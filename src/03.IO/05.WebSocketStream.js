Colibri.IO.WebSocketStream = class extends Destructable {

    constructor(uri, chunkSize, chunkCallback) {
        super();

        this._uri = uri;
        this._chunkCallback = chunkCallback;
        this._chunkSize = chunkSize;
        this._connect();
    }

    _unpack(view, size) {
        const result = [];
        let i = 0;
        while (i < view.length) {
            result.push(view.slice(i, i + size));
            i += size;
        }
        return result;
    }

    _connect() {
        this._socket = new WebSocket(this._uri);
        this._socket.binaryType = "arraybuffer";
        this._socket.onopen = (event) => console.log('WebSocket connection opened:', event);
        this._socket.onmessage = (event) => {
            let chunk = new Float32Array(event.data);;
            if(this._chunkSize && chunk.length > this._chunkSize) {
                chunk = this._unpack(chunk, this._chunkSize);
            }
            this._chunkCallback(chunk);
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

    disconnect() {
        this._socket.close();
    }


}