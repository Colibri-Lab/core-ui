Colibri.Events.Source = class extends Destructable {

    constructor(ipOrHost, port) {
        super();

        this._ipOrHost = ipOrHost;
        this._port = port;
        this._handlers = {};

        this._connect();
    }

    register(repsondent, eventName) {
        if(!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        this._handlers[eventName].push(repsondent);
    }

    _connect() {
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
            setTimeout(() => this._connect(), 3000);
        };
        this._socket.onerror = (error) => console.error('WebSocket error:', error);
    }

    get isReady() {
        return this._socket.readyState === 1;
    }


    Config(configData) {
        this._socket.send(JSON.stringify({event: 'ChangeConfig', data: configData}));
    }

}