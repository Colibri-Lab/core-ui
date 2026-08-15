
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
     * Creates an instance of GeoLocation.
     * @constructor
     * @param {Colibri.Devices.Device} device - The device object.
     */
    constructor(device) {
        super();
        this._device = device;
    }

    /**
     * Detects the current position.
     * @param {object} options - The options for geolocation detection.
     * @returns {Promise} - Promise resolving with the current position.
     * @async
     * @public
     * @example
     * ```
     * App.Device.GeoLocation.Detect({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true })
     *     .then(position => {
     *         console.log('Current position:', position);
     *     })
     *     .catch(error => {
     *         console.error('Error detecting position:', error);
     *     });
     * ```
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
     * @async
     * @public
     * @example
     * ```
     * App.Device.GeoLocation.Watch((position) => {
     *         console.log('Position changed:', position);
     *     }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true })
     *     .then(() => {
     *         console.log('Started watching position.');
     *     })
     *     .catch(error => {
     *         console.error('Error watching position:', error);
     *     });
     * ```
     */
    Watch(callback, options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.watchPosition(callback, (error) => {
                reject(error);
            }, options);
        });
    }

}