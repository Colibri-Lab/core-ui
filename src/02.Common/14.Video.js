/**
 * Audio methods 
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.Video = class {

    _mediaRecorder = null;
    _videoObject = null;

    RecordVideo(videoComponent, videoSettings = null, audioSettings = null, dataReceivedCallback = null) {
        const selectedMic = App.Browser.Get('selected-mic-id');
        const selectedCamera = App.Browser.Get('selected-camera-id');

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
                            const videoBlob = new Blob(audioChunks, { type: 'video/webm' });
                            resolve(videoBlob);
                        });
    
                        this._mediaRecorder.addEventListener("start", () => {
                            if(dataReceivedCallback) {
                                dataReceivedCallback();
                            }
                        });
    
                        this._mediaRecorder.start();
    
                    })
                    .catch((err) => {
                        console.error(err);
                        return null;
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
                            const videoBlob = new Blob(audioChunks, { type: 'video/webm' });
                            resolve(videoBlob);
                        });
    
                        this._mediaRecorder.addEventListener("start", () => {
                            if(dataReceivedCallback) {
                                dataReceivedCallback();
                            }
                        });
    
                        this._mediaRecorder.start();
    
                    })
                    .catch(error => {
                        reject(error);
                    });
            }

        });
    }


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