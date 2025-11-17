Colibri.IO.WebSocketStream = class extends Destructable {

    constructor(uri, chunkCallback) {
        super();

        this._uri = uri;
        this._chunkCallback = chunkCallback;
        this._connect();
    }

    _connect() {
        this._socket = new WebSocket(this._uri);
        this._socket.binaryType = "arraybuffer";
        this._socket.onopen = (event) => console.log('WebSocket connection opened:', event);
        this._socket.onmessage = (event) => {
            this._chunkCallback(event.data);
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


}