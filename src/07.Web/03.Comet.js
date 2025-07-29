/**
 * Handles the connection to the Comet server and message communication.
 * @class 
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Web
 */
Colibri.Web.Comet = class extends Colibri.Events.Dispatcher {

    /** @type {string} */
    _url = '';
    /** @type {object} */
    _storage = null;
    /** @type {Colibri.Storages.Store} */
    _store = null;
    /** @type {string} */
    _storeMessages = '';
    /** @type {string} */
    _storeUnread = '';

    /** @type {object} */
    _settings = null;
    /** @type {WebSocket|null} */
    _ws = null;
    /** @type {boolean} */
    _connected = false;
    /** @type {object} */
    _user = null;
    /** @type {string} */
    _clientId = null;

    __eventHandlers = {};
    __sentMessages = {};

    static Options = {
        origin: location.host
    };

    /**
     * @constructor
     * @param {object} settings - Settings for the Comet connection.
     */
    constructor(settings) {
        super();
        
        this._clientId = this._generateDeviceId();
        this._settings = settings;
        this.__specificHandlers = {};
        this._registeredSuccess = false;
        
        this.RegisterEvent('MessageReceivng', false, 'Before message received');
        this.RegisterEvent('MessageReceived', false, 'When a new message is received');
        this.RegisterEvent('MessageUpdated', false, 'When message text is updated');
        this.RegisterEvent('MessageSent', false, 'When a new message is sent');
        this.RegisterEvent('MessagesMarkedAsRead', false, 'When all messages marked as read');
        this.RegisterEvent('MessageRemoved', false, 'When message is removed');
        this.RegisterEvent('ChatCleared', false, 'When chat with user is removed');
        this.RegisterEvent('MessagesCleared', false, 'When all messages are cleared');
        this.RegisterEvent('EventReceived', false, 'When event is received');
        this.RegisterEvent('ConnectionError', false, 'When we can not connect to server');
        this.RegisterEvent('Registered', false, 'When we registered to server');
        this.RegisterEvent('FirebaseRegistered', false, 'When we registered with firebase to server');
        this.RegisterEvent('Subscribed', false, 'When we subscribed to channel');
        this.RegisterEvent('Unsubscribed', false, 'When we unsubscribed from channel');
        this.RegisterEvent('RegistrationError', false, 'When we can not register to server');
        this.RegisterEvent('MessageError', false, 'When can not send message, or message sending error');
        
    }

    _transferToModuleStore(messages) {
        this._storage.Get().then(messages => {
            const unreadCount = messages.filter(v => v.read === false).length;
            this._store.Set(this._storeMessages, {messages: messages, unread: unreadCount});
        });
    }

    /**
     * Destructor to close WebSocket connection when the object is destroyed.
     */
    destructor() {
        super.destructor();
        if(this._ws) {
            this._ws.close();
        }
    }

    get settings() {
        return this._settings;
    }

    get User() {
        return this._user;
    }

    get UserName() {
        return this._userName;
    }

    get isReady() {
        return this._ws.readyState === 1;
    }

    get isRegistered() {
        return this._registeredSuccess;
    }

    /**
     * Gets the client ID for the Comet connection.
     * @type {string}
     * @readonly
     */
    get clientId() {
        return this._clientId;
    }

    get connected() {
        return this._connected;       
    }

    /**
     * Generates a unique device ID for the Comet connection.
     * @private
     * @returns {string} - The generated device ID.
     */
    _generateDeviceId() {
        return App.Device.id;
    }

    /**
     * Initializes the WebSocket connection.
     * @private
     */
    _initConnection() {
        

        if((App.Device.isAndroid || App.Device.isIOs) && window['ColibriAccessories'] && window['ColibriAccessories']['Service']) {
            ColibriAccessories.Service.handle(
                () => {
                    this.__onCometOpened(true);
                }, 
                () => {
                    this._connected = false;
                    try {
                        this._ws.readyState = 0;
                    } catch(e) {}
                }, 
                (messages) => {
                    // connection is alive
                    this._connected = true;
                    this._ws.readyState = 1;
                    if(!Array.isArray(messages)) {
                        messages = [messages];
                    }
                    messages.forEach((message) => this.__onCometMessage({data: message}));
                }, 
                (log) => {
                    console.log(log);
                },
                (error) => {
                    this.__onCometError(error)
                }

            );

            ColibriAccessories.Service.start(
                App.Comet.settings.host, 
                App.Comet.settings.port, 
                App.Device.id,
                Colibri.Web.Comet.Options.origin,
                this._user,
                Object.assign({name: this._userName}, this._handlers),
                this._texts ?? {},
                () => {console.log('Successed !!!');},
                (err) => {console.log('Error !!!', err);}
            );
            this._ws = ColibriAccessories.Service;
            this._ws.readyState = 1; 
        } else {
            this._ws && this._ws.close();
            this._ws = new WebSocket('wss://' + this._settings.host + ':' + this._settings.port + '/client/' + this._clientId);
            this._ws.onopen = () => this.__onCometOpened();
            this._ws.onmessage = (message) => this.__onCometMessage(message);
            this._ws.onerror = error => this.__onCometError(error);
            Colibri.Common.StartTimer('comet-timer', 5000, () => {
                if(this._ws && this._ws.readyState !== 1) {
                    console.log('connection closed, may be server down');
                    this._initConnection();
                }
            });
        }

    }
    
    /**
     * Initializes the Comet object with user data and storage settings.
     * @param {object} userData - The user data object containing user GUID and name.
     * @param {Colibri.Storages.Store} store - The store to save messages.
     * @param {string} storeMessages - The key for storing messages in the store.
     * @param {object} handlers - Handlers for specific events.
     * @param {object} texts - Texts for notifications.
     * @param {object|null} firebaseServiceJson - Firebase service configuration JSON.
     * @param {string|null} pushToken - Push token for notifications.
     * @param {function|null} pushFunction - Function to handle push notifications.
     * @returns {void}
     */
    Init(userData, store, storeMessages, handlers = {}, texts = {}, firebaseServiceJson = null, pushToken = null, pushFunction = null) {

        this._user = userData.guid;
        this._userName = userData.name;
        this._store = store;
        this._storeMessages = storeMessages;
        this._handlers = handlers;
        this._texts = texts;
        this._firebaseServiceJson = firebaseServiceJson;
        this._pushToken = pushToken;
        this._pushFunction = pushFunction;

        if((App.Device.isAndroid || App.Device.isIOs) && App.Device.SqLite.isAvailable) {
            this._storage = new Colibri.Web.SqLiteStore();
        } else {
            let storeType = Colibri.Web.InternalStore;
            if(this._settings.store) {
                storeType = eval('Colibri.Web.' + this._settings.store);
            }
            this._storage = new storeType();
        }
        this._initConnection();
        this._transferToModuleStore();

        

    }

    SetPushToken(token, f) {
        this._pushToken = token;
        this._pushFunction = f; 
        this.Command(this._user, 'register', {name: this._userName, storeHandler: this._handlers['storeHandler'] ?? null, closeHandler: this._handlers['closeHandler'] ?? null});
        if(this._pushToken) {
            this.Command(this._user, 'firebase', {name: this._userName, json: JSON.stringify(this._firebaseServiceJson), token: this._pushToken, f: this._pushFunction});
        }
    }
  
    /**
     * Registers a handler for specific events.
     * @param {String} handlerName 
     * @param {Function} handler 
     */
    RegisterHandler(handlerName, handler) {
        if(!this.__specificHandlers[handlerName]) {
            this.__specificHandlers[handlerName] = [];
        }
        this.__specificHandlers[handlerName].push(handler);
    }


    /**
     * Registers a handler for specific events.
     * @param {String} handlerName 
     * @param {Function} handler 
     */
    UnRegisterHandler(handlerName, handler) {
        if(this.__specificHandlers[handlerName]) {
            for (let i = 0; i < this.__specificHandlers[handlerName].length; i++) {
                if(this.__specificHandlers[handlerName][i] === handler) {
                    this.__specificHandlers[handlerName].splice(i, 1);
                    break;
                }
            }
        }
    }

    DispatchHandlers(handlerName, args) {
        return new Promise((resolve, reject) => {
            const promises = [];
            if(this.__specificHandlers[handlerName] && isIterable(this.__specificHandlers[handlerName])) {
                for(const handler of this.__specificHandlers[handlerName]) {
                    promises.push(handler(args));
                }
            }
            if(promises.length === 0) {
                resolve([]);
            } else {
                Promise.all(promises).then((responses) => {
                    resolve(responses);
                });
            }
        });
    }

    /**
     * Disconnects from the Comet server.
     */
    Disconnect() {
        if(this._ws) {
            this._ws.close();
            this._ws = null;
            this._connected = false;
            try {
                this._ws.readyState = 0;
            } catch(e) {}
        }
    }

    /**
     * Handles the WebSocket connection open event.
     * @private
     */
    __onCometOpened(registered = false) {
        this._connected = true;
        if(!registered) {
            this.Command(this._user, 'register', {name: this._userName, storeHandler: this._handlers['storeHandler'] ?? null, closeHandler: this._handlers['closeHandler'] ?? null});
        }
        if(this._pushToken) {
            this.Command(this._user, 'firebase', {name: this._userName, json: JSON.stringify(this._firebaseServiceJson), token: this._pushToken, f: this._pushFunction});
        }
    }

    Subscribe(channelGuid, params = {}) {
        this.Command(channelGuid, 'subscribe', params);        
    }

    Unsubscribe(channelGuid, params = {}) {
        this.Command(channelGuid, 'unsubscribe', params);
    }

    /**
     * Handles incoming messages from the Comet server.
     * @private
     * @param {object} message - The received message object.
     */
    __onCometMessage(message) {
        message = JSON.parse(message.data);
        if(message.action == 'connection-success') {
            console.log('Connection to Comet Server ok');
            this.Dispatch('Connected');
        }
        else if(message.action == 'register-success') {
            this._registeredSuccess = true;
            console.log('User registered successfuly');
            this.Dispatch('Registered');
        }
        else if(message.action == 'firebase-success') {
            console.log('Firebase registered successfuly');
            this.Dispatch('FirebaseRegistered');
        }
        else if(message.action == 'subscribe-success') {
            console.log('Subscribed successfuly');
            this.Dispatch('Subscribed');
        }
        else if(message.action == 'unsubscribe-success') {
            console.log('Unsubscribed successfuly');
            this.Dispatch('Unsubscribed');
        }
        else if(message.action == 'register-error') {
            this._registeredSuccess = false;
            console.log('User registration error');
            this.Dispatch('RegistrationError', {message: message.message});
        }
        else if(message.action == 'debug-response') {
            console.log('Debug', message.message);
        }
        else if(message.action.endsWith('-sent') || message.action.endsWith('-error')) {
            const sentMessagePromise = this.__sentMessages[message.message.id];
            if(sentMessagePromise) {
                this.UpdateSetStatus(message.message.id, message.message.message.replaceAll('message ', '')).catch(() => {
                    // do hothing
                }).finally(() => {
                    if(this.__sentMessages[message.message.id]) {
                        clearTimeout(this.__sentMessages[message.message.id].rejectTimeout);
                        delete this.__sentMessages[message.message.id];
                        if(message.action.endsWith('-sent')) {
                            sentMessagePromise.resolve(message);
                        } else {
                            sentMessagePromise.reject(message);
                        } 
                    }
                });
                
            }

        }
        else if(message.action == 'message') {
            this.DispatchHandlers('MessageReceiving', {message: message}).then((responses) => {
                if(responses.filter(v => v === false).length > 0) {
                    return;
                }
                const msg = Colibri.Common.CometMessage.FromReceivedObject(message);
                this.AddLocalMessage(msg).then(() => {
                    this.Dispatch('MessageReceived', {message: msg});
                });
            });
        }
        else {
            const msg = Colibri.Common.CometEvent.FromReceivedObject(message);
            this.DispatchHandlers('EventReceiving', {message: msg}).then((responses) => {
                this.Dispatch('EventReceived', {event: msg});
                if(this.__eventHandlers[msg.action]) {
                    for(const handler of this.__eventHandlers[msg.action]) {
                        handler(msg);
                    }
                }
            });
        }
    }

    /**
     * Send the message and resolves or rejects a promise
     * @param {Colibri.Common.CometMessage|Colibri.Common.CometEvent} msg 
     * @returns Promise
     */
    _send(msg, resolve, reject) {

        if(['register', 'firebase', 'debug'].indexOf(msg.action) !== -1) {
            this._ws.send(msg.toJson());
            resolve({id: msg.id, message: 'message sent'});
            return;
        }

        this.__sentMessages[msg.id] = { 
            resolve, 
            reject, 
            rejectTimeout: setTimeout(() => {
                if(this.__sentMessages[msg.id]) {
                    delete this.__sentMessages[msg.id];
                    reject('Can not sent the message. Message timed out: ' + msg.action + ' (' + msg.id + ')');
                }
            }, 30000)
        };
        this._ws.send(msg.toJson());
    }

    UnwaitForEvent(eventName, handler) {
        if(!this.__eventHandlers[eventName]) {
            this.__eventHandlers[eventName] = [];
        }

        const index = this.__eventHandlers[eventName].indexOf(handler);
        if(index > -1) {
            this.__eventHandlers[eventName].splice(index, 1);
        }

    }

    WaitForEvent(eventName, handler) {
        if(!this.__eventHandlers[eventName]) {
            this.__eventHandlers[eventName] = [];
        }
        this.__eventHandlers[eventName].push(handler);
    }

    /**
     * Adds a message to the local storage.
     * @param {Colibri.Common.CometMessage} message message to save
     * @returns {Promise}
     */
    AddLocalMessage(message) {
        return new Promise((resolve, reject) => {            
            this._storage.Add(message).then((message) => {
                this._transferToModuleStore();
                resolve();
            }).catch(error => reject(error));
        });
    }

    /**
     * Handles WebSocket connection errors.
     * @private
     * @param {object} error - The error object.
     */
    __onCometError(error) {
        
        console.log('#{ui-comet-connection-error}');
        // App.Notices.Add(new Colibri.UI.Notice('#{ui-comet-connection-error}'));
        // Colibri.Common.StopTimer('comet-timer');
        this._connected = false;
        try {
            this._ws.readyState = 0;
        } catch(e) {}
    } 

    GetMessages(options = {}) {
        return new Promise((resolve, reject) => {
            this._storage.Get(options).then(messages => {
                resolve(messages.map(message => {
                    const msg = new Colibri.Common.CometMessage();
                    Object.forEach(message, (k, v) => {
                        msg[k] = v;
                    });
                    if(!(msg.date instanceof Date)) {
                        msg.date = typeof msg.date === 'string' ? msg.date : msg.date.toDateFromUnixTime();
                    }
                    msg.broadcast = (msg.broadcast === 'true' || msg.broadcast === true || msg.broadcast === 1);
                    msg.read = (msg.read === 'true' || msg.read === true || msg.read === 1);
                    msg.message = typeof msg.message === 'string' ? JSON.parse(msg.message) : msg.message;
                    return msg;
                }));
            }).catch(error => reject(error));
        });
    }

    GetConversation(userGuid, options = {}) {
        return this.GetMessages(Object.assignRecursive(options, {
            filter: [
                {from: userGuid, broadcast: false}, 
                {recipient: userGuid, broadcast: false}
            ],
        }));
    }

    GetBroadcast(options = {}) {
        return this.GetMessages(Object.assignRecursive(options, {
            filter: {
                broadcast: true
            },
        }))
    }

    /**
     * Clears stored messages.
     */
    ClearMessages(date = null) {
        return new Promise((resolve, reject) => {
            const res = () => {
                this._transferToModuleStore();
                this.Dispatch('MessagesCleared', {});
                resolve();
            };
            if(!date) {
                this._storage.Clear().then(res).catch(error => reject(error));
            } else {
                this._storage.Delete({filter: {date: ['>', date]}}).then(res).catch(error => reject(error));
            }
        });
    }

    /**
     * Marks all messages as read.
     */
    MarkAsRead(ids = null, sendEvent = true) {
        if(!ids) {
            return Promise.resolve();
        }
        if(!Array.isArray(ids)) {
            ids = [ids];
        }
        return new Promise((resolve, reject) => {
            const promises = [];
            for(const id of ids) {
                promises.push(this._storage.Update({read: true}, id));
            }
            Promise.all(promises).then(() => {
                this._transferToModuleStore();
                sendEvent && this.Dispatch('MessagesMarkedAsRead', {ids: ids});
                resolve();            
            }).catch(error => reject(error));
        });
    }

    /**
     * Removes a message from storage.
     * @param {object|number} message - The message to be removed.
     */
    RemoveMessage(message) {
        return new Promise((resolve, reject) => {
            this._storage.Delete({filter: {id: Object.isObject(message) ? message.id : message}}).then(() => {
                this._transferToModuleStore();
                this.Dispatch('MessageRemoved', {message: message});            
            }).catch(error => reject(error));
        });
    }

    /**
     * Removes a message from or to member.
     * @param {string} user - The message to be removed.
     */
    ClearConversationWith(user) {
        return new Promise((resolve, reject) => {
            this._storage.Delete({filter: [{from: user}, {recipient: user}]}).then(() => {
                this._transferToModuleStore();
                this.Dispatch('ChatCleared', {member: user});
            }).catch(error => reject(error));
        });
    }

    UpdateMessage(id, textOrFiles) {
        return new Promise((resolve, reject) => {
            this._storage.Update({read: true, message: Array.isArray(textOrFiles) ? {files: textOrFiles} : {text: textOrFiles}}, id).then((msg) => {
                this._transferToModuleStore();
                this.Dispatch('MessageUpdated', {message: msg});
            }).catch(error => reject(error));
        });
    }

    UpdateSetStatus(id, status = 'sent') {
        return new Promise((resolve, reject) => {
            this._storage.Update({message: {status: status}, read: true}, id).then((msg) => {
                this._transferToModuleStore();
                this.Dispatch('MessageUpdated', {message: msg});
            }).catch(error => reject(error));
        });
    }

    /**
     * Sends a command to the Comet server.
     * @param {string} userGuid - The GUID of the user.
     * @param {string} action - The action to be performed.
     * @param {object} message - The message data.
     */
    Command(userGuid, action, message = null, activate = false, wakeup = false) {
        return new Promise((resolve, reject) => {
            try {
                if(this._ws.readyState === 1) {
                    const msg = Colibri.Common.CometEvent.CreateForSend(action, Colibri.Web.Comet.Options.origin, this._user, userGuid, message, 'untrusted', activate, wakeup);
                    this._send(msg, resolve, reject);
                }
                else {
                    reject('server goes away');
                }
            }
            catch(e) {
                reject(e);
            }
        });
    }

    /**
     * Sends a broadcast message.
     * @param {string} action - The action to be performed.
     * @param {object} message - The message content.
     * @returns {string|null} - The ID of the sent message. 
     */
    CommandBroadcast(action, message = null, activate = false, wakeup = false) {
        return new Promise((resolve, reject) => {
            try {
                if(this._ws.readyState === 1) {
                    const msg = Colibri.Common.CometEvent.CreateForSendBroadcast(action, Colibri.Web.Comet.Options.origin, this._user, message, activate, wakeup);
                    this._send(msg, resolve, reject);
                }
                else {
                    reject('server goes away');
                }
            }
            catch(e) {
                reject(e);
            }
        });
    }

    SendFor(msg, userGuids) {
        return new Promise((resolve, reject) => {
            try {
                if(this._ws.readyState === 1) {
                    for(const userGuid of userGuids) {

                        const msgToSend = msg.clone();
                        msgToSend.message.for = userGuid;
                        this.DispatchHandlers('MessageSending', {message: msgToSend}).then((responses) => {
                            this._send(msgToSend, resolve, reject);
                        }).catch(error => {
                            this.Dispatch('MessageError', {error: error});
                        });
                    }

                    const msgToSend = msg.clone();
                    msgToSend.message.for = App.Comet.User;
                    msgToSend.MarkAsRead();
                    this.DispatchHandlers('MessageSending', {message: msgToSend}).then((responses) => {
                        this._send(msgToSend, resolve, reject);
                    }).catch(error => {
                        this.Dispatch('MessageError', {error: error});
                    });

                    // this.AddLocalMessage(msgToSend).then(() => {
                    //     this.Dispatch('MessageSent', {message: msgToSend});
                    // });

                }
                else {
                    reject('server goes away');
                }
            }
            catch(e) {
                reject(e);
            }
        });
    }

    /**
     * Sends a message to a specific user.
     * @param {string} userGuid - The GUID of the recipient user.
     * @param {string} message - The message content.
     * @param {object} contact - The name of the contact.
     * @returns {string|null} - The ID of the sent message.
     */
    SendTo(userGuid, message = null, contact = null, activate = false, wakeup = false, addLocal = true) {
        return new Promise((resolve, reject) => {
            try {

                if(this._ws.readyState === 1) {
                    const msg = Colibri.Common.CometMessage.CreateForSend(Colibri.Web.Comet.Options.origin, this._user, userGuid, message, contact, activate, wakeup);
                    msg.MarkAsRead();

                    const realSend = () => {
                        console.log('Sending message', msg);
                        this.Dispatch('MessageSent', {message: msg});
                        
                        const msgToSend = msg.clone();
                        this.DispatchHandlers('MessageSending', {message: msgToSend}).then((responses) => {
                            this._send(msgToSend, resolve, reject);
                        }).catch(error => {
                            this.Dispatch('MessageError', {error: error});
                        });

                    };
                    if(msg.from !== msg.recipient && addLocal) {
                        this.AddLocalMessage(msg).then(realSend);
                    } else {
                        realSend();
                    }
                }
                else {
                    reject('server goes away');
                }
            }
            catch(e) {
                reject(e);
            }
        });
        
    }

    /**
     * Sends a broadcast message.
     * @param {string} action - The action to be performed.
     * @param {string} message - The message content.
     * @param {object} contact - The name of the contact.
     * @returns {string|null} - The ID of the sent message. 
     */
    SendBroadcast(text = null, contact = null, activate = false, wakeup = false) {
        return new Promise((resolve, reject) => {
            try {
                if(this._ws.readyState === 1) {
                    const msg = Colibri.Common.CometMessage.CreateForSendBroadcast(Colibri.Web.Comet.Options.origin, this._user, text, contact, activate, wakeup);
                    this._send(msg, resolve, reject);
                    this.Dispatch('MessageSent', {message: msg});
                }
                else {
                    reject('server goes away');
                }
            }
            catch(e) {
                reject(e);
            }
        });
    }
    
    /**
     * Sends a message to a specific user.
     * @param {string} userGuid - The GUID of the recipient user.
     * @param {Array} files - The message content.
     * @param {object} contact - The name of the contact.
     * @returns {string|null} - The ID of the sent message.
     * @description This method sends files to a specific user and updates the local message store.
     */
    SendFilesTo(userGuid, files = null, contact = null, activate = false, wakeup = false) {
        return new Promise((resolve, reject) => {
            try {
                if(this._ws.readyState === 1) {
                    const msg = Colibri.Common.CometMessage.CreateForFilesSend(Colibri.Web.Comet.Options.origin, this._user, userGuid, files, contact, activate, wakeup);
                    msg.MarkAsRead();
                    if(msg.from !== msg.recipient) {
                        this.AddLocalMessage(msg).then(() => {
                            this.Dispatch('MessageSent', {message: msg});
                        });
                    }
                    const msgToSend = msg.clone();
                    this.DispatchHandlers('FilesSending', {message: msgToSend}).then((responses) => {
                        this._send(msgToSend, resolve, reject);
                    }).catch(error => {
                        this.Dispatch('MessageError', {error: error});
                        reject(error);
                    });
                }
                else {
                    reject('server goes away');
                }
            }
            catch(e) {
                reject(e);
            }
        });
    }

    /**
     * Sends a broadcast message.
     * @param {string} action - The action to be performed.
     * @param {Array} files - The message content.
     * @param {object} contact - The name of the contact.
     * @returns {string|null} - The ID of the sent message. 
     */
    SendFilesBroadcast(files = null, contact = null, activate = false, wakeup = false) {
        return new Promise((resolve, reject) => {
            try {
                if(this._ws.readyState === 1) {
                    const msg = Colibri.Common.CometMessage.CreateForFilesSendBroadcast(Colibri.Web.Comet.Options.origin, this._user, files, contact, activate, wakeup);
                    this._send(msg, resolve, reject);
                    this.Dispatch('MessageSent', {message: msg});
                }
                else {
                    reject('server goes away');
                }
            }
            catch(e) {
                reject(e);
            }
        });
    }


}

Colibri.Web.InternalStore = class extends Colibri.Common.AbstractMessageStore {

    /**
     * Add the message to the storage
     * @param {Object} message - The message to add.
     * @returns {Promise} A promise that resolves when the message is added.
     */
    Add(message) {
        let messages = App.Browser.Get('comet.messages');
        if(!messages) {
            messages = [];
        } else {
            messages = JSON.parse(messages);
        }
        const existing = Array.findObject(messages, 'id', message.id);
        if(!existing) {
            messages.push(message);
            App.Browser.Set('comet.messages', JSON.stringify(messages));
        } else {
            console.log('Message with ID ' + message.id + ' already exists in the store, not adding it again');
        }
        return Promise.resolve(message);
    }

    /**
     * Updates a message in the store.
     * @param {Object} message - The message to update.
     * @param {number} id - The ID of the message to update.
     * @returns {Promise} A promise that resolves when the message is updated.
     */
    Update(message, id) {
        let messages = App.Browser.Get('comet.messages');
        if(!messages) {
            messages = [];
        } else {
            messages = JSON.parse(messages);
        }
        const messageIndex = Array.findIndex(messages, (v, i, l) => v.id === id);
        if(messageIndex !== -1) {
            messages[messageIndex] = Object.assignRecursive(message, messages[messageIndex]);
            App.Browser.Set('comet.messages', JSON.stringify(messages));
            return Promise.resolve(messages[messageIndex]);
        }
        return Promise.reject('Can not find message');
    }

     /**
     * Store messages in the store.
     * @param {Array} messages - The messages to store.
     * @returns {Promise} A promise that resolves when the messages are stored.
     */
    Store(messages) {
        App.Browser.Set('comet.messages', JSON.stringify(messages));
        return Promise.resolve(messages);
    }

    /**
     * Retrieves messages from the store.
     * @param {Object} options - Options for retrieving messages.
     * @param {string} options.fields - The fields to retrieve.
     * @param {number} options.filter - The filter to apply to the messages.
     * @param {number} options.order - The order in which to retrieve messages.
     * @param {number} options.page - The page number for pagination.
     * @param {number} options.pagesize - The number of messages per page.
     * @returns {Promise} A promise that resolves with the retrieved messages.
     */
    Get(options = {}) {

        return new Promise((resolve, reject) => {
            let messages = App.Browser.Get('comet.messages');
            if(!messages) {
                messages = [];
            } else {
                messages = JSON.parse(messages);
            }

            options.order = options.order ?? ['date'];
            options.direction = options.direction ?? 'asc';
            options.filter = options.filter ?? {};
            options.page = options.page ?? 0;
            options.pagesize = options.pagesize ?? 100;
            if(!Array.isArray(options.order)) {
                options.order = [options.order];
            }

            messages.sort((a, b) => {
                const akey = options.order.map(v => a[v]).join('');
                const bkey = options.order.map(v => b[v]).join('');
                if(options.direction === 'desc') {
                    return akey < bkey ? 1 : (akey > bkey ? -1 : 0);
                } else {
                    return akey < bkey ? -1 : (akey > bkey ? 1 : 0);
                }
            });

            if(options.filter && (Object.isObject(options.filter) && Object.countKeys(options.filter) > 0 || Array.isArray(options.filter) && options.filter.length > 0)) {
                const filterString = window.convertFilterToString(options.filter);
                messages = messages.filter(row => {
                    let result = false;
                    eval('result = ' + filterString + ';');
                    return result;
                });
            }

            if(options.page > 0) {
                messages = messages.splice((options.page - 1) * options.pagesize, options.pagesize);
            }

            resolve(messages);
        });
    }

    /**
     * Deletes messages from the store.
     * @returns {Promise} A promise that resolves when the messages are deleted.
     */
    Clear() {
        App.Browser.Set('comet.messages', JSON.stringify([]));
        return Promise.resolve([]);
    }

    /**
     * Deletes a message from the store.
     * @param {Object} options - Options for deleting the message.
     * @param {number} options.filter - The filter to apply to the messages.
     * @returns {Promise} A promise that resolves when the message is deleted.
     */
    Delete(options) {
        let messages = App.Browser.Get('comet.messages');
        if(!messages) {
            messages = [];
        } else {
            messages = JSON.parse(messages);
        }

        options.filter = options.filter ?? [];
        if(options.filter) {
            const filterString = window.convertFilterToString(options.filter);
            messages = messages.filter(row => {
                let result = false;
                eval('result = ' + filterString + ';');
                return !result;
            });
        }

        App.Browser.Set('comet.messages', JSON.stringify(messages));
        return Promise.resolve();
    }
}

Colibri.Web.IndexedDbStore = class extends Colibri.Common.AbstractMessageStore {

    constructor() {
        super();

        this._dbName = 'comet.messages';
        this._storeName = 'messages';
        this._version = 1;
        this._db = null;

        this._initDb();
    }

    _initDb() {
        const request = indexedDB.open(this._dbName, this._version);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(this._storeName)) {
                const store = db.createObjectStore(this._storeName, { keyPath: 'id' });
                store.createIndex('action', 'action', { unique: false });
                store.createIndex('domain', 'domain', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('from', 'from', { unique: false });
                store.createIndex('recipient', 'recipient', { unique: false });
                store.createIndex('read', 'read', { unique: false });
                store.createIndex('message', 'message', { unique: false });
                store.createIndex('delivery', 'delivery', { unique: false });
                store.createIndex('broadcast', 'broadcast', { unique: false });
                store.createIndex('activate', 'activate', { unique: false });
                store.createIndex('wakeup', 'wakeup', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            this._db = event.target.result;
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
        };
    }

    _withStore(mode, callback) {
        return new Promise((resolve, reject) => {
            if (!this._db) {
                const request = indexedDB.open(this._dbName, this._version);
                request.onsuccess = () => {
                    this._db = request.result;
                    const tx = this._db.transaction(this._storeName, mode);
                    const store = tx.objectStore(this._storeName);
                    resolve(callback(store, tx));
                };
                request.onerror = e => reject(e.target.error);
            } else {
                const tx = this._db.transaction(this._storeName, mode);
                const store = tx.objectStore(this._storeName);
                resolve(callback(store, tx));
            }
        });
    }

    Add(message) {
        return this.Get({ filter: { id: message.id } }).then(existing => {
            if (existing.length > 0) {
                console.log(`Message with ID ${message.id} already exists`);
                return message;
            }
            return this._withStore('readwrite', (store) => {
                store.add(message);
                return message;
            });
        });
    }

    Update(message, id) {
        return new Promise((resolve, reject) => {
            this.Get({filter: {id: id}}).then((messages) => {            
                if(messages.length == 0) {
                    reject('Message not found');
                    return;
                }

                let msg = messages[0];
                msg = Object.assignRecursive(message, msg);

                this._withStore('readwrite', (store) => {
                    store.put(msg);
                    resolve(msg);
                });
            });
            
        })
    }

    Store(messages) {
        return this._withStore('readwrite', (store) => {
            messages.forEach(msg => store.put(msg));
            return messages;
        });
    }

    Get(options = {}) {
        options.order = options.order ?? ['date'];
        options.direction = options.direction ?? 'asc';
        options.filter = options.filter ?? {};
        options.page = options.page ?? 1;
        options.pagesize = options.pagesize ?? 100;

        if(!Array.isArray(options.order)) {
            options.order = [options.order];
        }
        
        let filterString = '';
        if(options.filter && (Object.isObject(options.filter) && Object.countKeys(options.filter) > 0 || Array.isArray(options.filter) && options.filter.length > 0)) {
            filterString = window.convertFilterToString(options.filter);
        }

        return this._withStore('readonly', (store) => {
            return new Promise((resolve, reject) => {
                const result = [];
                const req = store.openCursor();
                req.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {

                        const row = cursor.value;
                        let res = !!filterString;
                        if(filterString) {
                            eval('res = ' + filterString + ';');
                        }
                        if(res) {
                            result.push(row);
                        }
                        cursor.continue();
                        
                    } else {

                        result.sort((a, b) => {
                            const akey = options.order.map(v => a[v]).join('');
                            const bkey = options.order.map(v => b[v]).join('');
                            if(options.direction === 'desc') {
                                return akey < bkey ? 1 : (akey > bkey ? -1 : 0);
                            } else {
                                return akey < bkey ? -1 : (akey > bkey ? 1 : 0);
                            }
                        });

                        if(options.page > 0) {
                            const offset = (options.page - 1) * options.pagesize;
                            const paged = result.slice(offset, offset + options.pagesize);
                            resolve(paged);
                        } else {
                            resolve(result);
                        }

                    }
                };
                req.onerror = e => reject(e.target.error);
            });
        });
    }

    Clear() {
        return this._withStore('readwrite', (store) => {
            store.clear();
        });
    }

    Delete(options) {
        
        let filterString = '';
        if(options.filter && (Object.isObject(options.filter) && Object.countKeys(options.filter) > 0 || Array.isArray(options.filter) && options.filter.length > 0)) {
            filterString = window.convertFilterToString(options.filter);
        }

        return this._withStore('readwrite', (store) => {
            return new Promise((resolve, reject) => {
                const req = store.openCursor();
                req.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {
                        const row = cursor.value;
                        let res = !!filterString;
                        if(filterString) {
                            eval('res = ' + filterString + ';');
                        }
                        if(res) {
                            cursor.delete();
                        }
                        cursor.continue();
                    } else {
                        resolve();
                    }
                };
                req.onerror = e => reject(e.target.error);
            });
        });
    }

}

Colibri.Web.SqLiteStore = class extends Colibri.Common.AbstractMessageStore {

    constructor() {
        super();

        if(!App.Device.isAndroid && !App.Device.isIOs) {
            throw new Exception('Can not use SQLite store on this device');
        }

        this._db = App.Device.SqLite.Open('comet.messages', 'default');
        this._fields = [
            '"id" UNSIGNED BIG INT',
            '"action" VARCHAR(255)',
            '"domain" VARCHAR(255)',
            '"date" BIGINT', 
            '"from" VARCHAR(255)', 
            '"recipient" VARCHAR(255)', 
            '"read" BOOLEAN', 
            '"message" TEXT', 
            '"delivery" VARCHAR(50)', 
            '"broadcast" BOOLEAN',
            '"activate" BOOLEAN',
            '"wakeup" BOOLEAN',
        ];

    }

    /**
     * Add the message to the storage
     * @param {Object} message - The message to add.
     * @returns {Promise} A promise that resolves when the message is added.
     */
    Add(message) {
        return new Promise((resolve, reject) => {
            if(message.date instanceof Date) {
                message.date = message.date.toUnixTime();
            } else if(typeof message.date === 'string') {
                message.date = message.date.toDate().toUnixTime();
            }
            if(Object.isObject(message.message)) {
                message.message = JSON.stringify(message.message);
            }
            
            this.Get({filter: {
                id: message.id
            }}).then(existing => {
                if(existing.length > 0) {
                    console.log('Message with ID ' + message.id + ' already exists in the store, not adding it again');
                    resolve(message);
                } else {
                    App.Device.SqLite.CreateTable(
                        this._db,
                        'messages',
                        this._fields,
                        [message]
                    ).then(() => {
                        if(typeof message.date == 'number') {
                            message.date = message.date.toDateFromUnixTime();
                        }
                        if(typeof message.message === 'string') {
                            message.message = JSON.parse(message.message);
                        }
                        resolve(message);
                    }).catch(error => reject(error));
                }
            });

        });
    }

    /**
     * Updates a message in the store.
     * @param {Object} message - The message to update.
     * @param {number} id - The ID of the message to update.
     * @returns {Promise} A promise that resolves when the message is updated.
     */
    Update(message, id) {
        return new Promise((resolve, reject) => {

            this.Get({filter: {id: id}}).then((messages) => {   

                if(messages.length === 0) {
                    reject('Message not found');
                    return;
                }

                let msg = messages[0];                
                msg = Object.assignRecursive(message, msg);

                const saveMessage = Object.assign({}, msg, {id: id});
                if(saveMessage.date instanceof Date) {
                    saveMessage.date = saveMessage.date.toUnixTime();
                } else if(typeof saveMessage.date === 'string') {
                    saveMessage.date = saveMessage.date.toDate().toUnixTime();
                }
                if(Object.isObject(saveMessage.message)) {
                    saveMessage.message = JSON.stringify(saveMessage.message);
                }

                App.Device.SqLite.Update(
                    this._db,
                    'messages',
                    [saveMessage]
                ).then(() => {
                    if(typeof saveMessage.date == 'number') {
                        saveMessage.date = saveMessage.date.toDateFromUnixTime();
                    }
                    if(typeof saveMessage.message === 'string') {
                        saveMessage.message = JSON.parse(saveMessage.message);
                    }
                    resolve(saveMessage);
                }).catch(error => reject(error));


            });

        });
    }

     /**
     * Store messages in the store.
     * @param {Array} messages - The messages to store.
     * @returns {Promise} A promise that resolves when the messages are stored.
     */
    Store(messages) {
        messages.forEach((m) => {
            if(m.date instanceof Date) {
                m.date = m.date.toUnixTime();
            } else if(typeof m.date === 'string') {
                m.date = m.date.toDate().toUnixTime();
            }
            if(Object.isObject(m.message)) {
                m.message = JSON.stringify(m.message);
            }
        });
        return new Promise((resolve, reject) => {
            App.Device.SqLite.CreateTable(
                this._db,
                'messages',
                this._fields,
                messages
            ).then(() => {
                messages.forEach(m => {
                    if(typeof m.date == 'number') {
                        m.date = m.date.toDateFromUnixTime();
                    }
                    if(typeof m.message === 'string') {
                        m.message = JSON.parse(m.message);
                    }
                });
                resolve(messages);
            }).catch(error => reject(error));
        });
    }

    /**
     * Retrieves messages from the store.
     * @param {Object} options - Options for retrieving messages.
     * @param {string} options.fields - The fields to retrieve.
     * @param {number} options.filter - The filter to apply to the messages.
     * @param {number} options.order - The order in which to retrieve messages.
     * @param {number} options.page - The page number for pagination.
     * @param {number} options.pagesize - The number of messages per page.
     * @returns {Promise} A promise that resolves with the retrieved messages.
     */
    Get(options = {}) {

        return new Promise((resolve, reject) => {

            options.order = options.order ?? ['date'];
            options.direction = options.direction ?? 'asc';
            options.filter = options.filter ?? {};
            options.page = options.page ?? 0;
            options.pagesize = options.pagesize ?? 100;

            if(!Array.isArray(options.order)) {
                options.order = [options.order];
            }

            const limit = options.page > 0 ? options.pagesize + ' offset ' + ((options.page - 1) * options.pagesize) : '';
            const orderby = options.order.map(v => v + ' ' + options.direction).join(',');
            const filter = window.convertFilterToStringForSql(options.filter);
            
            App.Device.SqLite.CreateTable(
                this._db,
                'messages',
                this._fields,
            ).then(() => App.Device.SqLite.Select(
                this._db,
                'messages',
                '*',
                filter,
                orderby,
                limit
            )).then((messages) => {
                messages.forEach(m => {
                    if(typeof m.date == 'number') {
                        m.date = m.date.toDateFromUnixTime();
                    }
                    if(typeof m.message === 'string') {
                        m.message = JSON.parse(m.message);
                    }
                });
                resolve(messages);
            }).catch(error => reject(error));

        });
    }

    /**
     * Deletes messages from the store.
     * @returns {Promise} A promise that resolves when the messages are deleted.
     */
    Clear() {
        return new Promise((resolve, reject) => {
            App.Device.SqLite.CreateTable(
                this._db,
                'messages',
                this._fields,
            ).then(() => App.Device.SqLite.Delete(this._db, 'messages', 'true'))
            .then(() => {
                resolve()
            }).catch(error => reject(error));
        });
    }

    /**
     * Deletes a message from the store.
     * @param {Object} options - Options for deleting the message.
     * @param {number} options.filter - The filter to apply to the messages.
     * @returns {Promise} A promise that resolves when the message is deleted.
     */
    Delete(options) {
        let messages = App.Browser.Get('comet.messages');
        if(!messages) {
            messages = [];
        } else {
            messages = JSON.parse(messages);
        }
        
        const filterString = window.convertFilterToStringForSql(options.filter);
        return new Promise((resolve, reject) => {
            App.Device.SqLite.CreateTable(
                this._db,
                'messages',
                this._fields,
            ).then(() => App.Device.SqLite.Delete(this._db, 'messages', filterString))
            .then(() => {
                resolve()
            }).catch(error => reject(error));
        });
    }
}
