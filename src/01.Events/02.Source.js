Colibri.Events.Source = class extends Destructable {

    constructor(ipOrHost, port) {
        super();

        this._handlers = {};

        this.Connect(ipOrHost, port);
    }

    get ipAndPort() {
        return `${this._ipOrHost}:${this._port}`;
    }

    register(repsondent, eventName) {
        if(!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        this._handlers[eventName].push(repsondent);
    }

    unregister(repsondent, eventName) {
        if(!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        if(this._handlers[eventName]) {
            const index = this._handlers[eventName].indexOf(repsondent);
            this._handlers[eventName].splice(index, 1);
        }
    }

    Disconnect() {
        if(this._socket) {
            this._socket.close();
            this._socket = null;
        }
        this._ipOrHost = null;
        this._port = null;
    }

    Connect(ipOrHost, port) {

        if(!ipOrHost || !port) {
            return;
        }

        this.Disconnect();

        this._ipOrHost = ipOrHost;
        this._port = port;

        this._socket = new WebSocket(`wss://${this._ipOrHost}:${this._port}/dispatcher/${App.Device.id}`);
        this._socket.onopen = (event) => console.log('WebSocket connection opened:', event);
        this._socket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            if(this._handlers[messageData.event]) {
                for(const handler of this._handlers[messageData.event]) {
                    handler.Dispatch(messageData.event, messageData.args);
                }
            }
        };
        this._socket.onclose = (event) => {
            console.log('WebSocket connection closed:', event, 'reconnecting ');
            setTimeout(() => this.Connect(this._ipOrHost, this._port), 3000);
        };
        this._socket.onerror = (error) => console.error('WebSocket error:', error);
    }

    get isReady() {
        return this._socket.readyState === 1;
    }

    /**
     * Dispatch an event
     * @param {String} name Event name
     * @param {*} args Event arguments
     */
    Dispatch(name, args) {
        if(!this.isReady) {
            console.log('Dispatcher socket is not connected yet');
            console.log(name, args);
            return;
        }
        this._socket.send(JSON.stringify({event: name, args: args}));
    }

    /**
     * @deprecated
     */
    Event(name, args) {
        this.Dispatch(name, args);
    }


}