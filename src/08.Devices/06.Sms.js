
Colibri.Devices.Sms = class extends Destructable {
    
    _device = null;
    _plugin = null;
    _permitedSend = false;

    constructor(device) {
        super();
        this._device = device;
        this._pluginSend = this._device.Plugin('sms');
        if(this._device.isAndroid) {
            this._pluginRead = this._device.Plugin('SMSReceive');
        } else {
            this._pluginRead = null;    
        }
        this.CheckPermissionForSend();
    }

    CheckPermissionForSend() {
        return new Promise((resolve, reject) => {
            if(this._device.isIOs) {
                this._permitedSend = true;
                resolve();
            } else {
                this._pluginSend.hasPermission((hasPermission) => {
                    this._permitedSend = hasPermission;
                    if(this._permitedSend) {
                        resolve();
                    } else {
                        reject({error: 'Not set'});
                    }
                }, (e) => { 
                    this._permitedSend = false; 
                    reject({error: e});
                });
            }
        });
    }

    RequestPermissionForSend() {
        return new Promise((resolve, reject) => {
            this.CheckPermissionForSend().then(() => {
                this._permitedSend = true;
                resolve();
            }).catch((response) => {
                if(response.error === 'Not set') {
                    this._pluginSend.requestPermission(() => {
                        this._permitedSend = true;
                        resolve();
                    }, (error) => {
                        this._permitedSend = false;
                        reject({error: error});
                    });
                }
            });
        });
    }

    Send(number, message, intent = 'INTENT') {
        return new Promise((resolve, reject) => {
            this.RequestPermissionForSend().then(() => {
                this._pluginSend.send(number, message, {
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
            }).catch(e => {
                // do nothing
            });
        });
    }

    _smsReceiverCallback(message) {
        this._arriveCallback(message);
    }

    RegisterArriveListener(listener) {
        document.addEventListener('onSMSArrive', (e) => {
            listener(e);
        });
    }

    Watch() {
        if(!this._pluginRead) {
            return;
        }
        return new Promise((resolve, reject) => {
            this._pluginRead.startWatch((strSuccess) => {
                // if(strSuccess === 'SMS_WATCHING_STARTED' || strSuccess === 'SMS_WATCHING_ALREADY_STARTED') {
                // } else {
                //     reject(strSuccess);
                // }
                resolve(strSuccess);
            }, (strError) => {
                reject(strError);
            });    
        });
    }

    Stop() {
        if(!this._pluginRead) {
            return;
        }
        return new Promise((resolve, reject) => {
            this._pluginRead.stopWatch((strSuccess) => {
                resolve();
            }, (strError) => {
                reject(strError);
            });
        });
    }

}