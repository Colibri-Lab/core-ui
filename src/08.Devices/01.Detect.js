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
    }

    _detect() {
        if(!window.hasOwnProperty("cordova")){
            this._platform = 'web';
        }
        else {
            this._platform = cordova.platformId;
        }
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
        return eval('cordova.' + query);
    } 

    get FileSystem() {
        if(!this._fileSystem) {
            this._fileSystem = new Colibri.Devices.FileSystem(this);
        }
        return this._fileSystem;
    }

}