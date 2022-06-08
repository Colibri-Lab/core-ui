Colibri.Devices.Camera = class extends Colibri.Events.Dispatcher {

    _device = null;
    _plugin = null;


    constructor(device) {
        super();
        this._device = device;
        this._plugin = this._device.Plugin('camera');
    }

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

    CleanUp() {
        return new Promise((resolve, reject) => {
            this._plugin.cleanup(() => {
                resolve();
            }, e => reject(e), options)
        }); 
    }

}