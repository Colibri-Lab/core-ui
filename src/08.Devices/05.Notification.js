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

    HasPermnission() {
        return new Promise((resolve, reject) => {
            this._device.local.hasPermission((granted) => {
                this._granted = granted;
                if(granted) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    RequestPermission() {
        return new Promise((resolve, reject) => {
            if(this._granted) {
                resolve();
            } else {
                this.HasPermnission().catch(() => {
                    this._device.local.requestPermission(function (granted) {
                        this._granted = granted;
                        if(granted) {
                            resolve();
                        } else {
                            reject();
                        }
                    });    
                });
            }
        });
    }

    Schedule(title, message, buttonKey, buttonText, trigger, isForeground = true, isLaunch = true, priority = 2) {
        // trigger = { in: 1, unit: 'second' }, { in: 15, unit: 'minutes' }
        this.RequestPermission().then(() => {
            this._plugin.local.schedule({
                title: title,
                text: message,
                trigger: trigger,
                foreground: isForeground,
                launch: isLaunch,
                priority: priority,
                actions: [{ id: buttonKey, title: buttonText }]
            });    
        })
    }

    On(event, callback, scope) {
        this._device.local.un(event, callback, scope);
    }

}