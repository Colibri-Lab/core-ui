/**
 * Audio component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.IFrame = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('iframe'));
        this.AddClass('app-component-iframe');
    }

    /**
     * Video source
     * @type {String}
     */
    get src() {
        return this._element.attr('src');
    }
    /**
     * Video source
     * @type {String}
     */
    set src(value) {
        this._element.attr('src', value);
    }


}