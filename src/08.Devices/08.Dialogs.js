/**
 * Represents a utility for displaying dialogs and notifications.
 * @class
 * @extends Destructable
 * @memberof Colibri.Devices
 */
Colibri.Devices.Dialogs = class extends Destructable {
    
    /**
     * Instance variable representing the device.
     * @type {Colibri.UI.Device}
     * @private
     */
    _device = null;
    /**
     * Instance variable representing the notification plugin.
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
     * Creates an instance of Dialogs.
     * @constructor
     * @param {Colibri.Devices.Device} device - The device object.
     */
    constructor(device) {
        super();
        this._device = device;
        this._plugin = this._device.Plugin('notification');
    }

    /**
     * Displays an alert dialog.
     * @param {string} message - The message to display.
     * @param {string} title - The title of the alert dialog.
     * @param {string} buttonName - The label for the button.
     * @returns {Promise} - Promise resolving when the alert is dismissed.
     * @async
     * @public
     * @example
     * ```
     * App.Device.Dialogs.Alert('This is an alert message.', 'Alert Title', 'OK')
     *     .then(() => {
     *         console.log('Alert dismissed.');
     *     })
     *     .catch(error => {
     *         console.error('Error displaying alert:', error);
     *     });
     * ```
     */
    Alert(message, title, buttonName) {
        return new Promise((resolve, reject) => {
            this._plugin.alert(
                message,
                () => {
                    resolve();
                },
                title,
                buttonName
            );
        });
    }

    /**
     * Displays a confirmation dialog.
     * @param {string} message - The message to display.
     * @param {string} title - The title of the confirmation dialog.
     * @param {string[]} buttonLabels - Labels for the buttons.
     * @returns {Promise} - Promise resolving with the index of the selected button.
     * @async
     * @public
     * @example
     * ```
     * App.Device.Dialogs.Confirm('Are you sure?', 'Confirmation', ['Yes', 'No'])
     *     .then(buttonIndex => {
     *         console.log('Button index selected:', buttonIndex);
     *     })
     *     .catch(error => {
     *         console.error('Error displaying confirmation dialog:', error);
     *     });
     * ```
     */
    Confirm(message, title, buttonLabels = ['Ok', 'Cancel']) {
        return new Promise((resolve, reject) => {
            this._plugin.confirm(
                message,
                (buttonIndex) => {
                    resolve(buttonIndex);
                },
                title,
                buttonLabels
            );
        });
    }
 
    /**
     * Displays a prompt dialog.
     * @param {string} message - The message to display.
     * @param {string} title - The title of the prompt dialog.
     * @param {string[]} buttonLabels - Labels for the buttons.
     * @param {string} defaultText - The default text in the input field.
     * @returns {Promise} - Promise resolving with the entered text and button index.
     * @async
     * @public
     * @example
     * ```
     * App.Device.Dialogs.Prompt('Enter your name:', 'Prompt', ['OK', 'Cancel'], 'Default Name')
     *     .then(result => {
     *         console.log('Entered text:', result.input1);
     *         console.log('Button index selected:', result.buttonIndex);
     *     })
     *     .catch(error => {
     *         console.error('Error displaying prompt dialog:', error);
     *     });
     * ```
     */
    Prompt(message, title, buttonLabels = ['Ok', 'Cancel'], defaultText = '') {
        return new Promise((resolve, reject) => {
            this._plugin.confirm(
                message,
                (results) => {
                    resolve(results);
                },
                title,
                buttonLabels
            );
        });
    }

    /**
     * Emits a beep sound.
     * @param {number} times - The number of times to beep.
     * @public
     * @example
     * ```
     * App.Device.Dialogs.Beep(3)
     *     .then(() => {
     *         console.log('Beeped 3 times.');
     *     })
     *     .catch(error => {
     *         console.error('Error emitting beep:', error);
     *     });
     * ```
     */
    Beep(times) {
        this._plugin && this._plugin.beep(times);
    }

    /**
     * Schedules a local notification.
     * @param {string} title - The title of the notification.
     * @param {string} message - The message of the notification.
     * @param {object} trigger - The trigger object defining when to fire the notification.
     * @param {boolean} isForeground - Whether the app is in the foreground when notification fires.
     * @param {boolean} isLaunch - Whether the app launches when notification is tapped.
     * @param {number} priority - The priority of the notification.
     * @public
     * @example
     * ```
     * App.Device.Dialogs.Schedule('Notification Title', 'This is a notification message.', { in: 5, unit: 'seconds' }, true, true, 2)
     *     .then(() => {
     *         console.log('Notification scheduled.');
     *     })
     *     .catch(error => {
     *         console.error('Error scheduling notification:', error);
     *     });
     * ```
     */
    Schedule(title, message, trigger, isForeground = true, isLaunch = true, priority = 2) {
        // trigger = { in: 1, unit: 'second' }, { in: 15, unit: 'minutes' }
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