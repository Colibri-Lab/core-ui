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

/**
 * Represents an emulator for local notifications.
 * @class
 * @extends Destructable
 */
Colibri.Devices.LocalNotificationsEmulator = class extends Destructable {
    /**
     * Checks if the emulator has permission.
     * @param {function} success - Success callback.
     * @param {function} fail - Fail callback.
     */
    hasPermission(success, fail) {
        success(true);
    }
    /**
     * Requests permission for the emulator.
     * @param {function} success - Success callback.
     * @param {function} fail - Fail callback.
     */
    requestPermission(success, fail) {
        success(true);
    }
    /**
     * Schedules a notification with given parameters.
     * @param {*} params - Parameters for scheduling the notification.
     */
    schedule(params) {
        //
    }
    /**
     * Cancels a scheduled notification with given id.
     * @param {number} id - The id of the notification to cancel.
     */
    cancel(id) {
        // 
    }
    /**
     * Registers an event listener.
     * @param {string} event - The event to listen for.
     * @param {function} callback - The callback function.
     * @param {*} scope - The scope of the callback.
     */
    on(event, callback, scope) {
        // 
    }
     /**
     * Unregisters an event listener.
     * @param {string} event - The event to stop listening for.
     * @param {function} callback - The callback function.
     * @param {*} scope - The scope of the callback.
     */
    un(event, callback, scope) {
        // 
    }
}

/**
 * Represents a utility for handling local notifications.
 * @class
 * @extends Destructable
 */
Colibri.Devices.LocalNotifications = class extends Destructable {
    
    /**
     * Instance variable representing the device.
     * @type {Colibri.UI.Device}
     * @private
     */
    _device = null;
    /**
     * Instance variable representing the plugin.
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

    _notifications = {};

    /**
     * Creates an instance of LocalNotifications.
     * @param {*} device - The device object.
     */
    constructor(device) {
        super();
        this._device = device;
        if(this._device.isWeb) {
            this._plugin = {local: new Colibri.Devices.LocalNotificationsEmulator()};
        } else {
            this._plugin = this._device.Plugin('notification.local');
        }
    }

    FireQueuedEvents() {
        this._plugin.fireQueuedEvents();
    }

    /**
     * Checks if permission is granted.
     * @returns {Promise} - Promise resolving when permission is granted.
     */
    HasPermission() {
        return new Promise((resolve, reject) => {
            if(this._granted) {
                resolve();
            } else {
                this._plugin.hasPermission((granted) => {
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

    /**
     * Requests permission for notifications.
     * @returns {Promise} - Promise resolving when permission is granted.
     */
    RequestPermission() {
        return new Promise((resolve, reject) => {
            if(App.Device.isAndroid && App.Device.Info.version >= 13) {
                App.Device.RequestPermission('POST_NOTIFICATIONS').then((hasPermission) => {
                    if(!hasPermission) {
                        reject('Can not obtain permission for notifications');
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Adds actions to a notification group.
     * @param {string} groupName - The name of the notification group.
     * @param {*} actions - Actions to add.
     */
    AddActions(groupName, actions) {
        this._plugin.addActions(groupName, actions);
    }
    /**
     * Removes actions from a notification group.
     * @param {string} groupName - The name of the notification group.
     */
    RemoveActions(groupName) {
        this._plugin.removeActions(groupName);
    }

    _scheduleNotification(params, successCallback = null, errorCallback = null) {
        return new Promise((resolve, reject) => {
            this.RequestPermission().then(() => {
                this._plugin.cancelAll(() => {
                    console.log(params);
                    this._plugin.schedule(params, successCallback, errorCallback);
                    resolve();
                });
            });        
        })
    }

    /**
     * Schedules a notification with given parameters.
     * @param {number} id - The id of the notification.
     * @param {string} title - The title of the notification.
     * @param {string} message - The message of the notification.
     * @param {*} actions - Actions to attach to the notification.
     * @param {*} trigger - Trigger for the notification.
     * @param {{launch,foreground,priority,sticky,sound}} options - Additional options for the notification.
     * @param {*} progressBar - Progress bar configuration.
     * @param {Function} callback - Callback function to execute after scheduling.
     */
    Schedule(title, message, actions = null, trigger = null, data = null, options = {}, progressBar = null, successCallback = null, errorCallback = null) {
        const params = Object.assign(options, {
            title: title,
            text: message,
            data: data,
            launch: true
        });
        if(trigger) {
            params.trigger = trigger;
        } 
        if(actions && actions.length > 0) {
            params.actions = actions;
        }
        if(progressBar) {
            params.progressBar = progressBar;
        }
        return this._scheduleNotification(params, successCallback, errorCallback);
    }

    /**
     * Cancels a scheduled notification with given id.
     * @param {number} id - The id of the notification to cancel.
     */
    Cancel(id) {
        this.RequestPermission().then(() => {
            this._plugin.cancel(id);
        });
    }

    /**
     * Registers an event listener.
     * @param {string} event - The event to listen for.
     * @param {function(notification, eopts)} callback - The callback function.
     * @param {*} scope - The scope of the callback.
     */
    On(event, callback, scope) {
        this._plugin.on(event, callback, scope);
    }

    /**
     * Unregisters an event listener.
     * @param {string} event - The event to stop listening for.
     * @param {function} callback - The callback function.
     * @param {*} scope - The scope of the callback.
     */
    Off(event, callback, scope) {
        this._plugin.un(event, callback, scope);
    }

}