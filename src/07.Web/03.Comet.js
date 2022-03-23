Colibri.Web.Comet = class extends Colibri.Events.Dispatcher {

    _url = '';
    _storage = window.localStorage;
    _store = null;
    _storeMessages = '';
    _storeUnread = '';

    /**
     * Создает обьект
     */
    constructor() {
        super();

        this.RegisterEvent('MessageReceived', false, 'Когда получили новое сообщение');

        Colibri.Common.LoadScript((window.rpchandler ? window.rpchandler : '') + '/comet.json');
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
     * 
     * @param {number} organizationId ID организации
     * @param {Colibri.Storages.store} store хрналище
     * @param {string} storeMessages куда выбрасывать сообщения
     */
    Init(organizationId, store, storeMessages) {
        this._store = store;
        this._storeMessages = storeMessages;

        CometServer().start({dev_id: 0, user_id: organizationId, user_key: String.MD5(organizationId + ''), node: window.COMET_SERVER});
        CometServer().onAuthSuccess(() => {
            CometServer().subscription('msg', (message) => {
                message.date = new Date();
                message.read = false;
                var messages = this._getStoredMessages();
                messages.push(message);
                this._setStoredMessages(messages);
                this._saveToStore();
                this.Dispatch('MessageReceived', {message: message});
            });
            CometServer().get_pipe_log('msg');
            this._saveToStore();
        });
        CometServer().onAuthFalill(() => {
            this.ClearMessages();
        });
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
    }

    RemoveMessage(message) {
        let messages = this._getStoredMessages();
        messages = messages.filter(m => m.data.message_id != message.data.message_id);
        this._setStoredMessages(messages);
        this._saveToStore();
    }


}