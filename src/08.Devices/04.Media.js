/**
 * Represents a media utility for handling audio playback and recording.
 * @extends Colibri.Events.Dispatcher
 */

Colibri.Devices.Media = class extends Colibri.Events.Dispatcher {

    /**
     * Status code for 'None'.
     * @type {number}
     */
    static MediaNone = 0;
    /**
     * Status code for 'Starting'.
     * @type {number}
     */
    static MediaStarting = 1;
    /**
     * Status code for 'Running'.
     * @type {number}
     */
    static MediaRunning = 2;
    /**
     * Status code for 'Paused'.
     * @type {number}
     */
    static MediaPaused = 3;
    /**
     * Status code for 'Stopped'.
     * @type {number}
     */
    static MediaStopped = 4;
    
    /**
     * Instance variable representing the media object.
     * @type {object}
     * @private
     */
    _object = null;

    /**
     * Source of the media.
     * @type {string}
     * @private
     */
    _src = null;

    /**
     * Creates an instance of Media.
     * @param {string} src - The source of the media.
     */
    constructor(src) {
        super();
        this._src = src;
        this._registerEvents();
        this._check();
        this._create();
    }

    /**
     * Registers events for media.
     * @private
     */
    _registerEvents() {
        this.RegisterEvent('Stopped', false, 'Когда медия остановлено');
        this.RegisterEvent('ErrorOccurred', false, 'Когда произошла ошибка');
        this.RegisterEvent('StatusChanged', false, 'Когда получили статус');
    }

    /**
     * Checks if the Media plugin is installed.
     * @private
     */
    _check() {
        if(typeof Media !== 'function'){
            console.log('Plugin cordova.media is not installed. Please run cordova plugin add cordova-plugin-media');
        }
    }

    /**
     * Creates the media object.
     * @private
     */
    _create() {
        this._object = new Media(this._src, () => {
            this.Dispatch('Stopped', {});
        }, (status) => {
            this.Dispatch('ErrorOccurred', {status: status});
        }, (status) => {
            this.Dispatch('StatusChanged', {status: status});
        });
    }

    /**
     * Returns the current amplitude within an audio file.
     * @returns {Promise} - Promise resolving to the amplitude.
     */
    GetCurrentAmplitude() {
        return new Promise((resolve, reject) => {
            this._object.getCurrentAmplitude((amp) => {
                resolve(amp);
            }, e => reject(e));
        });
    }
    

    /**
     * Returns the current position within an audio file.
     * @returns {Promise} - Promise resolving to the position.
     */
    GetCurrentPosition() {
        return new Promise((resolve, reject) => {
            this._object.getCurrentPosition((position) => {
                resolve(position);
            }, e => reject(e));
        });
    }

    /**
     * Returns the duration of an audio file.
     * @returns {number} - The duration of the audio file.
     */
    GetDuration() {
        return this._object.getDuration();
    }

    /**
     * Start or resume playing an audio file.
     */
    Play() {
        return this._object.play();
    }

    /**
     * Pause playback of an audio file.
     */
    Pause() {
        return this._object.pause();
    }

    /**
     * Pause recording of an audio file.
     */
    PauseRecording() {
        return this._object.pauseRecord();
    }

    /**
     * Releases the underlying operating system's audio resources.
     */
    Release() {
        return this._object.release();
    }

    /**
     * Resume recording of an audio file.
     */
    ResumeRecording() {
        return this._object.resumeRecord();
    }

    /**
     * Moves the position within the audio file.
     * @param {number} ms - The position in milliseconds.
     */
    SeekTo(ms = 10000) {
        return this._object.seekTo(ms);
    }

    /**
     * Set the volume for audio playback.
     * @param {string} volume - The volume level.
     */
    SetVolume(volume = '0.5') {
        return this._object.setVolume(volume);
    }

    /**
     * Start recording an audio file.
     */
    StartRecording() {
        return this._object.startRecord();
    }

    /**
     * Stop recording an audio file.
     */
    StopRecording() {
        return this._object.stopRecord();
    }

    /**
     * Stop playing an audio file.
     */
    Stop() {
        return this._object.stop();
    }

    /**
     * Set the playback rate for the audio file.
     * @param {number} rate - The playback rate.
     */
    SetRate(rate = 2.0) {
        return this._object.setRate(rate);
    }

}

/**
 * Static method to start recording a media file.
 * @param {string} mediaFile - The media file to record.
 * @returns {*} - The media object.
 */
Colibri.Devices.Media.StartRecording = function(mediaFile) {
    const media = new Colibri.Devices.Media(mediaFile);
    media.StartRecording();
    return media;
}

/**
 * Static method to play a media file.
 * @param {string} mediaFile - The media file to play.
 * @returns {*} - The media object.
 */
Colibri.Devices.Media.Play = function(mediaFile) {
    const media = new Colibri.Devices.Media(mediaFile);
    media.play();
    return media;
}
