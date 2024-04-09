/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.PaneGrid = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.PaneGrid']);
        this.AddClass('colibri-ui-panegrid');


    }

    /**
     * Grid template rows
     * @type {String|Number}
     */
    get rows() {
        return this._element.css('grid-template-rows');
    }
    /**
     * Grid template rows
     * @type {String|Number}
     */
    set rows(value) {
        this._element.css('grid-template-rows', value);
    }

    /**
     * Grid template columns
     * @type {String|Number}
     */
    get columns() {
        return this._element.css('grid-template-columns');
    }
    /**
     * Grid template columns
     * @type {String|Number}
     */
    set columns(value) {
        this._element.css('grid-template-columns', value);
    }

    /**
     * Gap of grid
     * @type {String}
     */
    get gap() {
        return this._element.css('gap');
    }
    /**
     * Gap of grid
     * @type {String}
     */
    set gap(value) {
        this._element.css('gap', value);
    }
    _showGap() {
        
    }

}