
/**
 * Represents a utility for accessing sim information.
 * @class
 * @extends Destructable
 * @memberof Colibri.Devices
 */
Colibri.Devices.Sim = class extends Destructable {

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
        this._plugin = this._device.Plugin('sim');
    }

    /**
     * Detects the current position.
     * @returns {Promise} - Promise resolving with the current position.
     */
    HasPermission() {
        return new Promise((resolve, reject) => {
            this._plugin.hasReadPermission((result) => {
                resolve(result);
            }, (error) => {
                reject(error);
            });
        });
    }

    /**
     * Detects the current position.
     * @returns {Promise} - Promise resolving with the current position.
     */
    RequestPermission() {
        this._plugin.requestReadPermission();
    }


    /**
     * Detects the current sim installed.
     * @returns {Promise<{carrierName,countryCode,mcc,mnc}>} - Promise resolving with the current position.
     */
    Detect() {
        return new Promise((resolve, reject) => {
            const _detect = () => {
                this._plugin.getSimInfo((result) => {
                    resolve(result);
                }, (error) => {
                    reject(error);
                });                   
            };
            const _check = () => {
                this.HasPermission()
                    .then(_detect)
                    .catch(() => {
                        Colibri.Common.Delay(5000).then(_check);        
                    });
            }
            this.RequestPermission();
            Colibri.Common.Delay(5000).then(_check);
            
        });
    }

}