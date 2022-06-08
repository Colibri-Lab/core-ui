Colibri.Devices.Device = class extends Colibri.Events.Dispatcher {

    static Web = 'web';
    static IOs = 'ios';
    static Android = 'android';
    static Windows = 'electron';

    _platform = '';
    _fileSystem = null;
    
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
    }

    _detect() {
        if(!window.hasOwnProperty("cordova")){
            this._platform = 'web';
        }
        else {
            this._platform = cordova.platformId;
        }
    }

    _bindDeviceEvents() {
        window.addEventListener("orientationchange", () => {
            const old = this._currentOrientation;
            this._currentOrientation = screen.orientation.type;
            this.Dispatch('OrientationChanged', {current: this._currentOrientation, old: old});
        });
    }

    get platform() {
        return this._platform;
    }

    get isAndroid() {
        return this._platform === Colibri.Devices.Detect.Android;
    }

    get isIOs() {
        return this._platform === Colibri.Devices.Detect.IOs;
    }

    get isWindows() {
        return this._platform === Colibri.Devices.Detect.Windows;
    }

    Plugin(query) {
        let plugin = eval('cordova.' + query);
        if(!plugin) {
            plugin = eval('navigator.' + query);
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

}