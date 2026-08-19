/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.TableHeaderCell = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('th'));
        this.AddClass('colibri-ui-tableheadercell');
        this.shown = true;
    }

    /**
     * Row spanning
     * @type {Number}
     */
    get rowspan() {
        return parseInt(this._element.attr('rowspan'));
    }
    /**
     * Row spanning
     * @type {Number}
     */
    set rowspan(value) {
        this._element.attr('rowspan', value);
    }
    
    /**
     * Column spanning
     * @type {Number}
     */
    get colspan() {
        return parseInt(this._element.attr('colspan'));
    }
    /**
     * Column spanning
     * @type {Number}
     */
    set colspan(value) {
        this._element.attr('colspan', value);
    }

    /**
     * Text align
     * @type {start,end,left,right,center,justify,justify-all,match-parent,inherit,initial,revert,revert-layer,unset}
     */
    get align() {
        return super.halign;
    }
    /**
     * Text align
     * @type {start,end,left,right,center,justify,justify-all,match-parent,inherit,initial,revert,revert-layer,unset}
     */
    set align(value) {
        super.halign = value;
    }

    /**
     * Vertical align
     * @type {baseline,sub,super,text-top,text-bottom,middle,top,bottom,inherit,initial,revert,revert-layer,unset}
     */
    get valign() {
        return this._element.css('vertical-align');
    }
    /**
     * Vertical align
     * @type {baseline,sub,super,text-top,text-bottom,middle,top,bottom,inherit,initial,revert,revert-layer,unset}
     */
    set valign(value) {
        this._element.css('vertical-align', value);
    }

}
