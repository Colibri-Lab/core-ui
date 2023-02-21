Colibri.Web.Comet = class extends Colibri.Events.Dispatcher {

    _url = '';
    _storage = window.localStorage;
    _store = null;
    _storeMessages = '';
    _storeUnread = '';

    _settings = null;
    _ws = null;
    _connected = false;
    _user = null;
    _clientId = null;

    /**
     * Создает обьект
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

    destructor() {
        super.destructor();
        if(this._ws) {
            this._ws.close();
        }
    }

    _generateDeviceId() {
        let deviceId = App.Browser.Get('device-id');
        if(!deviceId) {
            deviceId = String.MD5(Date.Mc() + '');
            App.Browser.Set('device-id', deviceId);
        }
        return deviceId;
    }

    _initConnection() {
        this._ws && this._ws.close();
        console.log('wss://' + this._settings.host + ':' + this._settings.port + '/client/' + this._clientId);
        this._ws = new WebSocket('wss://' + this._settings.host + ':' + this._settings.port + '/client/' + this._clientId);
        this._ws.onopen = () => this.__onCometOpened();
        this._ws.onmessage = (message) => this.__onCometMessage(message);
        this._ws.onerror = error => this.__onCometError(error);
    }
    
    /**
     * 
     * @param {number} organizationId ID организации
     * @param {Colibri.Storages.Store} store хрналище
     * @param {string} storeMessages куда выбрасывать сообщения
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

    Disconnect() {
        if(this._ws) {
            this._ws.close();
            this._ws = null;
        }
    }

    __onCometOpened() {
        this._connected = true;
        this.Command(this._user, 'register', {name: this._userName});
    }

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

    __onCometError(error) {
        
        console.log('#{ui-comet-connection-error}');
        // App.Notices.Add(new Colibri.UI.Notice('#{ui-comet-connection-error}'));
        // Colibri.Common.StopTimer('comet-timer');

    } 


    /**
     * Берет из локального хранилища
     * @returns []
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
     * Сохраняет в локальное хранилище
     * @param {[]} messages сообщения
     */
    _setStoredMessages(messages) {
        this._storage.setItem('comet.messages', JSON.stringify(messages));
    }

    /**
     * Сохраняет сообщения в хранилище приложения
     */
    _saveToStore() {
        let messages = this._getStoredMessages();
        let unreadCount = 0;
        messages.forEach(message => unreadCount += (message.read !== true ? 1 : 0));
        this._store.Set(this._storeMessages, {messages: messages, unread: unreadCount});
    }

    /**
     * Очистить сообщения
     */
    ClearMessages() {
        this._setStoredMessages([]);
        this._saveToStore();
    }

    /**
     * Пометить все сообщения как прочитанные
     */
    MarkAsRead() {
        let messages = this._getStoredMessages();
        messages.forEach(message => message.read = true);
        this._setStoredMessages(messages);
        this._saveToStore();
        this.Dispatch('MessagesMarkedAsRead', {});
    }

    RemoveMessage(message) {
        let messages = this._getStoredMessages();
        messages = messages.filter(m => m.id != message.id);
        this._setStoredMessages(messages);
        this._saveToStore();
        this.Dispatch('MessageRemoved', {});
    }

    Command(userGuid, action, message = null) {
        try {
            if(this._ws.readyState === 1) {
                this._ws.send(JSON.stringify({action: action, user: userGuid, message: message, domain: document.domain}));
            }
            else {
                console.log('server goes away');
            }
        }
        catch(e) {
            console.log(e);
        }
    }

    SendTo(userGuid, action, message = null) {
        try {
            const id = Date.Mc();
            if(this._ws.readyState === 1) {
                this._ws.send(JSON.stringify({action: action, recipient: userGuid, message: {text: message, id: id}, domain: document.domain}));
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