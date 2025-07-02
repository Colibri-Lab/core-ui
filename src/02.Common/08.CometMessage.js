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

    activate = false;

    wakeup = false;

    constructor() {
        // do nothing
    }

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

    static FromReceivedObject(domain, from, message, delivery = 'untrusted', broadcast = false, activate = true, wakeup = true) {
        const msg = new Colibri.Common.CometMessage();
        msg.domain = domain === 'unknown' ? Colibri.Web.Comet.Options.origin : domain;
        msg.from = from === 'unknown' ? 'system' : from;    
        msg.message = Object.assign(message, {id: msg.id});
        msg.broadcast = broadcast;
        msg.delivery = delivery;
        msg.recipient = App.Comet.User;
        msg.activate = activate;
        msg.wakeup = wakeup;
        return msg;
    }

    static CreateForSend(domain, from, recipient, text, addditional = {}, activate = true, wakeup = true) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = recipient;
        message.message = Object.assign({text, id: message.id}, addditional);
        message.activate = activate;
        message.wakeup = wakeup;
        return message;
    }

    static CreateForFilesSend(domain, from, recipient, files, addditional = {}, activate = true, wakeup = true) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = recipient;
        message.message = {files, id: message.id};
        message.activate = activate;
        message.wakeup = wakeup;
        return message;
    }

    static CreateForSendBroadcast(domain, from, text, addditional = {}, activate = true, wakeup = true) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = '*';
        message.broadcast = true;
        message.message = Object.assign({text, id: message.id}, addditional);
        message.activate = activate;
        message.wakeup = wakeup;
        return message;
    }

    static CreateForFilesSendBroadcast(domain, from, files, addditional = {}, activate = true, wakeup = true) {
        const message = new Colibri.Common.CometMessage();
        message.domain = domain;
        message.from = from;
        message.recipient = '*';
        message.broadcast = true;
        message.message = Object.assign({files, id: message.id}, addditional);
        message.activate = activate;
        message.wakeup = wakeup;
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
            let useEncoding = true;
            if(message.text) {
                useEncoding = false;
            }
            return JSON.stringify({
                domain: this.domain, 
                action: this.action, 
                id: this.id, 
                recipient: this.recipient, 
                message: this.message, 
                delivery: this.delivery,
                broadcast: this.broadcast,
                activate: this.activate,
                wakeup: this.wakeup,
            }, null, null, useEncoding);
        } else {
            return JSON.stringify({
                domain: this.domain, 
                action: this.action, 
                id: this.id, 
                from: this.from, 
                message: this.message, 
                delivery: this.delivery,
                broadcast: this.broadcast,
                activate: this.activate,
                wakeup: this.wakeup,
            });
        }
    }

}