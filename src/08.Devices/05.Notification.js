/**
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
 */
Colibri.Devices.Notification = class {

    _device = null;
    _payload = null;

    constructor(device, payload) {
        this._device = device;
        this._payload = payload;
    }

    get title() {
        if(this._device.isAndroid) {
            return this._payload.data.title;
        }
        else if(this._device.isIOs) {
            return this._payload.data.title;
        }
    }
    get subtitle() {
        if(this._device.isAndroid) {
            return this._payload.data.body;
        }
        else if(this._device.isIOs) {
            
        }
    }
    get payload() {
        if(this._device.isAndroid) {
            return this._payload.data.payload;
        }
        else if(this._device.isIOs) {
            
        }
    }

}