
Colibri.Events.Event = class extends Destructable {

    /**
     * Событие
     * @constructor
     * @param {*} sender отправитель
     * @param {string} name событие
     * @param {boolean} [bubbles] поднимается ли вверх по дереву компонентов или нет
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

    destructor() {

    }

    /**
     * Отправитель
     * @type {Object}
     */
    get sender() {
        return this._sender;
    }
    set sender(value) {
        this._sender = value;
    }

    /**
     * Название события
     * @type {string}
     */
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }

    /**
     * Прыгает вверх по дереву обьектов
     * @type {boolean}
     */
    get bubbles() {
        return this._bubbles;
    }
    set bubbles(value) {
        this._bubbles = value;
    }


}