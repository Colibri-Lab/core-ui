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
        origin: location.domain
    };

    /**
     * @constructor
     * @param {object} settings - Settings for the Comet connection.
     */
    constructor(settings) {
        super();
        
        this._clientId = this._generateDeviceId();
        this._settings = settings;
        this.RegisterEvent('MessageReceived', false, 'Когда получили новое сообщение');
        this.RegisterEvent('MessagesMarkedAsRead', false, 'Когда сообщения помечены как прочтенные');
        this.RegisterEvent('MessageRemoved', false, 'Когда сообщение удалено');
        this.RegisterEvent('EventReceived', false, 'Когда произошло событие');
        this.RegisterEvent('ConnectionError', false, 'Не смогли подключиться');
        this.RegisterEvent('Connected', false, 'Успешно подключились');
        
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
    Init(userData, store, storeMessages) {

        this._user = userData.guid;
        this._userName = userData.name;
        this._store = store;
        this._storeMessages = storeMessages;
        
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
     * Disconnects from the Comet server.
     */
    Disconnect() {
        if(this._ws) {
            this._ws.close();
            this._ws = null;
        }
    }

    /**
     * Handles the WebSocket connection open event.
     * @private
     */
    __onCometOpened() {
        this._connected = true;
        this.Command(this._user, 'register', {name: this._userName});
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
            console.log('User registered successfuly');
        }
        else if(message.action == 'register-error') {
            console.log('User registration error');
        }
        else if(message.action == 'message') {
            message.id = message.id ?? Number.Rnd4();
            message.date = new Date();
            message.read = false;
            var messages = this._getStoredMessages();
            messages.push(message);
            this._setStoredMessages(messages);
            this._saveToStore();
            this.Dispatch('MessageReceived', {message: message});
        }
        else {
            this.Dispatch('EventReceived', {event: message});
        }
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
    ClearMessages() {
        this._setStoredMessages([]);
        this._saveToStore();
    }

    /**
     * Marks all messages as read.
     */
    MarkAsRead() {
        let messages = this._getStoredMessages();
        messages.forEach(message => message.read = true);
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
     * Sends a command to the Comet server.
     * @param {string} userGuid - The GUID of the user.
     * @param {string} action - The action to be performed.
     * @param {object} message - The message data.
     */
    Command(userGuid, action, message = null) {
        try {
            if(this._ws.readyState === 1) {
                this._ws.send(JSON.stringify({action: action, user: userGuid, message: message, domain: Colibri.Web.Comet.Options.origin}));
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
                this._ws.send(JSON.stringify({action: action, recipient: userGuid, message: {text: message, id: id}, domain: Colibri.Web.Comet.Options.origin}));
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

}