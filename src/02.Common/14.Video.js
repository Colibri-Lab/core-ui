/**
 * Video methods
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.Video = class {

    /**
     * MediaRecorder instance for recording video.
     * @type {MediaRecorder|null}
     */
    _mediaRecorder = null;
    /**
     * Video component element.
     * @type {HTMLVideoElement|null}
     */
    _videoObject = null;

    /**
     * Records video using the user's camera and microphone.
     * @param {HTMLVideoElement} videoComponent - The video component element to display the recorded video.
     * @param {MediaTrackConstraints|null} videoSettings - The video settings for the recording.
     * @param {MediaTrackConstraints|null} audioSettings - The audio settings for the recording.
     * @param {Function|null} dataReceivedCallback - A callback function to be called when data is received during recording.
     * @param {string|null} selectedMic - The ID of the selected microphone device.
     * @param {string|null} selectedCamera - The ID of the selected camera device or 'screen' for screen capture.
     * @returns {Promise<Blob>} - A promise that resolves to the recorded video blob.
     * @throws {Error} If there is an error accessing the user's media devices or if recording fails.
     * @example
     * const videoComponent = document.getElementById('video');
     * const videoSettings = { width: 1280, height: 720 };
     * const audioSettings = { echoCancellation: true };
     * const selectedMic = 'default';
     * const selectedCamera = 'default';
     * Colibri.Common.Video.RecordVideo(videoComponent, videoSettings, audioSettings, null, selectedMic, selectedCamera)
     *   .then(videoBlob => {
     *     Handle the recorded video blob
     *   })
     *   .catch(error => {
     *     Handle the error
     *   });
     * @description
     * This method uses the MediaRecorder API to record video from the user's camera and microphone.
     * It allows specifying video and audio settings, as well as selecting specific devices for recording.
     * The recorded video is returned as a Blob object.
     */
    RecordVideo(videoComponent, videoSettings = null, audioSettings = null, dataReceivedCallback = null, selectedMic = null, selectedCamera = null) {

        if(selectedCamera) {
            if(videoSettings) {
                videoSettings.deviceId = { exact: selectedCamera };
            } else {
                videoSettings = {deviceId: { exact: selectedCamera }};
            }
        }

        if(selectedMic) {
            if(audioSettings) {
                audioSettings.deviceId = { exact: selectedMic };
            } else {
                audioSettings = {deviceId: { exact: selectedMic }};
            }
        }

        this._videoObject = videoComponent;
        return new Promise((resolve, reject) => {
            
            this._changing = true;
            if(this._audioContext) {
                this._audioContext?.close();
            }
            if(this._mediaRecorder) {
                this._mediaRecorder.stop();
                this._mediaRecorder = null;
            }

            if(this._stream) {
                this._stream.getTracks().forEach((track) => {
                    if (track.readyState == 'live') {
                        track.stop();
                    }
                });
                this._stream = null;
            }

            if(selectedCamera === 'screen') {

                delete audioSettings.deviceId;
                videoSettings = { displaySurface: 'window' };
                const displayMediaOptions = {
                    video: true,
                    audio: audioSettings ?? true,
                };

                navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
                    .then(stream => {
                        videoComponent.srcObject = stream;
                        videoComponent.play();
    
                        this._stream = stream;
                        this._mediaRecorder = new MediaRecorder(stream);
                        const audioChunks = [];
    
                        this._mediaRecorder.addEventListener("dataavailable", event => {
                            audioChunks.push(event.data);
                        });
    
                        this._mediaRecorder.addEventListener("stop", () => {
                            if(!this._changing) {
                                const videoBlob = new Blob(audioChunks, { type: 'video/webm' });
                                resolve(videoBlob);
                            }
                        });
    
                        this._mediaRecorder.addEventListener("start", () => {
                            if(dataReceivedCallback) {
                                dataReceivedCallback();
                            }
                        });
    
                        this._changing = false;
                        this._mediaRecorder.start();
    
                    })
                    .catch((error) => {
                        reject(error);
                    });
            } else {

                navigator.mediaDevices.getUserMedia({ audio: audioSettings ?? true, video: videoSettings ?? true })
                    .then(stream => {
                        videoComponent.srcObject = stream;
                        videoComponent.play();
    
                        this._stream = stream;
                        this._mediaRecorder = new MediaRecorder(stream);
                        const audioChunks = [];
    
                        this._mediaRecorder.addEventListener("dataavailable", event => {
                            audioChunks.push(event.data);
                        });
    
                        this._mediaRecorder.addEventListener("stop", () => {
                            if(!this._changing) {
                                const videoBlob = new Blob(audioChunks, { type: 'video/webm' });
                                resolve(videoBlob);
                            }
                        });
    
                        this._mediaRecorder.addEventListener("start", () => {
                            if(dataReceivedCallback) {
                                dataReceivedCallback();
                            }
                        });
    
                        this._changing = false;
                        this._mediaRecorder.start();
    
                    })
                    .catch(error => {
                        reject(error);
                    });
            }

            

        });
    }

    /**
     * Stops the video recording and releases the media resources.
     * @returns {Promise<void>} - A promise that resolves when the recording is stopped and resources are released.
     * @throws {Error} If there is an error stopping the recording or releasing resources.
     * @example
     * Colibri.Common.Video.StopRecording()
     *   .then(() => {
     *     Recording stopped successfully
     *   })
     *   .catch(error => {
     *     Handle the error
     *   });
     * @description
     * This method stops the video recording, releases the media resources, and cleans up any associated objects.
     */
    StopRecording() {
        if(this._audioContext) {
            this._audioContext?.close();
        }
        if(this._mediaRecorder) {
            this._mediaRecorder.stop();
            this._mediaRecorder = null;
        }
        if(this._stream) {
            this._stream.getTracks().forEach((track) => {
                if (track.readyState == 'live') {
                    track.stop();
                }
            });
            this._stream = null;
        }
        return Promise.resolve();
    }
    
    /**
     * Captures a screenshot of the current video frame after waiting for a specified number of seconds.
     * @param {number} [secondstowait=3] - The number of seconds to wait before capturing the screenshot.
     * @returns {Promise<Blob>} - A promise that resolves to a Blob containing the captured screenshot.
     * @throws {Error} If there is an error capturing the screenshot.
     * @example
     * Colibri.Common.Video.CaptureScreeshot(5)
     *   .then(screenshotBlob => {
     *     Handle the captured screenshot blob
     *   })
     *   .catch(error => {
     *     Handle the error
     *   });
     * @description
     * This method captures a screenshot of the current video frame after waiting for the specified number of seconds.
     * The captured screenshot is returned as a Blob object.
     */
    CaptureScreeshot(secondstowait = 3) {
        return new Promise((resolve, reject) => {
            Colibri.Common.Delay(secondstowait * 1000).then(() => {
                const canvas = document.createElement('canvas');
                canvas.width = this._videoObject.videoElement.videoWidth;
                canvas.height = this._videoObject.videoElement.videoHeight;
                
                const context = canvas.getContext('2d');
                context.drawImage(this._videoObject.videoElement, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    canvas.remove();
                    resolve(blob);
                });
            });
        
        });
    }


}