/**
 * Provides a WebSocket stream with chunked data handling and custom formatting.
 * @class
 * @memberof Colibri.IO
 * @extends Destructable
 * @example 
 * ```
 * /// Create a new WebSocketStream instance
 * const stream = new Colibri.IO.WebSocketStream(
 *     'myStream',
 *     'ws://example.com/socket',
 *     1024, // chunk size in bytes
 *     [ // chunk formatter layout
 *         [8, 'timestamp', 'FDate'],
 *         [4, 'value', 'Float32']
 *     ],
 *     (chunks, streamInstance) => {
 *         console.log('Received chunks:', chunks);
 *     },
 *     (dataType, streamInstance) => {
 *         console.log('Data type changed to:', dataType);
 *     }
 * );
 * 
 * /// Disconnect the WebSocket stream when done
 * stream.disconnect(); 
 * ```
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
     * Data type of the chunk
     * @type {Function}
     */
    _chunkDataType = null;

    /**
     * This constructor initializes a new instance of the WebSocketStream class, establishing a WebSocket connection to the specified URI.
     * It sets up the necessary properties for handling chunked data, formatting, and callbacks for received data and data type changes.
     * @constructor
     * @param {string} name - The name of the WebSocket stream.
     * @param {string} uri - The URI of the WebSocket server.
     * @param {number} chunkSize - The size of each chunk in bytes.
     * @param {Array<Array>} chunkFormatter - The layout for formatting the received chunks.
     * @param {Function} chunkReceived - The callback function to handle received chunks.
     * @param {Function} dataTypeChanged - The callback function to handle changes in data type.
     * @constructor
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
     * This method takes a received buffer and a layout that defines how to interpret the data in the buffer.
     * It uses DataView to read the data from the buffer based on the specified sizes and types in the layout.
     * The method returns an object where each property corresponds to a field defined in the layout, containing the formatted data.
     * @param {ArrayBuffer} buffer - The received buffer to format.
     * @param {Array<Array>} layout - The layout defining the structure of the data in the buffer.
     * @returns {Object} An object containing the formatted data according to the specified layout.
     * @private
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
     * This method takes a received buffer and a specified row size, and splits the buffer into multiple rows based on the row size.
     * It returns an array of ArrayBuffers, where each ArrayBuffer corresponds to a single row of data extracted from the original buffer.
     * @param {ArrayBuffer} buffer - The received buffer to unpack.
     * @param {number} rowSize - The size of each row in bytes.
     * @returns {Array<ArrayBuffer>} An array of ArrayBuffers, each representing a row of data.
     * @private
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
     * This method creates a new WebSocket connection to the URI provided during the instantiation of the WebSocketStream class.
     * It sets the binary type of the WebSocket to "arraybuffer" and defines event handlers for the 'open', 'message', 'close', and 'error' events.
     * The 'message' event handler processes incoming data, optionally unpacks it into rows, formats it according to the specified layout, and invokes the chunkReceived callback.
     * The 'close' event handler attempts to reconnect after a delay if the disconnection was not manual.
     * The 'error' event handler logs any errors that occur during the WebSocket communication.
     * @private
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
     * @public
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