/**
 * Handles the connection to the Comet server and message communication.
 * @class 
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Common
 */
Colibri.Common.AbstractMessageStore = class extends Colibri.Events.Dispatcher {

    /**
     * Add the message to the storage
     * @param {Object} message - The message to add.
     * @returns {Promise} A promise that resolves when the message is added.
     */
    Add(message) {
        throw new Error('Not implemented');
    }

    /**
     * Updates a message in the store.
     * @param {Object} message - The message to update.
     * @param {number} id - The ID of the message to update.
     * @returns {Promise} A promise that resolves when the message is updated.
     */
    Update(message, id) {
        throw new Error('Not implemented');
    }

    /**
     * Store messages in the store.
     * @param {Array} messages - The messages to store.
     * @returns {Promise} A promise that resolves when the messages are stored.
     */
    Store(messages) {
        throw new Error('Not implemented');
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
        throw new Error('Not implemented');
    }

    /**
     * Deletes messages from the store.
     * @returns {Promise} A promise that resolves when the messages are deleted.
     */
    Clear() {
        throw new Error('Not implemented');
    }

    /**
     * Deletes a message from the store.
     * @param {Object} options - Options for deleting the message.
     * @param {number} options.filter - The filter to apply to the messages.
     * @returns {Promise} A promise that resolves when the message is deleted.
     */
    Delete(options = {}) {
        throw new Error('Not implemented');
    }

}