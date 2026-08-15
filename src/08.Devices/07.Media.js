/**
 * Represents a media utility for handling audio playback and recording.
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Devices
 */
Colibri.Devices.Media = class extends Colibri.Events.Dispatcher {

    /**
     * Status code for 'None'.
     * @const {number}
     */
    static MediaNone = 0;
    /**
     * Status code for 'Starting'.
     * @const {number}
     */
    static MediaStarting = 1;
    /**
     * Status code for 'Running'.
     * @const {number}
     */
    static MediaRunning = 2;
    /**
     * Status code for 'Paused'.
     * @const {number}
     */
    static MediaPaused = 3;
    /**
     * Status code for 'Stopped'.
     * @const {number}
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
     * @protected
     */
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
        if (typeof Media !== 'function') {
            console.log('Plugin cordova.media is not installed. Please run cordova plugin add cordova-plugin-media');
        }
    }

    /**
     * Converts a base64 string to a Blob object.
     * @param {string} b64Data - The base64 string.
     * @param {string} contentType - The content type of the Blob.
     * @param {number} sliceSize - The size of each slice.
     * @returns {Blob} - The resulting Blob object.
     * @private
     */
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

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    /**
     * Saves a base64 string as an audio file.
     * @param {string} folderpath - The folder path where the file will be saved.
     * @param {string} filename - The name of the file to be saved.
     * @param {string} content - The base64 content of the audio file.
     * @param {string} contentType - The content type of the audio file.
     * @returns {Promise} - A promise that resolves when the file is saved.
     * @private
     * @async
     */
    _saveBase64AsAudioFile(folderpath, filename, content, contentType) {
        return new Promise((resolve, reject) => {
            // Convert the base64 string in a Blob
            var DataBlob = this._b64toBlob(content, contentType);
            window.resolveLocalFileSystemURL(folderpath, function (dir) {
                dir.getFile(filename, {
                    create: true
                }, (file) => {
                    file.createWriter(function (fileWriter) {
                        fileWriter.write(DataBlob);
                        resolve();
                    }, () => {
                        reject('Unable to save file in path ' + folderpath);
                    });
                });
            });
        });

    }

    /**
     * Saves the base64 string as an audio file if needed.
     * @returns {Promise} - A promise that resolves when the file is saved or if no saving is needed.
     * @private
     * @async
     */
    _saveBase64IfNeeded() {
        return new Promise((resolve, reject) => {
            if (this._isBase64Encoded) {
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
                this.Dispatch('ErrorOccurred', { status: status });
            }, (status) => {
                this.Dispatch('StatusChanged', { status: status });
            });
        });
    }

    /**
     * Returns the current amplitude within an audio file.
     * @returns {Promise} - Promise resolving to the amplitude.
     * @public
     * @async
     * @example
     * ```
     * App.Device.Media.GetCurrentAmplitude()
     *     .then(amplitude => {
     *         console.log('Current Amplitude:', amplitude);
     *     })
     *     .catch(error => {
     *         console.error('Error getting current amplitude:', error);
     *     });
     * ```
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
     * @public
     * @async
     * @example
     * ```
     * App.Device.Media.GetCurrentPosition()
     *     .then(position => {
     *         console.log('Current Position:', position);
     *     })
     *     .catch(error => {
     *         console.error('Error getting current position:', error);
     *     });
     * ```
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
     * @public
     * @example
     * ```
     * App.Device.Media.GetDuration()
     *     .then(duration => {
     *         console.log('Duration:', duration);
     *     })
     *     .catch(error => {
     *         console.error('Error getting duration:', error);
     *     });
     * ```
     */
    GetDuration() {
        return this._object.getDuration();
    }

    /**
     * Start or resume playing an audio file.
     * @public
     * @example
     * ```
     * App.Device.Media.Play()
     *     .then(() => {
     *         console.log('Playback started.');
     *     })
     *     .catch(error => {
     *         console.error('Error starting playback:', error);
     *     });
     * ```
     */
    Play() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.play();
        });
    }

    /**
     * Pause playback of an audio file.
     * @public
     * @example
     * ```
     * App.Device.Media.Pause()
     *     .then(() => {
     *         console.log('Playback paused.');
     *     })
     *     .catch(error => {
     *         console.error('Error pausing playback:', error);
     *     });
     * ```
     */
    Pause() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.pause();
        });
    }

    /**
     * Pause recording of an audio file.
     * @public
     * @example
     * ```
     * App.Device.Media.PauseRecording()
     *     .then(() => {
     *         console.log('Recording paused.');
     *     })
     *     .catch(error => {
     *         console.error('Error pausing recording:', error);
     *     });
     * ```
     */
    PauseRecording() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.pauseRecord();
        });
    }

    /**
     * Releases the underlying operating system's audio resources.
     * @public
     * @example
     * ```
     * App.Device.Media.Release()
     *     .then(() => {
     *         console.log('Audio resources released.');
     *     })
     *     .catch(error => {
     *         console.error('Error releasing audio resources:', error);
     *     });
     * ```
     */
    Release() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.release();
        });
    }

    /**
     * Resume recording of an audio file.
     * @public
     * @example
     * ```
     * App.Device.Media.ResumeRecording()
     *     .then(() => {
     *         console.log('Recording resumed.');
     *     })
     *     .catch(error => {
     *         console.error('Error resuming recording:', error);
     *     });
     * ```
     */
    ResumeRecording() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.resumeRecord();
        });
    }

    /**
     * Moves the position within the audio file.
     * @param {number} ms - The position in milliseconds.
     * @public
     * @example
     * ```
     * App.Device.Media.SeekTo(10000)
     *     .then(() => {
     *         console.log('Seeked to 10 seconds.');
     *     })
     *     .catch(error => {
     *         console.error('Error seeking:', error);
     *     });
     * ```
     */
    SeekTo(ms = 10000) {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.seekTo(ms);
        });
    }

    /**
     * Set the volume for audio playback.
     * @param {string} volume - The volume level.
     * @public
     * @example
     * ```
     * App.Device.Media.SetVolume('0.5')
     *     .then(() => {
     *         console.log('Volume set to 50%.');
     *     })
     *     .catch(error => {
     *         console.error('Error setting volume:', error);
     *     });
     * ```
     */
    SetVolume(volume = '0.5') {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.setVolume(volume);
        });
    }

    /**
     * Start recording an audio file.
     * @public
     * @example
     * ```
     * App.Device.Media.StartRecording()
     *     .then(() => {
     *         console.log('Recording started.');
     *     })
     *     .catch(error => {
     *         console.error('Error starting recording:', error);
     *     });
     * ```
     */
    StartRecording() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.startRecord();
        });
    }

    /**
     * Stop recording an audio file.
     * @public
     * @example
     * ```
     * App.Device.Media.StopRecording()
     *     .then(() => {
     *         console.log('Recording stopped.');
     *     })
     *     .catch(error => {
     *         console.error('Error stopping recording:', error);
     *     });
     * ```
     */
    StopRecording() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.stopRecord();
        });
    }

    /**
     * Stop playing an audio file.
     * @public
     * @example
     * ```
     * App.Device.Media.Stop()
     *     .then(() => {
     *         console.log('Playback stopped.');
     *     })
     *     .catch(error => {
     *         console.error('Error stopping playback:', error);
     *     });
     * ```
     */
    Stop() {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.stop();
        });
    }

    /**
     * Set the playback rate for the audio file.
     * @param {number} rate - The playback rate.
     * @public
     * @example
     * ```
     * App.Device.Media.SetRate(2.0)
     *     .then(() => {
     *         console.log('Playback rate set to 2x.');
     *     })
     *     .catch(error => {
     *         console.error('Error setting playback rate:', error);
     *     });
     * ```
     */
    SetRate(rate = 2.0) {
        Colibri.Common.Wait(() => !!this._object).then(() => {
            this._object.setRate(rate);
        });
    }


    /**
     * Static method to play a media file.
     * @param {string} mediaFile - The media file to play.
     * @returns {*} - The media object.
     * @public
     * @example
     * ```
     * const media = Colibri.Devices.Media.Play('path/to/media/file.mp3');
     * ```
     */
    static Play(mediaFile, isBase64Encoded = false) {
        try {
            const media = new Colibri.Devices.Media(mediaFile, isBase64Encoded);
            media.Play();
            return media;
        } catch (e) {
            alert(e);
        }
    }

}

