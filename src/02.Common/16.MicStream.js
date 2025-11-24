Colibri.Common.MicStream = class extends Colibri.Events.Dispatcher {

    constructor(options = {}) {
        super();

        this._options = Object.assign({
            fftSize: 2048,
            smoothingTimeConstant: 0.8,
            minDecibels: -90,
            maxDecibels: -10,
        }, options);

        this._audioContext = null;
        this._analyser = null;
        this._dataArray = null;
        this._source = null;
        this._stream = null;

        this._registerEvents();
        
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        this.RegisterEvent('DataReceived', false, 'Mic data received');
        this.RegisterEvent('Started', false, 'Mic data received');
        this.RegisterEvent('Ended', false, 'Mic data received');
    }

    async start() {
        this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this._analyser = this._audioContext.createAnalyser();
        this._analyser.fftSize = this._options.fftSize;
        this._analyser.smoothingTimeConstant = this._options.smoothingTimeConstant;
        this._analyser.minDecibels = this._options.minDecibels;
        this._analyser.maxDecibels = this._options.maxDecibels;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this._stream = stream;

        this._source = this._audioContext.createMediaStreamSource(stream);
        this._source.connect(this._analyser);

        this._bufferLength = this._analyser.frequencyBinCount;
        this._dataArray = new Uint8Array(this._options.fftSize);

        Colibri.Common.StartTimer('mictimer', 100, () => {
            this.Dispatch('DataReceived', {data: this.getFrequencyData(), options: this._options});
        });

        this.Dispatch('Started', this._options);
    }

    get params() {
        return {length: 1000, row: this._options.fftSize, timeout: 100};
    }

    stop() {
        if (this._stream) {
            const tracks = this._stream.getTracks();
            tracks.forEach(track => track.stop());
            this._stream = null;
        }
        if (this._audioContext) {
            this._audioContext.close();
            this._audioContext = null;
        }
        this.Dispatch('Ended', this._options);
        Colibri.Common.StopTimer('mictimer');
    }

    getFrequencyData() {
        if (this._analyser && this._dataArray) {
            this._analyser.getByteFrequencyData(this._dataArray);
            return this._dataArray;
        }
        return null;
    }
};
