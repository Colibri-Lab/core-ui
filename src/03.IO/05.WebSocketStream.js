Colibri.IO.WebSocketStream = class extends Destructable {

    static TYPE_READERS = {
        FDate: (dv, o, le) => {
            const ns = dv.getBigUint64(o, le);
            const ms = Number(ns / 1000000n);
            const nano = Number(ns % 1_000_000n);
            return new Colibri.Common.FDate(ms, nano);
        },
        Date: (dv, o, le) => new Date(dv.getFloat64(o, le) * 1000),
        Float64: (dv, o, le) => dv.getFloat64(o, le),
        Float32: (dv, o, le) => dv.getFloat32(o, le),
        Uint32: (dv, o, le) => dv.getUint32(o, le),
        Uint16: (dv, o, le) => dv.getUint16(o, le),
        Uint8: (dv, o) => dv.getUint8(o)
    };

    static ARRAY_VIEWS = {
        Float32Array,
        Float64Array,
        Uint32Array,
        Uint16Array,
        Uint8Array
    };

    _chunkDataType = null;

    /**
     * constructor
     * @constructor
     * @param {String} uri websocket uri
     * @param {Number|null} chunkSize part size in bytes or null (means that must be one row in chunk)
     * @param {Array<Array>} format of chunk [[8,'time','Date'],[4,'duration','Uint8'],[['n',4], 'chunk','Float32Array']]
     */
    constructor(name, uri, chunkSize, chunkFormatter, chunkReceived, dataTypeChanged) {
        super();

        this._name = name;
        this._uri = uri;
        this._chunkReceived = chunkReceived;
        this._chunkSize = chunkSize;
        this._chunkFormatter = chunkFormatter;
        this._dataTypeChanged = dataTypeChanged;
        this._connect();
    }

    _format(buffer, layout) {
        const dv = new DataView(buffer);
        let offset = 0;
        const out = {};

        for (const [size, name, type] of layout) {

            // variable length field
            if (Array.isArray(size)) {
                const stride = size[1];
                const bytesLeft = buffer.byteLength - offset;
                const count = bytesLeft / stride;
                const Ctor = Colibri.IO.WebSocketStream.ARRAY_VIEWS[type];
                this.chunkDataType = Ctor;

                out[name] = new Ctor(dv.buffer, offset, count);
                offset += bytesLeft;
                break;
            }

            // scalar
            out[name] = Colibri.IO.WebSocketStream.TYPE_READERS[type](dv, offset, true);
            offset += size;
        }

        return out;
    }

    _unpackRows(buffer, rowSize) {
        const rows = [];
        const total = buffer.byteLength;
        for (let offset = 0; offset < total; offset += rowSize) {
            rows.push(buffer.slice(offset, offset + rowSize));
        }
        return rows;
    }

    _connect() {
        this._manualDisconnect = false;
        this._socket = new WebSocket(this._uri);
        this._socket.binaryType = "arraybuffer";
        this._socket.onopen = (event) => console.log('WebSocket connection opened:', event);
        this._socket.onmessage = (event) => {
            let chunks = event.data;
            if (this._chunkSize && chunks.byteLength > this._chunkSize) {
                chunks = this._unpackRows(chunks, this._chunkSize);
            } else {
                chunks = [chunks];
            }
            if (this._chunkFormatter) {
                for (let i = 0; i < chunks.length; i++) {
                    chunks[i] = this._format(chunks[i], this._chunkFormatter);
                }
            }
            this._chunkReceived(chunks, this);
        };
        this._socket.onclose = (event) => {
            console.log('WebSocket connection closed:', event, 'reconnecting ');
            if(!this._manualDisconnect) {
                setTimeout(() => this._connect(), 3000);
            }
        };
        this._socket.onerror = (error) => console.error('WebSocket error:', error);
    }

    get isReady() {
        return this._socket.readyState === 1;
    }

    get name() {
        return this._name;
    }

    get chunkSize() {
        return this._chunkSize;
    }

    set chunkSize(value) {
        this._chunkSize = value;
    }

    get chunkFormatter() {
        return this._chunkFormatter;
    }

    set chunkFormatter(value) {
        this._chunkFormatter = value;
    }

    disconnect() {
        this._manualDisconnect = true;
        this._socket.close();
    }

    get chunkDataType() {
        return this._chunkDataType;
    }

    set chunkDataType(value) {
        const dtype = this._chunkDataType;
        if(!dtype || dtype != value) {
            this._chunkDataType = value;
            if(this._dataTypeChanged) {
                this._dataTypeChanged(value, this);
            }
        }
    }


}