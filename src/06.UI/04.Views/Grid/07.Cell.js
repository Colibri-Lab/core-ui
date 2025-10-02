/**
 * Grid cell component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Grid
 */
Colibri.UI.Grid.Cell = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container, parentColumn = null) {
        super(name, container, Element.create('td'));

        this.AddClass('app-ui-row-cell');

        this._valueContainer = null;        
        this._stickyHorizontally = false;
        this._stickyVertically = false;
        this._selected = false;
        this._activated = false;
        this._value = null;
        
        this.parentColumn = parentColumn ?? this.grid.header.FindColumn(this.columnName);
        this.className = this.parentColumn.className;

        if(container instanceof Colibri.UI.Component) {
            container.Dispatch('ChildAdded', { cell: this });
        }

    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        
        this.RegisterEvent('Changed', false, 'When value is realy changed');

    }

    _registerEventHandlers() {
        super._registerEventHandlers();
        

    }

    _setParentColumnAttrs() {
        this._editor = this._parentColumn?.editor;
        this._viewer = this._parentColumn?.viewer;
        this._createViewer();
        this._createEditor();
        this.valign = this._parentColumn?.valign;
        this.halign = this._parentColumn?.halign;

        if (this._parentColumn?.editorAllways ?? false) {
            this.EditValue(false);
        }

    }

    __thisParentRowRowStickyChange(event, args) {
        this.stickyVertically = args.row.sticky;
    }

    PerformPositionChange() {
        if (this.stickyVertically) {
            this._element.css('top', args.row._positionTop + 'px');
        }
    }

    /**
     * Value container object
     * @type {Colibri.UI.Component}
     * @readonly
     */
    get valueContainer() {
        return this._valueContainer;
    }

    /**
     * Column name
     * @readonly
     */
    get columnName() {
        return this.name.substring(this.parent.name.length + 1);
    }

    /**
     * Horizontal sticky
     * @type {Boolean}
     */
    get stickyHorizontally() {
        return this._stickyHorizontally;
    }
    /**
     * Horizontal sticky
     * @type {Boolean}
     */
    set stickyHorizontally(value) {
        if (value) {
            this.AddClass('position-sticky-x');
        } else {
            this.RemoveClass('position-sticky-x');
            this._element.style.left = '';
        }
        this._stickyHorizontally = value;
    }

    /**
     * Vertical sticky
     * @type {Boolean}
     */
    get stickyVertically() {
        return this._stickyVertically;
    }
    /**
     * Vertical sticky
     * @type {Boolean}
     */
    set stickyVertically(value) {
        if (value) {
            this.AddClass('position-sticky-y');
        } else {
            this.RemoveClass('position-sticky-y');
            this._element.style.left = '';
        }
        this._stickyVertically = value;
    }

    /**
     * Is activated
     * @type {Boolean}
     */
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

    /**
     * Is activated
     * @type {Boolean}
     */
    get activated() {
        return this._activated;
    }

    /**
     * Is selected
     * @type {Boolean}
     */
    set selected(value) {
        if (value) {
            this.AddClass('cell-selected');
        } else {
            this.RemoveClass('cell-selected');
        }
        this._selected = value;
    }
    /**
     * Is selected
     * @type {Boolean}
     */
    get selected() {
        return this._selected;
    }

    /**
     * Grid
     * @type {Colibri.UI.Grid}
     */
    get grid() {
        return this?.parent?.grid;
    }

    /**
     * Parent column
     * @type {Colibri.UI.Grid.Column}
     */
    get parentColumn() {
        return this._parentColumn;
    }
    /**
     * Parent column
     * @type {Colibri.UI.Grid.Column}
     */
    set parentColumn(value) {
        if (this._parentColumn) {
            this._parentColumn.RemoveHandler('ColumnStickyChange', this.__parentColumnStickyChange, this);
            // this._parentColumn.RemoveHandler('ColumnDisposed', this.__parentColumnDisposed, this);
            this._parentColumn.RemoveHandler('ColumnPositionChange', this.__parentColumnPositionChange, this);
        }

        this._parentColumn = value;
        if (this._parentColumn !== null) {
            this.stickyHorizontally = this._parentColumn.sticky;
            this._parentColumn.AddHandler('ColumnStickyChange', this.__parentColumnStickyChange, false, this);
            // this._parentColumn.AddHandler('ColumnDisposed', this.__parentColumnDisposed, false, this);
            this._parentColumn.AddHandler('ColumnPositionChange', this.__parentColumnPositionChange, false, this);

        }

        this._setParentColumnAttrs();
    }

    __parentColumnStickyChange(event, args) {
        this.stickyHorizontally = args.column.sticky;
    }


    __parentColumnPositionChange(event, args) {
        if (this.stickyHorizontally) {
            this.left = args.column._positionLeft;
            if (args.column.ContainsClass('-last-sticky')) {
                this.AddClass('-last-sticky');
            }
        }
    }

    /**
     * Parent row
     * @type {Colibri.UI.Grid.Row}
     * @readonly
     */
    get parentRow() {
        return this.parent;
    }

    /**
     * Editor component
     * @type {Colibri.UI.Component}
     */
    get editor() {
        return this._editor;
    }
    /**
     * Editor component
     * @type {Colibri.UI.Component}
     */
    set editor(value) {
        this._editor = value;
        this._createEditor();
    }

    get editorObject() {
        return this._editorObject;
    }

    /**
     * Viewer component
     * @type {Colibri.UI.Component}
     */
    get viewer() {
        return this._viewer;
    }
    /**
     * Viewer component
     * @type {Colibri.UI.Component}
     */
    set viewer(value) {
        this._viewer = value;
        this._createViewer();
    }

    get viewerObject() {
        return this._viewerObject;
    }

    /**
     * Value of cell
     * @type {String}
     */
    get value() {
        return this._value;
    }
    /**
     * Value of cell
     * @type {String}
     */
    set value(value) {

        const isChanged = this._value !== value;
        this._value = value;
        if (this._viewerObject) {
            this._viewerObject.value = this._value;
            this._viewerObject.viewedObject = this.parentRow.value;
        }
        else {
            this._createValueContainer();
            this._valueContainer.value = '';
            this._valueContainer.value = this._generateViewFromParams();
        }

        if (this._editorObject) {
            this._editorObject.value = this._value;
        }

        if(this._parentColumn.editorAllways) {
            this.EditValue(!this._parentColumn.editorAllways)
        } else if(this._viewerObject) {
            this._viewerObject.Show(); 
        } else {
            this._valueContainer.Show();
        }

        if(isChanged) {
            this.Dispatch('Changed', {});
        }

    }

    /**
     * Vertical align
     * @type {bottom,middle,sub,super,text-bottom,text-top,top,auto}
     */
    get valign() {
        return this._element.css('vertical-align');
    }
    /**
     * Vertical align
     * @type {bottom,middle,sub,super,text-bottom,text-top,top,auto}
     */
    set valign(value) {
        this._element.css('vertical-align', value || 'middle');
    }
    /**
     * Horizontal align
     * @type {center,end,justify,left,right,start}
     */
    get halign() {
        return this._element.css('text-align');
    }
    /**
     * Horizontal align
     * @type {center,end,justify,left,right,start}
     */
    set halign(value) {
        this._element.css('text-align', value || 'left');
        this.AddClass('-halign-' + value );
    }

    /**
     * Context menu items
     * @type {Array}
     */
    get contextmenu() {
        return this.grid.contextmenu;
    }
    /**
     * Context menu items
     * @type {Array}
     */
    set contextmenu(items) {
        this.grid.contextmenu = items;
    }

    /**
     * Next cell
     * @type {Colibri.UI.Grid.Cell}
     */
    get nextCell() {
        if (this.next instanceof Colibri.UI.Grid.Cell) {
            return this.next;
        }
        return null;
    }

    /**
     * Previous cell
     * @type {Colibri.UI.Grid.Cell}
     */
    get prevCell() {
        if (this.prev instanceof Colibri.UI.Grid.Cell && this.prev.name !== 'checkbox-column') {
            return this.prev;
        }
        return null;
    }

    _generateViewFromParams(value) {
        const column = this.grid.header.FindColumn(this.columnName);
        if (column.tag.params && column.tag.params.render) {
            const ret = column.tag.params.render.apply(this, [this, this.parentRow]);
            if (ret) {
                return ret;
            }
        }
        else {
            return this._value;
        }
    }

    _createValueContainer() {
        if (!this._valueContainer) {
            this._valueContainer = new Colibri.UI.TextSpan('span', this);
            this._valueContainer.AddClass('app-ui-row-cell-value-container');
            this._valueContainer.copy = this.parentColumn.canCopy;
        }
    }

    _createViewer() {
        
        if (this._viewer && !this._viewerObject) {
    
            const viewer = eval(this._viewer);
            if (!viewer) {
                throw 'Can not find viewer component: ' + this._viewer;
            }
            this._viewerObject = new viewer(this.name + '_viewer', this);
            this._viewerObject.AddHandler('Clicked', this.__viewerObjectClicked, false, this);
            this._viewerObject.shown = true;
            this._viewerObject.field = this.parentColumn.tag;
            this._viewerObject.download = this.parentColumn.download;
            this._viewerObject.tag = { column: this.parentColumn, row: this.parentRow, cell: this };
            Object.forEach(this.parentColumn.tag.viewerAttrs, (name, value) => {
                this._viewerObject[name] = value;
            });

            this._valueContainer && (this._valueContainer.shown = false);
        }
        else {
            this._createValueContainer();
            this._valueContainer.shown = true;
        }
    }

    _removeViewer() {
        if(this._viewerObject) {
            this._viewerObject.Dispose();
            this._viewerObject = null;
        }
        this._createValueContainer();
        this._valueContainer.shown = true;
    }

    __viewerObjectClicked(event, args) {
        this.grid?.Dispatch('CellViewerClicked', Object.assign(args, { cell: this, field: this.columnName, data: this.parentRow.value, value: this.value }));
        this.EditValue();
    }

    _createEditor() {

        if (this._editor && !this._editorObject) {
            
            let editor = this._editor;
            let tag = this.parentColumn.tag;
            let download = this.parentColumn.download;
            if (typeof editor === 'string') {
                editor = eval(editor);
            } else if (editor instanceof Function && (!(editor instanceof Colibri.UI.Editor) && !(editor.prototype instanceof Colibri.UI.Editor))) {
                const returns = editor(this, this.parentRow, this.parentColumn, this.grid);
                editor = returns.editor;
                tag = returns.tag;
            }

            this._editorObject = new editor(this.name + '_editor', this);
            this._editorObject.field = tag;
            this._editorObject.download = download;
            this._editorObject.tag = { column: this.parentColumn, row: this.parentRow, cell: this };
            this._editorObject.AddHandler('KeyDown', this.__editorObjectKeyDown, false, this);
            this._editorObject.AddHandler('Changed', this.__editorObjectChanged, false, this);
            this._editorObject.AddHandler('LoosedFocus', this.__editorObjectLoosedFocus, false, this);
        }
        
    }

    _removeEditor() {
        if(this._editorObject) {
            this._editorObject.Dispose();
            this._editorObject = null;
        }
    }

    __editorObjectKeyDown(event, args) {
        if (args.domEvent.keyCode == 13 && !this._editorObject.invalid) {
            this.EndEdit();
        }
        else if (args.domEvent.keyCode == 27) {
            this.EndEdit(true, false);
        }
        args.domEvent.stopPropagation();
    }
    __editorObjectChanged(event, args) {
        if (!this._editorObject.invalid) {
            this._performChangeInEditor();
        }
    }
    __editorObjectLoosedFocus(event, args) {
        this.EndEdit(true, false);
    }

    EditValue(setFocus = true) {
        if (this._editorObject) {
            
            this.AddClass('-editing');
            this.parentRow && this.parentRow.AddClass('-editing');
            this._valueContainer && this._valueContainer.Hide();
            this._viewerObject && this._viewerObject.Hide();
            if (!this._editorObject.field) {
                this._editorObject.field = this._parentColumn.tag;
            }
            this._editorObject.Show();
            if (setFocus) {
                this._editorObject.Focus();
            }
            this._editorObject.editedObject = this.parentRow ? this.parentRow.value : null;
            this._editorObject.value = this.value;
            
            return true;
        }
        return false;
    }

    EndEdit(hide = true, cancel = false) {
        
        if (this._parentColumn.editorAllways) {
            return;
        }

        this.RemoveClass('-editing');
        this.parentRow.RemoveClass('-editing');
        if (this._viewerObject) {
            this._viewerObject.Show();
        }
        else {
            this._valueContainer ? this._valueContainer.Show() : this._createValueContainer();
        }
        hide && this._editorObject && this._editorObject.Hide();

        if(cancel) {
            return;
        }

        this._performChangeInEditor();
        
    }

    _performChangeInEditor() {

        this._createEditor();

        if (!this._editorObject || (this.value == this._editorObject.value)) {
            return;
        }

        const oldValue = this.value;
        this.value = this._editorObject.value;

        this.grid?.Dispatch('CellEditorChanged', { 
            cell: this,
            field: this.columnName,
            data: this.parentRow.value,
            newValue: this._editorObject.value,
            oldValue: oldValue 
        });
    }


    Dispose() {

        if(this._valueContainer) {
            this._valueContainer.Dispose();
            this._valueContainer = null;
        }

        if(this._viewerObject) {
            this._viewerObject.Dispose();
            this._viewerObject = null;
        }

        if(this._editorObject) {
            this._editorObject.Dispose();
            this._editorObject = null;
        }

        super.Dispose();

    }
    
    /**
     * Widht ot a cell
     * @type {Number|String} Width in percent or pixels (20% | 200px)   
     */
    get width() {
        return this._width;
    }
    /**
     * Widht ot a cell
     * @type {Number|String} Width in percent or pixels (20% | 200px)   
     */
    set width(value) {
        this._width = value;
    }



}