/**
 * Represents a utility for displaying dialogs and notifications.
 * @class
 * @extends Destructable
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
     * @param {*} device - The device object.
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
     */
    Beep(times) {
        this._plugin.beep(times);
    }

    /**
     * Schedules a local notification.
     * @param {string} title - The title of the notification.
     * @param {string} message - The message of the notification.
     * @param {object} trigger - The trigger object defining when to fire the notification.
     * @param {boolean} isForeground - Whether the app is in the foreground when notification fires.
     * @param {boolean} isLaunch - Whether the app launches when notification is tapped.
     * @param {number} priority - The priority of the notification.
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