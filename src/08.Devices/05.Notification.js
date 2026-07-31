/**
 * 
 * Represents a notification object.
 * 
 * IOs payload
 *  { 
 *      aps: {
 *          alert: {
 *              title: "Hello Alex!",
 *              subtitle: "You pretty boy"
 *          },
 *          payload: "payload 1234"
 *     }
 *  }
 * 
 * Android payload
 *  
 *  {
 *      data: {
 *          title: "Hello Alex!", 
 *          body: "You pretty boy!", 
 *          payload: "payload 1234"
 *      },
 *      priority: "high",
 *      content_available: true
 *  }
 * 
 * 
 * @class
 * @extends Destructable
 * @memberof Colibri.Devices
 */
Colibri.Devices.Notification = class extends Destructable {

    /**
     * Instance variable representing the device.
     * @type {Colibri.UI.Device}
     * @private
     */
    _device = null;

    /**
     * Instance variable representing the payload.
     * @type {null}
     * @private
     */
    _payload = null;

    /**
     * Creates an instance of Notification.
     * @constructor
     * @param {*} device - The device object.
     * @param {*} payload - The notification payload.
     */
    constructor(device, payload) {
        super();
        
        this._device = device;
        this._payload = payload;
    }

    /**
     * Gets the title of the notification.
     * @returns {string} - The title.
     */
    get title() {
        if(this._device.isAndroid) {
            return this._payload.data.title;
        }
        else if(this._device.isIOs) {
            return this._payload.data.title;
        }
    }
    /**
     * Gets the subtitle of the notification.
     * @returns {string} - The subtitle.
     */
    get subtitle() {
        if(this._device.isAndroid) {
            return this._payload.data.body;
        }
        else if(this._device.isIOs) {
            
        }
    }
    /**
     * Gets the payload of the notification.
     * @returns {string} - The payload.
     */
    get payload() {
        if(this._device.isAndroid) {
            return this._payload.data.payload;
        }
        else if(this._device.isIOs) {
            
        }
    }

}
