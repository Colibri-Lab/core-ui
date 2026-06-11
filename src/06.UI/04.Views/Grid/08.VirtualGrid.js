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

        this._gridSelection = [];

        this.animateScroll = false;
        this.handleResize = true;
        this.AddHandler('Scrolled', this.__thisRecalcCounts);
        this.AddHandler('Resized', this.__thisRecalcCounts);

        this.ClearHandler('Clicked');
        this.AddHandler('Clicked', this.__clickedProcessing2, false, this);


    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('VirtualRowsChanged', false, 'When the virtual rows are changed');
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
        if (!this.isConnected || !this._value?.length) {
            return;
        }

        const leftScrolled = this.scrollLeft;

        const gridHeight = (this._value?.length ?? 0) * this._rowHeight;
        const visibleHeight = this._element.bounds().outerHeight;
        const scrolledTop = this.scrollTop;
        this._gridScrollContainer.height = gridHeight;

        if (visibleHeight > gridHeight) {
            
            let i = 0;
            for (const row of this._value) {
                if (row) {
                    if (this.rows.Children('data' + i)) {
                        this.rows.Children('data' + i).value = row;
                        this.rows.Children('data' + i).styles = { visibility: 'visible' };
                    } else {
                        this.rows.Add('data' + i, row);
                    }
                    this.rows.Children('data' + i).height = this._rowHeight;
                } else {
                    if (this.rows.Children('data' + i)) {
                        this.rows.Children('data' + i).styles = { visibility: 'hidden' };
                    }
                }
                i++;
            }

        } else {


            const startIndex = Math.max(0, Math.floor(scrolledTop / this._rowHeight));
            const visibleCount = Math.ceil(visibleHeight / this._rowHeight) - 1 /* header */;
            const lastPageSize = this._value.length % visibleCount;
            this._gridScrollContainer.height = gridHeight - (visibleCount - lastPageSize) * this._rowHeight;

            const endIndex = Math.min(this._value.length, startIndex + visibleCount);
            const visibleRows = this._value.slice(startIndex, endIndex);
            this._gridScrollContainer.width = this._gridContent.width;

            for (let i = 0; i < visibleCount; i++) {
                if (visibleRows[i]) {
                    if (this.rows.Children('data' + i)) {
                        this.rows.Children('data' + i).value = visibleRows[i];
                        this.rows.Children('data' + i).styles = { visibility: 'visible' };
                    } else {
                        this.rows.Add('data' + i, visibleRows[i]);
                    }
                    this.rows.Children('data' + i).height = this._rowHeight;
                } else {
                    if (this.rows.Children('data' + i)) {
                        this.rows.Children('data' + i).styles = { visibility: 'hidden' };
                    }
                }
                this.rows.Children('data' + i).selected = this._gridSelection.indexOf(this.rows.Children('data' + i).value.id) !== -1;
            }
        }

        this.scrollLeft = leftScrolled;

    }

    _generateRows(visibleCount) {
        for (let i = 0; i < visibleCount; i++) {
            this.rows.Add('data' + i, this._emptyRow ?? {});
        }
    }

    
    /**
     * Selected items
     * @type {Array}
     */
    get selectedItems() {
        return this._gridSelection;
    }
    /**
     * Selected items
     * @type {Array}
     */
    set selectedItems(value) {
        if(JSON.stringify(this._gridSelection) != JSON.stringify(value)) {
            this._gridSelection = value;
            this._showValue();
        }
    }

    
    /**
     * @protected
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __clickedProcessing2(event, args) {

        const target = args.domEvent.target;
        const cell = target.closest('.app-ui-row-cell')?.getUIComponent();
        if (!cell) {
            return false;
        }

        const row = target.closest('.app-ui-row').getUIComponent();

        args.cell = cell;
        args.row = row;

        this._element.focus();

        switch (this.selectionMode) {
            case Colibri.UI.Grid.EveryCell:
                this.__clickedProcessing(event, args);
                break;
            case Colibri.UI.Grid.FullRow:
                this.DeactivateAllRows();

                if (!this.multiple || (!args.domEvent.ctrlKey && !args.domEvent.shiftKey)) {
                    this._gridSelection = [];
                }
                if(args.domEvent.shiftKey && this._gridSelection.length > 0) {
                    const indexes = this._gridSelection.map(v => this._value.map(vv => vv.id).indexOf(v));
                    const minIndex = Math.min(...indexes);
                    const maxIndex = this._value.map(vv => vv.id).indexOf(row.value.id);
                    this._gridSelection = [];
                    for(let i = Math.min(minIndex, maxIndex); i <= Math.max(minIndex, maxIndex); i++) {
                        this._gridSelection.push(this._value[i].id);
                    }
                } else {
                    if(this._gridSelection.indexOf(row.value.id) !== -1) {
                        this._gridSelection.splice(this._gridSelection.indexOf(row.value.id), 1);
                    } else {
                        this._gridSelection.push(row.value.id);
                    }
                }
                this._showValue();
                break;
        }

        cell.EditValue && cell.EditValue();

        args.item = this.selected;
        this.Dispatch('SelectionChanged', args);
    }

    
}