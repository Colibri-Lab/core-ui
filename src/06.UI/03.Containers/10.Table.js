Colibri.UI.Table = class extends Colibri.UI.Component {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('table'));
        this.AddClass('colibri-ui-table');
    }

    AddRow(name) {
        return new Colibri.UI.TableRow(name, this);
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

Colibri.UI.TableRow = class extends Colibri.UI.Component {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('tr'));
        this.AddClass('colibri-ui-tablerow');
        this.shown = true;
    }

    AddCell(name, className = null) {
        const ret = new Colibri.UI.TableCell(name, this);
        if(className) {
            ret.AddClass(className);
        }
        return ret;
    }

    AddHeaderCell(name) {
        return new Colibri.UI.TableHeaderCell(name, this);
    }

}

Colibri.UI.TableHeaderCell = class extends Colibri.UI.Component {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('th'));
        this.AddClass('colibri-ui-tableheadercell');
        this.shown = true;
    }

}

Colibri.UI.TableCell = class extends Colibri.UI.Component {
    
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
        return this._element.attr('colspan');
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
        return this._element.attr('rowspan');
    }
    /**
     * Col span
     * @type {Number}
     */
    set rowspan(value) {
        this._element.attr('rowspan', value);
    }

}

