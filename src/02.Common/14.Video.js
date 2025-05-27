/**
 * Audio methods 
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.Video = class {

    _mediaRecorder = null;

    RecordVideo(videoComponent, videoSettings = null, audioSettings = null) {
        return this._startRecordVideoOnWeb(videoComponent, videoSettings, audioSettings);
    }

    _startRecordVideoOnWeb(videoComponent, videoSettings = null, audioSettings = null) {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: audioSettings ?? true, video: videoSettings ?? true })
                .then(stream => {
                    videoComponent.srcObject = stream;

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

                    this._mediaRecorder.start();

                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    StopRecording() {
        return this._stopRecordVideooOnWeb();
    }

    _stopRecordVideooOnWeb() {
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

}