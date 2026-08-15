
/**
 * Represents a utility for accessing sim information.
 * @class
 * @extends Destructable
 * @memberof Colibri.Devices
 */
Colibri.Devices.Vibrate = class extends Destructable {

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
     * @param {Array<Number>|Number} time 
     * @public
     * @example
     * ```
     * /// Vibrate for 1000 milliseconds
     * Colibri.Devices.Vibrate.Vibrate(1000);
     * 
     * /// Vibrate for 500 milliseconds, pause for 200 milliseconds, then vibrate for 300 milliseconds
     * Colibri.Devices.Vibrate.Vibrate([500, 200, 300]);
     * ```
     */
    Vibrate(time) {
        navigator.vibrate(time);
    }

}