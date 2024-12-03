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

        this.tabIndex = 0;
        this._handleEvents();
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
            if(component instanceof Colibri.UI.Grid.Rows) {
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
                if(group.selected) {
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

        if(value === null) {
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

        switch(this.selectionMode) {
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
            if(row.checked) {
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
        this._setShowCheckboxes(value);
    }
    _setShowCheckboxes(value) {
        this._rowSelectionCheckbox.forEach((obj) => {
            if (value) {
                obj.AddClass('input-checkbox-shown');
            } else {
                obj.RemoveClass('input-checkbox-shown');
            }
        });
        this.header.columns.Children('button-container-for-row-selection').shown = value;
        this._showCheckboxes = value;
        Object.forEach(this.groups, (name, group) => {
            group.showCheckbox = value;
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
        if(!this.activeGroup || !this.activeGroup.activeRow || !this.activeGroup.activeRow.activeCell) {
            return null;
        }
        return this.activeGroup.activeRow.activeCell;
    }

    /**
     * Активная строка
     * @returns Colibri.UI.Row
     */
    get activeRow() {
        if(!this.activeGroup || !this.activeGroup.activeRow) {
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
            if(group.activeRow) {
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
            if(f) {
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
                    if (nameCell !== 'button-container-for-row-selection') {
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
                    if (nameCell !== 'button-container-for-row-selection') {
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
        if(this._massActionsMenuObject) {
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
        if(title) {
            rows.title = title;
        }

        rows.AddHandler('CellClicked', (event, args) => {
            if (this.selectionMode === Colibri.UI.Grid.EveryCell) {
                this.DeactivateAllCells();
                if (!this.multiple) {
                    this.DeselectAllCells();
                }
                args.cell.activated = !args.cell.activated;
                args.cell.selected = !args.cell.selected;
            }
            this.Dispatch('CellClicked', args);
        });

        rows.AddHandler('CellDoubleClicked', (event, args) => {
            this.Dispatch('CellDoubleClicked', args);
        });

        rows.AddHandler('RowClicked', (event, args) => {
            this.Dispatch('RowClicked', args);
            this.Dispatch('SelectionChanged', Object.assign(args, {item: this.selected}));
        });

        rows.AddHandler('RowSelected', (event, args) => {
            if(rows.checked.length == 0) {
                rows.checkbox.checked = false;
            }
            this.Dispatch('RowSelected', args);
        });

        rows.AddHandler('RowDisposed', (event, args) => {
            this.RecalculateCellPositions();
            this.Dispatch('RowDisposed', args);
        });

        rows.AddHandler('StickyChanged', (event, args) => {
            this.RecalculateCellPositions();
        });

        rows.AddHandler('GridCellsChanged', (event, args) => {
            this.RecalculateCellPositions();
        });

        rows.AddHandler('RowAdded', (event, args) => {
            this._norows.shown = false;
            this._gridContent.shown = true;
            Object.forEach(this.groups, (name, rows) => {
                rows.columns = this.header.columnsCount;
            });
            this.RecalculateCellPositions();
            this.Dispatch('RowAdded', {row: args.row});
        });

        rows.AddHandler('RowUpdated', (event, args) => {
            this.RecalculateCellPositions();
            this.Dispatch('RowUpdated', {row: args.row});
        });


        return rows;
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
    __processKeydown(event, args) {

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
                if(!activeGroup) {
                    activeGroup = this.firstGroup;
                }
                let lastGroup = this.lastGroup;

                let newActiveRow = null;

                if (activeRow === null) {
                    if (['ArrowDown', 'ArrowRight'].indexOf(e.code) !==  -1) {
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
                        if(newActiveRow) {
                            correctionCoefficient = newActiveRow._heightPrevStickyRow;
                        }
                    } else if (e.code === 'Enter') {
                        if (!this.multiple) {
                            this.UnselectAllRows();
                            activeRow.selected = true;
                        } else {
                            activeRow.selected = !activeRow.selected;
                        }
                        this.Dispatch('SelectionChanged', {item: activeRow});
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
                        this.Dispatch('SelectionChanged', {item: newActiveCell});
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
                this.Dispatch('HighlightedItemChanged', {item: newActiveItem});
            }
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
        else if(e.code === 'Space') {
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
        const   target = args.domEvent.target,
                cell = target.closest('.app-ui-row-cell')?.tag('component');

        if(!cell) {
            return false;
        }

        const row = target.closest('.app-ui-row').tag('component');

        args.cell = cell;
        args.row = row;

        this._element.focus();

        switch(this.selectionMode) {
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

        this.Dispatch('CellClicked', args);
        cell.EditValue && cell.EditValue();

        this.Dispatch('RowClicked', args);

        args.item = this.selected;
        this.Dispatch('SelectionChanged', args);
    }

    /**
     * Пересчитывает высоту строк
     */
    RecalculateCellPositions() {

        if (this._recalculateTimerCellPositions !== null) {
            clearTimeout(this._recalculateTimerCellPositions);
        }

        this._recalculateTimerCellPositions = setTimeout(() => {

            let tempHeight = this.header.height;
            Object.forEach(this.groups, (name, group) => {
                group.ForEach((nameRow, row) => {
                    row._heightPrevStickyRow = tempHeight;
                    if (row.sticky) {
                        row._positionTop = tempHeight;
                        tempHeight += row.height;
                        row.Dispatch('RowPositionChange', {row: row});
                    }
                });
            });

            let tempWidth = 0;
            let tempWidthPrevStickyCell = 0;
            let col = null;
            Object.forEach(this.header.FindAllColumns(), (nameColumn, column) => {
                column._widthPrevStickyCell = tempWidthPrevStickyCell;
                if (column.sticky) {
                    col = column;
                    tempWidthPrevStickyCell += parseFloat(column._element.css('width'));
                    column.left = tempWidth;
                    column._positionLeft = tempWidth;
                    tempWidth += parseFloat(column._element.css('width'));
                    column.Dispatch('ColumnPositionChange', {column: column});
                }
            });
            col && col.AddClass('-last-sticky')
            col && col.Dispatch('ColumnPositionChange', {column: col});

        }, 200);


    }

    /**
     * Скроллирует список
     * @param {Element} element элемент
     * @param {Element} container котейнер
     * @param {number} correctionCoefficient коэфициент корректировки
     * @param {bool} direction направление
     */
    __customScroll(element, container, correctionCoefficient, direction){

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
            if(removeGroups) {
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
                if(row instanceof Colibri.UI.Grid.Row) {
                    if(callback(rname, row, irow) === false) {
                        cancel = true;
                        return false;
                    }
                }
                return true;
            });
            if(cancel) {
                return false;
            }
            return true;
        });
    }

    DeleteAllExcept(found) {
        
        let collected = [];
        this.ForEveryRow((name, row) => {
            if(found.indexOf(name) === -1) {
                collected.push(row);
            }
        });

        for(const row of collected) {
            row.Dispose();
        }

    }


    /** @protected */
    _registerEvents() {
        super._registerEvents();

        this.RegisterEvent('HighlightedItemChanged', false, 'Поднимается, когда меняется подствеченный элемент');
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда выбирают элемент');
        this.RegisterEvent('CheckChanged', false, 'Поднимается, когда изменяется выбор галочек');
        this.RegisterEvent('RowsCheckboxClicked', false, 'Rows checkbox clicked');
        this.RegisterEvent('RowsCheckboxContextMenuItemClicked', false, 'Rows checkbox contextmenu clicked');

        this.RegisterEvent('ScrolledToBottom', false, 'Поднимается, когда грид доскролили до конца');

        this.RegisterEvent('ColumnVerticalAlignChanged', false, 'Изменилась вертикальная ориентация колонки')
        this.RegisterEvent('ColumnHorizontalAlignChanged', false, 'Изменилась горизонтальная ориентация колонки')
        this.RegisterEvent('ColumnVisibilityChanged', false, 'When column visibility is changed')
        this.RegisterEvent('ColumnClicked', false, 'Поднимается, когда щелкнули по колонке в заголовке');
        this.RegisterEvent('ColumnStickyChange', false, 'Поднимается, когда колонка меняет липкость');
        this.RegisterEvent('ColumnDisposed', false, 'Поднимается, когда удаляют колонку');
        this.RegisterEvent('ColumnEditorChanged', false, 'Когда изменился редактор в колонке');
        this.RegisterEvent('ColumnViewerChanged', false, 'Когда изменился компонент отображения в колонке');
        this.RegisterEvent('SortChanged', false, 'When sort column or order is changed');

        this.RegisterEvent('RowClicked', false, 'Поднимается, когда щелкнули по строке');
        this.RegisterEvent('RowStickyChange', false, 'Поднимается, когда строка меняет липкость');
        this.RegisterEvent('RowSelected', false, 'Поднимается, когда выбирают строку');
        this.RegisterEvent('RowDisposed', false, 'Поднимается, когда удаляют строку');
        this.RegisterEvent('RowAdded', false, 'Поднимается, когда добавилась строка');
        this.RegisterEvent('RowUpdated', false, 'Поднимается, когда обновилась строка');

        this.RegisterEvent('CellClicked', false, 'Поднимается, когда щелкнули по ячейке');
        this.RegisterEvent('CellDoubleClicked', false, 'Поднимается, когда щелкнули по ячейке');
        this.RegisterEvent('CellValueChanged', false, 'Когда встреенный редактор отправил Changed');
        this.RegisterEvent('CellViewerClicked', false, 'Когда кникнули на компонент отображения в колонке');
        this.RegisterEvent('CellEditorChanged', false, 'Когда редактирование ячейки завершено');
        this.RegisterEvent('MassActionsMenuActionClicked', false, 'Когда кликнули на кнопку внутри меню массовых операций');

    }

    _setSortAndOrder(column) {
        if(!column.sortable) {
            return;
        }
        
        const check = [this._sortColumn?.name, this._sortOrder];
        if(this._sortColumn && this._sortColumn === column) {
            if(this._sortOrder === null) {
                this._sortOrder = Colibri.UI.Grid.SortAsc;
            }
            else if(this._sortOrder === Colibri.UI.Grid.SortAsc) {
                this._sortOrder = Colibri.UI.Grid.SortDesc;
            }
            else if(this._sortOrder === Colibri.UI.Grid.SortDesc) {
                this._sortOrder = null;
            }
        }
        else if(!this._sortColumn || this._sortColumn !== column) {
            // убираем со старого
            this._sortColumn && (this._sortColumn.sortState = null);

            this._sortColumn = column;
            this._sortOrder = Colibri.UI.Grid.SortAsc;
        }

        this._sortColumn.sortState = this._sortOrder;

        if(JSON.stringify(check) !== JSON.stringify([this._sortColumn?.name, this._sortOrder])) {
            this.Dispatch('SortChanged', {sortColumn: this._sortColumn, order: this._sortOrder});
        }

    }

    Sort(columnName, order) {
        this._sortColumn = this.header.FindColumn(columnName);
        this._sortOrder = order;
        this.Dispatch('SortChanged', {sortColumn: this._sortColumn, order: this._sortOrder});
    }

    /**
     * Регистрация обработчиков событий
     */
    _handleEvents() {

        this.AddHandler('Clicked', this.__clickedProcessing);

        this.AddHandler('SelectionChanged', (event, args) => {
            if(args.item) {
                this.ForEveryRow((name, row) => {
                    if(row.ContainsClass('-editing') && row != args.item) {
                        row.EndEdit();
                    }
                })
            }
        });

        this.AddHandler('RowSelected', (event, args) => {
            if(this.checked.length == 0) {
                this.header.checkbox.checked = false;
            }
            this.Dispatch('CheckChanged');
        });

        this.AddHandler('KeyDown', this.__processKeydown);

        this.header.ForEach((name, columns) => columns.AddHandler('ColumnMoved', (event, args) => {
            this.ForEveryRow((name, row) => {
                const cell = row.Children(row.name + '-' + args.column.name);
                if(args.direction === 'up') {
                    cell.MoveUp();
                } else if(args.direction === 'down') {
                    cell.MoveDown();
                }
            });
        })); 


        this.header.ForEach((name, columns) => columns.AddHandler('ColumnAdded', (event, args) => {
            Object.forEach(this.groups, (name, rows) => {
                rows.columns = this.header.columnsCount;
            });
            this.RecalculateCellPositions();
        }));

        this.header.AddHandler('ColumnDisposed', (event, args) => {
            Object.forEach(this.groups, (name, rows) => {
                rows.columns = this.header.columnsCount;
            });
            this.Dispatch('ColumnDisposed', args);
        });

        this.header.AddHandler('ColumnStickyChange', (event, args) => {
            this.Dispatch('ColumnStickyChange', args);
        });

        this.header.AddHandler('ColumnClicked', (event, args) => {
            this._setSortAndOrder(args.column);
            this.Dispatch('ColumnClicked', args);
        });

        this._scrolling = -1;
        this._scrollY = -1;
        this._element.addEventListener('scroll', (event) => {
            if(event.target.scrollTop > this._scrollY) {                    
                if (this._gridContent._element.getBoundingClientRect().bottom < (event.target.getBoundingClientRect().bottom + 10)) {
                    clearTimeout(this._scrolling);
                    this._scrolling = setTimeout(() => {
                        this.Dispatch('ScrolledToBottom', {});
                    }, 66);
                }
            }
            this._scrollY = event.target.scrollTop;
        });

        this.AddHandler('ColumnEditorChanged', (event, args) => {
            const rowsName = this.rows.name;
            this.ForEveryRow((name, component) => {
                if(component instanceof Colibri.UI.Grid.Cell) {
                    component.editor = this.header.FindColumn(name).editor;
                }
            });
        });

        this.AddHandler('ColumnViewerChanged', (event, args) => {
            const rowsName = this.rows.name;
            this.ForEveryRow((name, component) => {
                if(component instanceof Colibri.UI.Grid.Cell) {
                    component.viewer = this.header.FindColumn(name).viewer;
                }
            });
        });

        this.AddHandler('VerticalAlignChanged', (event, args) => {
            const rowsName = this.rows.name;
            this.ForEveryRow((name, component) => {
                if(component instanceof Colibri.UI.Grid.Cell) {
                    component.align = this.header.FindColumn(name).align;
                }
            });
        });

        this.AddHandler('ColumnVisibilityChanged', (event, args) => {
            this.RecalculateCellVisibility(args.column);
        });

    }

    /**
     * Есть ли меню массовых операций
     * @type {boolean}
     */
    get hasMassActionsMenu() {
        return this._hasMassActionsMenu;
    }
    set hasMassActionsMenu(value) {
        this._hasMassActionsMenu = (value === true || value === 'true' || value === 1);
        if (this._hasMassActionsMenu) { this._setShowCheckboxes(true) }
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
        if(value instanceof String) {
            value = eval(value);
        }
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
                let actionsMenu = new cl(this.name + '-mass-actions-menu', container || document.body);
                actionsMenu.parent = this;
    
                this.AddHandler('RowSelected', (event, args) => {
                    actionsMenu.selectedItems = this.checked;
                });
    
                actionsMenu.AddHandler('ActionClicked', (event, args) => {
                    this.Dispatch('MassActionsMenuActionClicked', Object.assign({items: this.checked}, args));
                });
    
                this._massActionsMenuObject = actionsMenu;
                    
            }

            this._massActionsMenuObject.actions = this._massActionsMenu;
            this._massActionsMenuObject.selectedItems = this.checked;
            this._massActionsMenuObject.shown = true;
            this._massActionsMenuObject.styles = {'max-width': container.container.bounds().outerWidth + 'px'};

        }
    }

    RecalculateCellVisibility(column) {
        this.ForEveryRow((name, row) => {
            row.ForEach((name, cell) => {
                if(cell.parentColumn) {
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

        if(!value) {
            value = [];
        }

        if(Object.isObject(value)) {
            value = Object.values(value);
        }

        this.ClearAllRows();
        value.forEach((d) => {
            this.rows.Add('data' + (d.id ?? Date.Mc()), d);
        });

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
    }

}