/**
 * Message class for Comet
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.CometMessage = class {

    /**
     * Message action
     * @type {String}
     * @public
     */
    action = 'message';
    
    /**
     * Message domain
     * @type {String}
     * @public
     */
    domain = 'localhost';

    /**
     * Message date
     * @type {String}
     * @public
     */
    date = Date.Now();

    /**
     * Message ID
     * @type {Number}
     * @public
     */
    id = Date.Mc();

    /**
     * From user ID
     * @type {String}
     * @public
     */
    from = '';

    /**
     * Is message read
     * @type {Boolean}
     * @public
     */
    read = false;

    /**
     * Recipient of the message
     * If exists means that the message is sent to a specific user
     * @type {String}
     * @public
     */
    recipient = null;

    /**
     * Message text
     * @type {Object<text>}
     * @public
     */
    message = {};

    /**
     * Is message broadcast
     * @type {Boolean}
     * @public
     */
    broadcast = false;

    /** 
     * Delivery type
     * @type {string} 
     * @public
     */
    delivery = 'trusted';

    /** 
     * Activate message
     * @type {boolean} 
     * @public
     */
    activate = false;

    /** 
     * Wakeup message
     * @type {boolean} 
     * @public
     */
    wakeup = false;

    /**
     * Creates an instance of Colibri.Common.CometMessage.
     * @constructor
     * @public
     */
    constructor() {
        // do nothing
    }

    /**
     * Creates a clone of the current message.
     * @returns {Colibri.Common.CometMessage} A new instance of Colibri.Common.CometMessage with the same properties.
     * @public
     */
    clone() {
        const msg = new Colibri.Common.CometMessage();
        msg.action = this.action;
        msg.domain = this.domain;
        msg.date = this.date;
        msg.id = this.id;
        msg.from = this.from;
        msg.read = this.read;
        msg.recipient = this.recipient;
        msg.message = Object.assign({}, this.message);
        msg.broadcast = this.broadcast;
        msg.delivery = this.delivery;
        msg.activate = this.activate;
        msg.wakeup = this.wakeup;
        return msg;
    }

    /**
     * Creates a new instance of Colibri.Common.CometMessage from a received message object.
     * @param {Object} messageReceived - The received message object.
     * @returns {Colibri.Common.CometMessage} A new instance of Colibri.Common.CometMessage with properties set based on the received message.
     * @static
     * @public
     */
    static FromReceivedObject(messageReceived) {
        const msg = new Colibri.Common.CometMessage();
        msg.id = messageReceived.message.id ?? msg.id;
        msg.domain = messageReceived.domain === 'unknown' ? Colibri.Web.Comet.Options.origin : messageReceived.domain;
        msg.from = messageReceived.from === 'unknown' ? 'system' : messageReceived.from;    
        msg.message = Object.assign(messageReceived.message, {id: msg.id, status: 'received'});
        msg.broadcast = messageReceived.broadcast ?? false;
        msg.delivery = messageReceived.delivery ?? 'untrusted';
        msg.recipient = messageReceived.recipient ?? App.Comet.User;
        msg.activate = messageReceived.activate ?? true;
        msg.wakeup = messageReceived.wakeup ?? true;
        return msg;
    }

    /**
     * Creates a new instance of Colibri.Common.CometMessage for sending a message.
     * @param {string} domain - The domain of the message.
     * @param {string} from - The sender of the message.
     * @param {string} recipient - The recipient of the message.
     * @param {string} text - The text content of the message.
     * @param {Object} [addditional={}] - Additional properties to include in the message.
     * @param {boolean} [activate=true] - Whether to activate the message.
     * @param {boolean} [wakeup=true] - Whether to wake up the recipient.
     * @returns {Colibri.Common.CometMessage} A new instance of Colibri.Common.CometMessage for sending.
     * @public
     * @static
     */
    static CreateForSend(domain, from, recipient, text, addditional = {}, activate = true, wakeup = true) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = recipient;
        message.message = Object.assign({text, id: message.id, status: 'sending'}, addditional);
        message.activate = activate;
        message.wakeup = wakeup;
        return message;
    }

    /**
     * Creates a new instance of Colibri.Common.CometMessage for sending files.
     * @param {string} domain - The domain of the message.
     * @param {string} from - The sender of the message.
     * @param {string} recipient - The recipient of the message.
     * @param {Array} files - An array of files to send.
     * @param {Object} [addditional={}] - Additional properties to include in the message.
     * @param {boolean} [activate=true] - Whether to activate the message.
     * @param {boolean} [wakeup=true] - Whether to wake up the recipient.
     * @returns {Colibri.Common.CometMessage} A new instance of Colibri.Common.CometMessage for sending files.
     * @public
     * @static
     */
    static CreateForFilesSend(domain, from, recipient, files, addditional = {}, activate = true, wakeup = true) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = recipient;
        message.message = Object.assign({files, id: message.id, status: 'sending'}, addditional);
        message.activate = activate;
        message.wakeup = wakeup;
        return message;
    }

    /**
     * Creates a new instance of Colibri.Common.CometMessage for sending a broadcast message.
     * @param {string} domain - The domain of the message.
     * @param {string} from - The sender of the message.
     * @param {string} text - The text content of the message.
     * @param {Object} [addditional={}] - Additional properties to include in the message.
     * @param {boolean} [activate=true] - Whether to activate the message.
     * @param {boolean} [wakeup=true] - Whether to wake up the recipients.
     * @returns {Colibri.Common.CometMessage} A new instance of Colibri.Common.CometMessage for sending a broadcast message.
     * @public
     * @static
     */
    static CreateForSendBroadcast(domain, from, text, addditional = {}, activate = true, wakeup = true) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = '*';
        message.broadcast = true;
        message.message = Object.assign({text, id: message.id, status: 'sending'}, addditional);
        message.activate = activate;
        message.wakeup = wakeup;
        return message;
    }

    /**
     * Creates a new instance of Colibri.Common.CometMessage for sending files as a broadcast message.
     * @param {string} domain - The domain of the message.
     * @param {string} from - The sender of the message.
     * @param {Array} files - An array of files to send.
     * @param {Object} [addditional={}] - Additional properties to include in the message.
     * @param {boolean} [activate=true] - Whether to activate the message.
     * @param {boolean} [wakeup=true] - Whether to wake up the recipients.
     * @returns {Colibri.Common.CometMessage} A new instance of Colibri.Common.CometMessage for sending files as a broadcast message.
     * @public
     * @static
     */
    static CreateForFilesSendBroadcast(domain, from, files, addditional = {}, activate = true, wakeup = true) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = '*';
        message.broadcast = true;
        message.message = Object.assign({files, id: message.id, status: 'sending'}, addditional);
        message.activate = activate;
        message.wakeup = wakeup;
        return message;
    }

    /**
     * Marks the message as read.
     * @public
     */
    MarkAsRead() {
        this.read = true;
    }

    /**
     * Marks the message as unread.
     * @public
     */
    MarkAsUnread() {
        this.read = false;
    }

    /**
     * Checks if the message is intended for sending (i.e., has a recipient).
     * @type {boolean} True if the message has a recipient, otherwise false.
     */
    get isForSent() {
        return !!this.recipient;
    }

    /**
     * Checks if the message is a broadcast message.
     * @type {boolean} True if the message is a broadcast message, otherwise false.
     */
    get isBroadcast() {
        return this.broadcast;
    }

    /**
     * Converts the message instance to a plain object representation.
     * @returns {Object} A plain object representation of the message instance.
     * @public
     * @example
     * ```
     * const message = new Colibri.Common.CometMessage();
     * const messageObject = message.toObject();
     * ```
     */
    toObject() {
        const ret = {
            domain: this.domain, 
            action: this.action, 
            date: this.date.toDbDate(),
            id: this.id, 
            recipient: this.recipient, 
            message: this.message, 
            delivery: this.delivery,
            broadcast: this.broadcast,
            activate: this.activate,
            wakeup: this.wakeup,
        };
        if(!this.isForSent) {
            ret.from = this.from;
        }
        return ret;
    }

    /**
     * Converts the message instance to a JSON string representation.
     * @returns {string} A JSON string representation of the message instance.
     * @throws {TypeError} If the message instance cannot be converted to JSON.
     * @public
     * @example
     * ```
     * const message = new Colibri.Common.CometMessage();
     * const jsonString = message.toJson();
     * ```
     */
    toJson() {
        return JSON.stringify(this.toObject());
    }

}