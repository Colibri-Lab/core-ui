
/**
 * Represents a utility for accessing geolocation information.
 * @class
 * @extends Destructable
 * @memberof Colibri.Devices
 */
Colibri.Devices.GeoLocation = class extends Destructable {

    /**
     * Instance variable representing the device.
     * @type {Colibri.UI.Device}
     * @private
     */
    _device = null;
    /**
     * Instance variable representing the geolocation plugin.
     * @type {object}
     * @private
     */
    _plugin = null;
    /**
     * Flag indicating whether permission is granted.
     * @type {boolean}
     * @private
     */
    _permited = false;

    /**
     * Creates an instance of GeoLocation.
     * @param {*} device - The device object.
     */
    constructor(device) {
        super();
        this._device = device;
    }

    /**
     * Detects the current position.
     * @param {object} options - The options for geolocation detection.
     * @returns {Promise} - Promise resolving with the current position.
     */
    Detect(options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((position) => {
                resolve(position);
            }, (error) => {
                reject(error);
            }, options);    
        });
    }

    /**
     * Watches for changes in position.
     * @param {function} callback - The callback function to handle position changes.
     * @param {object} options - The options for watching position changes.
     * @returns {Promise} - Promise resolving when position watching is started.
     */
    Watch(callback, options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.watchPosition(callback, (error) => {
                reject(error);
            }, options);
        });
    }

}