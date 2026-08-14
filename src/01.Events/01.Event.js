/**
 * Represents an event.
 * @class
 * @extends Destructable
 * @memberof Colibri.Events
 */
Colibri.Events.Event = class extends Destructable {

    /**
     * Creates a new instance of Colibri.Events.Event.
     * @param {*} sender - The sender of the event.
     * @param {string} name - The name of the event.
     * @param {boolean} [bubbles=false] - Indicates whether the event bubbles up the component tree or not.
     * @constructor
     * @public
     */
    constructor(sender, name, bubbles) {
        super();

        /** @type {*} - отправитель */
        this._sender = sender;

        /** @type {string} name - событие */
        this._name = name;

        /** @type {boolean} */
        this._bubbles = bubbles || false;

    }

    /**
     * Destructs the event instance and releases any resources associated with it.
     * @destructor
     * @public
     */
    destructor() {

    }

    /**
     * Gets the sender of the event.
     * @type {*}
     * @public
     */
    get sender() {
        return this._sender;
    }
    /**
     * Sets the sender of the event.
     * @type {*}
     * @public
     */
    set sender(value) {
        this._sender = value;
    }

    /**
     * Gets the name of the event.
     * @type {string}
     * @public
     */
    get name() {
        return this._name;
    }
    /**
     * Sets the name of the event.
     * @type {string}
     * @public
     */
    set name(value) {
        this._name = value;
    }

    /**
     * Indicates whether the event bubbles.
     * @type {boolean}
     * @public
     */
    get bubbles() {
        return this._bubbles;
    }
    /**
     * Sets whether the event bubbles.
     * @type {boolean}
     * @public
     */
    set bubbles(value) {
        this._bubbles = value;
    }


}