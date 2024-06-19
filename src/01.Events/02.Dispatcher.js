/**
 * Represents a dispatcher for events.
 * @class
 * @extends Destructable
 * @memberof Colibri.Events
 */
Colibri.Events.Dispatcher = class extends Destructable {

    /** 
     * @type {Object.<string, Colibri.Events.Event>} - список зарегистрированых событий 
     **/
    __events = {};
    /** 
     * @type {Object.<string, Array<Object.<handler: Function, respondent: Object>>>} - список обработчиков 
     **/
    __handlers = {};

    /**
     * Creates a new instance of Colibri.Events.Dispatcher.
     */
    constructor() {
        super();
    }

    destructor() {
        super.destructor();
        this.Dispose();
    }

    /**
     * Registers an event.
     * @param {string} eventName - The name of the event.
     * @param {boolean} bubbles - Indicates whether the event bubbles up the component tree.
     * @param {string} description - Description of the event.
     */
    RegisterEvent(eventName, bubbles, description) {
        this.__events[eventName] = { name: eventName, bubbles: bubbles, description: description };
    }

    /**
     * Adds an event handler.
     * @param {string|array} eventName - The event or array of events to add the handler to.
     * @param {Function} handler - The handler method.
     * @param {boolean} [prepend=false] - Whether to insert the handler at the beginning.
     * @param {Object} [respondent=this] - The object that responds to the event.
     * @returns {Colibri.Events.Dispatcher}
     */
    AddHandler(eventName, handler, prepend = false, respondent = this) {

        if (eventName instanceof Array) {
            eventName.forEach((en) => {
                this.AddHandler(en, handler, prepend, respondent);
            });
        } else {
            
            this.RemoveHandler(eventName, handler);

            if (!this.__handlers[eventName]) {
                this.__handlers[eventName] = [];
            }

            const handlerObject = { handler: handler, respondent: respondent };
            if (prepend) {
                this.__handlers[eventName].splice(0, 0, handlerObject);
            } else {
                this.__handlers[eventName].push(handlerObject);
            }
        }

        return this;

    }

    /**
     * Removes an event handler.
     * @param {string} eventName - The event to remove the handler from.
     * @param {Function} handler - The handler to remove.
     * @returns {Colibri.Events.Dispatcher}
     */
    RemoveHandler(eventName, handler) {
        
        if (!this.__handlers[eventName]) {
            this.__handlers[eventName] = [];
        }

        const handlerObject = { handler: handler, respondent: this };
        for (let i = 0; i < this.__handlers[eventName].length; i++) {
            const h = this.__handlers[eventName][i];
            if (h.handler == handlerObject.handler && h.respondent == handlerObject.respondent) {
                this.__handlers[eventName].splice(i, 1);
                break;
            }
        }
        return this;
    }

    /**
     * Checks if an event handler exists.
     * @param {string} eventName - The event to check for the handler.
     * @param {Function} handler - The handler to check for.
     * @returns {boolean} - True if the handler exists, false otherwise.
     */
    HandlerExists(eventName, handler) {
        const handlerObject = { handler: handler, respondent: this },
              handlerStr = handlerObject.handler.toString();
        for (let i = 0; i < this.__handlers[eventName].length; i++) {
            const h = this.__handlers[eventName][i];
            if (h.handler.toString() === handlerStr && h.respondent === handlerObject.respondent) {
                return true;
            }
        }
        return false;
    }

    /**
     * Dispatches an event.
     * @param {(Colibri.Events.Event|string)} event - The event object or its name.
     * @param {object} args - Arguments for the event.
     * @returns {Colibri.Events.Dispatcher}
     */
    Dispatch(event, args = null) {

        if (!(event instanceof Colibri.Events.Event)) {
            // ищем сoбытие в стандартных
            if(this.__events[event]) {
                event = this.__events[event];
            } else if(!event.bubbles) {
                return true;
            }
        }

        if(!event.sender) {
            event.sender = this;
        }

        if(App && event.name !== 'Event') {
            App.Dispatch('Event', {event: event, args: args});
        }

        const eventHandlers = this.__handlers[event.name];
        if (eventHandlers) {

            for (var j = 0; j < eventHandlers.length; j++) {
                const handlerObject = eventHandlers[j];
                if (handlerObject && handlerObject.handler.apply(handlerObject.respondent, [event, args]) === false) {
                    return false;
                }
            }
        }

        if(event.bubbles && this.parent && this.parent.Dispatch(event, args) === false) {
            return false;
        }

        return true;
    }

    /**
     * Clears all event handlers.
     */
    ClearHandlers() {
        this.__handlers = {};
    }

    /**
     * Disposes of the dispatcher.
     */
    Dispose() {
        delete this.__events;
        delete this.__handlers;
        this.__events = {};
        this.__handlers = {};
    }


}