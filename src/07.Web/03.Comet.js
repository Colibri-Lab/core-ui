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
    _storage = window.localStorage;
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

    /**
     * Destructor to close WebSocket connection when the object is destroyed.
     */
    destructor() {
        super.destructor();
        if(this._ws) {
            this._ws.close();
        }
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
     * Generates a unique device ID for the Comet connection.
     * @private
     * @returns {string} - The generated device ID.
     */
    _generateDeviceId() {
        let deviceId = App.Browser.Get('device-id');
        if(!deviceId) {
            deviceId = String.MD5(Date.Mc() + '');
            App.Browser.Set('device-id', deviceId);
        }
        return deviceId;
    }

    /**
     * Initializes the WebSocket connection.
     * @private
     */
    _initConnection() {
        this._ws && this._ws.close();
        this._ws = new WebSocket('wss://' + this._settings.host + ':' + this._settings.port + '/client/' + this._clientId);
        this._ws.onopen = () => this.__onCometOpened();
        this._ws.onmessage = (message) => this.__onCometMessage(message);
        this._ws.onerror = error => this.__onCometError(error);
    }
    
    /**
     * Initializes the Comet object with user data and storage settings.
     * @param {object} userData - Data of the user.
     * @param {Colibri.Storages.Store} store - Storage object.
     * @param {string} storeMessages - Key where messages will be stored.
     */
    Init(userData, store, storeMessages, storeHandler = null) {

        this._user = userData.guid;
        this._userName = userData.name;
        this._store = store;
        this._storeMessages = storeMessages;
        this._storeHandler = storeHandler;
        
        this._initConnection();
        this._saveToStore();

        Colibri.Common.StartTimer('comet-timer', 5000, () => {
            if(this._ws && this._ws.readyState !== 1) {
                console.log('connection closed, may be server down');
                this._initConnection();
            }
        });

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
        }
    }

    /**
     * Handles the WebSocket connection open event.
     * @private
     */
    __onCometOpened() {
        this._connected = true;
        this.Command(this._user, 'register', {name: this._userName, storeHandler: this._storeHandler});
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
        else if(message.action == 'register-error') {
            this._registeredSuccess = false;
            console.log('User registration error');
        }
        else if(message.action == 'message') {
            this.DispatchHandlers('MessageReceiving', {message: message}).then((responses) => {
                if(responses.filter(v => v === false).length > 0) {
                    return;
                }
                this._addMessage(message);
                this.Dispatch('MessageReceived', {message: message});
            });
        }
        else {
            this.DispatchHandlers('EventReceiving', {message: message}).then((responses) => {
                this.Dispatch('EventReceived', {event: message});
            });
        }
    }

    _addMessage(message, read = false) {
        message.id = message.id ?? Number.Rnd4();
        message.date = new Date();
        message.read = read;
        var messages = this._getStoredMessages();
        messages.push(message);
        this._setStoredMessages(messages);
        this._saveToStore();
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
    } 


    /**
     * Retrieves stored messages from local storage.
     * @private
     * @returns {array} - Array of stored messages.
     */
    _getStoredMessages() {
        let messages = this._storage.getItem('comet.messages');
        if (!messages)
            messages = [];
        else
            messages = JSON.parse(messages);
        return messages;
    }

    /**
     * Saves messages to local storage.
     * @private
     * @param {array} messages - Array of messages to be stored.
     */
    _setStoredMessages(messages) {
        this._storage.setItem('comet.messages', JSON.stringify(messages));
    }

    /**
     * Saves messages to the application store.
     * @private
     */
    _saveToStore() {
        let messages = this._getStoredMessages();
        let unreadCount = 0;
        messages.forEach(message => unreadCount += (message.read !== true ? 1 : 0));
        this._store.Set(this._storeMessages, {messages: messages, unread: unreadCount});
    }

    /**
     * Clears stored messages.
     */
    ClearMessages(date = null) {
        if(date === null) {
            this._setStoredMessages([]);
        } else {
            let messages = this._getStoredMessages();
            messages = messages.filter(v => v.date > date);
            this._setStoredMessages(messages);    
        }
        this._saveToStore();
    }

    /**
     * Marks all messages as read.
     */
    MarkAsRead(ids = null) {
        let messages = this._getStoredMessages();
        if(ids && ids.length > 0) {
            messages.filter(v => ids.indexOf(v.id) !== -1).forEach(message => message.read = true);
        } else {
            messages.forEach(message => message.read = true);
        }
        this._setStoredMessages(messages);
        this._saveToStore();
        this.Dispatch('MessagesMarkedAsRead', {});
    }

    /**
     * Removes a message from storage.
     * @param {object} message - The message to be removed.
     */
    RemoveMessage(message) {
        let messages = this._getStoredMessages();
        messages = messages.filter(m => m.id != message.id);
        this._setStoredMessages(messages);
        this._saveToStore();
        this.Dispatch('MessageRemoved', {});
    }

    /**
     * Removes a message from or to member.
     * @param {string} user - The message to be removed.
     */
    ClearConversationWith(user) {
        let messages = this._getStoredMessages();
        messages = messages.filter(m => m.from != user && m?.recipient != user);
        this._setStoredMessages(messages);
        this._saveToStore();
        this.Dispatch('ChatCleared', {});
    }

    UpdateMessage(id, text) {
        let messages = this._getStoredMessages();
        messages.filter(m => m.id == id).forEach(message => message.message.text = text);
        this._setStoredMessages(messages);
        this._saveToStore();
    }

    /**
     * Sends a command to the Comet server.
     * @param {string} userGuid - The GUID of the user.
     * @param {string} action - The action to be performed.
     * @param {object} message - The message data.
     */
    Command(userGuid, action, message = null) {
        try {
            if(this._ws.readyState === 1) {
                const msg = {action: action, recipient: userGuid, message: message, domain: Colibri.Web.Comet.Options.origin, delivery: 'untrusted'};
                this._ws.send(JSON.stringify(msg));
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
     * @param {string} action - The action to be performed.
     * @param {string} message - The message content.
     * @returns {string|null} - The ID of the sent message.
     */
    SendTo(userGuid, action, message = null) {
        try {
            const id = Date.Mc();
            if(this._ws.readyState === 1) {
                const msg = {action: action, recipient: userGuid, message: {text: message, id: id}, domain: Colibri.Web.Comet.Options.origin, delivery: 'trusted'};
                this._addMessage(Object.assign({}, msg, {from: this._user}), true);
                this.DispatchHandlers('MessageSending', {message: msg}).then((responses) => {
                    this._ws.send(JSON.stringify(msg));
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
     * @param {string} message - The message content.
     * @returns {string|null} - The ID of the sent message. 
     */
    SendBroadcast(action, message = null) {
        try {
            const id = Date.Mc();
            if(this._ws.readyState === 1) {
                const msg = {action: action, recipient: '*', message: {text: message, id: id, broadcast: true}, domain: Colibri.Web.Comet.Options.origin, delivery: 'trusted'};
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
    
    /**
     * Sends a message to a specific user.
     * @param {string} userGuid - The GUID of the recipient user.
     * @param {string} action - The action to be performed.
     * @param {Array} message - The message content.
     * @returns {string|null} - The ID of the sent message.
     */
    SendFilesTo(userGuid, action, files = null) {
        try {
            const id = Date.Mc();
            if(this._ws.readyState === 1) {
                const msg = {action: action, recipient: userGuid, message: {files: files, id: id}, domain: Colibri.Web.Comet.Options.origin, delivery: 'trusted'};
                this._ws.send(JSON.stringify(msg));
                this._addMessage(Object.assign({}, msg, {from: this._user}), true);
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
     * @returns {string|null} - The ID of the sent message. 
     */
    SendFilesBroadcast(action, files = null) {
        try {
            const id = Date.Mc();
            if(this._ws.readyState === 1) {
                const msg = {action: action, recipient: '*', message: {files: files, id: id, broadcast: true}, domain: Colibri.Web.Comet.Options.origin, delivery: 'trusted'};
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

}