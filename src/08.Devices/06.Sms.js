/**
 * Represents a utility for handling SMS operations.
 * @class
 * @extends Destructable
 * @memberof Colibri.Devices
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
    _pluginSend = null;

    /**
     * Instance variable representing the notification read plugin.
     * @type {object}
     * @private
     */
    _pluginRead = null;

    /**
     * Instance variable representing the SMS plugin for receiving messages.
     * @type {object}
     * @private
     */
    _permitedSend = false;

    /**
     * @constructor
     * @param {Colibri.Devices.Device} device
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
     * @async
     * @public
     * @example
     * ```
     * App.Device.Sms.CheckPermissionForSend()
     *     .then(() => {
     *         console.log('Permission granted for sending SMS.');
     *     })
     *     .catch(error => {
     *         console.error('Permission denied for sending SMS:', error);
     *     });
     * ```
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
     * @async
     * @public
     * @example
     * ```
     * App.Device.Sms.RequestPermissionForSend()
     *     .then(() => {
     *         console.log('Permission granted for sending SMS.');
     *     })
     *     .catch(error => {
     *         console.error('Permission denied for sending SMS:', error);
     *     });
     * ```
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
     * @async
     * @public
     * @example
     * ```
     * App.Device.Sms.Send('+1234567890', 'Hello, this is a test message.', 'INTENT')
     *     .then(() => {
     *         console.log('SMS sent successfully.');
     *     })
     *     .catch(error => {
     *         console.error('Error sending SMS:', error);
     *     });
     * ```
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
                }, (response) => {
                    alert(JSON.stringify(response));
                    resolve();
                }, (error) => {
                    alert(JSON.stringify(error));
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
     * @private
     */
    _smsReceiverCallback(message) {
        this._arriveCallback(message);
    }

    /**
     * Registers an event listener for incoming SMS messages.
     * @param {function} listener - The listener function.
     * @public
     * @example
     * ```
     * App.Device.Sms.RegisterArriveListener((message) => {
     *     console.log('Incoming SMS:', message);
     * });
     * ```
     */
    RegisterArriveListener(listener) {
        document.addEventListener('onSMSArrive', (e) => {
            listener(e);
        });
    }

    /**
     * Starts watching for incoming SMS messages.
     * @async
     * @public
     * @returns {Promise} - Promise resolving when watching is started.
     * @example
     * ```
     * App.Device.Sms.Watch()
     *     .then(() => {
     *         console.log('Started watching for incoming SMS messages.');
     *     })
     *     .catch(error => {
     *         console.error('Error starting SMS watch:', error);
     *     });
     * ```
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
     * @async
     * @public
     * @returns {Promise} - Promise resolving when watching is stopped.
     * @example
     * ```
     * App.Device.Sms.Stop()
     *     .then(() => {
     *         console.log('Stopped watching for incoming SMS messages.');
     *     })
     *     .catch(error => {
     *         console.error('Error stopping SMS watch:', error);
     *     });
     * ```
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