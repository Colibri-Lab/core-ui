/**
 * Represents a camera utility for capturing pictures.
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Devices
 */
Colibri.Devices.Camera = class extends Colibri.Events.Dispatcher {

    /**
     * Instance variable representing the device.
     * @type {null}
     * @private
     */
    _device = null;

    /**
     * Instance variable representing the plugin.
     * @type {null}
     * @private
     */
    _plugin = null;

    /**
     * Creates an instance of Camera.
     * @param {*} device - The device object.
     */
    constructor(device) {
        super();
        this._device = device;
        this._plugin = this._device.Plugin('camera');
    }

    /**
     * Gets a picture from the camera.
     * @constructor
     * @param {*} options - Options for getting the picture.
     * @returns {Promise} - Promise resolving to the picture URI.
     */
    GetPicture(options = {}) {
        options = Object.assign({
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI, 
            sourceType: Camera.PictureSourceType.CAMERA, 
            allowEdit: false, 
            encodingType: Camera.EncodingType.PNG,
            mediaType: Camera.MediaType.PICTURE, 
            correctOrientation: false,
            saveToPhotoAlbum: false,
            cameraDirection: Camera.Direction.BACK
        }, options);
        return new Promise((resolve, reject) => {
            this._plugin.getPicture((picture) => {
                resolve(picture);
            }, e => reject(e), options)
        }); 
    }

    /**
     * Cleans up temporary files.
     * @returns {Promise} - Promise resolving when cleanup is complete.
     */
    CleanUp() {
        return new Promise((resolve, reject) => {
            this._plugin.cleanup(() => {
                resolve();
            }, e => reject(e), options)
        }); 
    }

}