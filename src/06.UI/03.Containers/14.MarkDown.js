/**
 * Mark down view
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.MarkDown = class extends Colibri.UI.Pane {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-markdown');


    }

    /**
     * Value String
     * @type {String}
     */
    get value() {
        return this._value;
    }
    /**
     * Value String
     * @type {String}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    /**
     * @ignore
     */
    _showValue() {
        super.value = this._value.markdownToHtml();
    }

}