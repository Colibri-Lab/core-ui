Colibri.Events.Dispatcher = class {

    /** @constructor */
    constructor() {
        /** @type {Object.<string, Array<Object.<handler: Function, respondent: Object>>>} - список обработчиков */
        this.__handlers = {};
        /** @type {Object.<string, Colibri.Events.Event>} - список зарегистрированых событий */
        this.__events = {};
    }

    /**
     * Регистрация события
     * @param {string} eventName событие
     * @param {boolean} bubbles поднимается вверх по дереву
     */
    RegisterEvent(eventName, bubbles, description) {
        this.__events[eventName] = { name: eventName, bubbles: bubbles, description: description };
    }

    /**
     * Добавляет обработчик события
     * @param {string|array} eventName Событие
     * @param {Function} handler Метод
     * @param {boolean} prepend Вставить в начало
     * @returns {Colibri.Events.Dispatcher}
     */
    AddHandler(eventName, handler, prepend = false, respondent = this) {

        if (eventName instanceof Array) {
            eventName.forEach((en) => {
                this.AddHandler(en, handler, prepend, respondent);
            });
        } else {

            if (!this.__handlers[eventName]) {
                this.__handlers[eventName] = [];
            }

            for (let i = 0; i < this.__handlers[eventName].length; i++) {
                const h = this.__handlers[eventName][i];
                if (h === handler) {
                    this.__handlers[eventName].splice(i, 1);
                }
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
     * Удалить обработчик события
     * @param {string} eventName Событие
     * @param {Function} handler Обработчик
     * @returns {Colibri.Events.Dispatcher}
     */
    RemoveHandler(eventName, handler) {
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
     *
     * @param {string} eventName Событие
     * @param {Function} handler Обработчик
     * @returns {boolean}
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
     * Поднять событие
     * @param {(Colibri.Events.Event|string)} event событие
     * @param {object} args аргументы
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

    Dispose() {
        this.__events = {};
        this.__handlers = {};
    }


}