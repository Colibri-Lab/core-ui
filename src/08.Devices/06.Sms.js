/**
 * Represents a utility for handling SMS operations.
 * @class
 * @extends Destructable
 */
Colibri.Devices.Sms = class extends Destructable {
    
    /**
     * Instance variable representing the device.
     * @type {Colibri.UI.Device}
     * @private
     */
    _device = null;
    /**
     * Instance variable representing the notification plugin.
     * @type {object}
     * @private
     */
    _plugin = null;
    /**
     * Instance variable representing the SMS plugin for receiving messages.
     * @type {null}
     * @private
     */
    _permitedSend = false;

    /**
     * Flag indicating whether permission to send SMS is granted.
     * @type {boolean}
     * @private
     */
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

    /**
     * Checks permission to send SMS.
     * @returns {Promise} - Promise resolving when permission is checked.
     */
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

    /**
     * Requests permission to send SMS.
     * @returns {Promise} - Promise resolving when permission is requested.
     */
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

    /**
     * Sends an SMS message.
     * @param {string} number - The recipient's phone number.
     * @param {string} message - The message content.
     * @param {string} intent - The intent for sending the message.
     * @returns {Promise} - Promise resolving when message is sent.
     */
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

    /**
     * Callback function for SMS arrival.
     * @param {*} message - The incoming SMS message.
     */
    _smsReceiverCallback(message) {
        this._arriveCallback(message);
    }

    /**
     * Registers an event listener for incoming SMS messages.
     * @param {function} listener - The listener function.
     */
    RegisterArriveListener(listener) {
        document.addEventListener('onSMSArrive', (e) => {
            listener(e);
        });
    }

    /**
     * Starts watching for incoming SMS messages.
     * @returns {Promise} - Promise resolving when watching is started.
     */
    Watch() {
        if(!this._pluginRead) {
            return;
        }
        return new Promise((resolve, reject) => {
            this._pluginRead.startWatch((strSuccess) => {
                resolve(strSuccess);
            }, (strError) => {
                reject(strError);
            });    
        });
    }

    /**
     * Stops watching for incoming SMS messages.
     * @returns {Promise} - Promise resolving when watching is stopped.
     */
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