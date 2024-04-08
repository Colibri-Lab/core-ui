/**
 * Represents a device in the Colibri framework, providing functionalities related to the device's platform, theme, and plugins.
 * @class
 * @extends Colibri.Events.Dispatcher
 */
Colibri.Devices.Device = class extends Colibri.Events.Dispatcher {

    /**
     * Represents the platform types.
     * @readonly
     * @enum {string}
     */
    static Platform = {
        Web: 'web',
        IOs: 'ios',
        Android: 'android',
        Windows: 'electron'
    };

    /**
     * Represents the theme types.
     * @readonly
     * @enum {string}
     */
    static Theme = {
        Light: 'light',
        Dark: 'dark'
    };

    /**
     * Represents the platform type of the device.
     * @private
     */
    _platform = '';
    /**
     * Represents the file system of the device.
     * @private
     */
    _fileSystem = null;
    /**
     * Represents the theme of the device.
     * @private
     */
    _theme = 'light';
    /**
     * Represents the theme detection plugin.
     * @private
     */
    _themeDetectionPlugin = null;
    /**
     * Represents the push notifications plugin.
     * @private
     */
    _pushNotifications = null;
    
    /**
     * Creates an instance of Device.
     */
    constructor() {
        super();
        this._detect();        
        this._registerEvents();
        this._bindDeviceEvents();

        try {
            this._currentOrientation = screen.orientation.type;
        }
        catch(e) {}

    }

    /**
     * Registers events for the device.
     * @private
     */
    _registerEvents() {
        this.RegisterEvent('OrientationChanged', false, 'Когда ориентация была изменена');
        this.RegisterEvent('ThemeChanged', false, 'Когда тема изменена');
        this.RegisterEvent('NotificationTapped', false, 'When push notification is tapped');
    }

    /**
     * Detects the platform and initializes theme detection and push notifications.
     * @private
     */
    _detect() {
        if(!window.hasOwnProperty("cordova")){
            this._platform = 'web';
            this._theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? Colibri.Devices.Device.Dark : Colibri.Devices.Device.Light;
        }
        else {
            this._platform = cordova.platformId;
            if(this.isIOs) {
                this._themeDetectionPlugin = this.Plugin('ThemeDetection');
                this._themeDetectionPlugin.isDarkModeEnabled((result) => {
                    this._theme = result.value ? Colibri.Devices.Device.Dark : Colibri.Devices.Device.Light;
                }, () => {
                    this._theme = Colibri.Devices.Device.Light;
                })
            } else {
                this._themeDetectionPlugin = this.Plugin('AutoTheme');
                if(this._themeDetectionPlugin) {
                    this._themeDetectionPlugin.getTheme((isdark) => {
                        this._theme = isdark ? Colibri.Devices.Device.Dark : Colibri.Devices.Device.Light;
                    });
                }
            }
            this._pushNotifications = this.Plugin('pushNotification');
            if(this._pushNotifications) {
                this._pushNotifications.registration((token) => {
                    console.log(token);
                }, e => console.log(e));
                this._pushNotifications.tapped((payload) => {
                    this.Dispatch('NotificationTapped', {payload: payload})
                }, e => console.log(e));
            }    

            this._localNotifications = new Colibri.Devices.LocalNotifications(this);
        }

    }

    /**
     * Binds events related to the device.
     * @private
     */
    _bindDeviceEvents() {
        window.addEventListener("orientationchange", () => {
            const old = this._currentOrientation;
            this._currentOrientation = screen.orientation.type;
            this.Dispatch('OrientationChanged', {current: this._currentOrientation, old: old});
        });
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
            const old = this._theme;
            this._theme = e.matches ? Colibri.Devices.Device.Dark : Colibri.Devices.Device.Light;
            this.Dispatch('ThemeChanged', {current: this._theme, old: old});
        });
        if(this._themeDetectionPlugin) {
            window.onThemeChange = (isdark) => {
                const old = this._theme;
                this._theme = isdark ? Colibri.Devices.Device.Dark : Colibri.Devices.Device.Light;
                this.Dispatch('ThemeChanged', {current: this._theme, old: old});
            };
        }
        
        
    }

    /**
     * Gets the platform type of the device.
     * @returns {string} The platform type.
     */
    get platform() {
        return this._platform;
    }

    /**
     * Checks if the device platform is Android.
     * @returns {boolean} True if the device platform is Android, otherwise false.
     */
    get isAndroid() {
        return this._platform === Colibri.Devices.Device.Android;
    }

    /**
     * Checks if the device platform is iOS.
     * @returns {boolean} True if the device platform is iOS, otherwise false.
     */
    get isIOs() {
        return this._platform === Colibri.Devices.Device.IOs;
    }

    /**
     * Checks if the device platform is Windows.
     * @returns {boolean} True if the device platform is Windows, otherwise false.
     */
    get isWindows() {
        return this._platform === Colibri.Devices.Device.Windows;
    }

    /**
     * Checks if the device platform is Web.
     * @returns {boolean} True if the device platform is Web, otherwise false.
     */
    get isWeb() {
        return this._platform === Colibri.Devices.Device.Web;
    }

    /**
     * Gets the background mode of the device.
     * @return {boolean} value - The value to set for background mode.
     */
    get backgroundMode() {
        return this._backgroundMode;
    }

    /**
     * Sets the background mode of the device.
     * @param {boolean} value - The value to set for background mode.
     * @throws {string} Throws an error if the 'cordova-plugin-background-mode' plugin is not enabled.
     */
    set backgroundMode(value) {
        if(!cordova?.plugins?.backgroundMode) {
            throw 'Please enable \'cordova-plugin-background-mode\' plugin';
        }

        this._backgroundMode = value;
        cordova.plugins.backgroundMode.setEnabled(value);
        if(value) {
            cordova.plugins.backgroundMode.setDefaults({ silent: true });
            // cordova.plugins.backgroundMode.overrideBackButton();
            cordova.plugins.backgroundMode.on('activate', function () {
                cordova.plugins.backgroundMode.disableWebViewOptimizations();
            });
        }
    
    }

    /**
     * Wakes up the device.
     * @throws {string} Throws an error if the 'cordova-plugin-background-mode' plugin is not enabled.
     */
    WakeUp() {
        if(!cordova?.plugins?.backgroundMode) {
            throw 'Please enable \'cordova-plugin-background-mode\' plugin';
        }
        cordova.plugins.backgroundMode.wakeUp();
    }

    /**
     * Unlocks the device.
     * @throws {string} Throws an error if the 'cordova-plugin-background-mode' plugin is not enabled.
     */
    Unlock() {
        if(!cordova?.plugins?.backgroundMode) {
            throw 'Please enable \'cordova-plugin-background-mode\' plugin';
        }
        cordova.plugins.backgroundMode.unlock();
    }

    /**
     * Retrieves the safe area of the device.
     * @returns {Promise<{top: number, bottom: number}>} A promise that resolves with the safe area object containing top and bottom values.
     */
    SafeArea() {
        return new Promise((resolve, reject) => {
            if(this.isIOs) {
                if(!window?.plugins?.safearea) {
                    reject('Can not fund \'cordova-plugin-safearea\' plugin');
                }
                window.plugins.safearea.get((result) => {
                    resolve(result);
                }, (e) => {
                    reject(e);
                });
            } else {
                resolve({top: 0, bottom: 0});
            }
        });
    }

    /**
     * Retrieves a plugin based on the provided query.
     * @param {string} query - The query string to retrieve the plugin.
     * @returns {*} The plugin object if found, otherwise undefined.
     */
    Plugin(query) {
        let plugin = eval('cordova.' + query);
        if(!plugin) {
            plugin = eval('navigator.' + query);
        }
        if(!plugin) {
            plugin = eval('cordova.plugins.' + query);
        }
        if(!plugin) {
            plugin = eval('window.' + query);
        }
        if(!plugin) {
            plugin = eval(query);
        }
        return plugin;
    } 

    /**
     * Locks the device orientation to a specified type.
     * @param {string|null} [type=null] - The orientation type to lock. Defaults to the current orientation type.
     */
    LockOrientation(type = null) {
        try {
            screen.orientation.lock(type || this._currentOrientation.type);
        }
        catch(e) {
            console.log(e)
        }
    }

    /**
     * Unlocks the device orientation.
     */
    UnlockOrientation() {
        try {
            screen.orientation.unlock();
        }
        catch(e) {
            console.log(e)
        }
    }

    /**
     * Retrieves the file system of the device.
     * @returns {Colibri.Devices.FileSystem} The file system instance.
     */
    get FileSystem() {
        if(!this._fileSystem) {
            this._fileSystem = new Colibri.Devices.FileSystem(this);
        }
        return this._fileSystem;
    }

    /**
     * Retrieves the camera instance.
     * @returns {Colibri.Devices.Camera} The camera instance.
     */
    get Camera() {
        if(!this._camera) {
            this._camera = new Colibri.Devices.Camera(this);
        }
        return this._camera;
    }

    /**
     * Retrieves the SMS instance.
     * @returns {Colibri.Devices.Sms} The SMS instance.
     */
    get Sms() {
        if(!this._sms) {
            this._sms = new Colibri.Devices.Sms(this);
        }
        return this._sms;
    }

    /**
     * Retrieves the dialogs instance.
     * @returns {Colibri.Devices.Dialogs} The dialogs instance.
     */
    get Dialogs() {
        if(!this._dialogs) {
            this._dialogs = new Colibri.Devices.Dialogs(this);
        }
        return this._dialogs;
    }

    /**
     * Retrieves the local notifications instance.
     * @returns {Colibri.Devices.LocalNotifications} The local notifications instance.
     */
    get Notifications() {
        return this._localNotifications;
    }

    /**
     * Retrieves device information.
     * @returns {Object} The device information.
     */
    get Info() {
        
        if(!window.hasOwnProperty("cordova")){
            console.log('Plugin cordova.device is not installed. Please run cordova plugin add cordova-plugin-device');
            return {};
        }

        return {
            cordova: device.cordova,
            model: device.model,
            platform: device.platform,
            uuid: device.uuid,
            version: device.version,
            manufacturer: device.manufacturer,
            isVirtual: device.isVirtual,
            serial: device.serial,
        }
    }

    /**
     * Retrieves the current theme.
     * @returns {string} The current theme.
     */
    get Theme() {
        return this._theme;
    }

    /**
     * Retrieves the geolocation instance.
     * @returns {Colibri.Devices.GeoLocation} The geolocation instance.
     */
    get GeoLocation() {
        if(!this._geoLocation) {
            this._geoLocation = new Colibri.Devices.GeoLocation(this);
        }
        return this._geoLocation;
    }

}