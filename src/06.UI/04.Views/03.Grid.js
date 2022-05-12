// const grid = new Colibri.UI.Grid('grid', document.body);
// grid.shown = true;      // показываем грид
// grid.showCheckboxes = false;    // показывать чекбоксы для строк (def false)
// grid.multiple = false;       // мульти выбор (def false)
// grid.cycleSelection = true;     // переход на другую ячейку другой строки при конце строки (def false)
// grid.selectionMode = Colibri.UI.Grid.FullRow;     // выбор строками (Colibri.UI.Grid.FullRow / Colibri.UI.Grid.EveryCell)
// let column1 = grid.header.columns.Add('column-1', 'column-1'); // добавить колонку
// column1.sticky = true; // приклеить колонку
// grid.rows.Add('row-name', {column1: 'value'});  // добавить строку со значениями

/**
 * Класс ГРИД
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
     * Конструктор
     * @param {string} name название компонента
     * @param {Element|Colibri.UI.Component} container контейнер
     * @param {string|Element} element содержание
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

        this._gridContent = new Colibri.UI.Component('app-ui-grid-content', this, '<table />');
        this._gridContent.shown = true;

        this._header = this.AddHeader('header');

        this._rows = this.AddGroup('default', null);
        this._norows = new Colibri.UI.Pane('app-ui-grid-norows', this, '<div />');
        this._norows.shown = true;

        this._footer = this.AddFooter('footer');

        this.GenerateChildren(element);

        this.tabIndex = 0;
        this._handleEvents();
    }

    /**
     * Возвращает хедер
     */
    get header() {
        return this._header;
    }

    /**
     * Возвращает подвал
     * @returns Colibri.UI.Pane
     */
    get footer() {
        return this._footer;
    }

    /**
     * Возвращает группу строк по умолчамнию
     * @returns Colibri.UI.Grid.Rows
     */
    get rows() {
        return this._rows;
    }

    /**
     * Возвращает массив групп строк
     * @returns Colibri.UI.Grid.Rows[]
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
     * @returns Colibri.UI.Component[]
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
     * @returns Colibri.UI.Component[]
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
     * @returns bool
     */
    get showCheckboxes() {
        return this._showCheckboxes;
    }

    /**
     * Отобразить чекбоксы  
     * @param {bool} value
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
     * @returns bool
     */
    get multiple() {
        return this._multiple;
    }

    /**
     * Режим выделения
     * @param {bool} value
     */
    set multiple(value) {
        this._multiple = value;
    }

    /**
     * Режим выделения
     * @returns Colibri.UI.Grid.FullRow|Colibri.UI.Grid.EveryCell
     */
    get selectionMode() {
        return this._selectionMode;
    }

    /**
     * Режим выделения
     * @param {Colibri.UI.Grid.FullRow|Colibri.UI.Grid.EveryCell} value
     */
    set selectionMode(value) {
        this._selectionMode = value;
    }

    /**
     * Режим циклического селекта
     * @returns bool
     */
    get cycleSelection() {
        return this._cycleSelection;
    }

    /**
     * Режим циклического селекта
     * @param {bool} value
     */
    set cycleSelection(value) {
        this._cycleSelection = value;
    }

    /**
     * Активная ячейка
     * @returns Colibri.UI.Cell
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
        this._sortOrder = Colibri.UI.Grid.SortAsc;
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
            this.__recalculateCellPositions();
            this.Dispatch('RowDisposed', args);
        });

        rows.AddHandler('StickyChanged', (event, args) => {
            this.__recalculateCellPositions();
        });

        rows.AddHandler('GridCellsChanged', (event, args) => {
            this.__recalculateCellPositions();
        });

        rows.AddHandler('RowAdded', (event, args) => {
            this._norows.shown = false;
            this._gridContent.shown = true;
            Object.forEach(this.groups, (name, rows) => {
                rows.columns = this.header.columns.count;
            });
            this.__recalculateCellPositions();
            this.Dispatch('RowAdded', {row: args.row});
        });

        rows.AddHandler('RowUpdated', (event, args) => {
            this.__recalculateCellPositions();
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
                        newActiveRow = firstGroup.firstRow;
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
    __recalculateCellPositions() {

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
            this.header.columns.ForEach((nameColumn, column) => {
                column._widthPrevStickyCell = tempWidthPrevStickyCell;
                if (column.sticky) {
                    tempWidthPrevStickyCell += parseFloat(column._element.css('width'));
                    if (!tempWidth) {
                        tempWidth = parseFloat(column._element.css('width'));
                    }
                    column.left = tempWidth;
                    column._positionLeft = tempWidth;
                    tempWidth += parseFloat(column._element.css('width'));
                    column.Dispatch('ColumnPositionChange', {column: column});
                }
            });

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
        this.header.columns.ForEach((name, column) => {
            if(name != 'button-container-for-row-selection') {
                column.Dispose();
            }
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

    /**
     * Регистрация событий
     */
    _registerEvents() {
        super._registerEvents();

        this.RegisterEvent('HighlightedItemChanged', false, 'Поднимается, когда меняется подствеченный элемент');
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда выбирают элемент');
        this.RegisterEvent('CheckChanged', false, 'Поднимается, когда изменяется выбор галочек');

        this.RegisterEvent('ScrolledToBottom', false, 'Поднимается, когда грид доскролили до конца');
        this.RegisterEvent('VerticalAlignChanged', false, 'Изменилась вертикальная ориентация колонки')

        this.RegisterEvent('ColumnClicked', false, 'Поднимается, когда щелкнули по колонке в заголовке');
        this.RegisterEvent('ColumnStickyChange', false, 'Поднимается, когда колонка меняет липкость');
        this.RegisterEvent('ColumnDisposed', false, 'Поднимается, когда удаляют колонку');
        this.RegisterEvent('ColumnEditorChanged', false, 'Когда изменился редактор в колонке');
        this.RegisterEvent('ColumnViewerChanged', false, 'Когда изменился компонент отображения в колонке');

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

        this.header.columns.AddHandler('ColumnAdded', (event, args) => {
            Object.forEach(this.groups, (name, rows) => {
                rows.columns = this.header.columns.count;
            });
            this.__recalculateCellPositions();
        });

        this.header.AddHandler('ColumnDisposed', (event, args) => {
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
                    component.editor = this.columns.Children(name).editor;
                }
            });
        });

        this.AddHandler('ColumnViewerChanged', (event, args) => {
            const rowsName = this.rows.name;
            this.ForEveryRow((name, component) => {
                if(component instanceof Colibri.UI.Grid.Cell) {
                    component.viewer = this.columns.Children(name).viewer;
                }
            });
        });

        this.AddHandler('VerticalAlignChanged', (event, args) => {
            const rowsName = this.rows.name;
            this.ForEveryRow((name, component) => {
                if(component instanceof Colibri.UI.Grid.Cell) {
                    component.align = this.columns.Children(name).align;
                }
            });
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
        this._massActionsMenuClass = value;
    }

    /**
     * Показать меню массовых операций
     * @param container
     */
    ShowMassActionsMenu(container) {
        let actionsMenuClass = eval(this._massActionsMenuClass);
        if (actionsMenuClass) {
            if (!this._massActionsMenuObject) { 
                let actionsMenu = new Colibri.UI.MassActionsMenu(this.name + '-mass-actions-menu', container || document.body);
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

        }
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

        if(!data || (!Array.isArray(data) && data instanceof Object)) {
            data = Object.values(data);
        }

        this.ClearAllRows();
        value.forEach((d) => {
            this.rows.Add('data' + d.id, d);
        });

    }

    get value() {
        const ret = [];
        this.ForEveryRow((row) => {
            ret.push(row.value);
        });
        return ret;
    }

}
/**
 * Класс заголовка таблицы
 */
Colibri.UI.Grid.Header = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<thead />');

        this._sticky = true;
        this._grid = this.parent.parent;

        this._columns = new Colibri.UI.Grid.Columns('app-ui-header-columns', this);
        this._columns.AddClass('app-ui-header-columns');
        this._columns.shown = true;

        let columnSelectionButtons = this.columns.Add('button-container-for-row-selection', '');
        columnSelectionButtons.shown = this.grid.showCheckboxes;

        this._checkbox = new Colibri.UI.Checkbox('row-checkbox', columnSelectionButtons);
        this._checkbox.hasThirdState = true;
        this._checkbox.shown = true;

        this._handleEvents();
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ColumnAdded', false, 'Поднимается, когда добавляется колонка');
        this.RegisterEvent('ColumnStickyChange', false, 'Поднимается, когда колонка меняет липкость');
        this.RegisterEvent('ColumnClicked', false, 'Поднимается, когда щелкнули по колонке в заголовке');
        this.RegisterEvent('ColumnDisposed', false, 'Поднимается, когда удалили колонку');
    }

    _handleEvents() {
        this._columns.AddHandler('ColumnAdded', (event, args) => {
            this.Dispatch('ColumnAdded', args);
        });

        this._columns.AddHandler('ColumnStickyChange', (event, args) => {
            this.Dispatch('ColumnStickyChange', args);
        });

        this._columns.AddHandler('ColumnClicked', (event, args) => {
            this.Dispatch('ColumnClicked', args);
        });

        this._columns.AddHandler('ColumnDisposed', (event, args) => {
            this.Dispatch('ColumnDisposed', args);
        });
        this._checkbox.AddHandler('Changed', (event, args) => {
            Object.forEach(this.grid.groups, (name, group) => {
                group.ForEach((name, row) => {
                    if(row.shown) {
                        row.checked = args.value;
                    }
                    else {
                        row.checked = false;
                    }
                });    
                group.checkbox.checked = args.value;
            });
            this.checkbox.thirdState = this.grid.rowsCount > this.grid.checked.length;
            Object.forEach(this.grid.groups, (name, group) => {
                group.checkbox.thirdState = group.rowsCount > group.checked.length;
            });
            this.grid.Dispatch('RowSelected');
        });
    }

    get checkbox() {
        return this._checkbox;
    }

    get columns() {
        return this._columns;
    }

    get grid() {
        return this._grid;
    }

    get sticky() {
        return this._sticky;
    }



}

/**
 * Класс списка колонок
 */
Colibri.UI.Grid.Columns = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<tr />');
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ColumnAdded', false, 'Поднимается, когда добавляется колонка');
        this.RegisterEvent('ColumnStickyChange', false, 'Поднимается, когда колонка меняет липкость');
        this.RegisterEvent('ColumnClicked', false, 'Поднимается, когда щелкнули по колонке в заголовке');
        this.RegisterEvent('ColumnDisposed', false, 'Поднимается, когда удалили колонку');
    }

    Add(name, title, attrs = {}) {
        let newColumn = new Colibri.UI.Grid.Column(name, this);
        newColumn.value = title;
        newColumn.shown = true;

        Object.forEach(attrs, (name, attr) => {
            newColumn[name] = attr;
        });

        this.Dispatch('ColumnAdded', {column: newColumn});

        newColumn.AddHandler('ColumnStickyChange', (event, args) => {
            this.Dispatch('ColumnStickyChange', args);
        });

        newColumn.AddHandler('ColumnClicked', (event, args) => {
            this.Dispatch('ColumnClicked', args);
        });

        newColumn.AddHandler('ColumnDisposed', (event, args) => {
            this.Dispatch('ColumnDisposed', args);
        });

        return newColumn;
    }

    get grid() {
        return this.parent.grid;
    }

    get count() {
        return this.children - 1;
    }
}
/**
 * Класс колонки
 */
Colibri.UI.Grid.Column = class extends Colibri.UI.Component {

    constructor(name, container, element) {
        super(name, container, '<td />');
        this.AddClass('app-ui-column');
        this.AddClass('position-sticky-y');
        // this.shown = this.parent.shown;

        this.sticky = false;
        this._resizable = false;
        this._resizeHandler = null;

        this._handleEvents();

        this._editor = null;
        this._viewer = null;
        this._sortIcons = {
            asc: Colibri.UI.SortAscIcon,
            desc: Colibri.UI.SortDescIcon
        };

        this.GenerateChildren(element);

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ColumnStickyChange', false, 'Поднимается, когда колонка меняет липкость');
        this.RegisterEvent('ColumnClicked', false, 'Поднимается, когда щелкнули по колонке в заголовке');
        this.RegisterEvent('ColumnDisposed', false, 'Поднимается, когда удалили колонку');
        this.RegisterEvent('ColumnPositionChange', false, 'Поднимается, когда колонка изменила положение липкости');
    }

    _handleEvents() {
        this.AddHandler('Clicked', (event, args) => {
            this.Dispatch('ColumnClicked', {column: this});
        });
        this.AddHandler('ComponentDisposed', (event, args) => {
            this.Dispatch('ColumnDisposed', {column: this});
        });
    }
    
    Dispose() {
        super.Dispose();
        this.Dispatch('ColumnDisposed', {column: this});
    }

    get sticky() {
        return this._sticky;
    }

    set sticky(value) {
        if (value) {
            this.AddClass('position-sticky-x');
        } else {
            this.RemoveClass('position-sticky-x');
            this._element.style.left = '';
        }

        if (this._sticky !== value) {
            this._sticky = value;
            this.Dispatch('ColumnStickyChange', {column: this});
        }
    }

    get resizable() {
        return this._resizable;
    }

    set resizable(value) {
        value = (value === 'true' || value === true);
        this._resizable = value;
        if(this._resizable) {
            this._createResizeHandler();
        }
        else {
            this._removeResizeHandler();
        }
    }

    get sortable() {
        return this._sortable;
    }

    set sortable(value) {
        value = (value === 'true' || value === true);
        this._sortable = value;
        if(this._sortable) {
            this._createSortHandler();
        }
        else {
            this._removeSortHandler();
        }
    }

    get sortState() {
        return this._sortState;
    }
    set sortState(value) {
        this._sortState = value;
        this._sortHandler && this._sortHandler.html(value ? this._sortIcons[value] : '');
    }

    _bindResizeEvents() {

        const stopClick = (e) => { e.preventDefault(); e.stopPropagation(); return false; };

        const startResize = (e) => {
            this._resizing = true;
            Colibri.UI.Resizing = true;
            
            const next = this.container.next().tag('component');
            if(!next) {
                return false;
            }
            const parentBounds = this.parent.container.bounds();

            this._resizeData = {width: this.container.bounds().outerWidth, nextWidth: next.container.bounds().outerWidth, full: parentBounds.outerWidth, x: e.pageX};

            // ставим на документ, чтобы точно перехватить        
            document.addEventListener("touchend", stopResize, {capture: true});
            document.addEventListener("mouseup", stopResize, {capture: true});

            document.addEventListener("touchmove", doResize, {capture: true});
            document.addEventListener("mousemove", doResize, {capture: true});

            e.preventDefault();
            e.stopPropagation();
            return false;

        };

        const stopResize = (e) => {
            e.preventDefault();
            e.stopPropagation();
        
            this._resizing = false;
            Colibri.UI.Resizing = false;

            document.removeEventListener("touchend", stopResize, {capture: true});
            document.removeEventListener("mouseup", stopResize, {capture: true});
    
            document.removeEventListener("touchmove", doResize, {capture: true});
            document.removeEventListener("mousemove", doResize, {capture: true});

            return false;

        };

        const doResize = (e) => {
            if (this._resizing) {
                e.preventDefault();
                e.stopPropagation();

                const next = this.container.next().tag('component');
                const newWidth = (this._resizeData.width + (e.pageX - this._resizeData.x)).percentOf(this._resizeData.full);
                const newNextWidth = (this._resizeData.nextWidth - (e.pageX - this._resizeData.x)).percentOf(this._resizeData.full);

                if(newWidth < 1 || newNextWidth < 1) {
                    return false;
                }

                this.container.css('width', newWidth.toFixed(2) + '%');
                next.container.css('width', newNextWidth.toFixed(2) + '%'); 

                return false;
            }
        };

        this._resizeHandler.addEventListener("touchstart", startResize, false);
        this._resizeHandler.addEventListener("mousedown", startResize, false);
        this._resizeHandler.addEventListener("click", stopClick, false);
        this._resizeHandler.addEventListener("dblclick", stopClick, false);

    }

    _createResizeHandler() {
        this._resizeHandler = Element.create('span', {class: 'resize-border'});
        this._bindResizeEvents();
        this._element.append(this._resizeHandler);
    }

    _removeResizeHandler() {
        this._resizeHandler && this._resizeHandler.remove();
    }

    _createSortHandler() {
        this._sortHandler = Element.create('span', {class: 'sort-handler'});
        this._element.append(this._sortHandler);
    }

    _removeSortHandler() {
        this._sortHandler && this._sortHandler.remove();
    }

    get grid() {
        return this.parent;
    }

    get editor() {
        return this._editor;
    }
    set editor(value) {
        this._editor = value;
        this.grid.Dispatch('ColumnEditorChanged', {column: this});
    }

    get viewer() {
        return this._viewer;
    }
    set viewer(value) {
        this._viewer = value;
        this.grid.Dispatch('ColumnViewerChanged', {column: this});
    }

    get align() {
        return this._align;
    }
    set align(value) {
        this._align = value;
        this.grid.Dispatch('ColumnVerticalAlignChanged', {column: this});
    }

    set editorAllways(value) {
        this._editorAllways = value;
    }
    
    get editorAllways() {
        return this._editorAllways;
    }

    set download(value) {
        this._download = value;
    }

    get download() {
        return this._download;
    }


}

/**
 * Класс группы строк
 */
Colibri.UI.Grid.Rows = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<tbody />');

        this._tempCountRowsReportedCellsChange = 0;

        this._title = new Colibri.UI.Component('rows-title', this, '<tr />');
        this._title.AddClass('app-ui-rows-group');
        this.__addButtonContainerForRowSelection();
        this._titleCell = new Colibri.UI.Component('rows-title-cell', this._title, '<td />');
        this._titleCell.shown = true;
        this._titleCellSpan = new Colibri.UI.TextSpan('rows-title-span', this._titleCell);
        this._titleCellSpan.shown = true;
        this._titleCellCountSpan = new Colibri.UI.TextSpan('rows-title-rowscount-span', this._titleCell);
        this._titleCellCountSpan.shown = true;
        this._titleCellArrow = new Colibri.UI.Icon('rows-title-icon', this._titleCell);
        this._titleCellArrow.shown = true;
        this._titleCellArrow.value = Colibri.UI.DownArrowIcon;
        this.title = 'По умолчанию';
        this.columns = this.grid.header.columns.count;

        this._titleCell.AddHandler('Clicked', (event, args) => {
            this.closed = !this.closed;
        });

    }

    __addButtonContainerForRowSelection() {

        this._checkboxContainer = new Colibri.UI.Component('button-container-for-row-selection', this._title, '<td />');
        this._checkboxContainer.AddClass('app-ui-row-cell');
        this._checkboxContainer.shown = this.grid.showCheckboxes;
        if (this.grid.showCheckboxes) {
            this._checkboxContainer.AddClass('input-checkbox-shown');
        }

        this._checkbox = new Colibri.UI.Checkbox('row-checkbox', this._checkboxContainer);
        this._checkbox.hasThirdState = true;
        this._checkbox.shown = true;

        this._checkbox.AddHandler('Changed', (event, args) => {
            this.ForEach((name, row) => {
                if(row.shown) {
                    row.checked = args.value;
                }
                else {
                    row.checked = false;
                }
            });    
            this.grid.header.checkbox.thirdState = this.grid.rowsCount > this.grid.checked.length;
            this.checkbox.thirdState = this.rowsCount > this.checked.length;
            this.grid.Dispatch('RowSelected');
        });

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('RowAdded', false, 'Поднимается, когда добавляется строка');
        this.RegisterEvent('RowUpdated', false, 'Поднимается, когда обновляется строка');
        this.RegisterEvent('RowStickyChange', false, 'Поднимается, когда строка меняет липкость');
        this.RegisterEvent('RowClicked', false, 'Поднимается, когда щелкнули по строке');
        this.RegisterEvent('CellClicked', false, 'Поднимается, когда щелкнули по ячейке');
        this.RegisterEvent('CellDoubleClicked', false, 'Поднимается, когда дважды щелкнули по ячейке');
        this.RegisterEvent('RowSelected', false, 'Поднимается, когда выбирают строку');
        this.RegisterEvent('RowDisposed', false, 'Поднимается, когда удалили строку');
        this.RegisterEvent('GridCellsChanged', false, 'Поднимается, когда все строки сообщили об изменении ячеек (sticky/dispose)');
        this.RegisterEvent('StickyChanged', false, 'Поднимается, когда все ячейки сообщили об изменинии sticky');
    }

    Add(name, value, index = null) {
        this.shown = true;
        let newRow = new Colibri.UI.Grid.Row(name, this);
        newRow.value = value;
        newRow.hasContextMenu = this.grid.hasContextMenu;

        // добавили, смотрим есть ли сортировка
        if(this.grid?.tag?.params?.sort) {
            const foundIndex = this.grid.tag.params.sort(newRow, this);
            this.Children(name, newRow, foundIndex);
        }
        else if(index) {
            this.Children(name, newRow, index);
        }

        this.Dispatch('RowAdded', {row: newRow});

        newRow.AddHandler('RowUpdated', (event, args) => {
            if(this.grid?.tag?.params?.sort) {
                const foundIndex = this.grid.tag.params.sort(newRow, this);
                this.Children(newRow.name, newRow, foundIndex);
            }
            this.Dispatch('RowUpdated', {row: args.row});
        });

        newRow.AddHandler('RowStickyChange', (event, args) => {
            this.Dispatch('RowStickyChange', args);
        });

        newRow.AddHandler('CellClicked', (event, args) => {
            this.Dispatch('CellClicked', args);
        });

        newRow.AddHandler('CellDoubleClicked', (event, args) => {
            this.Dispatch('CellDoubleClicked', args);
        });

        newRow.AddHandler('RowSelected', (event, args) => {
            if (this.grid.selectionMode === Colibri.UI.Grid.FullRow) {
                if (!this.grid.multiple) { 
                    this.grid.UnselectAllRows();
                }
                //args.row.selected = !args.row.selected;
                this.Dispatch('RowSelected', args);
            }
        });

        newRow.AddHandler('ComponentDisposed', (event, args) => {
            this.Dispatch('RowDisposed', {row: newRow});
        });

        newRow.AddHandler('CellHorizontalStickyChanged', (event, args) => {
            this._tempCountRowsReportedCellsChange = this._tempCountRowsReportedCellsChange + 1;
            if (this.rowsCount === this._tempCountRowsReportedCellsChange) {
                this._tempCountRowsReportedCellsChange = 0;
                this.Dispatch('GridCellsChanged', {rows: this});
            }
        });

        newRow.AddHandler('CellDisposed', (event, args) => {
            this._tempCountRowsReportedCellsChange = this._tempCountRowsReportedCellsChange + 1;
            if (this.rowsCount === this._tempCountRowsReportedCellsChange) {
                this._tempCountRowsReportedCellsChange = 0;
                this.Dispatch('GridCellsChanged', {rows: this});
            }
        });

        newRow.AddHandler('StickyChanged', (event, args) => {
            this.Dispatch('StickyChanged', args);
        });

        this._titleCellCountSpan.value = ' (' + this.rowsCount + ')';

        return newRow;
    }

    get checkbox() {
        return this._checkbox;
    }

    get selected() {
        let selectedRow = [];
        this.ForEach((nameRow, row) => {
            if(row instanceof Colibri.UI.Grid.Row) {
                row.selected ? selectedRow.push(row) : '';
            }
        });
        return selectedRow;
    }

    get checked() {
        let checkedRows = [];
        this.ForEach((nameRow, row) => {
            if(row instanceof Colibri.UI.Grid.Row) {
                row.checked ? checkedRows.push(row) : '';
            }
        });
        return checkedRows;
    }

    get activeRow() {
        let activeRow = null;
        this.ForEach((rowName, row) => {
            if (row.activated) {
                activeRow = row;
            }
        });
        return activeRow;
    }

    get grid() {
        return this.parent.parent;
    }

    get prevGroup() {
        if(this.prev instanceof Colibri.UI.Grid.Rows) {
            return this.prev;
        }
        return null;
    }

    get nextGroup() {
        if(this.next instanceof Colibri.UI.Grid.Rows) {
            return this.next;
        }
        return null;
    }

    get rowsCount() {
        return this.children - 1;
    }


    get firstRow() {
        return this.Children('firstChild').next;
    }

    get lastRow() {
        return this.Children('lastChild');
    }

    set title(value) {
        this._titleCellSpan.value = value;
        this._title.shown = !!value;
    }

    get title() {
        return this._titleCellSpan.value; 
    }

    get titleCell() {
        return this._titleCell;
    }

    set columns(count) {
        this._titleCell.container.attr('colspan', count);
    }

    set showCheckbox(value) {
        this._title.Children('button-container-for-row-selection').shown = value;
    }

    get closed() {
        return this.ContainsClass('-closed');
    }

    set closed(value) {
        if(value) {
            this.AddClass('-closed');
        }
        else {
            this.RemoveClass('-closed');
        }
    }

    Clear() {
        this.ForEach((name, component) => {
            if(component instanceof Colibri.UI.Grid.Row) {
                component.Dispose();
            }
        });
    }

    ForEveryRow(callback) {
        this.ForEach((rname, row, irow) => {
            if(row instanceof Colibri.UI.Grid.Row) {
                if(callback(rname, row, irow) === false) {
                    return false;
                }
            }
            return true;
        });
    }
}

/**
 * Класс строки
 */
Colibri.UI.Grid.Row = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<tr />');
        this.AddClass('app-ui-row');
        this.shown = this.parent.shown;

        this.countCells = 0;
        this._tempCountCellsReportedChange = 0;

        this._heightPrevStickyRow = this.header.shown ? this.header.height : 0;

        this.sticky = false;
        this.activated = false;

        this._checkbox = null;
        this._checkboxContainer = null;
        this.__addButtonContainerForRowSelection();

        this._handleEvents();

        this._data = null;

        this.draggable = this.grid.draggable;
        this.dropable = this.grid.dropable;

    }

    _columnAddedHandler = (event, args) => {
        this.__newCell('', args.column);
    }

    Dispose() {
        this.grid._rowSelectionCheckbox.delete(this._checkboxContainer);
        this.header.columns.RemoveHandler('ColumnAdded', this._columnAddedHandler);
        super.Dispose();
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('RowStickyChange', false, 'Поднимается, когда строка меняет липкость');
        this.RegisterEvent('CellClicked', false, 'Поднимается, когда щелкнули по ячейке');
        this.RegisterEvent('CellDoubleClicked', false, 'Поднимается, когда дважды щелкнули по ячейке');
        this.RegisterEvent('RowSelected', false, 'Поднимается, когда выбирают строку');
        this.RegisterEvent('RowClicked', false, 'Поднимается, когда кликнули по строке');
        this.RegisterEvent('RowUpdated', false, 'Поднимается, когда обновили данные строки');
        this.RegisterEvent('CellHorizontalStickyChanged', false, 'Поднимается, когда ячейка меняет sticky по горизонтали');
        this.RegisterEvent('StickyChanged', false, 'Поднимается, когда все ячейки сообщили об изменинии sticky');
        this.RegisterEvent('CellDisposed', false, 'Поднимается, когда удалили ячейку');
        this.RegisterEvent('RowPositionChange', false, 'Поднимается, когда меняется положение липкости');
    }

    _handleEvents() {

        this.header.columns.AddHandler('ColumnAdded', this._columnAddedHandler);
        
        this.AddHandler('RowStickyChange', (event, args) => {
            if(!this._checkboxContainer) {
                return true;
            }

            if (args.row.sticky) {
                this._checkboxContainer.AddClass('position-sticky-y');
            } else {
                this._checkboxContainer.RemoveClass('position-sticky-y');
            }
            this._checkboxContainer._stickyVertically = args.row.sticky;
        });

        this.AddHandler('RowPositionChange', (event, args) => {
            if(!this._checkboxContainer) {
                return true;
            }

            if (this._checkboxContainer._stickyVertically) {
                this._checkboxContainer._element.css('top', args.row._positionTop + 'px');
            }
        });

        this.AddHandler('ContextMenuIconClicked', (event, args) => this.grid.Dispatch('ContextMenuIconClicked', Object.assign({item: this}, args)));
        this.AddHandler('ContextMenuItemClicked', (event, args) => this.grid.Dispatch('ContextMenuItemClicked', Object.assign({item: this}, args)));

    }

    __addButtonContainerForRowSelection() {

        this._checkboxContainer = new Colibri.UI.Component('button-container-for-row-selection', this, '<td />');
        this._checkboxContainer.AddClass('app-ui-row-cell');
        this._checkboxContainer.shown = this.grid.showCheckboxes;
        if (this.grid.showCheckboxes) {
            this._checkboxContainer.AddClass('input-checkbox-shown');
        }
        this.grid._rowSelectionCheckbox.add(this._checkboxContainer);

        this._checkbox = new Colibri.UI.Checkbox('row-checkbox', this._checkboxContainer);
        this._checkbox.shown = true;

        this._checkbox.AddHandler('Changed', (event, args) => {
            this.Dispatch('RowSelected', {row: this});

            this.header.checkbox.thirdState = this.grid.rowsCount > this.grid.checked.length;
            this.group.checkbox.thirdState = this.group.rowsCount > this.group.checked.length;
        });

    }
    
    set index(value) {
        this.parent.Children(this.name, this, value);   
    }

    get value() {
        let ret = Object.assign({}, this._data);
        this.header.columns.ForEach((columnName, column) => {
            if (columnName !== 'button-container-for-row-selection') {
                const cell = this.Children(this.name + '-' + column.name);
                if(cell) {
                    ret[column.name] = cell.value;
                }
            }
        });
        return ret;
    }

    set value(value) {
        this._data = Object.assign({}, value);
        this.header.columns.ForEach((columnName, column) => {
            if (columnName !== 'button-container-for-row-selection') {
                this.__newCell(this._data, column);
            }
        });
        this.Dispatch('RowUpdated', {row: this});
        return this;
    }

    get activeCell() {
        let active = null;
        this.ForEach((cellName, cell) => {
            if(cell.activated) {
                active = cell;
                return false;
            }
            return true;
        });
        return active;
    }

    get firstCell() {
        return this.Children('firstChild').next;
    }

    get lastCell() {
        return this.Children('lastChild');
    }

    get prevRow() {
        if(this.prev instanceof Colibri.UI.Grid.Row) {
            return this.prev;
        }
        return null;
    }

    get nextRow() {
        if(this.next instanceof Colibri.UI.Grid.Row) {
            return this.next;
        }
        return null;
    }

    __newCell(value, column) {
        this.countCells = this.countCells + 1;

        let newCell = this.Children(this.name + '-' + column.name);
        if(!newCell) {

            if(this.hasContextMenu) {
                this._removeContextMenuButton();
            }

            newCell = new Colibri.UI.Grid.Cell(this.name + '-' + column.name, this);
            newCell.parentColumn = column;
            newCell.shown = true;
        
            newCell.AddHandler('CellDoubleClicked', (event, args) => {
                this.Dispatch('CellDoubleClicked', args);
            });
    
            newCell.AddHandler('CellHorizontalStickyChanged', (event, args) => {
                this.Dispatch('CellHorizontalStickyChanged', args);
            });
    
            newCell.AddHandler('CellVerticalStickyChanged', (event, args) => {
                this._tempCountCellsReportedChange = this._tempCountCellsReportedChange + 1;
                if (this.countCells === this._tempCountCellsReportedChange) {
                    this._tempCountCellsReportedChange = 0;
                    this.Dispatch('StickyChanged', {row: this});
                }
            });
    
            newCell.AddHandler('CellDisposed', (event, args) => {
                this.Dispatch('CellDisposed', args);
            });
        }

        newCell.value = column.name.indexOf('.') === -1 ? value[column.name] : eval(`value.${column.name}`);
        
        if(this.hasContextMenu) {
            this._createContextMenuButton();
        }

    }

    get sticky() {
        return this._sticky;
    }

    set sticky(value) {
        if (value) {
            this.AddClass('container-position-sticky-y');
        } else {
            this.RemoveClass('container-position-sticky-y');
        }

        if (this._sticky !== value) {
            this._sticky = value;
            this.Dispatch('RowStickyChange', {row: this});
        }

    }

    get selected() {
        return this._selected;
    }

    set selected(value) {
        value ? this.AddClass('row-selected') : this.RemoveClass('row-selected');
        this._selected = value;
    }

    get activated () {
        return this._activated;
    }

    set activated(value) {
        if (value) {
            if (this.grid.selectionMode === Colibri.UI.Grid.FullRow) {
                this.AddClass('row-active');
            }
        } else {
            if (this.grid.selectionMode === Colibri.UI.Grid.FullRow) {
                this.RemoveClass('row-active');
            }
        }
        this._activated = value;
    }

    get group() {
        return this.parent;
    }

    get grid() {
        return this.parent.parent.parent;
    }

    get header() {
        return this.grid.header;
    }

    get countCells() {
        return this._countCells;
    }

    set countCells(value) {
        this._countCells = value;
    }

    get checked() {
        return this._checkbox && this._checkbox.checked;
    }
    set checked(value) {
        this._checkbox && (this._checkbox.checked = value);
    }

    get checkboxEnabled() {
        return this._checkbox && this._checkbox.enabled;
    }
    set checkboxEnabled(value) {
        this._checkbox && (this._checkbox.enabled = value);
    }

    set checkboxTooltip(value) {
        this._checkbox && (this._checkbox.toolTip = value);
    }

    Cell(columnName) {
        return this.Children(this.name + '-' + columnName);
    }
    
    _createContextMenuButton() {
        this.lastCell.CreateContextMenuButton();
        this.AddClass('app-component-hascontextmenu');
    }

    _removeContextMenuButton() {
        this.lastCell.RemoveContextMenuButton();
        this.RemoveClass('app-component-hascontextmenu');
    }

    EndEdit() {
        this.ForEach((name, cell) => {
            cell.EndEdit && cell.EndEdit();
        })
    }


    ShowContextMenu(orientation = [Colibri.UI.ContextMenu.RT, Colibri.UI.ContextMenu.RB], className = '', point = null) {
        const cell = this.Children('lastChild');

        cell.Children(cell.name + '-contextmenu-icon-parent').AddClass('-selected');

        if(this._contextMenuObject) {
            this._contextMenuObject.Dispose();
        }
        
        const contextMenuObject = new Colibri.UI.ContextMenu(cell.name + '-contextmenu', document.body, orientation, point);
        contextMenuObject.Show(this.contextmenu, cell);
        if(className) {
            contextMenuObject.AddClass(className);
        }
        contextMenuObject.AddHandler('Clicked', (event, args) => {
            contextMenuObject.Hide();
            this.Dispatch('ContextMenuItemClicked', args);
            contextMenuObject.Dispose();            
            cell.Children(cell.name + '-contextmenu-icon-parent').RemoveClass('-selected');
        });
        

        this._contextMenuObject = contextMenuObject;
    }

    
    _getContextMenuIcon() {
        if(this.lastCell.Children(this.lastCell.name + '-contextmenu-icon-parent')) {
            return this.lastCell.Children(this.lastCell.name + '-contextmenu-icon-parent/' + this.lastCell.name + '-contextmenu-icon');
        }
        return null;
    }


}

/**
 * Класс ячейки
 */
Colibri.UI.Grid.Cell = class extends Colibri.UI.Pane {

    constructor(name, container) {
        super(name, container, '<td />');

        this.AddClass('app-ui-row-cell');

        this._valueContainer = new Colibri.UI.TextSpan('span', this);
        this._valueContainer.AddClass('app-ui-row-cell-value-container');
        this._valueContainer.shown = true;

        this._stickyHorizontally = false;
        this._stickyVertically = false;
        this._selected = false;
        this._activated = false;
        this._parentColumn = null;
        this._value = null;

        this._parentColumn = this.grid.header.columns.Children(this.columnName);
        this._editor = this._parentColumn.editor;
        this._viewer = this._parentColumn.viewer;
        this._editorObject = null;
        this._viewerObject = null;
        this._createViewer();
        this._createEditor();
        this.align = this._parentColumn.align;

        this._handleEvents();
        if(this._parentColumn.editorAllways) {
            this.EditValue();
        }
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('CellClicked', false, 'Поднимается, когда щелкнули по ячейке');
        this.RegisterEvent('CellDoubleClicked', false, 'Поднимается, когда дважды щелкнули по ячейке');
        this.RegisterEvent('CellDisposed', false, 'Поднимается, когда удалили ячейку');
        this.RegisterEvent('CellHorizontalStickyChanged', false, 'Поднимается, когда ячейка меняет липкость по горизонтали');
        this.RegisterEvent('CellVerticalStickyChanged', false, 'Поднимается, когда ячейка меняет липкость по вертикали');
        this.RegisterEvent('ViewerClicked', false, 'Кликнули на элемент отображения ячейки');
        this.RegisterEvent('EditorChanged', false, 'Изменилось значение в редакторе');
    }

    _handleEvents() {

        this.AddHandler('DoubleClicked', (event, args) => {
            this.Dispatch('CellDoubleClicked', {cell: this, row: this.parentRow});
        });

        this.AddHandler('ComponentDisposed', (event, args) => {
            this.Dispatch('CellDisposed', {cell: this});
        });


        this.parentRow.AddHandler('RowStickyChange', (event, args) => {
            this.stickyVertically = args.row.sticky;
        });

        this.parentRow.AddHandler('RowPositionChange', (event, args) => {
            if (this.stickyVertically) {
                this._element.css('top', args.row._positionTop + 'px');
            }
        });

        this.AddHandler('ViewerClicked', (event, args) => {
            this.grid.Dispatch('CellViewerClicked', {cell: this, field: this.columnName, data: this.parentRow.value});
            this.Dispatch('CellClicked', {cell: this});
            this.EditValue();
        });

        this.AddHandler('EditorChanged', (event, args) => {
            if(this.value == args.value) {
                return true;
            }

            const oldValue = this.value;
            this.value = args.value;
            this.grid.Dispatch('CellValueChanged', {cell: this, row: this.parentRow, value: event.sender.value, oldValue: oldValue});
            this.grid.Dispatch('CellEditorChanged', {cell: this, field: this.columnName, data: this.parentRow.value});
        });





    }

    get valueContainer() {
        return this._valueContainer;
    }

    get columnName() {
        return this.name.substr(this.parent.name.length + 1);
    }

    get stickyHorizontally() {
        return this._stickyHorizontally;
    }

    set stickyHorizontally(value) {
        if (value) {
            this.AddClass('position-sticky-x');
        } else {
            this.RemoveClass('position-sticky-x');
            this._element.style.left = '';
        }
        this._stickyHorizontally = value;
        this.Dispatch('CellHorizontalStickyChanged', {cell: this});
    }

    get stickyVertically() {
        return this._stickyVertically;
    }

    set stickyVertically(value) {
        if (value) {
            this.AddClass('position-sticky-y');
        } else {
            this.RemoveClass('position-sticky-y');
            this._element.style.left = '';
        }
        this._stickyVertically = value;
        this.Dispatch('CellVerticalStickyChanged', {cell: this});
    }

    set activated(value) {
        if (value) {
            if (this.grid.selectionMode === Colibri.UI.Grid.EveryCell) {
                this.AddClass('cell-active');
            }
        } else {
            if (this.grid.selectionMode === Colibri.UI.Grid.EveryCell) {
                this.RemoveClass('cell-active');
            }
        }
        this._activated = value;
    }

    get activated () {
        return this._activated;
    }

    set selected(value) {
        if (value) {
            this.AddClass('cell-selected');
        } else {
            this.RemoveClass('cell-selected');
        }
        this._selected = value;
    }

    get selected () {
        return this._selected;
    }

    get grid() {
        return this.parent.parent.parent.parent;
    }

    get parentColumn() {
        return this._parentColumn;
    }

    set parentColumn(value) {
        this._parentColumn = value;
        if(this.parentColumn !== null) {

            this.stickyHorizontally = this.parentColumn.sticky;
            this.parentColumn.AddHandler('ColumnStickyChange', (event, args) => {
                this.stickyHorizontally = args.column.sticky;
            });

            this.parentColumn.AddHandler('ColumnDisposed', (event, args) => {
                const parent = this.parent;
                this.Dispose();
                if(parent?.hasContextMenu) {
                    parent?.lastCell && parent.lastCell.CreateContextMenuButton();   
                }
            });

            this.parentColumn.AddHandler('ColumnPositionChange', (event, args) => {
                if (this.stickyHorizontally) {
                    this.left = args.column._positionLeft;
                }
            });
        }
    }

    get parentRow() {
        return this.parent;
    }

    get editor() {
        return this._editor;
    }
    set editor(value) {
        this._editor = value;
        this._createEditor();
    }

    get viewer() {
        return this._viewer;
    }
    set viewer(value) {
        this._viewer = value;
        this._createViewer();
    }

    get value() {
        return this._value;
    } 

    set value(value) {
        this._value = value;
        if(this._viewerObject) {
            this._viewerObject.value = this._value;
            this._viewerObject.viewedObject = this.parentRow.value;
        }
        else {
            this._valueContainer.value = '';
            this._valueContainer.value = this._generateViewFromParams();
        }
        if(this._editorObject) {
            this._editorObject.value = this._value;
        }
    }

    get align() {
        return this._element.css('vertical-align');
    }
    set align(value) {
        this._element.css('vertical-align', value || 'middle');
    }

    get contextmenu() {
        return this.grid.contextmenu;
    }

    set contextmenu(items) {
        this.grid.contextmenu = items;
    }

    get nextCell() {
        if(this.next instanceof Colibri.UI.Grid.Cell) {
            return this.next;
        }
        return null;
    }

    get prevCell() {
        if(this.prev instanceof Colibri.UI.Grid.Cell && this.prev.name !== 'button-container-for-row-selection') {
            return this.prev;
        }
        return null;
    }

    _generateViewFromParams(value) {
        const column = this.grid.header.columns.Children(this.columnName);
        if(column.tag.params && column.tag.params.render) {
            const ret = column.tag.params.render.apply(this, [this, this.parentRow]);
            if(ret) {
                return ret;
            }
        }
        else {
            return this._value;
        }
    }

    _createViewer() {
        if(this._viewer && !this._viewerObject) {
            const viewer = eval(this._viewer);
            this._viewerObject = new viewer(this.name + '_viewer', this);
            this._viewerObject.AddHandler('Clicked', (event, args) => this.Dispatch('ViewerClicked', {value: event.sender.value}));
            this._viewerObject.shown = true;
            this._viewerObject.field = this.parentColumn.tag;
            this._viewerObject.download = this.parentColumn.download;
        }
        else {
            if(this._viewerObject) {
                this._viewerObject.Dispose();
            }
        }
    }

    _createEditor() {
        if(this._editor && !this._editorObject) {
            const editor = eval(this._editor);
            this._editorObject = new editor(this.name + '_editor', this);
            this._editorObject.field = this.parentColumn.tag;
            this._editorObject.download = this.parentColumn.download;            
            this._editorObject.AddHandler('KeyDown', (event, args) => {
                if(args.domEvent.keyCode == 13 && !this._editorObject.invalid) {
                    this.Dispatch('EditorChanged', {value: event.sender.value});
                    this.EndEdit();
                }
                else if(args.domEvent.keyCode == 27) {
                    this._editorObject.Dispatch('LoosedFocus');
                }
                args.domEvent.stopPropagation();
            });
            this._editorObject.AddHandler('Changed', (event, args) => {
                if(!this._editorObject.invalid) {
                    this.Dispatch('EditorChanged', {value: event.sender.value});
                }
            });
            this._editorObject.AddHandler('LoosedFocus', (event, args) => {
                this.EndEdit();
            });
        }
        else if(this._editorObject) {
            this._editorObject.Dispose();
        }
    }

    EditValue() {
        if(this._editorObject) {
            Colibri.Common.Delay(50).then(() => {
                this.AddClass('-editing');
                this.parentRow.AddClass('-editing');
                this._valueContainer.Hide();
                this._viewerObject && this._viewerObject.Hide();
                this._editorObject.field = this._parentColumn.tag;
                this._editorObject.Show();
                this._editorObject.Focus();
                this._editorObject.editedObject = this.parentRow.value; 
                this._editorObject.value = this.value;   
            });
            return true;
        }
        return false;
    }

    EndEdit(hide = true) {
        if(this._parentColumn.editorAllways) {
            return;
        }
        this.RemoveClass('-editing');
        this.parentRow.RemoveClass('-editing');
        if(this._viewerObject) {
            this._viewerObject.Show();
        }
        else {
            this._valueContainer.Show();
        }
        hide && this._editorObject && this._editorObject.Hide();
    } 

    CreateContextMenuButton() {
        let contextMenuParent = this.Children(this._name + '-contextmenu-icon-parent');
        if(!this.parent.hasContextMenu || contextMenuParent) {
            return;
        }

        contextMenuParent = new Colibri.UI.Component(this._name + '-contextmenu-icon-parent', this);
        contextMenuParent.AddClass('app-contextmenu-icon-component');
        contextMenuParent.shown = true;
        
        const contextMenuIcon = new Colibri.UI.Icon(this._name + '-contextmenu-icon', contextMenuParent);
        contextMenuIcon.shown = true;
        contextMenuIcon.value = Colibri.UI.ContextMenuIcon;
        contextMenuIcon.AddHandler(['Clicked', 'DoubleClicked'], (event, args) => {
            this.parent.Dispatch('ContextMenuIconClicked', args);
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            args.domEvent.returnValue = true;
            return false;
        });
    }

    RemoveContextMenuButton() {
        if(this.parent.hasContextMenu && this.Children(this._name + '-contextmenu-icon-parent')) {
            this.Children(this._name + '-contextmenu-icon-parent').Dispose();
        }
    }


}