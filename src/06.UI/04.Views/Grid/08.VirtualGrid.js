/**
 * Grid component
 * @class
 * @namespace
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.VirtualGrid = class extends Colibri.UI.Grid {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {string|Element} element element to create in
     */
    constructor(name, container, element) {
        super(name, container);
        this.AddClass('app-ui-virtualgrid-container');

        this._gridScrollContainer = new Colibri.UI.Component('app-ui-grid-scroll', this, Element.create('div'));
        this._gridScrollContainer.shown = true;

        // this.animateScroll = true;
        this.handleResize = true;
        this.AddHandler('Scrolled', this.__thisRecalcCounts);
        this.AddHandler('Resize', this.__thisRecalcCounts);

    }

    Refresh() {
        this._showValue();
    }

    __thisRecalcCounts(event, args) {
        this._showValue();
    }

    /**
     * Empty row object
     * @type {Object}
     */
    get emptyRow() {
        return this._emptyRow;
    }
    /**
     * Empty row object
     * @type {Object}
     */
    set emptyRow(value) {
        this._emptyRow = value;
    }

    /**
     * Row fixed height
     * @type {Number}
     */
    get rowHeight() {
        return this._rowHeight;
    }
    /**
     * Row fixed height
     * @type {Number}
     */
    set rowHeight(value) {
        value = this._convertProperty('Number', value);
        this._rowHeight = value;
    }

    /**
     * Value Array
     * @type {Array}
     */
    get value() {
        return this._value;
    }
    /**
     * Value Array
     * @type {Array}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        const gridHeight = this._value.length * this._rowHeight;
        const visibleHeight = this._element.bounds().outerHeight;
        const scrolledTop = this.scrollTop;
        this._gridScrollContainer.height = gridHeight;

        if(visibleHeight > gridHeight) {
            super.value = this._value;
        } else {

            
            const startIndex = Math.max(0, Math.floor(scrolledTop / this._rowHeight));
            const visibleCount = Math.ceil(visibleHeight / this._rowHeight) - 1 /* header */;
            const lastPageSize = this._value.length % visibleCount;
            console.log(lastPageSize);
            this._gridScrollContainer.height = gridHeight - (visibleCount - lastPageSize) * this._rowHeight;

            const endIndex = Math.min(this._value.length, startIndex + visibleCount);
            const visibleRows = this._value.slice(startIndex, endIndex);
            this._gridScrollContainer.width = this._gridContent.width;
            
            for(let i=0; i<visibleCount;i++) {
                if(visibleRows[i]) {
                    if(this.rows.Children('data' + i)) {
                        this.rows.Children('data' + i).value = visibleRows[i];
                        this.rows.Children('data' + i).styles = {visibility: 'visible'};
                    } else {
                        this.rows.Add('data' + i, visibleRows[i]);
                    }
                    this.rows.Children('data' + i).height = this._rowHeight;
                } else {
                    if(this.rows.Children('data' + i)) {
                        this.rows.Children('data' + i).styles = {visibility: 'hidden'};
                    }
                }
            }



        }




    }

    _generateRows(visibleCount) {
        for(let i=0; i<visibleCount;i++) {
            this.rows.Add('data' + i, this._emptyRow ?? {});
        }
    }


}