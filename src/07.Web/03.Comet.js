/**
 * Handles the connection to the Comet server and message communication.
 * @class 
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Web
 */
Colibri.Web.Comet = class extends Colibri.Events.Dispatcher {

    /**
     * The URL of the Comet server. 
     * @type {string} 
     */
    _url = '';

    /**
     * The storage object for storing messages. 
     * @type {object} 
     */
    _storage = null;

    /** 
     * The store object for managing messages in the module.
     * @type {Colibri.Storages.Store} 
     */
    _store = null;

    /** 
     * The key for storing messages in the module store.
     * @type {string} 
     */
    _storeMessages = '';
    
    /** 
     * The key for storing unread message count in the module store.
     * @type {string} 
     */
    _storeUnread = '';

    /** 
     * The settings for the Comet connection.
     * @type {object} 
     */
    _settings = null;

    /** 
     * The WebSocket connection for the Comet server.
     * @type {WebSocket|null} 
     */
    _ws = null;

    /** 
     * Whether the Comet connection is established.
     * @type {boolean} 
     */
    _connected = false;

    /** 
     * The user object for the Comet connection.
     * @type {object} 
     */
    _user = null;

    /** 
     * The client ID for the Comet connection.
     * @type {string} 
     */
    _clientId = null;

    /** 
     * Event handlers for specific events in the Comet connection.
     * @type {Object}
     */
    __eventHandlers = {};

    /** 
     * Sent messages
     * @type {Object}
     */
    __sentMessages = {};

    /**
     * Global options for the Comet connection.
     * @type {object}
     */
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

    /**
     * Transfers messages from the storage to the module store and updates the unread count.
     * @private
     */
    _transferToModuleStore() {
        this._storage.Get().then(messages => {
            const unreadCount = messages.filter(v => v.read === false).length;
            this._store.Set(this._storeMessages, {messages: messages, unread: unreadCount});
        });
    }

    /**
     * Destructor to close WebSocket connection when the object is destroyed.
     * @destructor
     */
    destructor() {
        super.destructor();
        if(this._ws) {
            this._ws.close();
        }
    }

    /**
     * Gets the settings for the Comet connection.
     * @type {object}
     * @readonly
     */
    get settings() {
        return this._settings;
    }

    /**
     * Gets the user GUID for the Comet connection.
     * @type {string}
     * @readonly
     */
    get User() {
        return this._user;
    }

    /**
     * Gets the user name for the Comet connection.
     * @type {string}
     * @readonly
     */
    get UserName() {
        return this._userName;
    }

    /**
     * Gets the connection status of the Comet connection.
     * @type {boolean}
     * @readonly
     */
    get isReady() {
        return this._ws.readyState === 1;
    }

    /**
     * Gets the registration status of the Comet connection.
     * @type {boolean}
     * @readonly
     */
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

    /**
     * Gets the connection status of the Comet connection.
     * @type {boolean}
     * @readonly
     */
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
            this._ws = new WebSocket('wss://' + (this._websocketURI ?? this._settings.host + ':' + this._settings.port) + '/client/' + this._clientId);
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
     * @param {string|null} websocketURI - The URI for the WebSocket connection.
     * @returns {void}
     * @public
     * @example
     * ```
     * const userData = { guid: 'user-guid', name: 'User Name' };
     * App.Comet.Init(userData, store, 'messages', handlers, texts, firebaseServiceJson, pushToken, pushFunction, websocketURI);
     * ```
     */
    Init(userData, store, storeMessages, handlers = {}, texts = {}, firebaseServiceJson = null, pushToken = null, pushFunction = null, websocketURI = null) {

        this._websocketURI = websocketURI;
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

    /**
     * Sets the push token and function for handling push notifications.
     * @param {string} token - The push token.
     * @param {function} f - The function to handle push notifications.
     * @returns {void}
     * @public
     * @example
     * ```
     * const token = 'push-token';
     * const pushFunction = (notification) => { console.log(notification); };
     * App.Comet.SetPushToken(token, pushFunction);
     * ```
     */
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
     * @param {String} handlerName - The name of the event to register the handler for.
     * @param {Function} handler - The function to be called when the event occurs.
     * @param {Object} respondent - The object that will respond to the handler.
     * @public
     * @example
     * ```
     * /// Register a handler for the 'EventReceiving|MessageReceiving|FilesSending|MessageSending' event
     * App.Comet.RegisterHandler('EventReceiving', myHandler, this);
     * ```
     */
    RegisterHandler(handlerName, handler, respondent) {
        if(!this.__specificHandlers[handlerName]) {
            this.__specificHandlers[handlerName] = [];
        }
        this.UnRegisterHandler(handlerName, handler, respondent);
        this.__specificHandlers[handlerName].push([handler, respondent]);
    }


    /**
     * Registers a handler for specific events.
     * @param {String} handlerName - The name of the event to register the handler for.
     * @param {Function} handler - The function to be called when the event occurs.
     * @public
     * @example
     * ```
     * /// Unregister a handler for the 'EventReceiving|MessageReceiving|FilesSending|MessageSending' event
     * App.Comet.UnRegisterHandler('EventReceiving', myHandler, this);
     * ```
     */
    UnRegisterHandler(handlerName, handler, respondent) {
        if(this.__specificHandlers[handlerName]) {
            for (let i = 0; i < this.__specificHandlers[handlerName].length; i++) {
                if(this.__specificHandlers[handlerName][i][0] === handler && this.__specificHandlers[handlerName][i][1] === respondent) {
                    this.__specificHandlers[handlerName].splice(i, 1);
                    break;
                }
            }
        }
    }

    /**
     * Dispatches handlers for specific events.
     * @param {String} handlerName - The name of the event to dispatch handlers for.
     * @param {Object} args - The arguments to pass to the handlers.
     * @returns {Promise<Array>} - An array of responses from the handlers.
     * @async
     * @public
     * @example
     * ```
     * /// Dispatch handlers for the 'EventReceiving|MessageReceiving|FilesSending|MessageSending' event
     * App.Comet.DispatchHandlers('MessageReceiving', {key: 'value'});
     * ```
     */
    async DispatchHandlers(handlerName, args) {

        const responses = [];
        if(this.__specificHandlers[handlerName] && isIterable(this.__specificHandlers[handlerName])) {
            for(const handler of this.__specificHandlers[handlerName]) {
                const han = handler[0];
                const res = handler[1] || this;
                responses.push(await han.apply(res, [args]));
            }
        }
        return responses;
    }

    /**
     * Disconnects from the Comet server.
     * @public
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
     * @param {boolean} registered - Whether the user is already registered.
     * @private
     */
    __onCometOpened(registered = false) {
        this._connected = true;
        if(!registered) {
            this.Command(this._user, 'register', {name: this._userName, storeHandler: this._handlers?.['storeHandler'] ?? null, closeHandler: this._handlers?.['closeHandler'] ?? null});
        }
        if(this._pushToken) {
            this.Command(this._user, 'firebase', {name: this._userName, json: JSON.stringify(this._firebaseServiceJson), token: this._pushToken, f: this._pushFunction});
        }
    }

    /**
     * Subscribes to a channel on the Comet server.
     * @param {string} channelGuid - The GUID of the channel to subscribe to.
     * @param {Object} params - Additional parameters for the subscription.
     * @public
     * @example
     * ```
     * /// Subscribe to a channel with GUID 'channel-guid'
     * App.Comet.Subscribe('channel-guid', {param1: 'value1', param2: 'value2'});
     * ```
     */
    Subscribe(channelGuid, params = {}) {
        this.Command(channelGuid, 'subscribe', params);        
    }

    /**
     * Unsubscribes from a channel on the Comet server.
     * @param {string} channelGuid - The GUID of the channel to unsubscribe from.
     * @param {Object} params - Additional parameters for the unsubscription.
     * @public
     * @example
     * ```
     * /// Unsubscribe from a channel with GUID 'channel-guid'
     * App.Comet.Unsubscribe('channel-guid', {param1: 'value1', param2: 'value2'});
     * ```
     */
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
                this.DispatchEvent(msg);
            });
        }
    }

    /**
     * Send the message and resolves or rejects a promise
     * @param {Colibri.Common.CometMessage|Colibri.Common.CometEvent} msg 
     * @param {function} resolve - The function to call when the message is sent successfully.
     * @param {function} reject - The function to call when there is an error sending the message.
     * @returns {void}
     * @private
     */
    _send(msg, resolve, reject) {

        if(['register', 'firebase', 'debug', 'subscribe', 'unsubscribe'].indexOf(msg.action) !== -1) {
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

    /**
     * Registers a handler for a specific event.
     * @param {string} eventName - The name of the event to wait for.
     * @param {function} handler - The handler function to call when the event occurs.
     * @param {object} respondent - The object that will be the context (`this`) for the handler.
     * @returns {void}
     * @public
     * @example
     * ```
     * /// Register a handler for the 'some-event' event
     * App.Comet.WaitForEvent('some-event', (message) => { console.log(message); }, this);
     * ```
     */
    UnwaitForEvent(eventName, handler, respondent) {
        if(!this.__eventHandlers[eventName]) {
            this.__eventHandlers[eventName] = [];
        }

        const newHandlers = [];
        for(const h of this.__eventHandlers[eventName]) {
            if(!(h[0] === handler && h[1] === respondent)) {
                newHandlers.push(h);
            }
        }
        this.__eventHandlers[eventName] = newHandlers;

    }

    /**
     * Registers a handler for a specific event.
     * @param {string} eventName - The name of the event to wait for.
     * @param {function} handler - The handler function to call when the event occurs.
     * @param {object} respondent - The object that will be the context (`this`) for the handler.
     * @param {object} args - Additional arguments to pass to the handler.
     * @returns {void}
     * @public
     * @example
     * ```
     * /// Register a handler for the 'some-event' event
     * App.Comet.WaitForEvent('some-event', (message) => { console.log(message); }, this, {additional: 'data'});
     * ```
     */
    WaitForEvent(eventName, handler, respondent, args = {}) {
        if(!this.__eventHandlers[eventName]) {
            this.__eventHandlers[eventName] = [];
        }
        this.UnwaitForEvent(eventName, handler, respondent);
        this.__eventHandlers[eventName].push([handler, respondent, args]);
    }

    /**
     * Dispatches an event to all registered handlers.
     * @async
     * @param {Colibri.Common.CometMessage} msg - The message containing the event information.
     * @returns {Promise<void>}
     * @public
     * @example
     * ```
     * /// Dispatch an event to all registered handlers
     * App.Comet.DispatchEvent(msg);
     * ```
     */
    async DispatchEvent(msg) {
        if(this.__eventHandlers[msg.action]) {
            for(const handler of this.__eventHandlers[msg.action]) {
                const han = handler[0];
                let resp = handler[1];
                let args = handler[2];
                if(!resp) {
                    resp = this;
                }
                if(han.isAsync()) {
                    await han.apply(resp, [msg, args]);
                } else {
                    han.apply(resp, [msg, args]);
                }
            }
        }
    }

    /**
     * Adds a message to the local storage.
     * @param {Colibri.Common.CometMessage} message message to save
     * @returns {Promise}
     * @async
     * @public
     * @example
     * ```
     * /// Add a local message
     * App.Comet.AddLocalMessage(message);
     * ```
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

    /**
     * Retrieves messages from the local storage.
     * @param {object} options - Options for retrieving messages.
     * @returns {Promise<Array<Colibri.Common.CometMessage>>}
     * @async
     * @public
     * @example
     * ```
     * /// Get messages with specific options
     * App.Comet.GetMessages({filter: {from: 'user-guid'}}).then(messages => { 
     *      console.log(messages); 
     * }).catch(error => { 
     *      console.error(error); 
     * });
     * ```
     */
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

    /**
     * Retrieves the conversation with a specific user.
     * @param {string} userGuid - The GUID of the user.
     * @param {object} options - Options for retrieving messages.
     * @returns {Promise<Array<Colibri.Common.CometMessage>>}
     * @async
     * @public
     */
    GetConversation(userGuid, options = {}) {
        return this.GetMessages(Object.assignRecursive(options, {
            filter: [
                {from: userGuid, broadcast: false}, 
                {recipient: userGuid, broadcast: false}
            ],
        }));
    }

    /**
     * Retrieves broadcast messages from the local storage.
     * @param {object} options - Options for retrieving messages.
     * @returns {Promise<Array<Colibri.Common.CometMessage>>}
     * @async   
     * @public
     */
    GetBroadcast(options = {}) {
        return this.GetMessages(Object.assignRecursive(options, {
            filter: {
                broadcast: true
            },
        }))
    }

    /**
     * Clears stored messages.
     * @param {Date|null} date - If provided, only messages after this date will be cleared.    
     * @returns {Promise<void>}
     * @async
     * @public
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
     * @param {Array<number>|null} ids - The IDs of the messages to mark as read. If null, all messages will be marked as read.
     * @param {boolean} sendEvent - Whether to dispatch the 'MessagesMarkedAsRead' event.
     * @returns {Promise<void>}
     * @async
     * @public
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
     * @returns {Promise<void>}
     * @async
     * @public
     */
    RemoveMessage(message) {
        return new Promise((resolve, reject) => {
            this._storage.Delete({filter: {id: Object.isObject(message) ? message.id : message}}).then(() => {
                this._transferToModuleStore();
                this.Dispatch('MessageRemoved', {message: message});
                resolve();
            }).catch(error => reject(error));
        });
    }

    /**
     * Removes a message from or to member.
     * @param {string} user - The user whose conversation is to be cleared.
     * @returns {Promise<void>}
     * @async
     * @public
     */
    ClearConversationWith(user) {
        return new Promise((resolve, reject) => {
            this._storage.Delete({filter: [{from: user}, {recipient: user}]}).then(() => {
                this._transferToModuleStore();
                this.Dispatch('ChatCleared', {member: user});
                resolve();
            }).catch(error => reject(error));
        });
    }

    /**
     * Updates the text or files of a message.
     * @param {number} id - The ID of the message to be updated.
     * @param {string|Array<object>} textOrFiles - The new text or files for the message.
     * @returns {Promise<void>}
     * @async
     * @public
     */
    UpdateMessage(id, textOrFiles) {
        return new Promise((resolve, reject) => {
            this._storage.Update({read: true, message: Array.isArray(textOrFiles) ? {files: textOrFiles} : {text: textOrFiles}}, id).then((msg) => {
                this._transferToModuleStore();
                this.Dispatch('MessageUpdated', {message: msg});
                resolve();
            }).catch(error => reject(error));
        });
    }

    /**
     * Updates the status of a message.
     * @param {number} id - The ID of the message to be updated.
     * @param {string} status - The new status of the message.
     * @returns {Promise<void>}
     * @async
     * @public
     */
    UpdateSetStatus(id, status = 'sent') {
        return new Promise((resolve, reject) => {
            this._storage.Update({message: {status: status}, read: true}, id).then((msg) => {
                this._transferToModuleStore();
                this.Dispatch('MessageUpdated', {message: msg});
                resolve();
            }).catch(error => reject(error));
        });
    }

    /**
     * Sends a command to the Comet server.
     * @param {string} userGuid - The GUID of the user to send the command to.
     * @param {string} action - The action to be performed.
     * @param {object} message - The message data.
     * @param {boolean} activate - Whether to activate the command.
     * @param {boolean} wakeup - Whether to wake up the recipient.
     * @async
     * @public
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
     * @param {object} message - The message data.
     * @param {boolean} activate - Whether to activate the message.
     * @param {boolean} wakeup - Whether to wake up the recipient.
     * @returns {Promise<string|null>} - The ID of the sent message. 
     * @async
     * @public
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

    /**
     * Sends a message to multiple users.
     * @param {Colibri.Common.CometMessage} msg - The message to be sent.
     * @param {Array<string>} userGuids - An array of user GUIDs to send the message to.
     * @returns {Promise<void>}
     * @async
     * @public
     */
    SendFor(msg, userGuids) {
        return new Promise((resolve, reject) => {
            try {
                if(this._ws.readyState === 1) {
                    for(const userGuid of userGuids) {
                        const msgToSend = msg.clone();
                        msgToSend.message.for = userGuid;
                        this.DispatchHandlers(
                            msgToSend.message?.files ? 'FilesSending' : 'MessageSending', 
                            {message: msgToSend}
                        ).then((responses) => {
                            this._send(msgToSend, resolve, reject);
                        }).catch(error => {
                            this.Dispatch('MessageError', {error: error});
                        });
                    }

                    const msgToSend = msg.clone();
                    msgToSend.message.for = App.Comet.User;
                    msgToSend.MarkAsRead();

                    this.AddLocalMessage(msgToSend).then(() => {
                        this.Dispatch('MessageSent', {message: msgToSend});
                        this.DispatchHandlers(
                            msgToSend.message?.files ? 'FilesSending' : 'MessageSending', 
                            {message: msgToSend}
                        ).then((responses) => {
                            this._send(msgToSend, resolve, reject);
                        }).catch(error => {
                            this.Dispatch('MessageError', {error: error});
                        });
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
     * Sends a message to a specific user.
     * @param {string} userGuid - The GUID of the recipient user.
     * @param {string|object} message - The message content.
     * @param {object} contact - The name of the contact.
     * @param {boolean} activate - Whether to activate the message.
     * @param {boolean} wakeup - Whether to wake up the recipient.
     * @param {boolean} addLocal - Whether to add the message to local storage.
     * @returns {string|null} - The ID of the sent message.
     * @async
     * @public
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
     * @param {string} text - The message content.
     * @param {object} contact - The name of the contact.
     * @param {boolean} activate - Whether to activate the message.
     * @param {boolean} wakeup - Whether to wake up the recipient.
     * @returns {Promise<string|null>} - The ID of the sent message.
     * @async
     * @public
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
     * This method sends files to a specific user and updates the local message store.
     * @param {string} userGuid - The GUID of the recipient user.
     * @param {Array} files - The message content.
     * @param {object} contact - The name of the contact.
     * @param {boolean} activate - Whether to activate the message.
     * @param {boolean} wakeup - Whether to wake up the recipient.
     * @returns {Promise<string|null>} - The ID of the sent message.
     * @async
     * @public
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
     * @param {Array} files - The message content.
     * @param {object} contact - The name of the contact.
     * @param {boolean} activate - Whether to activate the message.
     * @param {boolean} wakeup - Whether to wake up the recipient.
     * @returns {Promise<string|null>} - The ID of the sent message.
     * @async
     * @public
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
