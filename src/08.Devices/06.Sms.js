
Colibri.Devices.Sms = class extends Destructable {
    
    _device = null;
    _plugin = null;
    _permited = false;

    constructor(device) {
        super();
        this._device = device;
        this._plugin = this._device.Plugin('sms');
        this.CheckPermission();
    }

    CheckPermission() {
        return new Promise((resolve, reject) => {
            this._plugin.hasPermission((hasPermission) => {
                this._permited = hasPermission;
                if(this._permited) {
                    resolve();
                } else {
                    reject({error: 'Not set'});
                }
            }, (e) => { 
                this._permited = false; 
                reject({error: e});
            });    
        });
    }

    RequestPermission() {
        return new Promise((resolve, reject) => {
            this.CheckPermission().then(() => {
                this._permited = true;
                resolve();
            }).catch((response) => {
                if(response.error === 'Not set') {
                    this._plugin.requestPermission(() => {
                        this._permited = true;
                        resolve();
                    }, (error) => {
                        this._permited = false;
                        reject({error: error});
                    });
                }
            });
        });
    }

    Send(number, message, intent = 'INTENT') {
        return new Promise((resolve, reject) => {
            this._plugin.send(number, message, {
                replaceLineBreaks: true, // true to replace \n by a new line, false by default
                android: {
                    intent: intent
                    //intent: '' // send SMS without opening any other app, require : android.permission.SEND_SMS and android.permission.READ_PHONE_STATE
                }
            }, () => {
                resolve();
            }, () => {
                reject();
            });    
        });
    }


}