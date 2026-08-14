/**
 * Internal storage class for managing messages in the Comet system.
 * @class 
 * @extends Colibri.Common.AbstractMessageStore
 * @memberof Colibri.Web
 */
Colibri.Web.InternalStore = class extends Colibri.Common.AbstractMessageStore {

    /**
     * Add the message to the storage
     * @param {Object} message - The message to add.
     * @returns {Promise} A promise that resolves when the message is added.
     * @public
     * @async
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
     * @public
     * @async
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
     * @public
     * @async
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
     * @public
     * @async
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
     * @public
     * @async
     */
    Clear() {
        App.Browser.Set('comet.messages', JSON.stringify([]));
        return Promise.resolve([]);
    }

    /**
     * Deletes a message from the store.
     * @param {Object} options - Options for deleting the message.
     * @param {Object|Array} options.filter - The filter to apply to the messages.
     * @returns {Promise} A promise that resolves when the message is deleted.
     * @public
     * @async
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
