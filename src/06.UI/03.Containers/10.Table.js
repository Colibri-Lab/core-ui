/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Table = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('table'));
        this.AddClass('colibri-ui-table');
    }

    /**
     * Adds a row to table
     * @param {string} name name of cell
     * @returns {Colibri.UI.TableRow}
     */
    AddRow(name, className = null) {
        const row = new Colibri.UI.TableRow(name, this);
        if(className) {
            row.AddClass(className);
        }
        return row;
    }


    /**
     * Cell padding
     * @type {Number}
     */
    get cellpadding() {
        return this._element.attr('cellpadding');
    }
    /**
     * Cell padding
     * @type {Number}
     */
    set cellpadding(value) {
        this._element.attr('cellpadding', value);
    }

    /**
     * Cell spacing
     * @type {Number}
     */
    get cellspacing() {
        return this._element.attr('cellspacing');
    }
    /**
     * Cell spacing
     * @type {Number}
     */
    set cellspacing(value) {
        this._element.attr('cellspacing', value);
    }

}

/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.TableRow = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('tr'));
        this.AddClass('colibri-ui-tablerow');
        this.shown = true;
    }

    /**
     * Adds a cell to table row
     * @param {string} name name of cell
     * @param {string} className class name of cell
     * @param {string} value value of cell
     * @returns {Colibri.UI.TableCell}
     */
    AddCell(name, className = null, value = null) {
        const ret = new Colibri.UI.TableCell(name, this);
        if(className) {
            ret.AddClass(className);
        }
        if(value) {
            ret.value = value;
        }
        return ret;
    }

    /**
     * Adds a header cell to table row
     * @param {string} name name of cell
     * @param {string} className class name of cell
     * @param {string} value value of cell
     * @returns {Colibri.UI.TableHeaderCell}
     */
    AddHeaderCell(name, className = null, value = null) {
        const ret = new Colibri.UI.TableHeaderCell(name, this);
        if(className) {
            ret.AddClass(className);
        }
        if(value) {
            ret.value = value;
        }
        return ret;
    }

}

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

}

