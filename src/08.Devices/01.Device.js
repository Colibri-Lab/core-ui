/**
 * Represents a device in the Colibri framework, providing functionalities related to the device's platform, theme, and plugins.
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Devices
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
    _pushToken = null;
    
    /**
     * Creates an instance of Device.
     * @constructor
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

    get id() {
        let deviceId = App.Browser.Get('device-id');
        if(!deviceId) {
            deviceId = String.MD5(Date.Mc() + '');
            App.Browser.Set('device-id', deviceId);
        }
        return deviceId;

    }

    /**
     * Registers events for the device.
     * @private
     */
    /** @protected */
    _registerEvents() {
        this.RegisterEvent('OrientationChanged', false, 'Когда ориентация была изменена');
        this.RegisterEvent('ThemeChanged', false, 'Когда тема изменена');
        this.RegisterEvent('NotificationTapped', false, 'When push notification is tapped');
        this.RegisterEvent('NotificationToken', false, 'When push notification token is changed');
        this.RegisterEvent('BackgroundMode', false, 'Each 5 seconds whe background mode is active');
        this.RegisterEvent('DeviceLocked', false, 'When user locked the device');
        this.RegisterEvent('DeviceUnlocked', false, 'When user unlocked the device');
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
            this._pushNotifications = this.Plugin('firebase.messaging');
            if(this._pushNotifications) {
                App.AddHandler('ApplicationInitialized', () => {
                    this._pushNotifications.getToken().then((token) => {
                        this._pushToken = token;
                        this.Dispatch('NotificationToken', {token: token});
                    }, e => console.log(e));
                    this._pushNotifications.onMessage((notification) => {
                        this.Dispatch('NotificationTapped', notification);
                    }, e => console.log(e));
                    this._pushNotifications.onBackgroundMessage((notification) => {
                        console.log(this.__handlers);
                        this.Dispatch('NotificationTapped', notification);
                    });
                });
            }    

            this._availableRingtones = {};
            if(this.isAndroid || this.isIOs) {
                this._ringtones = this.Plugin('NativeRingtones');
            } else {
                this._ringtones = null;
            }

            this._localNotifications = new Colibri.Devices.LocalNotifications(this);

            if(window?.ColibriAccessories?.DeviceLock !== undefined) {
                window.ColibriAccessories.DeviceLock.watch((state) => {
                    console.log('device lock state changed', state);
                }, (e) => {
                    console.log('device lock error', e);
                });
                window.addEventListener('deviceLocked', (e) => {
                    this._deviceLocked = true;
                    this.Dispatch('DeviceLocked', {locked: true});
                });
                window.addEventListener('deviceUnlocked', (e) => {
                    this._deviceLocked = false;
                    this.Dispatch('DeviceUnlocked', {locked: false});
                });
            }

        }

    }

    ClearNotifications() {
        this._pushNotifications = this.Plugin('firebase.messaging');
        if(this._pushNotifications) {
            return this._pushNotifications.clearNotifications();
        }
        return Promise.reject();
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

    RequestPermission(perm) {
        if(!cordova.plugins.permissions) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            var permissions = cordova.plugins.permissions;
            permissions.requestPermission(permissions[perm], (status) => {
                resolve(status.hasPermission);
            }, (error) => reject(error));
        })
    }

    RequestPermissions(perms) {
        if(!cordova.plugins.permissions) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            var permissions = cordova.plugins.permissions;
            const promises = [];
            for(const perm of perms) {
                promises.push(this.RequestPermission(perm));
            }
            Promise.all(promises).then((statuses) => {
                const hasPermissions = [];
                for(const status of statuses) {
                    if(!status.hasPermission) {
                        hasPermissions.push(status);
                    }
                }
                resolve(hasPermissions);
            });
        })
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
        return this._platform === Colibri.Devices.Device.Platform.Android;
    }

    /**
     * Checks if the device platform is iOS.
     * @returns {boolean} True if the device platform is iOS, otherwise false.
     */
    get isIOs() {
        return this._platform === Colibri.Devices.Device.Platform.IOs;
    }

    /**
     * Checks if the device platform is Windows.
     * @returns {boolean} True if the device platform is Windows, otherwise false.
     */
    get isWindows() {
        return this._platform === Colibri.Devices.Device.Platform.Windows;
    }

    /**
     * Checks if the device platform is Web.
     * @returns {boolean} True if the device platform is Web, otherwise false.
     */
    get isWeb() {
        return this._platform === Colibri.Devices.Device.Platform.Web;
    }

    get autoStart() {
        return this._autoStart;
    }

    set autoStart(value) {
        if(value) {
            cordova.plugins.autoStart.enable();
        } else {
            cordova.plugins.autoStart.disable();
        }
    }

    enableAutoStartService(id) {
        cordova.plugins.autoStart.enableService(id);
    }

    /**
     * Gets the background mode of the device.
     * @return {boolean} value - The value to set for background mode.
     */
    get backgroundMode() {
        return this._backgroundMode;
    }

    SetBackgroundModeDefaults(defaults) {
        cordova.plugins.backgroundMode.setDefaults(defaults);
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
        if(value) {
            cordova.plugins.backgroundMode.on('activate', () => {
                cordova.plugins.backgroundMode.disableWebViewOptimizations();
            });
            cordova.plugins.backgroundMode.on('deactivate', () => {
                this.ClearNotifications();
            });
        }
        
        if(value) {
            cordova.plugins.backgroundMode.setDefaults({ silent: false });
            cordova.plugins.backgroundMode.enable();
            Colibri.Common.StartTimer('background-mode', 5000, () => {
                this.Dispatch('BackgroundMode', {active: true})
                console.log('Working in background mode ...');
            });
        } else {
            cordova.plugins.backgroundMode.disable();
            Colibri.Common.StopTimer('background-mode');
        }

    
    }

    /**
     * Ignore battery optimizations for the app.
     * @type {Boolean}
     */
    DisableBatteryOptimizations() {
        return cordova.plugins.backgroundMode.disableWebViewOptimizations();
    }

    get overrideBackButton() {
        return this._overrideBackButton;
    }
    set overrideBackButton(value) {
        this._overrideBackButton = value;
        if(value) {
            cordova.plugins.backgroundMode.overrideBackButton();
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

    Foreground() {
        if(!cordova?.plugins?.backgroundMode) {
            throw 'Please enable \'cordova-plugin-background-mode\' plugin';
        }
        cordova.plugins.backgroundMode.moveToForeground();
    }
    
    Background() {
        if(!cordova?.plugins?.backgroundMode) {
            throw 'Please enable \'cordova-plugin-background-mode\' plugin';
        }
        cordova.plugins.backgroundMode.moveToBackground();
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

    _searchInObject(object, query) {
        let ret = null;
        try {
            const searchQuery = 'ret = object.' + query + ';';
            eval(searchQuery);
        } catch(e) {
            ret = null;
        }
        return ret;
    }

    /**
     * Retrieves a plugin based on the provided query.
     * @param {string} query - The query string to retrieve the plugin.
     * @returns {*} The plugin object if found, otherwise undefined.
     */
    Plugin(query) {
        try {
            let plugin = null;
            if(cordova) {
                plugin = this._searchInObject(cordova, query);
            }
            if(!plugin && cordova && cordova.plugins) {
                plugin = this._searchInObject(cordova.plugins, query);
            }
            if(!plugin && navigator) {
                plugin = this._searchInObject(navigator, query);
            }
            if(!plugin && window && window.plugins) {
                plugin = this._searchInObject(window.plugins, query);
            }
            if(!plugin && window) {
                plugin = this._searchInObject(window, query);
            }
            if(!plugin) {
                plugin = eval(query);
            }
            return plugin;
        } catch(e) {
            return null;
        }
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
            sdkVersion: this._getAndroidSdkVersion()
        }
    }

    _getAndroidSdkVersion() {
        const match = navigator.userAgent.match(/Android\s+(\d+)/);
        if (match) {
            const versionNumber = parseInt(match[1], 10);
            switch (versionNumber) {
            case 13: return 33;
            case 14: return 34;
            case 12: return 32;
            case 11: return 30;
            default: return null;
            }
        }
        return null;
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

    /**
     * Retrieves the sim instance.
     * @returns {Colibri.Devices.Sim} The sim instance.
     */
    get Sim() {
        if(!this._sim) {
            this._sim = new Colibri.Devices.Sim(this);
        }
        return this._sim;
    }

    get Vibrate() {
        if(!this._vibrate) {
            this._vibrate = new Colibri.Devices.Vibrate(this);
        }
        return this._vibrate;
    }

    get SqLite() {
        if(!this._sqLite) {
            this._sqLite = new Colibri.Devices.SqLite(this);
        }
        return this._sqLite;
    }

    get pushToken() {
        return this._pushToken;
    }

    set pushToken(value) {
        this._pushToken = value;
    }

    set pushFunction(value) {
        this._pushFunction = value;
    }
    get pushFunction() { 
        return this._pushFunction;
    }

    get isInBackgroundMode() {
        return cordova?.plugins?.backgroundMode?.isActive() ?? false;
    }

    get Capture() {
        if(!this._capture) {
            this._capture = new Colibri.Devices.Capture();
        }
        return this._capture;
    }

    get Auth() {
        if(!this._auth) {
            this._auth = new Colibri.Devices.Auth(this);
        }
        return this._auth;
    }

    get hasRingtones() {
        return !!this._ringtones;
    }


    /**
     * Get the list of ringtones available on the device
     * @param {{notification|alarm|ringtone}}} ringtoneType 
     * @returns Promise
     */
    AvailableRingtones(ringtoneType = 'notification') {
        return new Promise((resolve, reject) => {        
            this._ringtones.getRingtone((list) => {
                resolve(list);
            }, (e) => {}, ringtoneType);
        });
    }

    PlayRingtone(url) {
        return new Promise((resolve, reject) => {
            this._ringtones.playRingtone(url, () => {
                resolve();
            }, (e) => {
                reject(e);
            });
        });
    }

    StopRingtone() {
        return new Promise((resolve, reject) => {
            this._ringtones.stopRingtone(() => {
                resolve();
            }, (e) => {
                reject(e);
            });
        });
    }

    SetAudioToSpeakers() {
        if(AudioToggle !== undefined) {
            AudioToggle.setAudioMode(AudioToggle.SPEAKER);
        }
    }
    SetAudioToEarpiece() {
        if(AudioToggle !== undefined) {
            AudioToggle.setAudioMode(AudioToggle.EARPIECE);
        }
    }

    GetSystemSpeakerVolume() {
        return new Promise((resolve, reject) => {
            cordova.plugins.VolumeControl.getVolume(
                volume => resolve(parseFloat(volume)), 
                e => reject(e)
            );
        })
    }

    IsMuted() {
        return new Promise((resolve, reject) => {
            cordova.plugins.VolumeControl.isMuted(
                muted => resolve(muted), 
                e => reject(e)
            );
        })
    }

    ToggleMute() {
        return new Promise((resolve, reject) => {
            cordova.plugins.VolumeControl.toggleMute(
                () => resolve(), 
                e => reject(e)
            );
        })
    }

    Mute() {
        return this.IsMuted().then(muted => {
            if(!muted) {
                return this.ToggleMute();
            }
        });
    }

    UnMute() {
        return this.IsMuted().then(muted => {
            if(muted) {
                return this.ToggleMute();
            }
        });
    }

    get deviceLocked() {
        return this._deviceLocked || false;
    }
}