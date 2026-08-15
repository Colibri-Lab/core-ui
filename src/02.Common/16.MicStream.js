/**
 * Microphone stream class for capturing audio data from the user's microphone.
 * @class
 * @memberof Colibri.Common
 * @extends Colibri.Events.Dispatcher
 * @example
 * ```
 * const micStream = new Colibri.Common.MicStream({ fftSize: 2048 });
 * micStream.AddHandler('DataReceived', (event, args) => {
 *     const frequencyData = args.data;
 *     Handle the received frequency data
 * });
 * micStream.start(); // Start capturing audio data
 * 
 * To stop capturing audio data:
 * micStream.stop();
 * ```
 */
Colibri.Common.MicStream = class extends Colibri.Events.Dispatcher {

    /**
     * Initializes a new instance of the MicStream class with the specified options.
     * @constructor
     * @public
     */
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

    /**
     * Registers the events for the MicStream class.
     * @private
     * @returns {void}
     */
    _registerEvents() {
        this.RegisterEvent('DataReceived', false, 'Mic data received');
        this.RegisterEvent('Started', false, 'Mic started');
        this.RegisterEvent('Ended', false, 'Mic stopped');
        this.RegisterEvent('DevicesLoaded', false, 'Mic devices loaded');
    }

    /**
     * Loads the available microphone devices and dispatches the 'DevicesLoaded' event with the list of devices.
     * This method retrieves the list of available microphone devices using the MediaDevices API and dispatches the 'DevicesLoaded' event with the list of devices.
     * @returns {Promise<Array<MediaDeviceInfo>>} - A promise that resolves to an array of available microphone devices.
     * @throws {Error} If there is an error loading the devices.
     * @async
     * @public
     * @example
     * ```
     * Colibri.Common.MicStream.loadDevices().then(devices => {
     *     console.log('Available microphone devices:', devices);
     * }).catch(error => {
     *     console.error('Error loading microphone devices:', error);
     * });
     * ```
     */
    async loadDevices() {
        const list = await navigator.mediaDevices.enumerateDevices();
        const devices = list.filter(d => d.kind === 'audioinput');
        this.Dispatch('DevicesLoaded', {devices: devices});
        return devices;
    }

    /**
     * Starts capturing audio data from the user's microphone and dispatches the 'DataReceived' event with the frequency data.
     * @param {string|null} deviceId - The ID of the microphone device to use (optional).
     * @returns {Promise<void>} - A promise that resolves when the microphone stream is started.
     * @throws {Error} If there is an error starting the microphone stream.
     * @public
     * @async
     * @example
     * ```
     * const micStream = new Colibri.Common.MicStream({ fftSize: 2048 });
     * micStream.AddHandler('DataReceived', (event, args) => {
     *     const frequencyData = args.data;
     *     /// Handle the received frequency data
     * });
     * micStream.start(); // Start capturing audio data
     * ```
     */
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

    /**
     * Gets the parameters for the microphone stream, including the length of the data array, the FFT size, and the timeout interval.
     * @returns {Object} - An object containing the parameters for the microphone stream.
     * @property {number} length - The length of the data array (default: 1000).
     * @property {number} row - The FFT size used for frequency analysis (default: this._options.fftSize).
     * @property {number} timeout - The timeout interval in milliseconds for capturing audio data (default: 100).
     */
    get params() {
        return {length: 1000, row: this._options.fftSize, timeout: 100};
    }

    /**
     * Stops capturing audio data from the user's microphone and releases the media resources.
     * @returns {void}
     * @description This method stops the microphone stream and releases any associated resources.
     * @public
     * @example
     * ```
     * const micStream = new Colibri.Common.MicStream({ fftSize: 2048 });
     * micStream.start(); // Start capturing audio data 
     * /// Stop capturing audio data after some time
     * setTimeout(() => {
     *     micStream.stop();
     *     console.log('Microphone stream stopped');
     * }, 5000);
     * ```
     */
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

    /**
     * Gets the frequency data from the microphone stream.
     * This method retrieves the frequency data from the microphone stream using the AnalyserNode.
     * The frequency data is returned as a Uint8Array, which can be used for further processing or visualization.
     * @returns {Uint8Array|null} - A Uint8Array containing the frequency data, or null if the analyser is not initialized.
     * @public
     * @example
     * ```
     * const micStream = new Colibri.Common.MicStream({ fftSize: 2048 });
     * micStream.start(); // Start capturing audio data
     * /// Get the frequency data after some time
     * setTimeout(() => {
     *     const frequencyData = micStream.getFrequencyData();
     *     console.log('Frequency data:', frequencyData);
     * }, 2000);
     * ```
     */
    getFrequencyData() {
        if (this._analyser && this._dataArray) {
            this._analyser.getByteFrequencyData(this._dataArray);
            return this._dataArray;
        }
        return null;
    }

    /**
     * Sets the microphone device to use for capturing audio data.
     * This method sets the microphone device to use for capturing audio data.
     * If the microphone stream is already started, it will restart the stream with the new device.
     * @param {string} deviceId - The ID of the microphone device to use.
     * @returns {void}
     * @public
     * @example
     * ```
     * const micStream = new Colibri.Common.MicStream({ fftSize: 2048 });
     * micStream.start(); // Start capturing audio data
     * /// Change the microphone device after some time
     * setTimeout(() => {
     *     micStream.setDevice('new-device-id');
     *     console.log('Microphone device changed');
     * }, 3000);
     * ```
     */
    setDevice(deviceId) {
        this._options.deviceId = deviceId;
        if (this._audioContext) {
            this.start();
        }
    }

};
