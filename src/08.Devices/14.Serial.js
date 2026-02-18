Colibri.Devices.Serial = class extends Colibri.Events.Dispatcher {

    constructor(usbVendorId = 0x1A86, boundRate = 9600) {
        super();
        this._usbVendorId = usbVendorId;
        this._boundRate = boundRate;
        this._port = null;

        this.RegisterEvent('DataReceived', false, 'When data received from port');

    }

    destructor() {
        if(this._port) {
            this._port.close();
        }
    }

    stringToBytes(str) {
        const bytesPerRow = this._boundRate / 8;

        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    }

    Open() {
        return navigator.serial.requestPort({ filters: [{ usbVendorId: 0x1A86 }] })
            .then(port => {
                this._port = port;
                return port.open({ baudRate: this._boundRate });
            })
            .catch(err => console.error("Ошибка подключения:", err));
    }

    StopAsyncRead() {
        Colibri.Common.StopTimer('serial-read-timer' + this._usbVendorId);
        
        this._reader.cancel()
            .then(() => this._reader.releaseLock())
            .then(() => this._textDecoder.readable.cancel())  // optional, cancels the decoder
            .then(() => this._textDecoder.writable.close())   // close the decoder
            .catch(err => console.error("Error closing port:", err));
    }

    AsyncRead(timeout = 2000) {

        this._textDecoder = new TextDecoderStream();
        this._port.readable.pipeTo(this._textDecoder.writable);
        this._reader = this._textDecoder.readable.getReader();
        
        Colibri.Common.StartTimer('serial-read-timer' + this._usbVendorId, timeout, () => {
            this._reader.read().then(({ value, done }) => {
                if (done) {
                    return;
                }
                if (value) {
                    this.Dispatch('DataReceived', {data: this.stringToBytes(value), original: value})
                }
            }).catch(err => console.error(err));
        });
    }

    Read() {
        return new Promise((resolve, reject) => {
            this._textDecoder = new TextDecoderStream();
            this._port.readable.pipeTo(this._textDecoder.writable);
            this._reader = this._textDecoder.readable.getReader();
            this._reader.read().then(({ value, done }) => {
                if (done) {
                    return;
                }
                if (value) {
                    this._reader.cancel()
                        .then(() => this._reader.releaseLock())
                        .then(() => this._textDecoder.readable.cancel())  // optional, cancels the decoder
                        .then(() => this._textDecoder.writable.close())   // close the decoder
                        .catch(err => console.error("Error closing port:", err));
                    resolve(this.stringToBytes(value));
                }
            }).catch(err => reject(err));
        });
    }

    Write(data) {
        var textEncoder = new TextEncoderStream();
        textEncoder.readable.pipeTo(this._port.writable);
        var writer = textEncoder.writable.getWriter();
        return writer.write(data + "\n").catch(e => console.error(e));
    }

}