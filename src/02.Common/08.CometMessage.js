/**
 * Message class for Comet
 * @class 
 * @memberof Colibri.Common
 */
Colibri.Common.CometMessage = class {

    /**
     * Message action
     * @type {String}
     */
    action = 'message';
    
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
     * Is message read
     * @type {Boolean}
     */
    read = false;

    /**
     * Recipient of the message
     * If exists means that the message is sent to a specific user
     * @type {String}
     */
    recipient = null;

    /**
     * Message text
     * @type {Object<text>}
     */
    message = {};

    /**
     * Is message broadcast
     * @type {Boolean}
     */
    broadcast = false;

    /** 
     * Delivery type
     * @type {string} 
     */
    delivery = 'trusted';

    constructor() {
        // do nothing
    }

    static FromReceivedObject(domain, from, message, delivery = 'untrusted', broadcast = false) {
        const msg = new Colibri.Common.CometMessage();
        msg.domain = domain;
        msg.from = from;    
        msg.message = Object.assign(message, {id: message.id});
        msg.broadcast = broadcast;
        msg.delivery = delivery;
        return msg;
    }

    static CreateForSend(domain, from, recipient, text, addditional = {}) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = recipient;
        message.message = Object.assign({text, id: message.id}, addditional);
        return message;
    }

    static CreateForFilesSend(domain, from, recipient, files) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = recipient;
        message.message = {files, id: message.id};
        return message;
    }

    static CreateForSendBroadcast(domain, from, text, addditional = {}) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = '*';
        message.broadcast = true;
        message.message = Object.assign({text, id: message.id}, addditional);
        return message;
    }

    static CreateForFilesSendBroadcast(domain, from, files) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = '*';
        message.broadcast = true;
        message.message = {files, id: message.id};
        return message;
    }

    MarkAsRead() {
        this.read = true;
    }

    MarkAsUnread() {
        this.read = false;
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
                broadcast: this.broadcast
            });
        } else {
            return JSON.stringify({
                domain: this.domain, 
                action: this.action, 
                id: this.id, 
                from: this.from, 
                message: this.message, 
                delivery: this.delivery,
                broadcast: this.broadcast
            });
        }
    }

}