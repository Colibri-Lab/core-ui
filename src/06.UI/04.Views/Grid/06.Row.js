/**
 * Grid row component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Grid
 */
Colibri.UI.Grid.Row = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('tr'));
        this.AddClass('app-ui-row');
        this.shown = this.parent.shown;

        this._templateElement = null;

        this.cells = 0;
        this._tempCountCellsReportedChange = 0;

        this._heightPrevStickyRow = this.header?.shown ? this.header.height : 0;

        this.sticky = false;
        this.activated = false;

        this._checkbox = null;
        this._checkboxContainer = null;
        this._addCheckboxContainer();
        this._createContextMenuButton();

        this._data = null;

        this.draggable = this.grid?.draggable ?? false;
        this.dropable = this.grid?.dropable ?? false;

        if(container instanceof Colibri.UI.Component) {
            container.Dispatch('ChildAdded', { row: this });
        }


    }

    Dispose() {

        if (this._templateElement) {
            this._templateElement.remove();
        }

        this.grid?.UnregisterCheckbox(this._checkboxContainer);
        super.Dispose();
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();

        this.RegisterEvent('RowDisposed', true, 'Поднимается, когда выбирают строку');        
        this.RegisterEvent('RowSelected', true, 'Поднимается, когда выбирают строку');        
        this.RegisterEvent('RowStickyChanged', true, 'Поднимается, когда все ячейки сообщили об изменинии sticky');

    }

    _registerEventHandlers() {
        super._registerEventHandlers();
        
        this.AddHandler('ComponentDisposed', this.__thisComponentDisposed);
        this.AddHandler('ChildAdded', this.__thisChildAdded);
        this.AddHandler('ContextMenu', this.__thisContextMenu);

    }

    __thisComponentDisposed(event, args) {
        this.Dispatch('RowDisposed', args);
    }

    __thisChildAdded(event, args) {
        if(this._contextmenuContainer) {
            this.MoveChild(this._contextmenuContainer, this._contextmenuContainer.childIndex, this.children, false);
        }
    }

    PerformColumnAdd(column) {
        this.Add(this.value, column);
    }

    PerformColumnRemove(column) {
        let cell = this.Children(this.name + '-' + column.name);
        if(cell) {
            cell.Dispose();
        }
    }

    _addCheckboxContainer() {

        this._checkboxContainer = new Colibri.UI.Component('checkbox-column', this, Element.create('td'));
        this._checkboxContainer.AddClass('app-ui-row-cell');
        this._checkboxContainer.shown = false;

        this._checkbox = new Colibri.UI.Checkbox('checkbox', this._checkboxContainer);
        this._checkbox.shown = true;
        this._checkbox.AddHandler('Changed', this.__checkboxChanged, false, this);

    }

    _createContextMenuButton() {
        this._contextmenuContainer = new Colibri.UI.Component('contextmenu-column', this, Element.create('td'));
        this._contextmenuContainer.AddClass('app-ui-row-cell');
        this._contextmenuContainer.shown = false;
        this._contextmenuContainer.width = 20;
        
        const contextMenuParent = new Colibri.UI.Component(this._name + '-contextmenu-icon-parent', this._contextmenuContainer);
        contextMenuParent.AddClass('app-contextmenu-icon-component');
        contextMenuParent.shown = true;

        const contextMenuIcon = new Colibri.UI.Icon(this._name + '-contextmenu-icon', contextMenuParent);
        contextMenuIcon.shown = true;
        contextMenuIcon.value = Colibri.UI.ContextMenuIcon;
        contextMenuIcon.AddHandler(['Clicked', 'DoubleClicked'], this.__contextMenuIconClickedOrDoubleClicked, false, this);
    }

    _removeContextMenuButton() {
        if(this._hasContextMenu && this._contextmenuContainer.Children(this._name + '-contextmenu-icon-parent')) {
            this._contextmenuContainer.Children(this._name + '-contextmenu-icon-parent').Dispose();
        }
    }


    __contextMenuIconClickedOrDoubleClicked(event, args) {
        if(event.name === 'ContextMenu') {
            args.isContextMenuEvent = true;
        }
        this.grid.Dispatch('ContextMenuIconClicked', Object.assign(args, {item: this}));
        if(event.name === 'ContextMenu') {
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        }
    }

    __checkboxChanged(event, args) {
        this.Dispatch('RowSelected', { row: this });

        this.header && (this.header.checkbox.thirdState = this.grid?.rowsCount > this.grid?.checked.length);
        this.group.checkbox.thirdState = this.group.rowsCount > this.group.checked.length;
    }

    _renderTemplateRow() {
        if (this.grid?.rowTemplateComponent) {

            if (this._templateElement) {
                this._templateElement.remove();
            }

            this._templateElement = Element.create('tr', { class: 'app-ui-row-template' });
            this._element.after(this._templateElement);
            this._templateElement.append(Element.create('td', { colspan: this._element.children.length - (this.grid?.showCheckboxes ? 0 : 1) }))

            const comp = eval(this.grid?.rowTemplateComponent);
            const templateObject = new comp(this.name + '-template', this._templateElement.querySelector('td'));
            Object.forEach(this.grid?.rowTemplateAttrs ?? {}, (key, value) => {
                templateObject[key] = value;
            });
            templateObject.parent = this;
            templateObject.shown = true;
            templateObject.value = this._data;

        }
    }

    set index(value) {
        this.parent.Children(this.name, this, value);
    }

    get value() {
        let ret = Object.assign({}, this._data);
        Object.forEach(this.header?.FindAllColumns(), (columnName, column) => {
            const cell = this.Children(this.name + '-' + column.name);
            if (cell) {
                ret[column.name] = cell.value;
            }
        });
        return ret;
    }

    set value(value) {
        this._data = Object.assign({}, value);
        Object.forEach(this.header?.FindAllColumns(), (columnName, column) => {
            this.Add(this._data, column);
        });
        this._renderTemplateRow();
        return this;
    }

    get activeCell() {
        let active = null;
        this.ForEach((cellName, cell) => {
            if (cell.activated) {
                active = cell;
                return false;
            }
            return true;
        });
        return active;
    }

    get firstCell() {
        const firstCell = this.Children('firstChild');
        if (firstCell instanceof Colibri.UI.Grid.Cell) {
            return firstCell;
        }
        return null;
    }

    get lastCell() {
        const lastCell = this.Children('lastChild');
        if (lastCell instanceof Colibri.UI.Grid.Cell) {
            return lastCell;
        }
        return null;
    }

    get prevRow() {
        if (this.prev instanceof Colibri.UI.Grid.Row) {
            return this.prev;
        }
        return null;
    }

    get nextRow() {
        if (this.next instanceof Colibri.UI.Grid.Row) {
            return this.next;
        }
        return null;
    }

    Add(value, column) {
        
        let val = '';
        try {
            val = column.name.indexOf('.') === -1 ? value[column.name] : eval(`value.${column.name}`);
        } catch (e) {
            // 
        }
        if (column.colspan && column.colspan > 1 && !val) {
            return null;
        }

        let newCell = this.Children(this.name + '-' + column.name);
        if (!newCell) {
            newCell = new Colibri.UI.Grid.Cell(this.name + '-' + column.name, this, column);    
        } else {
            newCell.parentColumn = column;
        }

        newCell.shown = column.shown;
        
        newCell.value = val;
        

    }

    /**
     * Has context menu
     * @type {Boolean}
     */
    get hasContextMenu() {
        return this._contextmenuContainer.shown;
    }
    /**
     * Has context menu
     * @type {Boolean}
     */
    set hasContextMenu(value) {
        value = this._convertProperty('Boolean', value);
        this._contextmenuContainer.shown = value;
        if(value) {
            this.AddHandler('ContextMenu', this.__contextMenuIconClickedOrDoubleClicked);
        } else {
            this.RemoveHandler('ContextMenu', this.__contextMenuIconClickedOrDoubleClicked);
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

        const isChanged = this._sticky !== value; 
        this._sticky = value;

        if (this._checkboxContainer) {
            if (value) {
                this._checkboxContainer.AddClass('position-sticky-y');
            } else {
                this._checkboxContainer.RemoveClass('position-sticky-y');
            }
            this._checkboxContainer._stickyVertically = args.row.sticky;
        }

        if (isChanged) {
            this.Dispatch('RowStickyChanged', { row: this });
        }

    }



    get selected() {
        return this._selected;
    }

    set selected(value) {
        value ? this.AddClass('row-selected') : this.RemoveClass('row-selected');
        this._selected = value;
        this.Dispatch('RowSelected', {row: this});
    }

    get activated() {
        return this._activated;
    }

    set activated(value) {
        if (value) {
            if (this.grid?.selectionMode === Colibri.UI.Grid.FullRow) {
                this.AddClass('row-active');
            }
        } else {
            if (this.grid?.selectionMode === Colibri.UI.Grid.FullRow) {
                this.RemoveClass('row-active');
            }
        }
        this._activated = value;
    }

    /**
     * @readonly
     */
    get group() {
        return this.parent;
    }

    /**
     * @readonly
     */
    get grid() {
        return this?.parent?.parent?.parent;
    }

    /**
     * @readonly
     */
    get header() {
        return this.grid?.header ?? null;
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

    get checkboxTooltip() {
        return this._checkbox ? this._checkbox.toolTip : null;
    }
    set checkboxTooltip(value) {
        this._checkbox && (this._checkbox.toolTip = value);
    }

    set checkbox(value) {
        this._checkboxContainer.shown = value;
    }
    get checkbox() {
        return this._checkboxContainer.shown;
    }

    Cell(columnName) {
        return this.Children(this.name + '-' + columnName);
    }

    EndEdit() {
        this.ForEach((name, cell) => {
            cell.EndEdit && cell.EndEdit();
        })
    }


    ShowContextMenu(orientation = [Colibri.UI.ContextMenu.RB, Colibri.UI.ContextMenu.RT], className = '', point = null) {

        this._contextmenuContainer.Children('firstChild').AddClass('-selected');

        if (this._contextMenuObject) {
            this._contextMenuObject.Dispose();
            this._contextMenuObject = null;
        }

        this._contextMenuObject = new Colibri.UI.ContextMenu(this.name + '-contextmenu', document.body, orientation, point);
        this._contextMenuObject.Show(this.contextmenu, this._contextmenuContainer);
        if (className) {
            this._contextMenuObject.AddClass(className);
        }
        this._contextMenuObject.AddHandler('Clicked', this.__contextMenuObjectClicked, false, this);

    }

    __contextMenuObjectClicked(event, args) {
        
        this._contextmenuContainer.Children('firstChild')?.RemoveClass('-selected');
        this._contextMenuObject.Hide();
        this.grid.Dispatch('ContextMenuItemClicked', Object.assign(args, {item: this}));
        this._contextMenuObject.Dispose();
        this._contextMenuObject = null;
    }


    _getContextMenuIcon() {
        if (this._contextmenuContainer.Children(this.lastCell.name + '-contextmenu-icon-parent')) {
            return this._contextmenuContainer.Children(this.lastCell.name + '-contextmenu-icon-parent/' + this.lastCell.name + '-contextmenu-icon');
        }
        return null;
    }


}