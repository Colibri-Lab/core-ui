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
        this.RegisterEvent('MessagesMarkedAsRead', false, 'When all messages marked as read');
        this.RegisterEvent('MessageRemoved', false, 'When message is removed');
        this.RegisterEvent('ChatCleared', false, 'When chat with user is removed');
        this.RegisterEvent('EventReceived', false, 'When event is received');
        this.RegisterEvent('ConnectionError', false, 'When we can not connect to server');
        this.RegisterEvent('Connected', false, 'When we connected to server');
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
                    this._ws.readyState = 0;
                }, 
                (message) => {
                    // connection is alive
                    this._connected = true;
                    this._ws.readyState = 1;
                    this.__onCometMessage({data: message});
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
                JSON.stringify(Object.assign({name: this._userName}, this._handlers)),
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
     * @param {object} userData - Data of the user.
     * @param {Colibri.Storages.Store} store - Storage object.
     * @param {string} storeMessages - Key where messages will be stored.
     */
    Init(userData, store, storeMessages, handlers = {}, firebaseServiceJson = null, pushToken = null, pushFunction = null) {

        this._user = userData.guid;
        this._userName = userData.name;
        this._store = store;
        this._storeMessages = storeMessages;
        this._handlers = handlers;
        this._firebaseServiceJson = firebaseServiceJson;
        this._pushToken = pushToken;
        this._pushFunction = pushFunction;

        if((App.Device.isAndroid || App.Device.isIOs) && App.Device.SqLite.isAvailable) {
            this._storage = new Colibri.Web.SqLiteStore();
        } else {
            this._storage = new Colibri.Web.InternalStore();
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
            this._ws.readyState = 0;
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

    /**
     * Handles incoming messages from the Comet server.
     * @private
     * @param {object} message - The received message object.
     */
    __onCometMessage(message) {
        message = JSON.parse(message.data);
        if(message.action == 'connection-success') {
            console.log('Connection to Comet Server ok');
        }
        else if(message.action == 'register-success') {
            this._registeredSuccess = true;
            console.log('User registered successfuly');
        }
        else if(message.action == 'firebase-success') {
            console.log('Firebase registered successfuly');
        }
        else if(message.action == 'register-error') {
            this._registeredSuccess = false;
            console.log('User registration error');
        }
        else if(message.action == 'message') {
            this.DispatchHandlers('MessageReceiving', {message: message}).then((responses) => {
                if(responses.filter(v => v === false).length > 0) {
                    return;
                }
                const msg = Colibri.Common.CometMessage.FromReceivedObject(message.domain, message.from, message.message, message.delivery, message.broadcast);
                this._addMessage(msg).then(() => {
                    this.Dispatch('MessageReceived', {message: msg});
                });
            });
        }
        else {
            const msg = Colibri.Common.CometEvent.FromReceivedObject(message.action, message.domain, message.from, message.message, message.delivery, message.broadcast);
            this.DispatchHandlers('EventReceiving', {message: msg}).then((responses) => {
                this.Dispatch('EventReceived', {event: msg});
            });
        }
    }

    _addMessage(message) {
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
        this._ws.readyState = 0;
    } 

    GetMessages(options = {}) {
        return new Promise((resolve, reject) => {
            this._storage.Get(options).then(messages => {
                resolve(messages.map(message => {
                    const msg = new Colibri.Common.CometMessage();
                    Object.forEach(message, (k, v) => {
                        msg[k] = v;
                    });
                    msg.date = typeof msg.date === 'string' ? msg.date : msg.date.toDateFromUnixTime();
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
    MarkAsRead(ids = null) {
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
                this.Dispatch('MessagesMarkedAsRead', {});
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
                this.Dispatch('MessagesMarkedAsRead', {});            
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
                this.Dispatch('ChatCleared', {});
            }).catch(error => reject(error));
        });
    }

    UpdateMessage(id, text) {
        return new Promise((resolve, reject) => {
            this._storage.Update({message: {text: text}}, id).then(() => {
                this._transferToModuleStore();
                this.Dispatch('ChatCleared', {});
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
        try {
            if(this._ws.readyState === 1) {
                const msg = Colibri.Common.CometEvent.CreateForSend(action, Colibri.Web.Comet.Options.origin, this._user, userGuid, message, 'untrusted', activate, wakeup);
                // const msg = {action: action, recipient: userGuid, message: message, domain: Colibri.Web.Comet.Options.origin, delivery: 'untrusted'};
                this._ws.send(msg.toJson());
            }
            else {
                console.log('server goes away');
            }
        }
        catch(e) {
            console.log(e);
        }
    }

    /**
     * Sends a message to a specific user.
     * @param {string} userGuid - The GUID of the recipient user.
     * @param {string} message - The message content.
     * @param {string} contactName - The name of the contact.
     * @returns {string|null} - The ID of the sent message.
     */
    SendTo(userGuid, message = null, contactName = null, activate = true, wakeup = true) {
        try {
            const id = Date.Mc();
            if(this._ws.readyState === 1) {
                const msg = Colibri.Common.CometMessage.CreateForSend(Colibri.Web.Comet.Options.origin, this._user, userGuid, message, {contact: contactName}, activate, wakeup);
                msg.MarkAsRead();
                if(msg.from !== msg.recipient) {
                    this._addMessage(msg);
                }
                this.DispatchHandlers('MessageSending', {message: msg}).then((responses) => {
                    this._ws.send(msg.toJson());
                }).catch(error => {
                    this.Dispatch('MessageError', {error: error});
                });
                return id;
            }
            else {
                console.log('server goes away');
            }
        }
        catch(e) {
            console.log(e);
        }
        return null;
    }

    /**
     * Sends a broadcast message.
     * @param {string} action - The action to be performed.
     * @param {object} message - The message content.
     * @returns {string|null} - The ID of the sent message. 
     */
    CommandBroadcast(action, message = null, activate = true, wakeup = true) {
        try {
            const id = Date.Mc();
            if(this._ws.readyState === 1) {
                const msg = Colibri.Common.CometEvent.CreateForSendBroadcast(action, Colibri.Web.Comet.Options.origin, this._user, message, activate, wakeup);
                // const msg = {action: action, recipient: '*', message: {text: message, id: id, broadcast: true}, domain: Colibri.Web.Comet.Options.origin, delivery: 'trusted'};
                this._ws.send(msg.toJson());
                return id;
            }
            else {
                console.log('server goes away');
            }
        }
        catch(e) {
            console.log(e);
        }
        return null;
    }

    /**
     * Sends a broadcast message.
     * @param {string} action - The action to be performed.
     * @param {string} message - The message content.
     * @param {string} contactName - The name of the contact.
     * @returns {string|null} - The ID of the sent message. 
     */
    SendBroadcast(text = null, contactName = null, activate = true, wakeup = true) {
        try {
            const id = Date.Mc();
            if(this._ws.readyState === 1) {
                const msg = Colibri.Common.CometMessage.CreateForSendBroadcast(Colibri.Web.Comet.Options.origin, this._user, text, {contact: contactName}, activate, wakeup);
                this._ws.send(msg.toJson());
                return id;
            }
            else {
                console.log('server goes away');
            }
        }
        catch(e) {
            console.log(e);
        }
        return null;
    }
    
    /**
     * Sends a message to a specific user.
     * @param {string} userGuid - The GUID of the recipient user.
     * @param {string} action - The action to be performed.
     * @param {Array} message - The message content.
     * @param {string} contactName - The name of the contact.
     * @returns {string|null} - The ID of the sent message.
     */
    SendFilesTo(userGuid, action, files = null, contactName = null, activate = true, wakeup = true) {
        try {
            const id = Date.Mc();
            if(this._ws.readyState === 1) {
                const msg = Colibri.Common.CometMessage.CreateForFilesSend(Colibri.Web.Comet.Options.origin, this._user, userGuid, files, {contact: contactName}, activate, wakeup);
                msg.MarkAsRead();
                if(msg.from !== msg.recipient) {
                    this._addMessage(msg);
                }
                this.DispatchHandlers('FilesSending', {message: msg}).then((responses) => {
                    this._ws.send(msg.toJson());
                }).catch(error => {
                    this.Dispatch('MessageError', {error: error});
                });
                return id;
            }
            else {
                console.log('server goes away');
            }
        }
        catch(e) {
            console.log(e);
        }
        return null;
    }

    /**
     * Sends a broadcast message.
     * @param {string} action - The action to be performed.
     * @param {Array} files - The message content.
     * @param {string} contactName - The name of the contact.
     * @returns {string|null} - The ID of the sent message. 
     */
    SendFilesBroadcast(action, files = null, contactName = null, activate = true, wakeup = true) {
        try {
            const id = Date.Mc();
            if(this._ws.readyState === 1) {
                const msg = Colibri.Common.CometMessage.CreateForFilesSendBroadcast(Colibri.Web.Comet.Options.origin, this._user, files, {contact: contactName}, activate, wakeup);
                // const msg = {action: action, recipient: '*', message: {files: files, id: id, broadcast: true}, domain: Colibri.Web.Comet.Options.origin, delivery: 'trusted'};
                this._ws.send(JSON.stringify(msg));
                return id;
            }
            else {
                console.log('server goes away');
            }
        }
        catch(e) {
            console.log(e);
        }
        return null;
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
        messages.push(message);
        App.Browser.Set('comet.messages', JSON.stringify(messages));
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
        messages[messageIndex] = Object.assignRecursive(message, messages[messageIndex]);
        // messages[messageIndex] = Object.assign({}, messages[messageIndex], message);
        App.Browser.Set('comet.messages', JSON.stringify(messages));
        return Promise.resolve(message);
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
            App.Device.SqLite.CreateTable(
                this._db,
                'messages',
                this._fields,
                [message]
            ).then(() => {
                resolve(message);
            }).catch(error => reject(error));
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
            App.Device.SqLite.CreateTable(
                this._db,
                'messages',
                this._fields,
            ).then(() => App.Device.SqLite.Update(
                this._db,
                'messages',
                [Object.assign({}, message, {id: id})]
            )).then(() => {
                resolve(message);
            }).catch(error => reject(error));
        });
    }

     /**
     * Store messages in the store.
     * @param {Array} messages - The messages to store.
     * @returns {Promise} A promise that resolves when the messages are stored.
     */
    Store(messages) {
        return new Promise((resolve, reject) => {
            App.Device.SqLite.CreateTable(
                this._db,
                'messages',
                this._fields,
                messages
            ).then(() => {
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

            const limit = options.pagesize + ' offset ' + ((options.page - 1) * options.pagesize);
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
