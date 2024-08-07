/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Frame = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('iframe'));
        this.AddClass('colibri-ui-frame');

    }

    /**
     * Url of frame
     * @type {string}
     */
    get url() {
        return this._element.attr('src');
    }
    /**
     * Url of frame
     * @type {string}
     */
    set url(value) {
        this._element.attr('src', value);
    }

}