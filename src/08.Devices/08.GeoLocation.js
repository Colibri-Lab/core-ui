
Colibri.Devices.Dialogs = class extends Destructable {

    _device = null;
    _plugin = null;
    _permited = false;

    constructor(device) {
        super();
        this._device = device;
        this._plugin = this._device.Plugin('geolocation');
    }

    Detect(options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((position) => {
                resolve(position);
            }, (error) => {
                reject(error);
            });    
        });
    }

}