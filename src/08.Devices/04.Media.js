Colibri.Devices.Media = class extends Colibri.Events.Dispatcher {

    static MediaNone = 0;
    static MediaStarting = 1;
    static MediaRunning = 2;
    static MediaPaused = 3;
    static MediaStopped = 4;
    
    _object = null;
    _src = null;

    constructor(src) {
        super();
        this._src = src;
        this._registerEvents();
        this._check();
        this._create();
    }

    _registerEvents() {
        this.RegisterEvent('Stopped', false, 'Когда медия остановлено');
        this.RegisterEvent('ErrorOccurred', false, 'Когда произошла ошибка');
        this.RegisterEvent('StatusChanged', false, 'Когда получили статус');
    }

    _check() {
        if(typeof Media !== 'function'){
            console.log('Plugin cordova.media is not installed. Please run cordova plugin add cordova-plugin-media');
        }
    }

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
     * Returns the current amplitude within an audio file
     */
    GetCurrentAmplitude() {
        return new Promise((resolve, reject) => {
            this._object.getCurrentAmplitude((amp) => {
                resolve(amp);
            }, e => reject(e));
        });
    }
    

    /**
     * Returns the current position within an audio file
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
    PauseRecord() {
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
    ResumeRecord() {
        return this._object.resumeRecord();
    }

    /**
     * Moves the position within the audio file.
     */
    SeekTo(ms = 10000) {
        return this._object.seekTo(ms);
    }

    /**
     * Set the volume for audio playback.
     */
    SetVolume(volume = '0.5') {
        return this._object.setVolume(volume);
    }

    /**
     * Start recording an audio file.
     */
    StartRecord() {
        return this._object.startRecord();
    }

    /**
     * Stop recording an audio file.
     */
    StopRecord() {
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
     */
    SetRate(rate = 2.0) {
        return this._object.setRate(rate);
    }

}

Colibri.Devices.Media.StartRecord = function(mediaFile) {
    const media = new Colibri.Devices.Media(mediaFile);
    media.StartRecord();
    return media;
}

Colibri.Devices.Media.Play = function(mediaFile) {
    const media = new Colibri.Devices.Media(mediaFile);
    media.play();
    return media;
}
