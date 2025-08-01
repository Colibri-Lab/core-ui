/**
 * Message class for Comet
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.CometEvent = class {

    /**
     * Message action
     * @type {String}
     */
    action = '';
    
    /**
     * Message domain
     * @type {String}
     */
    domain = 'localhost';

    /**
     * Message date
     * @type {String}
     */
    date = Date.Now();

    /**
     * Message ID
     * @type {Number}
     */
    id = Date.Mc();

    /**
     * From user ID
     * @type {String}
     */
    from = '';

    /**
     * Recipient of the message
     * If exists means that the message is sent to a specific user
     * @type {String}
     */
    recipient = null;

    /**
     * Message text
     * @type {Object}
     */
    message = {};

    /** 
     * Delivery type
     * @type {String}
     */
    delivery = 'untrusted';

    /**
     * Is message broadcast
     * @type {Boolean}
     */
    broadcast = false;

    activate = false;

    wakeup = false;

    constructor() {
        // do nothing
    }

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

    get isForSent() {
        return !!this.recipient;
    }

    get isBradcast() {
        return this.recipient === '*' || this.message.boradcast;
    }

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