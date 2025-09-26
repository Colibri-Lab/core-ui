/**
 * Grid component
 * @class
 * @namespace
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.Grid = class extends Colibri.UI.Pane {

    /** выделять строки целиком */
    static FullRow = 'fullrow';
    /** Выделять ячейки отдельно */
    static EveryCell = 'everycell';

    /** Сортировка по возрастанию */
    static SortAsc = 'asc';
    /** Сортировка по убыванию */
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


    /** @protected */
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
        this.RegisterEvent('ColumnDisposed', false, 'When column is disposed');
        this.RegisterEvent('ColumnAdded', false, 'When column is added');
        this.RegisterEvent('ColumnMoved', false, 'When column is moved');


        this.RegisterEvent('RowStickyChanged', false, 'When row sticky state changed');
        this.RegisterEvent('RowCheckChanged', false, 'When row check state changed');
        this.RegisterEvent('RowSelected', false, 'When row is selected');
        this.RegisterEvent('RowDisposed', false, 'When row is disposed');
        this.RegisterEvent('RowAdded', false, 'When row is added');
        this.RegisterEvent('RowUpdated', false, 'When row is updated');

        this.RegisterEvent('CellViewerClicked', false, 'When clicked on cell viewer component');
        this.RegisterEvent('CellEditorChanged', false, 'When cell editor is changed');
        this.RegisterEvent('MassActionsMenuActionClicked', false, 'When clicked on button inside mass actions menu');

    }

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

    }

    __thisChildsProcessed(event, args) {
        this._completeRender();
    }

    __thisComponentRendered(event, args) {
        this._completeRender();
    }

    RegisterCheckbox(container) {
        this._rowSelectionCheckbox.add(container);
    }

    UnregisterCheckbox(container) {
        this._rowSelectionCheckbox.delete(container);
    }

    /**
     * Возвращает хедер
     * @type {Colibri.UI.Grid.Header}
     */
    get header() {
        return this._header;
    }

    /**
     * Возвращает подвал
     * @type {Colibri.UI.Pane}
     */
    get footer() {
        return this._footer;
    }

    /**
     * Возвращает группу строк по умолчамнию
     * @type {Colibri.UI.Grid.Rows}
     */
    get rows() {
        return this._rows;
    }

    /**
     * Возвращает массив групп строк
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
     * Возвращает сыделенные строки/ячейки
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
     * Возвращает сыделенные строки/ячейки
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
     * Возвращает список прочеканных строк  
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
     * Отобразить чекболксы
     * @type {bool}
     */
    get showCheckboxes() {
        return this._showCheckboxes;
    }

    /**
     * Отобразить чекбоксы  
     * @type {bool}
     */
    set showCheckboxes(value) {
        value = this._convertProperty('Boolean', value);
        this._showCheckboxes = value;
        this._showShowCheckboxes();
    }
    _showShowCheckboxes() {
        this.header.columns.showCheckboxes = this._showCheckboxes;
        Object.forEach(this.groups, (name, group) => {
            group.showCheckboxes = this._showCheckboxes;
        });
    }

    /**
     * Мультиселект
     * @type bool
     */
    get multiple() {
        return this._multiple;
    }

    /**
     * Режим выделения
     * @type {bool}
     */
    set multiple(value) {
        this._multiple = value === 'true' || value === true;
    }

    /**
     * Режим выделения
     * @type {fullrow,everycell}
     */
    get selectionMode() {
        return this._selectionMode;
    }

    /**
     * Режим выделения
     * @type {fullrow,everycell}
     */
    set selectionMode(value) {
        this._selectionMode = value;
    }

    /**
     * Режим циклического селекта
     * @type {bool}
     */
    get cycleSelection() {
        return this._cycleSelection;
    }

    /**
     * Режим циклического селекта
     * @type {bool} value
     */
    set cycleSelection(value) {
        this._cycleSelection = value;
    }

    /**
     * Активная ячейка
     * @type {Colibri.UI.Cell}
     */
    get activeCell() {
        if (!this.activeGroup || !this.activeGroup.activeRow || !this.activeGroup.activeRow.activeCell) {
            return null;
        }
        return this.activeGroup.activeRow.activeCell;
    }

    /**
     * Активная строка
     * @returns Colibri.UI.Row
     */
    get activeRow() {
        if (!this.activeGroup || !this.activeGroup.activeRow) {
            return null;
        }
        return this.activeGroup.activeRow;
    }

    /**
     * Активная группа
     * @returns Colibri.UI.Rows
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
     * Первая группа
     * @returns Colibri.UI.Rows
     */
    get firstGroup() {
        return this.groups[Object.keys(this.groups)[0]];
    }

    /**
     * Последняя группа
     * @returns Colibri.UI.Rows
     */
    get lastGroup() {
        let groupNames = Object.keys(this.groups);
        return this.groups[groupNames[groupNames.length - 1]];
    }

    /**
     * Возвращает количество строк
     */
    get rowsCount() {
        let count = 0;
        Object.forEach(this.groups, (name, rows) => {
            count += rows.rowsCount;
        });
        return count;
    }

    get emptyMessage() {
        return this._norows.value;
    }

    set emptyMessage(value) {
        this._norows.value = value;
    }

    get sortColumn() {
        return this._sortColumn;
    }
    get sortOrder() {
        return this._sortOrder;
    }

    ResetSort() {
        this._sortColumn = null;
        this._sortOrder = null;
    }

    /**
     * Найти строку во всех группах
     * @param {string} key название строки
     * @returns Colibri.UI.Row
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
     * Снять выделение со всех ячеек 
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
     * Снять активность со всех ячеек 
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
     * Снять активность со всех строк 
     */
    DeactivateAllRows() {
        Object.forEach(this.groups, (name, group) => {
            group.ForEach((rowName, row) => {
                row.activated = false;
            });
        });
    }

    /**
     * Снять выделение со всех строк
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
     * Снять выделение со всех строк
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
     * Создает колонку  
     * @param {string} name название колонки
     * @returns Colibri.UI.Grid.Column
     */
    AddHeader(name) {
        const header = new Colibri.UI.Grid.Header(name, this._gridContent);
        header.AddClass('app-ui-grid-head');
        header.shown = true;
        return header;
    }

    /**
     * Создает группу строк (таблицу)
     * @param {string} name название строки
     * @param {string} title заголовок строки
     * @returns Colibri.UI.Grid.Rows
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

    Groups(name) {
        return this._gridContent.Children(name);
    }

    __rowsRowDisposed(event, args) {
        Object.forEach(this.groups, (name, rows) => {
            rows.columns = this.header.columnsCount;
        });
        this.RecalculateCellPositions();
    }

    __rowsStickyChanged(event, args) {
        this.RecalculateCellPositions();
    }

    __rowsGridCellsChanged(event, args) {
        this.RecalculateCellPositions();
    }

    __rowsRowAdded(event, args) {
        this._norows.shown = false;
        this._gridContent.shown = true;
        Object.forEach(this.groups, (name, rows) => {
            rows.columns = this.header.columnsCount;
            rows.hasContextMenu = this.hasContextMenu;
        });
        this.RecalculateCellPositions();
    }

    __rowsRowUpdated(event, args) {
        this.RecalculateCellPositions();
        this.Dispatch('RowUpdated', { row: args.row });
    }

    /**
     * Создает подвал для таблицы
     * @param {string} name название
     * @returns Colibri.UI.Pane
     */
    AddFooter(name) {
        const footer = new Colibri.UI.Pane(name, this);
        footer.AddClass('app-ui-grid-footer');
        footer.shown = false;
        return footer;
    }

    /**
     * Обработчик события нажатия кнопки на гриде
     * @param {Object} sender 
     * @param {Object} args 
     * @returns 
     */
    /**
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
        }

    }

    /**
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
                if (!this.multiple) {
                    this.DeselectAllCells();
                }
                cell.activated = !cell.activated;
                cell.selected = !cell.selected;
                break;
            case Colibri.UI.Grid.FullRow:
                this.DeactivateAllRows();

                if (!this.multiple) {
                    this.UnselectAllRows();
                }
                row.activated = !row.activated;
                row.selected = !row.selected;
                break;
        }

        cell.EditValue && cell.EditValue();

        args.item = this.selected;
        this.Dispatch('SelectionChanged', args);
    }

    /**
     * Пересчитывает высоту строк
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
     * Скроллирует список
     * @param {Element} element элемент
     * @param {Element} container котейнер
     * @param {number} correctionCoefficient коэфициент корректировки
     * @param {bool} direction направление
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
     * Создает кнопку контекстное меню
     */
    _createContextMenuButton() {
        // Do nothing
    }

    /**
     * Удаляет кнопку контекстного меню
     */
    _removeContextMenuButton() {
        // Do nothing
    }

    /**
     * Удаляет строки из грида, все
     * @param {bool} removeGroups удалить пустые группы тоже
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
     * Удаляет строки из грида, все
     * @param {bool} removeGroups удалить пустые группы тоже
     */
    ClearAll() {
        this.ClearAllRows(true);
        Object.forEach(this.header.FindAllColumns(), (name, column) => {
            column.Dispose();
        });
        this._gridContent.shown = false;
        this._norows.shown = true;
    }

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

    Sort(columnName, order) {
        this._sortColumn = this.header.FindColumn(columnName);
        this._sortOrder = order;
        this.Dispatch('SortChanged', { sortColumn: this._sortColumn, order: this._sortOrder });
    }

    __thisSelectionChanged(event, args) {
        if (args.item) {
            this.ForEveryRow((name, row) => {
                if (row.ContainsClass('-editing') && row != args.item) {
                    row.EndEdit();
                }
            })
        }
    }

    __rowsRowCheckChanged(event, args) {
        this._massActionsMenuObject && (this._massActionsMenuObject.selectedItems = this.checked);
        this.Dispatch('CheckChanged', args);
    }

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

    __columnColumnAdded(event, args) {
        const column = args.column;
        this.ForEveryRow((name, row) => {
            row.Add(row.value[column.name] ?? null, column);
        });
        this._completeRender();
        this.RecalculateCellPositions();
    }

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

    __headerColumnClicked(event, args) {
        this._setSortAndOrder(args.column);
    }

    /**
     * Есть ли меню массовых операций
     * @type {boolean}
     */
    get hasMassActionsMenu() {
        return this._hasMassActionsMenu;
    }
    set hasMassActionsMenu(value) {
        value = this._convertProperty('Boolean', value);
        this._hasMassActionsMenu = value;
        if (this._hasMassActionsMenu) { 
            this.showCheckboxes = true; 
        }
    }

    /**
     * Меню массовых операций
     * @type {Object}
     */
    get massActionsMenu() {
        return this._massActionsMenu;
    }
    set massActionsMenu(value) {
        value = this._convertProperty('Array', value);
        this._massActionsMenu = value;
        if (!this._massActionsMenu) {
            this._massActionsMenuObject?.Dispose();
            this._massActionsMenuObject = null;
        }
    }

    /**
     * Класс меню массовых операций (наследник Colibri.UI.MassActionsMenu)
     * @type {Colibri.UI.MassActionsMenu}
     */
    get massActionsMenuClass() {
        return this._massActionsMenuClass;
    }
    set massActionsMenuClass(value) {
        value = this._convertProperty('Colibri.UI.MassActionsMenu', value);
        this._massActionsMenuClass = value;
    }


    /**
     * Показать меню массовых операций
     * @param container
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
    _showHasContextMenu() {
        this.header.hasContextMenu = this._hasContextMenu;
        for(const group of Object.values(this.groups)) {
            group.hasContextMenu = this._hasContextMenu;
        }
    }

    RecalculateCellVisibility(column) {
        this.ForEveryRow((name, row) => {
            row.ForEach((name, cell) => {
                if (cell.parentColumn) {
                    cell.shown = cell.parentColumn.shown;
                }
            });
        });
    }

    get draggable() {
        return this._draggable;
    }

    set draggable(value) {
        this._draggable = value;
    }

    get dropable() {
        return this._dropable;
    }

    set dropable(value) {
        this._dropable = value;
    }

    set enabled(value) {
        this._enabled = value === 'true' || value === true;
        this._setEnabled();
    }

    get enabled() {
        return this._enabled;
    }

    _setEnabled() {
        // выключаем все группы, те выключают строки, строки выключают чекбоксы
        this.header.checkbox.enabled = this._enabled;
        Object.forEach(this.groups, (name, group) => {
            group.checkbox.enabled = this._enabled;
        });
        this.ForEveryRow((rname, row) => row.checkboxEnabled = this._enabled);
    }

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

}