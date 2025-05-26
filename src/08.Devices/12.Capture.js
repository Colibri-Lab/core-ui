
/**
 * Represents a utility for accessing sim information.
 * @class
 * @extends Destructable
 * @memberof Colibri.Devices
 */
Colibri.Devices.Capture = class extends Destructable {

    /**
     * Instance variable representing the device.
     * @type {Colibri.UI.Device}
     * @private
     */
    _device = null;

    /**
     * Creates an instance of GeoLocation.
     * @constructor
     * @param {Colibri.Devices.Device} device - The device object.
     */
    constructor(device) {
        super();
        this._device = device;
    }

    /**
     * Vibrates
     * @param {Array<Number>|Nunber} time 
     */
    Audio(limit = 10) {
        return new Promise((resolve, reject) => {
            navigator.device.capture.captureAudio((mediaFiles) => {
                const file = mediaFiles[0];
                window.resolveLocalFileSystemURL(file.fullPath, function(fileEntry) {
                    fileEntry.file(function(file) {
                        const reader = new FileReader();
                        reader.onloadend = function() {
                            const blob = new Blob([new Uint8Array(this.result)], { type: file.type });
                            resolve(blob);
                        };
                        reader.readAsArrayBuffer(file);
                    }, fileFail);
                }, fileFail);
            }, (error) => {
                reject(error);
            }, {limit: limit});
        });
    }

}