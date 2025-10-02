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

        this.animateScroll = true;
        this.AddHandler('Scrolled', this.__thisScrolled);

    }

    __thisScrolled(event, args) {
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
            const buffer = 3;
            const startIndex = Math.max(0, Math.floor(scrolledTop / this._rowHeight) - buffer);
            const offsetY = startIndex * this._rowHeight;
            const visibleCount = Math.ceil(visibleHeight / this._rowHeight) - 1 /* header */ + buffer * 2;
            // this._gridScrollContainer.styles = {transform: `translateY(${offsetY}px)`};

            const endIndex = Math.min(this._value.length, startIndex + visibleCount);
            const visibleRows = this._value.slice(startIndex, endIndex);
            
            // if(this.rows.children === 0) {
            //     this._generateRows(visibleCount);
            // }

            for(let i=0; i<visibleCount;i++) {
                this.rows.Add('data' + i, visibleRows[i]);
            }
            this._gridScrollContainer.width = this._gridContent.width;

            // super.value = visibleRows;


        }




    }

    _generateRows(visibleCount) {
        for(let i=0; i<visibleCount;i++) {
            this.rows.Add('data' + i, this._emptyRow ?? {});
        }
    }


}