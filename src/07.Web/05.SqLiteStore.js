/**
 * SQLite storage class for managing messages in the Comet system.
 * @class 
 * @extends Colibri.Common.AbstractMessageStore
 * @memberof Colibri.Web
 */
Colibri.Web.SqLiteStore = class extends Colibri.Common.AbstractMessageStore {

    /**
     * Initializes the SQLite storage for messages.
     * @constructor
     */
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
