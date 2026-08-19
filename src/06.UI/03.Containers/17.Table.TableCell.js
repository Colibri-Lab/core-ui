/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.TableCell = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('td'));
        this.AddClass('colibri-ui-tablecell');
        this.shown = true;
    }

    /**
     * Col span
     * @type {Number}
     */
    get colspan() {
        return parseInt(this._element.attr('colspan'));
    }
    /**
     * Col span
     * @type {Number}
     */
    set colspan(value) {
        this._element.attr('colspan', value);
    }

    /**
     * Row span
     * @type {Number}
     */
    get rowspan() {
        return parseInt(this._element.attr('rowspan'));
    }
    /**
     * Col span
     * @type {Number}
     */
    set rowspan(value) {
        this._element.attr('rowspan', value);
    }

    /**
     * Text align
     * @type {left,center,right,justify}
     */
    get align() {
        return this._element.css('text-align');
    }
    /**
     * Text align
     * @type {left,center,right,justify}
     */
    set align(value) {
        this._element.css('text-align', value);
    }

    /**
     * Vertical align
     * @type {top,middle,bottom}
     */
    get verticalAlign() {
        return this._element.css('vertical-align');
    }
    /**
     * Vertical align
     * @type {top,middle,bottom}
     */
    set verticalAlign(value) {
        this._element.css('vertical-align', value);
    }

    /**
     * Tooltip string
     * @type {String}
     */
    get title() {
        return this.toolTip;
    }
    /**
     * Tooltip string
     * @type {String}
     */
    set title(value) {
        this.toolTip = value;
    }

}

