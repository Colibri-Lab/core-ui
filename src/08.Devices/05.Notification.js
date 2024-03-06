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

Colibri.Devices.LocalNotificationsEmulator = class extends Destructable {
    hasPermission(success, fail) {
        success(true);
    }
    requestPermission(success, fail) {
        success(true);
    }
    schedule(params) {
        //
    }
    cancel(id) {
        // 
    }
    on(event, callback, scope) {
        // 
    }
    un(event, callback, scope) {
        // 
    }
}

Colibri.Devices.LocalNotifications = class extends Destructable {
    
    _device = null;
    _plugin = null;
    _permited = false;

    constructor(device) {
        super();
        this._device = device;
        if(this._device.isWeb) {
            this._plugin = {local: new Colibri.Devices.LocalNotificationsEmulator()};
        } else {
            this._plugin = this._device.Plugin('plugins.notification');
        }
        this._plugin.local.setDummyNotifications();
        this._plugin.local.fireQueuedEvents();

    }

    HasPermission() {
        return new Promise((resolve, reject) => {
            if(this._granted) {
                resolve();
            } else {
                this._plugin.local.hasPermission((granted) => {
                    this._granted = granted;
                    if(granted) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            }
        });
    }

    RequestPermission() {
        return new Promise((resolve, reject) => {
            if(this._granted) {
                resolve();
            } else {
                this.HasPermission().catch(() => {
                    this._plugin.local.requestPermission(function (granted) {
                        this._granted = granted;
                        if(granted) {
                            resolve();
                        } else {
                            reject();
                        }
                    });    
                }).then(() => resolve());
            }
        });
    }

    AddActions(groupName, actions) {
        this._plugin.local.addActions(groupName, actions);
    }

    Schedule(event, title, message, actions = null, trigger = null, isForeground = true, isLaunch = true, priority = 2, id = null) {
        // trigger = { in: 1, unit: 'second' }, { in: 15, unit: 'minutes' }
        this.RequestPermission().then(() => {
            const params = {
                title: title,
                text: message,
                foreground: isForeground,
                launch: isLaunch,
                priority: priority,
            }
            if(id) {
                params.id = id;
            }
            if(trigger) {
                params.trigger = trigger;
            }
            if(actions && actions.length > 0) {
                params.actions = actions;
            }
            if(event) {
                params.event = event;
            }
            this._plugin.local.schedule(params);    
        });
    }

    Cancel(id) {
        this.RequestPermission().then(() => {
            this._plugin.local.cancel(id);    
        });
    }

    On(event, callback, scope) {
        this._plugin.local.on(event, callback, scope);
    }
    Off(event, callback, scope) {
        this._plugin.local.un(event, callback, scope);
    }

}