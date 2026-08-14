/**
 * Represents a media recording utility for handling audio recording.
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Devices.Media
 */
Colibri.Devices.Media.Recording = class extends Colibri.Events.Dispatcher {

    /** 
     * Creates an instance of Media.Recording.
     * @constructor
     * @param {string} file - The file path for the recording.
     * @param {function} recordingCompleted - Callback function when recording is completed.
     * @param {function} recordingError - Callback function when an error occurs during recording.  
     */
    constructor(file, recordingCompleted, recordingError) {
        super();
        this._mediaRec = new Media(file,
            () => {
                window.resolveLocalFileSystemURL(file, function(entry) {
                    entry.file((file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const blob = new Blob([new Uint8Array(reader.result)], { type: 'audio/wav' });
                            recordingCompleted(blob);
                        };
                        reader.readAsArrayBuffer(file);
                    });
                });
                
            },
            recordingError
        );
    }

    /**
     * Start recording the media.
     * @public
     */
    Start() {
        this._mediaRec.startRecord();
    }

    /**
     * Stop recording the media.
     * @public
     */
    Stop() {
        this._mediaRec.stopRecord();
    }

    /**
     * Static method to start recording a media file.
     * @param {string} mediaFile - The media file to record.
     * @returns {*} - The media object.
     */
    static StartRecording(type = 'audio', success, error) {
        const filePath = cordova.file.cacheDirectory + 'temp.' + (type === 'audio' ? 'wav' : 'mp4');
        const rec = new Colibri.Devices.Media.Recording(filePath, success, error);
        rec.Start();
        return rec;
    }
}


