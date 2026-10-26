const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

function createDevice(respond) {
    const context = vm.createContext({
        Colibri: {Native: {}, Events: {Event: class {}}},
        Destructable: class {},
        App: null,
        setTimeout,
        clearTimeout
    });
    for (const file of ['01.Events/03.Dispatcher.js', '10.Native/01.Bridge.js', '10.Native/02.Device.js', '10.Native/03.Device.Platform.js', '10.Native/04.Device.Theme.js', '10.Native/005.Firebase.js']) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), context);
    }
    const calls = [];
    let receive;
    const transport = {
        onMessage(handler) { receive = handler; },
        async send(request) {
            calls.push(request);
            if (request.capability === 'device') {
                return {version: 1, type: 'response', id: request.id, result: {platform: 'android', theme: 'light', capabilities: ['firebase.start']}};
            }
            return {version: 1, type: 'response', id: request.id, ...respond(request)};
        }
    };
    const bridge = new context.Colibri.Native.Bridge(transport);
    const device = new context.Colibri.Native.Device(bridge);
    return {device, calls, emit: (name, payload) => receive({version: 1, type: 'event', name, payload})};
}

test('delivers queued notification openings and live FCM events through the real bridge', async () => {
    const {device, emit} = createDevice(() => ({result: {events: [{name: 'firebase.notificationOpened', payload: {messageId: 'cold'}}]}}));
    const firebase = device.firebase;
    assert.equal(firebase, device.firebase);
    const received = [];
    for (const name of ['NotificationOpened', 'MessageReceived', 'TokenChanged']) {
        firebase.AddHandler(name, (event, args) => received.push({name, args}));
    }
    emit('firebase.messageReceived', {messageId: 'before-start'});
    assert.equal(received.length, 0);
    await firebase.Start();
    emit('firebase.messageReceived', {messageId: 'foreground'});
    emit('firebase.tokenChanged', {token: 'renewed'});
    assert.deepEqual(received.map(entry => entry.name), ['NotificationOpened', 'MessageReceived', 'TokenChanged']);
    assert.equal(received[0].args.messageId, 'cold');
    await firebase.Stop();
    emit('firebase.messageReceived', {});
    assert.equal(received.length, 3);
    device.Close();
});

test('forwards Firebase methods and consumes an initial message before starting events', async () => {
    const {device, calls} = createDevice(request => ({result: request.method === 'getInitialMessage' ? {messageId: 'launch'} : {token: 'registration'}}));
    const firebase = device.firebase;
    assert.equal((await firebase.GetInitialMessage()).messageId, 'launch');
    assert.equal((await firebase.GetToken()).token, 'registration');
    await firebase.GetPermission();
    await firebase.RequestPermission();
    await firebase.DeleteToken();
    assert.deepEqual(calls.filter(request => request.capability === 'firebase').map(request => request.method), ['getInitialMessage', 'getToken', 'getPermission', 'requestPermission', 'deleteToken']);
    device.Close();
});

test('surfaces host configuration failures and resets event forwarding after a failed Start', async () => {
    const {device, emit} = createDevice(() => ({error: {code: 'firebase_not_configured', message: 'Missing client configuration'}}));
    let delivered = 0;
    device.firebase.AddHandler('MessageReceived', () => { delivered++; });
    await assert.rejects(device.firebase.Start(), {code: 'firebase_not_configured'});
    emit('firebase.messageReceived', {});
    assert.equal(delivered, 0);
    await assert.rejects(device.firebase.GetToken(), {code: 'firebase_not_configured'});
    device.Close();
});