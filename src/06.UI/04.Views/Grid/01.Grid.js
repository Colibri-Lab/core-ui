/**
 * Grid view component
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.Grid = class extends Colibri.UI.Pane {

    /** 
     * Select full row
     * @const {string}
     */
    static FullRow = 'fullrow';
    /** 
     * Select every cell
     * @const {string}
     */
    static EveryCell = 'everycell';

    /**
     * Sort ascending
     * @const {string}
     */
    static SortAsc = 'asc';
    /**
     * Sort descending
     * @const {string}
     */
    static SortDesc = 'desc';

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {string|Element} element element to create in
     */
    constructor(name, container, element) {
        super(name, container);

        this.AddClass('app-ui-grid-container');

        this._recalculateTimerCellPositions = null;

        this._groups = false;
        this._rowSelectionCheckbox = new Set();
        this._showCheckboxes = false;
        this._multiple = false;
        this._selectionMode = Colibri.UI.Grid.EveryCell;
        this._cycleSelection = false;
        this._hasMassActionsMenu = false;
        this._massActionsMenuClass = Colibri.UI.MassActionsMenu;

        this._gridContent = new Colibri.UI.Component('app-ui-grid-content', this, Element.create('table'));
        this._gridContent.shown = true;

        this._header = this.AddHeader('header');

        this._rows = this.AddGroup('default', null);
        this._norows = new Colibri.UI.Pane('app-ui-grid-norows', this, Element.create('div'));
        this._norows.shown = true;

        this._footer = this.AddFooter('footer');
        
        this.GenerateChildren(element);

        this.handleScrollProperties = true;

        this.tabIndex = 0;

        
    }

    /** 
     * @ignore
     * @protected
     */
    _registerEvents() {
        super._registerEvents();

        this.RegisterEvent('HighlightedItemChanged', false, 'When item is highlighted');
        this.RegisterEvent('SelectionChanged', false, 'When selection is changed');
        this.RegisterEvent('CheckChanged', false, 'When checks are changed');
        this.RegisterEvent('SortChanged', false, 'When sort column or order is changed');
        this.RegisterEvent('ScrolledToBottom', false, 'When scrolled to bottom of grid');

        this.RegisterEvent('RowsCheckboxClicked', false, 'Rows checkbox clicked');
        this.RegisterEvent('RowsCheckboxContextMenuItemClicked', false, 'Rows checkbox contextmenu clicked');


        this.RegisterEvent('HeaderCheckboxChanged', false, 'When header checkbox state changed');
        this.RegisterEvent('ColumnPropertyChanged', false, 'When changed the column property');
        this.RegisterEvent('ColumnClicked', false, 'When column header is clicked');
        this.RegisterEvent('ColumnContextMenu', false, 'When column header contextmenu is clicked');
        this.RegisterEvent('ColumnContextMenuItemClicked', false, 'When column header contextmenu item is clicked');
        this.RegisterEvent('ColumnDisposed', false, 'When column is disposed');
        this.RegisterEvent('ColumnAdded', false, 'When column is added');
        this.RegisterEvent('ColumnMoved', false, 'When column is moved');


        this.RegisterEvent('RowStickyChanged', false, 'When row sticky state changed');
        this.RegisterEvent('RowCheckChanged', false, 'When row check state changed');
        this.RegisterEvent('RowSelected', false, 'When row is selected');
        this.RegisterEvent('RowDisposed', false, 'When row is disposed');
        this.RegisterEvent('RowAdded', false, 'When row is added');
        this.RegisterEvent('RowUpdated', false, 'When row is updated');
        this.RegisterEvent('RowDoubleClicked', false, 'When row is double clicked');

        this.RegisterEvent('CellClicked', false, 'When clicked on cell value container');
        this.RegisterEvent('CellViewerClicked', false, 'When clicked on cell viewer component');
        this.RegisterEvent('CellEditorChanged', false, 'When cell editor is changed');
        this.RegisterEvent('MassActionsMenuActionClicked', false, 'When clicked on button inside mass actions menu');
        this.RegisterEvent('CustomContextMenuButtonClicked', false, 'When custom context menu button is clicked');
        this.RegisterEvent('CustomContextMenuButtonContextMenuItemClicked', false, 'When custom context menu button item is clicked');

    }

    /**
     * @ignore
     * @protected
     */
    _registerEventHandlers() {
        super._registerEventHandlers();

        this.AddHandler('RowStickyChanged', this.__rowsStickyChanged);

        this.AddHandler('RowCheckChanged', this.__rowsRowCheckChanged);
        this.AddHandler('RowDisposed', this.__rowsRowDisposed);
        this.AddHandler('RowAdded', this.__rowsRowAdded);

        this.AddHandler('HeaderCheckboxChanged', this.__headerCheckboxChanged);

        this.AddHandler('Clicked', this.__clickedProcessing);
        this.AddHandler('SelectionChanged', this.__thisSelectionChanged);
        this.AddHandler('KeyDown', this.__thisKeyDown);
        this.AddHandler('ColumnPropertyChanged', this.__thisColumnPropertyChanged);

        this.AddHandler('ColumnMoved', this.__columnColumnMoved);
        this.AddHandler('ColumnAdded', this.__columnColumnAdded);

        this.AddHandler('ColumnDisposed', this.__headerColumnDisposed);
        this.AddHandler('ColumnStickyChange', this.__headerColumnStickyChange);
        this.AddHandler('ColumnClicked', this.__headerColumnClicked);

        this.AddHandler('VerticalAlignChanged', this.__thisVerticalAlignChanged);
        this.AddHandler('ChildsProcessed', this.__thisChildsProcessed);
        this.AddHandler('ComponentRendered', this.__thisComponentRendered);

        this.handleResize = true;
        this.AddHandler('Resized', (event, args) => {
            this._customContextMenuIcon && (this._customContextMenuIcon.top = this.top - this.parent.top);
        });

    }

    /**
     * Add custom context menu button to grid
     * @param {string|Colibri.UI.Component} icon icon or component
     * @param {number} top top position
     * @param {number} right right position
     * @public
     */
    AddCustomContextMenuButton(icon, top = null, right = 0) {
        if(this._customContextMenuIcon) {
            return;
        }        

        if(icon instanceof Colibri.UI.Component) {
            this._customContextMenuIcon = icon;
            this._customContextMenuIcon.parent = this;
            this._customContextMenuIcon.AddClass('-custom-contextmenu-icon');
            this._customContextMenuIcon.right = right;
            this._customContextMenuIcon.top = !top ? this.top - this.parent.top : top;
        } else {
            this._customContextMenuIcon = new Colibri.UI.Icon('contextmenu-icon', this.parent);
            this._customContextMenuIcon.AddClass('-custom-contextmenu-icon');
            this._customContextMenuIcon.iconSVG = icon;
            this._customContextMenuIcon.shown = true;
            this.parent.styles = {position: 'relative'};
            this._customContextMenuIcon.right = right;
            this._customContextMenuIcon.top = !top ? this.top - this.parent.top : top;

        }

        this._customContextMenuIcon.AddHandler('Clicked', this.__customContextMenuIconClicked, false, this);
        this._customContextMenuIcon.AddHandler('ContextMenuItemClicked', this.__customContextMenuIconContextMenuItemClicked, false, this);

    }
    /**
     * Remove custom context menu button from grid
     * @public
     */
    RemoveCustomContextMenuButton() {
        if(!this._customContextMenuIcon) {
            return;
        }
        this.parent.styles = {position: null};
        this._customContextMenuIcon.Dispose();
        this._customContextMenuIcon = null;
    }

    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __customContextMenuIconContextMenuItemClicked(event, args) {
        return this.Dispatch('CustomContextMenuButtonContextMenuItemClicked', Object.assign(args, {icon: this._customContextMenuIcon}));
    }
    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __customContextMenuIconClicked(event, args) { 
        return this.Dispatch('CustomContextMenuButtonClicked', Object.assign(args, {icon: this._customContextMenuIcon}));
    }

    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisChildsProcessed(event, args) {
        this._completeRender();
    }

    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisComponentRendered(event, args) {
        this._completeRender();
    }

    /**
     * Register a checkbox for row selection
     * @public
     */
    RegisterCheckbox(container) {
        this._rowSelectionCheckbox.add(container);
    }

    /**
     * Unregister a checkbox for row selection
     * @public
     */
    UnregisterCheckbox(container) {
        this._rowSelectionCheckbox.delete(container);
    }

    /**
     * Header of Grid
     * @type {Colibri.UI.Grid.Header}
     */
    get header() {
        return this._header;
    }

    /**
     * Footer of Grid
     * @type {Colibri.UI.Pane}
     */
    get footer() {
        return this._footer;
    }

    /**
     * Default group of rows
     * @type {Colibri.UI.Grid.Rows}
     */
    get rows() {
        return this._rows;
    }

    /**
     * Array of row groups
     * @type {Colibri.UI.Grid.Rows[]}
     */
    get groups() {
        let ret = {};
        this._gridContent.ForEach((name, component) => {
            if (component instanceof Colibri.UI.Grid.Rows) {
                ret[name] = component;
            }
        });
        return ret;
    }

    /**
     * Selected rows/cells
     * @type {Colibri.UI.Component[]}
     */
    get selected() {
        let selected = [];
        if (this.selectionMode === Colibri.UI.Grid.FullRow) {
            Object.forEach(this.groups, (name, group) => {
                if (group.selected) {
                    selected = selected.concat(group.selected);
                }
            });
        } else if (this.selectionMode === Colibri.UI.Grid.EveryCell) {
            let selectedCell = [];
            this.ForEveryRow((nameRow, row) => {
                row.ForEach((nameCell, cell) => {
                    cell.selected ? selectedCell.push(cell) : '';
                });
            });
            selected = selectedCell;
        }
        if (this.multiple) {
            return selected;
        } else {
            return selected[0];
        }
    }
    /**
     * Selected rows/cells
     * @type {Colibri.UI.Component[]}
     */
    set selected(value) {

        if (value === null) {
            this.UnselectAllRows();
            return;
        }

        let cell = value instanceof Colibri.UI.Grid.Cell ? value : null;
        let row = value instanceof Colibri.UI.Grid.Row ? value : null;

        if (!cell && !row) {
            return;
        }

        let args = {};
        args.cell = cell;
        args.row = row;

        switch (this.selectionMode) {
            case Colibri.UI.Grid.EveryCell:
                if (cell) {
                    this.DeactivateAllCells();
                    if (!this.multiple) {
                        this.DeselectAllCells();
                    }
                    cell.activated = !cell.activated;
                    cell.selected = !cell.selected;
                }
                break;
            case Colibri.UI.Grid.FullRow:
                if (row) {
                    this.DeactivateAllRows();
                    if (!this.multiple) {
                        this.UnselectAllRows();
                    }
                    row.activated = !row.activated;
                    row.selected = !row.selected;
                }
                break;
        }

        args.item = this.selected;
        this.Dispatch('SelectionChanged', args);
    }

    /**
     * Checked rows
     * @type {Colibri.UI.Component[]}
     */
    get checked() {
        let checked = [];
        this.ForEveryRow((name, row) => {
            if (row.checked) {
                checked.push(row);
            }
        });
        return checked;
    }

    /**
     * Show checkboxes
     * @type {bool}
     */
    get showCheckboxes() {
        return this._showCheckboxes;
    }

    /**
     * Show checkboxes
     * @type {bool}
     */
    set showCheckboxes(value) {
        value = this._convertProperty('Boolean', value);
        this._showCheckboxes = value;
        this._showShowCheckboxes();
    }
    /**
     * @ignore
     * @private
     */
    _showShowCheckboxes() {
        this.header.columns.showCheckboxes = this._showCheckboxes;
        Object.forEach(this.groups, (name, group) => {
            group.showCheckboxes = this._showCheckboxes;
        });
    }

    /**
     * Is multiple selection enabled
     * @type {boolean}
     */
    get multiple() {
        return this._multiple;
    }

    /**
     * Is multiple selection enabled
     * @type {boolean}
     */
    set multiple(value) {
        this._multiple = value === 'true' || value === true;
    }

    /**
     * Selection mode
     * @type {fullrow,everycell}
     */
    get selectionMode() {
        return this._selectionMode;
    }

    /**
     * Selection mode
     * @type {fullrow,everycell}
     */
    set selectionMode(value) {
        this._selectionMode = value;
    }

    /**
     * Cycle selection mode
     * @type {boolean}
     */
    get cycleSelection() {
        return this._cycleSelection;
    }

    /**
     * Cycle selection mode
     * @type {boolean} value
     */
    set cycleSelection(value) {
        this._cycleSelection = value;
    }

    /**
     * Active cell
     * @type {Colibri.UI.Cell}
     */
    get activeCell() {
        if (!this.activeGroup || !this.activeGroup.activeRow || !this.activeGroup.activeRow.activeCell) {
            return null;
        }
        return this.activeGroup.activeRow.activeCell;
    }

    /**
     * Active row
     * @returns {Colibri.UI.Row}
     */
    get activeRow() {
        if (!this.activeGroup || !this.activeGroup.activeRow) {
            return null;
        }
        return this.activeGroup.activeRow;
    }

    /**
     * Active group
     * @returns {Colibri.UI.Rows}
     */
    get activeGroup() {
        let activeGroup = null;
        Object.forEach(this.groups, (name, group) => {
            if (group.activeRow) {
                activeGroup = group;
                return false;
            }
            return true;
        });
        return activeGroup;
    }

    /**
     * First group
     * @returns {Colibri.UI.Rows}
     */
    get firstGroup() {
        return this.groups[Object.keys(this.groups)[0]];
    }

    /**
     * Last group
     * @returns {Colibri.UI.Rows}
     */
    get lastGroup() {
        let groupNames = Object.keys(this.groups);
        return this.groups[groupNames[groupNames.length - 1]];
    }

    /**
     * Returns the number of rows
     * @type {number}
     */
    get rowsCount() {
        let count = 0;
        Object.forEach(this.groups, (name, rows) => {
            count += rows.rowsCount;
        });
        return count;
    }

    /**
     * Empty message, shows if grid is empty
     * @type {string}
     */
    get emptyMessage() {
        return this._norows.value;
    }
    /**
     * Empty message, shows if grid is empty
     * @type {string}
     */
    set emptyMessage(value) {
        this._norows.value = value;
    }
    /**
     * Sort column
     * @type {Colibri.UI.Grid.Column}
     */
    get sortColumn() {
        return this._sortColumn;
    }
    /**
     * Sort order
     * @type {Colibri.UI.Grid.SortAsc|Colibri.UI.Grid.SortDesc}
     */
    get sortOrder() {
        return this._sortOrder;
    }

    /**
     * Reset the sort
     * @public
     */
    ResetSort() {
        this._sortColumn = null;
        this._sortOrder = null;
    }

    /**
     * Find row by key
     * @param {string} key row key
     * @returns {Colibri.UI.Row}
     * @public
     */
    FindRow(key) {
        let found = null;
        Object.forEach(this.groups, (name, group) => {
            let f = group.Children(key);
            if (f) {
                found = f;
                return false;
            }
            return true;
        });
        return found;
    }

    /**
     * Unselect all cells
     * @public 
     */
    DeselectAllCells() {
        Object.forEach(this.groups, (name, group) => {
            group.ForEach((nameRow, row) => {
                row.ForEach((nameCell, cell) => {
                    if (nameCell !== 'checkbox-column') {
                        cell.selected = false;
                    }
                })
            });
        });
    }

    /**
     * Deactivate all cells
     * @public
     */
    DeactivateAllCells() {
        Object.forEach(this.groups, (name, group) => {
            group.ForEach((nameRow, row) => {
                row.ForEach((nameCell, cell) => {
                    if (nameCell !== 'checkbox-column') {
                        cell.activated = false;
                    }
                })
            });
        });
    }

    /**
     * Deactivate all rows
     * @public
     */
    DeactivateAllRows() {
        Object.forEach(this.groups, (name, group) => {
            group.ForEach((rowName, row) => {
                row.activated = false;
            });
        });
    }

    /**
     * Unselect all rows
     * @public
     */
    UnselectAllRows() {
        Object.forEach(this.groups, (name, group) => {
            group.ForEach((rowName, row) => {
                row.selected = false;
            });
        });
        this.Dispatch('SelectionChanged', {});
    }

    /**
     * Uncheck all rows
     * @public
     */
    UncheckAllRows() {
        Object.forEach(this.groups, (name, group) => {
            group.ForEach((rowName, row) => {
                row.checked = false;
            });
            group.checkbox.checked = false;
        });
        this.header.checkbox.checked = false;
        if (this._massActionsMenuObject) {
            this._massActionsMenuObject.Dispose();
            this._massActionsMenuObject = null;
        }
        this.Dispatch('CheckChanged', {});
    }

    /**
     * Creates a column
     * @param {string} name column name
     * @returns {Colibri.UI.Grid.Column}
     * @public
     */
    AddHeader(name) {
        const header = new Colibri.UI.Grid.Header(name, this._gridContent);
        header.AddClass('app-ui-grid-head');
        header.shown = true;
        return header;
    }

    /**
     * Creates a group of rows (table)
     * @param {string} name row group name
     * @param {string} title row group title
     * @returns {Colibri.UI.Grid.Rows}
     * @public
     */
    AddGroup(name, title) {
        const rows = new Colibri.UI.Grid.Rows(name, this._gridContent);
        rows.AddClass('app-ui-grid-rows');
        if (title) {
            rows.title = title;
        }

        rows.AddHandler('GridCellsChanged', this.__rowsGridCellsChanged, false, this);
        rows.AddHandler('RowUpdated', this.__rowsRowUpdated, false, this);

        return rows;
    }

    /**
     * Returns a group of rows by name
     * @param {string} name row group name
     * @returns {Colibri.UI.Grid.Rows}
     * @public
     */
    Groups(name) {
        return this._gridContent.Children(name);
    }

    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __rowsRowDisposed(event, args) {
        Object.forEach(this.groups, (name, rows) => {
            rows.columns = this.header.columnsCount;
        });
        this.RecalculateCellPositions();
    }

    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __rowsStickyChanged(event, args) {
        this.RecalculateCellPositions();
    }

    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __rowsGridCellsChanged(event, args) {
        this.RecalculateCellPositions();
    }

    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __rowsRowAdded(event, args) {
        this._norows.shown = false;
        this._gridContent.shown = true;
        Object.forEach(this.groups, (name, rows) => {
            rows.columns = this.header.columnsCount;
            rows.hasContextMenu = this.hasContextMenu;
        });
        this.RecalculateCellPositions();
    }

    /** 
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __rowsRowUpdated(event, args) {
        this.RecalculateCellPositions();
        this.Dispatch('RowUpdated', { row: args.row });
    }

    /**
     * Creates a footer
     * @param {string} name footer name
     * @returns {Colibri.UI.Pane}
     * @public
     */
    AddFooter(name) {
        const footer = new Colibri.UI.Pane(name, this);
        footer.AddClass('app-ui-grid-footer');
        footer.shown = false;
        return footer;
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisKeyDown(event, args) {
        const e = args.domEvent;

        if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', 'NumpadEnter'].indexOf(e.code) !== -1) {

            let activeItem;
            let newActiveItem;
            let correctionCoefficient = 0;
            let direction = 'all';

            if (this.selectionMode === Colibri.UI.Grid.FullRow) {
                direction = 'Y';
                let activeRow = this.activeRow;
                let activeGroup = this.activeGroup;
                if (!activeGroup) {
                    activeGroup = this.firstGroup;
                }
                let lastGroup = this.lastGroup;

                let newActiveRow = null;

                if (activeRow === null) {
                    if (['ArrowDown', 'ArrowRight'].indexOf(e.code) !== -1) {
                        newActiveRow = activeGroup.firstRow;
                    }
                    else if (['ArrowUp', 'ArrowLeft'].indexOf(e.code) !== -1) {
                        newActiveRow = lastGroup.lastRow;
                    }
                } else {
                    if (e.code !== 'Enter') {
                        if (['ArrowDown', 'ArrowRight'].indexOf(e.code) !== -1) {
                            if (activeRow.nextRow !== null) {
                                newActiveRow = activeRow.nextRow;
                            }
                            else {
                                newActiveRow = activeGroup.nextGroup ? activeGroup.nextGroup.firstRow : this.firstGroup.firstRow;
                            }
                        } else {
                            if (activeRow.prevRow !== null) {
                                newActiveRow = activeRow.prevRow;
                            }
                            else {
                                newActiveRow = activeGroup.prevGroup ? activeGroup.prevGroup.lastRow : this.lastGroup.lastRow;
                            }
                        }
                        if (newActiveRow) {
                            correctionCoefficient = newActiveRow._heightPrevStickyRow;
                        }
                    } else if (e.code === 'Enter') {
                        if (!this.multiple) {
                            this.UnselectAllRows();
                            activeRow.selected = true;
                        } else {
                            activeRow.selected = !activeRow.selected;
                        }
                        this.Dispatch('SelectionChanged', { item: activeRow });
                    }
                }

                activeItem = activeRow !== null ? activeRow : null;
                newActiveItem = newActiveRow;

            } else {

                let activeCell = this.activeCell;
                let newActiveCell = null;

                if (activeCell === null) {
                    newActiveCell = this.firstGroup.firstRow.firstCell;

                } else {

                    if (e.code === 'ArrowRight') {
                        if (activeCell.nextCell !== null) {
                            newActiveCell = activeCell.nextCell;
                            correctionCoefficient = newActiveCell.parentColumn._widthPrevStickyCell;
                        } else if (activeCell.parent.nextRow !== null) {
                            if (this.cycleSelection) {
                                newActiveCell = activeCell.parent.nextRow.firstCell;
                                correctionCoefficient = newActiveCell.parentColumn._widthPrevStickyCell;
                            }
                        } else {
                            if (this.cycleSelection) {
                                newActiveCell = activeCell.parent.parent.firstRow.firstCell;
                                correctionCoefficient = newActiveCell.parent._heightPrevStickyRow;
                            }
                        }
                    } else if (e.code === 'ArrowLeft') {
                        if (activeCell.prevCell !== null) {
                            newActiveCell = activeCell.prevCell;
                            correctionCoefficient = newActiveCell.parentColumn._widthPrevStickyCell;
                        } else if (activeCell.parent.prevRow !== null) {
                            if (this.cycleSelection) {
                                newActiveCell = activeCell.parent.prevRow.lastCell;
                                correctionCoefficient = newActiveCell.parentColumn._widthPrevStickyCell;
                            }
                        } else {
                            if (this.cycleSelection) {
                                newActiveCell = activeCell.parent.parent.lastRow.lastCell;
                                correctionCoefficient = newActiveCell.parentColumn._widthPrevStickyCell;
                            }
                        }
                    } else if (e.code === 'ArrowDown') {
                        if (activeCell.parent.nextRow !== null) {
                            let nameNewCell = 'app-ui-cell-' + activeCell.parent.nextRow.name + '-' + activeCell.parentColumn.name;
                            newActiveCell = activeCell.parent.nextRow.Children(nameNewCell);
                            correctionCoefficient = newActiveCell.parentRow._heightPrevStickyRow;
                        } else {
                            if (this.cycleSelection) {
                                let nameNewCell = 'app-ui-cell-' + activeCell.parent.parent.firstRow.name + '-' + activeCell.parentColumn.name;
                                newActiveCell = activeCell.parent.parent.firstRow.Children(nameNewCell);
                                correctionCoefficient = newActiveCell.parentRow._heightPrevStickyRow;
                            }
                        }
                    } else if (e.code === 'ArrowUp') {
                        if (activeCell.parent.prevRow !== null) {
                            let nameNewCell = 'app-ui-cell-' + activeCell.parent.prevRow.name + '-' + activeCell.parentColumn.name;
                            newActiveCell = activeCell.parent.prevRow.Children(nameNewCell);
                            correctionCoefficient = newActiveCell.parentRow._heightPrevStickyRow;
                        } else {
                            if (this.cycleSelection) {
                                let nameNewCell = 'app-ui-cell-' + activeCell.parent.parent.lastRow.name + '-' + activeCell.parentColumn.name;
                                newActiveCell = activeCell.parent.parent.lastRow.Children(nameNewCell);
                                correctionCoefficient = 0;
                            }
                        }
                    } else if (e.code === 'Enter') {
                        if (!this.multiple) {
                            this.DeselectAllCells();
                        }
                        activeCell.selected = !activeCell.selected;
                        newActiveCell = activeCell;
                        this.Dispatch('SelectionChanged', { item: newActiveCell });
                    }

                }

                if (newActiveCell !== null) {
                    if (activeCell !== null) {
                        activeItem = activeCell;
                    }
                    newActiveItem = newActiveCell;
                }
            }

            if (newActiveItem !== null && newActiveItem !== undefined) {
                if (activeItem !== null && activeItem !== undefined) {
                    activeItem.activated = false;
                }
                newActiveItem.activated = true;
                this.__customScroll(newActiveItem._element, this.container, correctionCoefficient, direction);
                this.Dispatch('HighlightedItemChanged', { item: newActiveItem });
            }
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
        else if (e.code === 'Space' && !(e.target.is('input') || e.target.is('textarea'))) {
            this.selected = null;
            this.activeRow.checked = !this.activeRow.checked;
            this.Dispatch('CheckChanged');
            e.stopPropagation();
            e.preventDefault();
            return false;
        } else if (e.code === 'Tab') {
            const editors = this.CollectEditors();
            const editor = args.domEvent.target?.closestComponent().Closest(v => v instanceof Colibri.UI.Editor);
            const editorIndex = editors.indexOf(editor);
            if (e.shiftKey) {
                if (editorIndex > 0) {
                    editors[editorIndex - 1].Focus();
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                } else {
                    this.parent.Dispatch('KeyDown', {component: this});
                }
            } else {
                if(editorIndex < editors.length - 1) {
                    editors[editorIndex + 1].Focus();
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                } else {
                    this.parent.Dispatch('KeyDown', {component: this});
                }
            }
            return false;
        }

        return true;
    }


    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __clickedProcessing(event, args) {

        const target = args.domEvent.target;
        // const cell = target.closest('.app-ui-row-cell')?.getUIComponent();
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
                this.DeactivateAllCells();
                if (!this.multiple || !document.keysPressed.ctrl) {
                    this.DeselectAllCells();
                }
                cell.activated = !cell.activated;
                cell.selected = !cell.selected;
                break;
            case Colibri.UI.Grid.FullRow:
                this.DeactivateAllRows();

                if (!this.multiple || (!document.keysPressed.ctrl && !document.keysPressed.shift)) {
                    this.UnselectAllRows();
                }
                if(document.keysPressed.shift && this.selected.length > 0) {
                    const indexes = this.selected.map(v => v.childIndex);
                    const minIndex = Math.min(...indexes);
                    const maxIndex = row.childIndex;
                    this.selected.forEach(v => (v.selected = false));
                    for(let i = Math.min(minIndex, maxIndex); i <= Math.max(minIndex, maxIndex); i++) {
                        (this.activeGroup ?? this.rows).Children(i).selected = true;
                    }
                } else {
                    row.activated = !row.activated;
                    row.selected = !row.selected;
                }
                break;
        }

        cell.EditValue && cell.EditValue();

        args.item = this.selected;
        this.Dispatch('SelectionChanged', args);
    }

    /**
     * Recalculate positions of sticky cells and rows
     * @public
     */
    RecalculateCellPositions() {
        if(!this.header) {
            return;
        }

        let tempWidth = 0;
        let tempWidthPrevStickyCell = 0;
        let col = null;
        let colcount = 0;
        Object.forEach(this.header.FindAllColumns(), (nameColumn, column) => {
            column._widthPrevStickyCell = tempWidthPrevStickyCell;
            if (column.sticky) {
                col = column;
                tempWidthPrevStickyCell += parseFloat(column._element.css('width'));
                column.left = tempWidth;
                column.tag.stickyLeft = tempWidth;
                tempWidth += parseFloat(column._element.css('width'));
            }
        });

        col && col.AddClass('-last-sticky')

        let tempHeight = this.header.height;
        Object.forEach(this.groups, (name, group) => {
            group.ForEach((nameRow, row) => {
                row._heightPrevStickyRow = tempHeight;
                if (row.sticky) {
                    row.top = tempHeight;
                    tempHeight += row.height;
                }
                row.ForEach((n, cell) => {
                    if(n !== 'checkbox-column' && n !== 'contextmenu-column') {
                        if(cell.parentColumn?.sticky) {
                            cell.left = cell.parentColumn.tag.stickyLeft;
                        }
                    }
                });
            });
        });

    }

    /**
     * Scrolls the list
     * @param {Element} element element
     * @param {Element} container container
     * @param {number} correctionCoefficient correction coefficient
     * @param {bool} direction direction
     * @private
     * @ignore
     */
    __customScroll(element, container, correctionCoefficient, direction) {

        if (!!!correctionCoefficient) {
            correctionCoefficient = 0;
        }

        let containerBoundingClientRect = container.getBoundingClientRect();
        let cTop = containerBoundingClientRect.top;
        let cBottom = containerBoundingClientRect.bottom;
        let cLeft = containerBoundingClientRect.left;
        let cRight = containerBoundingClientRect.right;

        let elementBoundingClientRect = element.getBoundingClientRect();
        let eTop = elementBoundingClientRect.top;
        let eBottom = elementBoundingClientRect.bottom;
        let eLeft = elementBoundingClientRect.left;
        let eRight = elementBoundingClientRect.right;

        let bottomCorrection = 0;
        if (this.footer.shown) {
            bottomCorrection = this.footer._element.clientHeight;
        }

        if (direction === 'all' || direction === 'Y') {
            if (eBottom > cBottom - bottomCorrection) {
                container.scrollTop += (eBottom - container.clientHeight + bottomCorrection);
            } else if (eTop < (cTop + correctionCoefficient)) {
                container.scrollTop -= (cTop - eTop + correctionCoefficient);
            }
        }

        if (direction === 'all' || direction === 'X') {
            if (eLeft < (cLeft + correctionCoefficient)) {
                container.scrollLeft -= (cLeft - eLeft + correctionCoefficient);
            } else if (eRight > cRight) {
                container.scrollLeft += (eRight - cRight);
            }
        }
    }

    /**
     * Creates a context menu button
     * @private
     * @ignore
     */
    _createContextMenuButton() {
        // Do nothing
    }

    /**
     * Removes the context menu button
     * @private
     * @ignore
     */
    _removeContextMenuButton() {
        // Do nothing
    }

    /**
     * Removes all rows from the grid
     * @param {bool} removeGroups remove empty groups as well
     * @public
     */
    ClearAllRows(removeGroups = true) {
        Object.forEach(this.groups, (name, group) => {
            group.Clear();
            if (removeGroups) {
                group.Hide();
            }
        });
        this._gridContent.shown = false;
        this._norows.shown = true;
        this.UnselectAllRows();
        this.UncheckAllRows();

    }

    /**
     * Removes all rows from the grid
     * @param {bool} removeGroups remove empty groups as well
     * @public
     */
    ClearAll() {
        this.ClearAllRows(true);
        Object.forEach(this.header.FindAllColumns(), (name, column) => {
            column.Dispose();
        });
        this._gridContent.shown = false;
        this._norows.shown = true;
    }

    /**
     * Iterates through all rows and executes a callback function
     * @param {function} callback callback function with parameters (name, row, index)
     * @public
     */
    ForEveryRow(callback) {
        let cancel = false;
        Object.forEach(this.groups, (name, group, igroup) => {
            group.ForEach((rname, row, irow) => {
                if (row instanceof Colibri.UI.Grid.Row) {
                    if (callback(rname, row, irow) === false) {
                        cancel = true;
                        return false;
                    }
                }
                return true;
            });
            if (cancel) {
                return false;
            }
            return true;
        });
    }

    /**
     * Deletes all rows except those specified in the found array
     * @param {string[]} found array of row names to keep
     * @public
     */
    DeleteAllExcept(found) {

        let collected = [];
        this.ForEveryRow((name, row) => {
            if (found.indexOf(name) === -1) {
                collected.push(row);
            }
        });

        for (const row of collected) {
            row.Dispose();
        }

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __headerCheckboxChanged(event, args) {

        if(!args.value) {
            this.UncheckAllRows();
        } else {
            for(const group of Object.values(this.groups)) {
                group.ForEveryRow((name, row) => {
                    row.checked = row.shown && args.value;
                });
                group.checkbox.checked = args.value;
                group.checkbox.thirdState = group.rowsCount > group.checked.length;
            }
            this.header.checkbox.thirdState = this.rowsCount > this.checked.length;
        }

        this.Dispatch('RowSelected');
        this.Dispatch('CheckChanged');
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     */
    _setSortAndOrder(column) {
        if (!column.sortable) {
            return;
        }

        const check = [this._sortColumn?.name, this._sortOrder];
        if (this._sortColumn && this._sortColumn === column) {
            if (this._sortOrder === null) {
                this._sortOrder = Colibri.UI.Grid.SortAsc;
            }
            else if (this._sortOrder === Colibri.UI.Grid.SortAsc) {
                this._sortOrder = Colibri.UI.Grid.SortDesc;
            }
            else if (this._sortOrder === Colibri.UI.Grid.SortDesc) {
                this._sortOrder = null;
            }
        }
        else if (!this._sortColumn || this._sortColumn !== column) {
            // убираем со старого
            this._sortColumn && (this._sortColumn.sortState = null);

            this._sortColumn = column;
            this._sortOrder = Colibri.UI.Grid.SortAsc;
        }

        this._sortColumn.sortState = this._sortOrder;

        if (JSON.stringify(check) !== JSON.stringify([this._sortColumn?.name, this._sortOrder])) {
            this.Dispatch('SortChanged', { sortColumn: this._sortColumn, order: this._sortOrder });
        }

    }

    /**
     * Sorts the grid by a specific column and order
     * @param {string} columnName name of the column to sort by
     * @param {Colibri.UI.Grid.SortAsc|Colibri.UI.Grid.SortDesc} order sorting order (ascending or descending)
     * @public
     */
    Sort(columnName, order) {
        this._sortColumn = this.header.FindColumn(columnName);
        this._sortOrder = order;
        this.Dispatch('SortChanged', { sortColumn: this._sortColumn, order: this._sortOrder });
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisSelectionChanged(event, args) {
        if (args.item) {
            this.ForEveryRow((name, row) => {
                if (row.ContainsClass('-editing') && row != args.item) {
                    row.EndEdit();
                }
            })
        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __rowsRowCheckChanged(event, args) {
        this._massActionsMenuObject && (this._massActionsMenuObject.selectedItems = this.checked);
        this.Dispatch('CheckChanged', args);
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __columnColumnMoved(event, args) {
        this.ForEveryRow((name, row) => {
            const cell = row.Cell(args.column.name);
            if(cell) {
                const fromIndex = cell.childIndex;
                const toIndex = args.column.childIndex;
                row.MoveChild(cell, fromIndex, toIndex, false);
            } 
        });
        this._completeRender();
        this.RecalculateCellPositions();
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __columnColumnAdded(event, args) {
        const column = args.column;
        this.ForEveryRow((name, row) => {
            row.Add(row.value[column.name] ?? null, column);
        });
        this._completeRender();
        this.RecalculateCellPositions();
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __headerColumnDisposed(event, args) {
        const column = args.column;
        this.ForEveryRow((name, row) => {
            row.Cell(column.name)?.Dispose();
        });
        Object.forEach(this.groups, (name, rows) => {
            rows.columns = this.header.columnsCount;
        });
        this._completeRender(column.name);
        this.RecalculateCellPositions();
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    _completeRender(disposedName = null) {
        return;
        if(this.header) {
            let cols = [];
            if(this.hasContextMenu) {
                cols.push('40px');
            } 

            const columns = this.header.FindColumnsWithWidth();
            for(const column of columns) {
                if(disposedName && column.name === disposedName) {
                    continue;
                }
                let width = column.width || 'auto';
                if(width.isNumeric()) {
                    width = width + 'px';
                }
                cols.push(width);
            }

            // cols.push('repeat(' + this.header.columnsCount + ', auto)');
            if(this.showCheckboxes) {
                cols.push('20px');
            }
            this._gridContent.container.css('grid-template-columns', cols.join(' '));

            for(const group of Object.values(this.groups)) {
                group.titleCell.colspan = cols.length;
            }

        }

        

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisColumnPropertyChanged(event, args) {
        if(args.property === 'sticky') {
            this.RecalculateCellPositions();
        } else if(['shown', 'editor', 'viewer', 'valign', 'halign', 'width'].indexOf(args.property) !== -1) {
            this.ForEveryRow((n, row) => {
                if(row.Cell(args.column.name)) {
                    row.Cell(args.column.name)[args.property] = args.column[args.property];
                }
            });
            this.RecalculateCellVisibility(args.column);
            if(args.property === 'width') {
                this._completeRender();
            }
        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __headerColumnClicked(event, args) {
        this._setSortAndOrder(args.column);
    }

    /**
     * Whether the grid has a mass actions menu
     * @type {boolean}
     */
    get hasMassActionsMenu() {
        return this._hasMassActionsMenu;
    }
    /**
     * Whether the grid has a mass actions menu
     * @type {boolean}
     */
    set hasMassActionsMenu(value) {
        value = this._convertProperty('Boolean', value);
        this._hasMassActionsMenu = value;
        if (this._hasMassActionsMenu) { 
            this.showCheckboxes = true; 
        }
    }

    /**
     * Mass actions menu configuration
     * @type {Object}
     */
    get massActionsMenu() {
        return this._massActionsMenu;
    }
    /**
     * Mass actions menu configuration
     * @type {Object}
     */
    set massActionsMenu(value) {
        value = this._convertProperty('Array', value);
        this._massActionsMenu = value;
        if (!this._massActionsMenu) {
            this._massActionsMenuObject?.Dispose();
            this._massActionsMenuObject = null;
        }
    }

    /**
     * Mass actions menu class
     * @type {Colibri.UI.MassActionsMenu}
     */
    get massActionsMenuClass() {
        return this._massActionsMenuClass;
    }
    /**
     * Mass actions menu class
     * @type {Colibri.UI.MassActionsMenu}
     */
    set massActionsMenuClass(value) {
        value = this._convertProperty('Colibri.UI.MassActionsMenu', value);
        this._massActionsMenuClass = value;
    }


    /**
     * Show mass actions menu
     * @param {HTMLElement} container The container element for the mass actions menu
     * @public
     */
    ShowMassActionsMenu(container) {
        if (this._massActionsMenuClass) {
            if (!this._massActionsMenuObject) {
                const cl = this._massActionsMenuClass;
                this._massActionsMenuObject = new cl(this.name + '-mass-actions-menu', container || document.body);
                this._massActionsMenuObject.parent = this;
                this._massActionsMenuObject.AddHandler('ActionClicked', this.__massActionMenuObjectActionClicked, false, this);
            }

            this._massActionsMenuObject.actions = this._massActionsMenu;
            this._massActionsMenuObject.selectedItems = this.checked;
            this._massActionsMenuObject.shown = true;
            this._massActionsMenuObject.styles = { 'max-width': container.container.bounds().outerWidth + 'px' };

        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __massActionMenuObjectActionClicked(event, args) {
        this._massActionsMenuObject.parent.Dispatch('MassActionsMenuActionClicked', Object.assign({ items: this.checked }, args));
    }

    /**
     * Has context menu
     * @type {Boolean}
     */
    get hasContextMenu() {
        return this._hasContextMenu;
    }
    /**
     * Has context menu
     * @type {Boolean}
     */
    set hasContextMenu(value) {
        this._hasContextMenu = value;
        this._showHasContextMenu();
    }
    /**
     * @ignore
     * @private
     */
    _showHasContextMenu() {
        this.header.hasContextMenu = this._hasContextMenu;
        for(const group of Object.values(this.groups)) {
            group.hasContextMenu = this._hasContextMenu;
        }
    }

    /**
     * Recalculates the visibility of cells based on their parent column's visibility
     * @param {Colibri.UI.Grid.Column} column The column whose visibility has changed
     * @public
     */
    RecalculateCellVisibility(column) {
        this.ForEveryRow((name, row) => {
            row.ForEach((name, cell) => {
                if (cell.parentColumn) {
                    cell.shown = cell.parentColumn.shown;
                }
            });
            row.SetRowTemplateSpan();
        });
    }

    /**
     * Is draggable
     * @type {boolean}
     */
    get draggable() {
        return this._draggable;
    }
    
    /**
     * Is draggable
     * @type {boolean}
     */    
    set draggable(value) {
        this._draggable = value;
    }

    /**
     * Is droppable
     * @type {boolean}
     */
    get dropable() {
        return this._dropable;
    }
    /**
     * Is droppable
     * @type {boolean}
     */
    set dropable(value) {
        this._dropable = value;
    }

    /**
     * Is enabled
     * @type {boolean}
     */
    set enabled(value) {
        this._enabled = value === 'true' || value === true;
        this._setEnabled();
    }

    /**
     * Is enabled
     * @type {boolean}
     */
    get enabled() {
        return this._enabled;
    }

    /**
     * @ignore
     * @private
     */
    _setEnabled() {
        // выключаем все группы, те выключают строки, строки выключают чекбоксы
        this.header.checkbox.enabled = this._enabled;
        Object.forEach(this.groups, (name, group) => {
            group.checkbox.enabled = this._enabled;
        });
        this.ForEveryRow((rname, row) => row.checkboxEnabled = this._enabled);
    }

    /**
     * Sets/Gets the value of the grid, which is an array of data objects. Each object represents a row in the grid.
     * @type {Array}
     */
    set value(value) {

        if (!value) {
            value = [];
        }

        if (Object.isObject(value)) {
            value = Object.values(value);
        }

        this.ClearAllRows();
        value.forEach((d) => {
            this.rows.Add('data' + (d.id ?? Date.Mc()), d);
        });

        this._norows.shown = value.length == 0;
        this._gridContent.shown = value.length > 0;

    }

    /**
     * Sets/Gets the value of the grid, which is an array of data objects. Each object represents a row in the grid.
     * @type {Array}
     */
    get value() {
        const ret = [];
        this.ForEveryRow((name, row) => {
            ret.push(row.value);
        });
        return ret;
    }

    /**
     * Row template component
     * @type {string}
     */
    get rowTemplateComponent() {
        return this._rowTemplateComponent;
    }
    /**
     * Row template component
     * @type {string}
     */
    set rowTemplateComponent(value) {
        this._rowTemplateComponent = value;
    }

    /**
     * Row template attributes
     * @type {Object}
     */
    get rowTemplateAttrs() {
        return this._rowTemplateAttrs;
    }
    /**
     * Row template attributes
     * @type {Object}
     */
    set rowTemplateAttrs(value) {
        this._rowTemplateAttrs = value;
    }

    /**
     * Column sort icons
     * @type {Object|String}
     */
    get columnSortIcons() {
        return this._columnSortIcons;
    }
    /**
     * Column sort icons
     * @type {Object|String}
     */
    set columnSortIcons(value) {
        this._columnSortIcons = value;
        const columns = this.header.FindAllColumns();
        Object.forEach(columns, (name, column) => {
            column.sortIcons = this._columnSortIcons;
        });
    }

    /**
     * Resize mode of the grid, which can be either 'percentage' or 'factual'. This determines how the grid resizes its columns and rows.
     * @type {persentage,factual}
     */
    get resizeMode() {
        return this._resizeMode;
    }
    /**
     * Resize mode of the grid, which can be either 'percentage' or 'factual'. This determines how the grid resizes its columns and rows.
     * @type {persentage,factual}
     */
    set resizeMode(value) {
        this._resizeMode = value;
    }

    /**
     * Focus on component
     * @param {string|number} element The element to focus on. It can be 'firstVisibleChild', 'lastVisibleChild', 'firstChild', 'lastChild', or an index of the editor to focus on.
     * @public
     */
    Focus(element = 'firstVisibleChild') {
        const editors = this.CollectEditors();
        if(element === 'firstVisibleChild') {
            const first = editors.find(e => e.shown);
            if(first) {
                first.Focus();
            }
        } else if(element === 'lastVisibleChild') {
            const last = editors.reverse().find(e => e.shown);
            if(last) {
                last.Focus();
            }
        } else if(element === 'firstChild') {
            if(editors.length) {
                editors[0].Focus();
            }
        } else if(element === 'lastChild') {
            if(editors.length) {
                editors[editors.length - 1].Focus();
            }
        } else {
            editors[element]?.Focus();
        }
    }

    /**
     * Collects all editors from the grid's rows and returns them as an array.
     * @returns {Array} An array of all editors in the grid.
     * @public
     */
    CollectEditors() {
        let editors = [];
        this.ForEveryRow((name, row) => {
            editors = editors.concat(row.CollectEditors());
        });
        return editors;
    }

}