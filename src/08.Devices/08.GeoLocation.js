
Colibri.Devices.GeoLocation = class extends Destructable {

    _device = null;
    _plugin = null;
    _permited = false;

    constructor(device) {
        super();
        this._device = device;
    }

    Detect(options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((position) => {
                resolve(position);
            }, (error) => {
                reject(error);
            }, options);    
        });
    }

    Watch(callback, options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.watchPosition(callback, (error) => {
                reject(error);
            }, options);
        });
    }

}