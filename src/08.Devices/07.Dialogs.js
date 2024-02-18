
Colibri.Devices.Dialogs = class extends Destructable {
    
    _device = null;
    _plugin = null;
    _permited = false;

    constructor(device) {
        super();
        this._device = device;
        this._plugin = this._device.Plugin('notification');
    }

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

    Beep(times) {
        this._plugin.beep(times);
    }

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