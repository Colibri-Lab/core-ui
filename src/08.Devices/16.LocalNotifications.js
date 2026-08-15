/**
 * Represents a utility for handling local notifications.
 * @class
 * @extends Destructable
 * @memberof Colibri.Devices
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

    /**
     * Notifications
     * @type {Object}
     * @private
     */
    _notifications = {};

    /**
     * Creates an instance of LocalNotifications.
     * @constructor
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

    /**
     * Fires queued events.
     * @public
     * @example
     * ```
     * App.Device.LocalNotifications.FireQueuedEvents();
     * ```
     */
    FireQueuedEvents() {
        this._plugin.fireQueuedEvents();
    }

    /**
     * Checks if permission is granted.
     * @returns {Promise} - Promise resolving when permission is granted.
     * @public
     * @example
     * ```
     * App.Device.LocalNotifications.HasPermission()
     *     .then(() => {
     *         console.log('Permission granted for local notifications.');
     *     })
     *     .catch(() => {
     *         console.error('Permission denied for local notifications.');
     *     });
     * ```
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
     * @public
     * @example
     * ```
     * App.Device.LocalNotifications.RequestPermission()
     *     .then(() => {
     *         console.log('Permission granted for local notifications.');
     *     })
     *     .catch(() => {
     *         console.error('Permission denied for local notifications.');
     *     });
     * ```
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
     * @public
     * @example
     * ```
     * App.Device.LocalNotifications.AddActions('myGroup', [
     *     { id: 'action1', title: 'Action 1' },
     *     { id: 'action2', title: 'Action 2' }
     * ]);
     * ```
     */
    AddActions(groupName, actions) {
        this._plugin.addActions(groupName, actions);
    }
    /**
     * Removes actions from a notification group.
     * @param {string} groupName - The name of the notification group.
     * @public
     * @example
     * ```
     * App.Device.LocalNotifications.RemoveActions('myGroup');
     * ```
     */
    RemoveActions(groupName) {
        this._plugin.removeActions(groupName);
    }

    /**
     * Schedules a notification with given parameters.
     * @param {*} params - Parameters for scheduling the notification.
     * @param {function} successCallback - Success callback function.
     * @param {function} errorCallback - Error callback function.
     * @returns {Promise} - Promise resolving when the notification is scheduled.
     * @private
     */
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
     * @public
     * @example
     * ```
     * App.Device.LocalNotifications.Schedule(1, 'Notification Title', 'This is a notification message.', null, { in: 5, unit: 'seconds' }, { launch: true, foreground: true, priority: 2 }, null, () => {
     *     console.log('Notification scheduled.');
     * });
     * ```
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
     * @public
     * @example
     * ```
     * App.Device.LocalNotifications.Cancel(1);
     * ```
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
     * @public
     * @example
     * ```
     * App.Device.LocalNotifications.On('click', (notification, eopts) => {
     *     console.log('Notification clicked:', notification);
     * }, this);
     * ```
     */
    On(event, callback, scope) {
        this._plugin.on(event, callback, scope);
    }

    /**
     * Unregisters an event listener.
     * @param {string} event - The event to stop listening for.
     * @param {function} callback - The callback function.
     * @param {*} scope - The scope of the callback.
     * @public
     * @example
     * ```
     * App.Device.LocalNotifications.Off('click', myClickHandler, this);
     * ```
     */
    Off(event, callback, scope) {
        this._plugin.un(event, callback, scope);
    }

}