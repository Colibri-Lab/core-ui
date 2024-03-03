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
                    console.log(payload);
                }, e => console.log(e));
            }       
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
        if(!this._notifications) {
            this._notifications = new Colibri.Devices.LocalNotifications(this);
        }
        return this._notifications;
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

}