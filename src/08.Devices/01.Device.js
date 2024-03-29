Colibri.Devices.Device = class extends Colibri.Events.Dispatcher {

    static Web = 'web';
    static IOs = 'ios';
    static Android = 'android';
    static Windows = 'electron';

    static Light = 'light';
    static Dark = 'dark';

    _platform = '';
    _fileSystem = null;
    _theme = 'light';
    _themeDetectionPlugin = null;
    _pushNotifications = null;
    
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

    _registerEvents() {
        this.RegisterEvent('OrientationChanged', false, 'Когда ориентация была изменена');
        this.RegisterEvent('ThemeChanged', false, 'Когда тема изменена');
        this.RegisterEvent('NotificationTapped', false, 'When push notification is tapped');
    }

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

    get platform() {
        return this._platform;
    }

    get isAndroid() {
        return this._platform === Colibri.Devices.Device.Android;
    }

    get isIOs() {
        return this._platform === Colibri.Devices.Device.IOs;
    }

    get isWindows() {
        return this._platform === Colibri.Devices.Device.Windows;
    }

    get isWeb() {
        return this._platform === Colibri.Devices.Device.Web;
    }

    get backgroundMode() {
        return this._backgroundMode;
    }

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

    WakeUp() {
        if(!cordova?.plugins?.backgroundMode) {
            throw 'Please enable \'cordova-plugin-background-mode\' plugin';
        }
        cordova.plugins.backgroundMode.wakeUp();
    }

    Unlock() {
        if(!cordova?.plugins?.backgroundMode) {
            throw 'Please enable \'cordova-plugin-background-mode\' plugin';
        }
        cordova.plugins.backgroundMode.unlock();
    }

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

    LockOrientation(type = null) {
        try {
            screen.orientation.lock(type || this._currentOrientation.type);
        }
        catch(e) {
            console.log(e)
        }
    }

    UnlockOrientation() {
        try {
            screen.orientation.unlock();
        }
        catch(e) {
            console.log(e)
        }
    }

    get FileSystem() {
        if(!this._fileSystem) {
            this._fileSystem = new Colibri.Devices.FileSystem(this);
        }
        return this._fileSystem;
    }

    get Camera() {
        if(!this._camera) {
            this._camera = new Colibri.Devices.Camera(this);
        }
        return this._camera;
    }

    get Sms() {
        if(!this._sms) {
            this._sms = new Colibri.Devices.Sms(this);
        }
        return this._sms;
    }

    get Dialogs() {
        if(!this._dialogs) {
            this._dialogs = new Colibri.Devices.Dialogs(this);
        }
        return this._dialogs;
    }

    get Notifications() {
        return this._localNotifications;
    }

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

    get Theme() {
        return this._theme;
    }

    get GeoLocation() {
        if(!this._geoLocation) {
            this._geoLocation = new Colibri.Devices.GeoLocation(this);
        }
        return this._geoLocation;
    }

}