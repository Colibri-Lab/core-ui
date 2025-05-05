/**
 * Represents a media utility for handling audio playback and recording.
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Devices
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
     * @constructor
     * @param {string} src - The source of the media.
     */
    constructor(src, isBase64Encoded = false) {
        super();
        this._isBase64Encoded = isBase64Encoded;
        this._src = src;
        this._registerEvents();
        this._check();
        this._create();
    }

    /**
     * Registers events for media.
     * @private
     */
    /** @protected */
    _registerEvents() {
        this.RegisterEvent('Started', false, 'When media is started');
        this.RegisterEvent('Stopped', false, 'When media is stopped');
        this.RegisterEvent('ErrorOccurred', false, 'When error occurred');
        this.RegisterEvent('StatusChanged', false, 'When status is changed');
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

    _b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

      var blob = new Blob(byteArrays, {type: contentType});
      return blob;
    }

    _saveBase64AsAudioFile(folderpath, filename, content, contentType) {
        return new Promise((resolve, reject) => {
            // Convert the base64 string in a Blob
            var DataBlob = this._b64toBlob(content,contentType);    
            window.resolveLocalFileSystemURL(folderpath, function(dir) {
                dir.getFile(filename, {
                    create: true
                }, (file) => {
                    file.createWriter(function(fileWriter) {
                        fileWriter.write(DataBlob);
                        resolve();
                    }, () => {
                        alert('Unable to save file in path '+ folderpath);
                    });
                });
            });
        });
        
    }

    _saveBase64IfNeeded() {
        return new Promise((resolve, reject) => {
            if(this._isBase64Encoded) {
                let type = this._src.replaceAll('data:', '').split(';')[0];
                let data = this._src.split(';')[1].replaceAll('base64,', '');
                let src = Date.Mc() + '.' + Colibri.Common.MimeType.type2ext(type);
                this._saveBase64AsAudioFile(cordova.file.cacheDirectory, src, data, type).then(() => {  
                    this._src = cordova.file.cacheDirectory + src;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Creates the media object.
     * @private
     */
    _create() {
        this._saveBase64IfNeeded().then(() => {
            this._object = new Media(this._src, () => {
                this.Dispatch('Started', {});
            }, (status) => {
                this.Dispatch('ErrorOccurred', {status: status});
            }, (status) => {
                this.Dispatch('StatusChanged', {status: status});
            });
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
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.play();
        });
    }

    /**
     * Pause playback of an audio file.
     */
    Pause() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.pause();
        });
    }

    /**
     * Pause recording of an audio file.
     */
    PauseRecording() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.pauseRecord();
        });
    }

    /**
     * Releases the underlying operating system's audio resources.
     */
    Release() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.release();
        });
    }

    /**
     * Resume recording of an audio file.
     */
    ResumeRecording() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.resumeRecord();
        });
    }

    /**
     * Moves the position within the audio file.
     * @param {number} ms - The position in milliseconds.
     */
    SeekTo(ms = 10000) {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.seekTo(ms);
        });
    }

    /**
     * Set the volume for audio playback.
     * @param {string} volume - The volume level.
     */
    SetVolume(volume = '0.5') {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.setVolume(volume);
        });
    }

    /**
     * Start recording an audio file.
     */
    StartRecording() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.startRecord();
        });
    }

    /**
     * Stop recording an audio file.
     */
    StopRecording() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.stopRecord();
        });
    }

    /**
     * Stop playing an audio file.
     */
    Stop() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.stop();
        });
    }

    /**
     * Set the playback rate for the audio file.
     * @param {number} rate - The playback rate.
     */
    SetRate(rate = 2.0) {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.setRate(rate);
        });
    }

}

/**
 * Static method to start recording a media file.
 * @param {string} mediaFile - The media file to record.
 * @returns {*} - The media object.
 */
Colibri.Devices.Media.StartRecording = function(mediaFile) {
    try {
        const media = new Colibri.Devices.Media(mediaFile);
        media.StartRecording();
        return media;
    } catch (e) {
        alert(e);
    }
}

/**
 * Static method to play a media file.
 * @param {string} mediaFile - The media file to play.
 * @returns {*} - The media object.
 */
Colibri.Devices.Media.Play = function(mediaFile, isBase64Encoded = false) {
    try {
        const media = new Colibri.Devices.Media(mediaFile, isBase64Encoded);
        media.Play();
        return media;
    } catch (e) {
        alert(e);
    }
}
