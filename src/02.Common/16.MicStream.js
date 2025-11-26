Colibri.Common.MicStream = class extends Colibri.Events.Dispatcher {

    constructor(options = {}) {
        super();

        this._options = Object.assign({
            fftSize: 2048,
            smoothingTimeConstant: 0.8,
            minDecibels: -90,
            maxDecibels: -10,
            deviceId: null,         // ← выбор устройства
        }, options);

        this._audioContext = null;
        this._analyser = null;
        this._dataArray = null;
        this._source = null;
        this._stream = null;

        this._registerEvents();
    }

    _registerEvents() {
        this.RegisterEvent('DataReceived', false, 'Mic data received');
        this.RegisterEvent('Started', false, 'Mic started');
        this.RegisterEvent('Ended', false, 'Mic stopped');
        this.RegisterEvent('DevicesLoaded', false, 'Mic devices loaded');
    }

    async loadDevices() {
        const list = await navigator.mediaDevices.enumerateDevices();
        const devices = list.filter(d => d.kind === 'audioinput');
        this.Dispatch('DevicesLoaded', {devices: devices});
        return devices;
    }

    async start(deviceId = null) {
        this.stop();

        this._options.deviceId = deviceId || this._options.deviceId;

        this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this._analyser = this._audioContext.createAnalyser();
        this._analyser.fftSize = this._options.fftSize;
        this._analyser.smoothingTimeConstant = this._options.smoothingTimeConstant;
        this._analyser.minDecibels = this._options.minDecibels;
        this._analyser.maxDecibels = this._options.maxDecibels;

        const constraints = {
            audio: this._options.deviceId ? { deviceId: this._options.deviceId } : true,
            video: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this._stream = stream;

        this._source = this._audioContext.createMediaStreamSource(stream);
        this._source.connect(this._analyser);

        this._bufferLength = this._analyser.frequencyBinCount;
        this._dataArray = new Uint8Array(this._options.fftSize);

        Colibri.Common.StartTimer('mictimer', this._options.timeout || 100, () => {
            this.Dispatch('DataReceived', {data: this.getFrequencyData(), options: this._options});
        });

        this.Dispatch('Started', this._options);
    }

    get params() {
        return {length: 1000, row: this._options.fftSize, timeout: 100};
    }

    stop() {
        Colibri.Common.StopTimer('mictimer');

        if (this._stream) {
            this._stream.getTracks().forEach(t => t.stop());
            this._stream = null;
        }
        if (this._audioContext) {
            this._audioContext.close();
            this._audioContext = null;
        }
        this.Dispatch('Ended', this._options);
    }

    getFrequencyData() {
        if (this._analyser && this._dataArray) {
            this._analyser.getByteFrequencyData(this._dataArray);
            return this._dataArray;
        }
        return null;
    }

    setDevice(deviceId) {
        this._options.deviceId = deviceId;
        if (this._audioContext) {
            this.start();
        }
    }

};
