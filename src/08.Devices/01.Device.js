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
        Electron: 'electron'
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

    _browser = null;
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
        this._detectBrowser();  
        this._registerEvents();
        this._bindDeviceEvents();

        this._deviceLocked = false;
        this._applicationActivated = true;
        this._proximityState = 'far';
        this._audioDevice = 'default';
        
        try {
            this._currentOrientation = screen.orientation.type;
        }
        catch(e) {}


        if(window.ColibriAccessories && ColibriAccessories.Share) {
            ColibriAccessories.Share.Handle((items) => {
                this.Dispatch('ShareReceived', { items });
            });
        }

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
        this.RegisterEvent('DeviceLocked', false, 'When user locked the device');
        this.RegisterEvent('DeviceUnlocked', false, 'When user unlocked the device');
        this.RegisterEvent('DeviceApplicationForeground', false, 'When application is in foreground');
        this.RegisterEvent('DeviceApplicationBackground', false, 'When application is in background');
        this.RegisterEvent('ShareReceived', false, 'When received a share from other app');
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
                window.addEventListener('colibri-accessories:onDeviceLocked', (e) => {
                    this._deviceLocked = true;
                    this.Dispatch('DeviceLocked', {locked: true});
                });
                window.addEventListener('colibri-accessories:onDeviceUnlocked', (e) => {
                    this._deviceLocked = false;
                    this.Dispatch('DeviceUnlocked', {locked: false});
                });
                window.addEventListener('colibri-accessories:onNotification', (e) => {
                    this.Dispatch('NotificationTapped', {payload: e.detail});
                });
            }

            if(window?.ColibriAccessories?.BackgroundMode !== undefined) {
                window.ColibriAccessories.BackgroundMode.watch((state) => {
                    console.log('device lock state changed', state);
                }, (e) => {
                    console.log('device lock error', e);
                });
                window.addEventListener('colibri-accessories:onAppForeground', (e) => {
                    this._applicationActivated = true;
                    this.Dispatch('DeviceApplicationForeground', {activated: true});
                });
                window.addEventListener('colibri-accessories:onAppBackground', (e) => {
                    this._applicationActivated = false;
                    this.Dispatch('DeviceApplicationBackground', {activated: false});
                });
            }

            if(window?.ColibriAccessories?.Proximity !== undefined) {
                window.ColibriAccessories.Proximity.watch((state) => {
                    console.log('Proximity state changed', state);
                }, (e) => {
                    console.log('Proximity error', e);
                });
                window.addEventListener('colibri-accessories:onProximityClose', (e) => {
                    this._proximityState = 'close';
                    this.Dispatch('DeviceProximityChanged', {state: this._proximityState});
                });
                window.addEventListener('colibri-accessories:onProximityFar', (e) => {
                    this._proximityState = 'far';
                    this.Dispatch('DeviceProximityChanged', {state: this._proximityState});
                });
            }

        }

        if(this.isIOs) {
            document.body.classList.add('-ios');
        } else if(this.isAndroid) {
            document.body.classList.add('-android');
        } else if(this.isWindows) {
            document.body.classList.add('-windows');
        }

    }

    _detectBrowser() {
        if(navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1) {
            this._browser = 'safari';
        } else if(navigator.userAgent.indexOf('Chrome') > -1) {
            this._browser = 'chrome';
        } else if(navigator.userAgent.indexOf('Firefox') > -1) {
            this._browser = 'firefox';
        } else if(navigator.userAgent.indexOf('Edg') > -1) {
            this._browser = 'edge';
        } else if(navigator.userAgent.indexOf('Opera') > -1) {
            this._browser = 'opera';
        }
    }

    get browser() {
        return this._browser;
    }

    get isSafari() {
        return this._browser === 'safari';
    }

    get isFirefox() {
        return this._browser === 'firefox';
    }

    get isEdge() {
        return this._browser === 'edge';
    }

    get isOpera() {
        return this._browser === 'opera';
    }

    get isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    }

    ClearNotifications() {
        this._pushNotifications = this.Plugin('firebase.messaging');
        if(this._pushNotifications) {
            return this._pushNotifications.clearNotifications();
        }
        return Promise.reject();
    }

    StartProximityScreenOff() {
        if(window?.ColibriAccessories?.Proximity) {
            window.ColibriAccessories.Proximity.screenOff();
        }
    }

    StopProximityScreenOff() {
        if(window?.ColibriAccessories?.Proximity) {
            window.ColibriAccessories.Proximity.stopScreenOff();
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
                    if(!status?.hasPermission) {
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
    get isElectron() {
        return this._platform === Colibri.Devices.Device.Platform.Electron;
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

    Foreground() {
        if(!window.ColibriAccessories?.App) {
            throw 'Please enable \'cordova-plugin-colibri-accessories\' plugin';
        }
        window.ColibriAccessories?.App.moveForeground();
    }
    
    Background() {
        if(!window.ColibriAccessories?.App) {
            throw 'Please enable \'cordova-plugin-colibri-accessories\' plugin';
        }
        window.ColibriAccessories?.App.moveBackground();
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

    AudioDevice() {
        return this._audioDevice;
    }

    SetAudioToDefault() {
        if(window['AudioToggle'] !== undefined) {
            window['AudioToggle'].setAudioMode(AudioToggle.NORMAL); 
            this._audioDevice = 'default';
        }
    }
    SetAudioToSpeakers() {
        if(window['AudioToggle'] !== undefined) {
            window['AudioToggle'].setAudioMode(AudioToggle.SPEAKER);
            this._audioDevice = 'speakers';
        }
    }
    SetAudioToEarpiece() {
        if(window['AudioToggle'] !== undefined) {
            window['AudioToggle'].setAudioMode(AudioToggle.EARPIECE);
            this._audioDevice = 'earpiece';
        }
    }

    GetSystemSpeakerVolume() {
        return new Promise((resolve, reject) => {
            if(cordova.plugins?.VolumeControl) {
                cordova.plugins?.VolumeControl.getVolume(
                    volume => resolve(parseFloat(volume)), 
                    e => reject(e)
                );
            } else {
                Promise.resolve();
            }
        })
    }

    IsMuted() {
        if(!window?.cordova?.plugins?.VolumeControl) {
            return Promise.resolve(false);
        }
        return new Promise((resolve, reject) => {
            window.cordova.plugins.VolumeControl.isMuted(
                muted => resolve(muted == 0), 
                e => reject(e)
            );
        })
    }

    ToggleMute() {
        if(!window?.cordova?.plugins?.VolumeControl) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            cordova.plugins.VolumeControl.toggleMute(
                () => resolve(), 
                e => reject(e)
            );
        })
    }

    Mute() {
        if(!window?.cordova?.plugins?.VolumeControl) {
            return Promise.resolve();
        }
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

    get isLocked() {
        return this._deviceLocked || false;
    }

    get isActive() {
        return this._applicationActivated || false;
    }

    get priximityState() {
        return this._proximityState || 'far';
    }

    Notify(title, text, contact, photo) {
        return new Promise((resolve, reject) => {
            if(this.isAndroid || this.isIOs || this.isWindows) {
                window.ColibriAccessories.UI.notifyMessage(
                    title, 
                    photo, 
                    text, 
                    contact, 
                    (token) => {
                        resolve(token);
                    }
                );
            } else if(this.isWeb) {
                Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                        const notification = new Notification(title, {
                            body: text,
                            icon: photo,
                            data: contact
                        });
                        notification.onclick = (e) => {
                            e.preventDefault();
                            resolve(notification.data);
                        }
                    }
                });
            }
            // else if(this.isWindows) {
            //     const notification = new Notification(
            //         title, {
            //             body: text,
            //             icon: 'img/app.png',
            //             data: { contact: contact },
            //         }
            //     );
            //     notification.onclick = (e) => {
            //         resolve(e.target.data.contact);
            //     };
            // }
        });
    }

    NotifyReady() {
        if(window.ColibriAccessories) {
            window.ColibriAccessories.App.NotifyReady();
        }
    }

}