/**
 * Audio methods 
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.Audio = class {

    _mediaRecorder = null;

    RecordAudio(audioSettings = null) {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: audioSettings ?? true })
                .then(stream => {
                    this._stream = stream;
                    this._mediaRecorder = new MediaRecorder(stream);
                    const audioChunks = [];

                    this._mediaRecorder.addEventListener("dataavailable", event => {
                        audioChunks.push(event.data);
                    });

                    this._mediaRecorder.addEventListener("stop", () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        console.log(audioBlob);
                        resolve(audioBlob);
                    });

                    this._mediaRecorder.start();

                })
                .catch(error => {
                    reject(error);
                });
        });
    }


    StopRecording() {
        
        if(this._animationFrame) {
            Colibri.Common.StopTimer('audio-animation-tick');
        }
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

    AmplitudeTick(tickMethod) {
    
        Colibri.Common.Wait(() => !!this._stream).then(() => {
            
            this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = this._audioContext.createAnalyser();
            const microphone = this._audioContext.createMediaStreamSource(this._stream);
            analyser.fftSize = 256;
    
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            microphone.connect(analyser);
    
            const updateAmplitude = () => {
                analyser.getByteTimeDomainData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    let val = (dataArray[i] - 128) / 128;
                    sum += val * val;
                }
                const rms = Math.sqrt(sum / bufferLength);
                const amplitude = Math.min(1.0, rms * 2);
                tickMethod(amplitude);
            }
            
            Colibri.Common.StartTimer('audio-animation-tick', 200, updateAmplitude);
            updateAmplitude();

        });
    }

}