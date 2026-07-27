/**
 * Provides a WebSocket stream with chunked data handling and custom formatting.
 * @class
 * @memberof Colibri.IO
 */
Colibri.IO.WebSocketStream = class extends Destructable {

    /**
     * @type {Object.<string, Function>} - A mapping of data types to their corresponding reader functions.
     * @readonly
     */
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

    /**
     * @type {Object.<string, Function>} - A mapping of array view types to their corresponding constructors.
     * @readonly
     */
    static ARRAY_VIEWS = {
        Float32Array,
        Float64Array,
        Uint32Array,
        Uint16Array,
        Uint8Array
    };

    /**
     * @type {Function} - Data type of the chunk
     */
    _chunkDataType = null;

    /**
     * Constructor
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

    /**
     * Formats the received buffer according to the specified layout.
     * @param {ArrayBuffer} buffer - The received buffer to format.
     * @param {Array<Array>} layout - The layout defining the structure of the data in the buffer.
     * @returns {Object} An object containing the formatted data according to the specified layout.
     * @private
     * @description
     * This method takes a received buffer and a layout that defines how to interpret the data in the buffer.
     * It uses DataView to read the data from the buffer based on the specified sizes and types in the layout.
     * The method returns an object where each property corresponds to a field defined in the layout, containing the formatted data.
     */
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

    /**
     * Unpacks the received buffer into rows based on the specified row size.
     * @param {ArrayBuffer} buffer - The received buffer to unpack.
     * @param {number} rowSize - The size of each row in bytes.
     * @returns {Array<ArrayBuffer>} An array of ArrayBuffers, each representing a row of data.
     * @private
     * @description
     * This method takes a received buffer and a specified row size, and splits the buffer into multiple rows based on the row size.
     * It returns an array of ArrayBuffers, where each ArrayBuffer corresponds to a single row of data extracted from the original buffer.
     */
    _unpackRows(buffer, rowSize) {
        const rows = [];
        const total = buffer.byteLength;
        for (let offset = 0; offset < total; offset += rowSize) {
            rows.push(buffer.slice(offset, offset + rowSize));
        }
        return rows;
    }

    /**
     * Establishes a WebSocket connection to the specified URI and sets up event handlers for open, message, close, and error events.
     * @private
     * @description
     * This method creates a new WebSocket connection to the URI provided during the instantiation of the WebSocketStream class.
     * It sets the binary type of the WebSocket to "arraybuffer" and defines event handlers for the 'open', 'message', 'close', and 'error' events.
     * The 'message' event handler processes incoming data, optionally unpacks it into rows, formats it according to the specified layout, and invokes the chunkReceived callback.
     * The 'close' event handler attempts to reconnect after a delay if the disconnection was not manual.
     * The 'error' event handler logs any errors that occur during the WebSocket communication.
     */
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

    /**
     * Indicates whether the WebSocket connection is ready (open).
     * @type {boolean}
     * @readonly
     */
    get isReady() {
        return this._socket.readyState === 1;
    }

    /**
     * Stream name
     * @type {String}
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the chunk size in bytes.
     * @type {number|null}
     */
    get chunkSize() {
        return this._chunkSize;
    }

    /**
     * Sets the chunk size in bytes.
     * @type {number|null}
     */
    set chunkSize(value) {
        this._chunkSize = value;
    }

    /**
     * Gets the chunk formatter function.
     * @type {Function}
     */
    get chunkFormatter() {
        return this._chunkFormatter;
    }

    /**
     * Sets the chunk formatter function.
     * @type {Function}
     */
    set chunkFormatter(value) {
        this._chunkFormatter = value;
    }

    /**
     * Disconnects the WebSocket connection and prevents automatic reconnection.
     * @returns {void}
     * @description
     */
    disconnect() {
        this._manualDisconnect = true;
        this._socket.close();
    }

    /**
     * Gets the data type of the chunk.
     * @type {Function}
     */
    get chunkDataType() {
        return this._chunkDataType;
    }

    /**
     * Sets the data type of the chunk and invokes the dataTypeChanged callback if the data type has changed.
     * @type {Function}
     */
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