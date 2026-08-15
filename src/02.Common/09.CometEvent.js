/**
 * Message class for Comet
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.CometEvent = class {

    /**
     * Message action
     * @type {String}
     * @public
     */
    action = '';
    
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
     * Recipient of the message
     * If exists means that the message is sent to a specific user
     * @type {String}
     * @public
     */
    recipient = null;

    /**
     * Message text
     * @type {Object}
     * @public
     */
    message = {};

    /** 
     * Delivery type
     * @type {String}
     * @public
     */
    delivery = 'untrusted';

    /**
     * Is message broadcast
     * @type {Boolean}
     * @public
     */
    broadcast = false;

    /** 
     * Activate message
     * @type {Boolean}
     * @public
     */
    activate = false;

    /**
     * Wake up recipients
     * @type {Boolean}
     * @public
     */
    wakeup = false;

    /**
     * Constructs a new CometEvent instance.
     * @constructor 
     * @public
     */
    constructor() {
        // do nothing
    }

    /**
     * Creates a clone of the current CometEvent instance.
     * @returns {Colibri.Common.CometEvent} A new instance of Colibri.Common.CometEvent with the same properties as the current instance.
     * @public
     * @example
     * ```
     * const originalEvent = new Colibri.Common.CometEvent();
     * const clonedEvent = originalEvent.clone();
     * console.log(clonedEvent); // Outputs: A clone of the original CometEvent instance
     * ```
     */
    clone() {
        const msg = new Colibri.Common.CometEvent();
        msg.action = this.action;
        msg.domain = this.domain;
        msg.date = this.date;
        msg.id = this.id;
        msg.from = this.from;
        msg.recipient = this.recipient;
        msg.message = this.message;
        msg.delivery = this.delivery;
        msg.broadcast = this.broadcast;
        msg.activate = this.activate;
        msg.wakeup = this.wakeup;
        return msg;
    }

    /**
     * Creates a new instance of Colibri.Common.CometEvent from a received event object.
     * @param {Object} eventReceived - The received event object.
     * @returns {Colibri.Common.CometEvent} A new instance of Colibri.Common.CometEvent created from the received event object.
     * @public
     * @example
     * ```
     * const receivedEvent = { action: 'send', domain: 'example.com', from: 'user1', message: 'Hello!', broadcast: false, delivery: 'untrusted', activate: false, wakeup: false };
     * const cometEvent = Colibri.Common.CometEvent.FromReceivedObject(receivedEvent);
     * console.log(cometEvent); // Outputs: A new instance of Colibri.Common.CometEvent created from the received event object
     * ```
     */
    static FromReceivedObject(eventReceived) {
        const msg = new Colibri.Common.CometEvent();
        msg.action = eventReceived.action;
        msg.domain = eventReceived.domain;
        msg.from = eventReceived.from;
        msg.message = eventReceived.message;
        msg.broadcast = eventReceived.broadcast ?? false;
        msg.delivery = eventReceived.delivery ?? 'untrusted';
        msg.activate = eventReceived.activate ?? false;
        msg.wakeup = eventReceived.wakeup ?? false;
        return msg;
    }

    /**
     * Creates a new instance of Colibri.Common.CometEvent for sending a message.
     * @param {string} action - The action of the message.
     * @param {string} domain - The domain of the message.
     * @param {string} from - The sender of the message.
     * @param {string} recipient - The recipient of the message.
     * @param {Object} message - The content of the message.
     * @param {string} [delivery='untrusted'] - The delivery type of the message.
     * @param {boolean} [activate=false] - Whether to activate the message.
     * @param {boolean} [wakeup=false] - Whether to wake up the recipients.
     * @returns {Colibri.Common.CometEvent} A new instance of Colibri.Common.CometEvent for sending a message.
     * @public
     * @example
     * ```
     * const messageToSend = Colibri.Common.CometEvent.CreateForSend('send', 'example.com', 'user1', 'user2', { text: 'Hello!' }, 'untrusted', false, false);
     * console.log(messageToSend); // Outputs: A new instance of Colibri.Common.CometEvent for sending a message
     * ```
     */
    static CreateForSend(action, domain, from, recipient, message, delivery = 'untrusted', activate = false, wakeup = false) {
        const msg = new Colibri.Common.CometMessage();
        msg.action = action;
        msg.domain = domain;
        msg.from = from;
        msg.recipient = recipient;
        msg.message = message;
        msg.delivery = delivery;
        msg.activate = activate;
        msg.wakeup = wakeup;
        return msg;
    }

    /**
     * Creates a new instance of Colibri.Common.CometEvent for sending a broadcast message.
     * @param {string} action - The action of the message.
     * @param {string} domain - The domain of the message.
     * @param {string} from - The sender of the message.
     * @param {Object} message - The content of the message.
     * @param {string} [delivery='untrusted'] - The delivery type of the message.
     * @param {boolean} [activate=false] - Whether to activate the message.
     * @param {boolean} [wakeup=false] - Whether to wake up the recipients.
     * @returns {Colibri.Common.CometEvent} A new instance of Colibri.Common.CometEvent for sending a broadcast message.
     * @public
     * @example
     * ```
     * const broadcastMessage = Colibri.Common.CometEvent.CreateForSendBroadcast('broadcast', 'example.com', 'user1', { text: 'Hello, everyone!' }, 'untrusted', false, false);
     * console.log(broadcastMessage); // Outputs: A new instance of Colibri.Common.CometEvent for sending a broadcast message
     * ```
     */
    static CreateForSendBroadcast(action, domain, from, message, delivery = 'untrusted', activate = false, wakeup = false) {
        const msg = new Colibri.Common.CometMessage();
        msg.action = action;
        msg.domain = domain;
        msg.from = from;
        msg.recipient = '*';
        msg.broadcast = true;
        msg.message = message;
        msg.delivery = delivery;
        msg.activate = activate;
        msg.wakeup = wakeup;
        return msg;
    }

    /**
     * Checks if the message is intended for sending (i.e., has a recipient).
     * @type {boolean} True if the message has a recipient, otherwise false.
     * @public
     */
    get isForSent() {
        return !!this.recipient;
    }

    /**
     * Checks if the message is a broadcast message (i.e., has a recipient of '*').
     * @type {boolean} True if the message is a broadcast message, otherwise false.
     * @public
     */
    get isBroadcast() {
        return this.recipient === '*' || this.message.broadcast;
    }

    /**
     * Converts the message instance to a JSON string representation.
     * @returns {string} A JSON string representation of the message instance.
     * @throws {TypeError} If the message instance cannot be converted to JSON.
     * @example
     * ```
     * const message = new Colibri.Common.CometMessage();
     * const jsonString = message.toJson();
     * ``` 
     */
    toJson() {
        if(this.isForSent) {
            return JSON.stringify({
                domain: this.domain, 
                action: this.action, 
                id: this.id, 
                recipient: this.recipient, 
                message: this.message, 
                delivery: this.delivery,
                activate: this.activate,
                wakeup: this.wakeup,
            });
        } else {
            return JSON.stringify({
                domain: this.domain, 
                action: this.action, 
                id: this.id, 
                from: this.from, 
                message: this.message, 
                delivery: this.delivery,
                activate: this.activate,
                wakeup: this.wakeup,
            });
        }
    }

}