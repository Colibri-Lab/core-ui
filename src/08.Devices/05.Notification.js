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
Colibri.Devices.Notification = class extends Destructable {

    _device = null;
    _payload = null;

    constructor(device, payload) {
        super();
        
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


Colibri.Devices.LocalNotifications = class extends Destructable {
    
    _device = null;
    _plugin = null;
    _permited = false;

    constructor(device) {
        super();
        this._device = device;
        this._plugin = this._device.Plugin('plugins.notification');
    }

    Schedule(title, message, trigger, isForeground = true, isLaunch = true, priority = 2) {
        // trigger = { in: 1, unit: 'second' }, { in: 15, unit: 'minutes' }
        debugger;
        this._plugin.local.schedule({
            title: title,
            text: message,
            trigger: trigger,
            foreground: isForeground,
            launch: isLaunch,
            priority: priority,
        });
    }

}