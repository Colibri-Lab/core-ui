/**
 * Grid cell component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Grid
 */
Colibri.UI.Grid.Cell = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('td'));

        this.AddClass('app-ui-row-cell');

        this._parentColumn = this.grid.header.FindColumn(this.columnName);
        this.className = this._parentColumn.className;

        this._valueContainer = new Colibri.UI.TextSpan('span', this);
        this._valueContainer.AddClass('app-ui-row-cell-value-container');
        this._valueContainer.shown = true;
        this._valueContainer.copy = this.parentColumn.canCopy;

        this._stickyHorizontally = false;
        this._stickyVertically = false;
        this._selected = false;
        this._activated = false;
        this._value = null;

        this._editor = this._parentColumn?.editor;
        this._viewer = this._parentColumn?.viewer;
        this._editorObject = null;
        this._viewerObject = null;
        this._createViewer();
        this._createEditor();
        this.valign = this._parentColumn?.valign;
        this.halign = this._parentColumn?.halign;

        this._handleEvents();
        if(this._parentColumn?.editorAllways ?? false) {
            this.EditValue(false);
        }
    }

    /** @protected */
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
            this.grid.Dispatch('CellViewerClicked', Object.assign(args, {cell: this, field: this.columnName, data: this.parentRow.value}));
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
        return this.name.substr(this.parent.name.length + 1);
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
        this.Dispatch('CellHorizontalStickyChanged', {cell: this});
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
        this.Dispatch('CellVerticalStickyChanged', {cell: this});
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
    get activated () {
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
    get selected () {
        return this._selected;
    }

    /**
     * Grid
     * @type {Colibri.UI.Grid}
     */
    get grid() {
        return this?.parent?.parent?.parent?.parent;
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
                    if(args.column.ContainsClass('-last-sticky')) {
                        this.AddClass('-last-sticky');   
                    }
                }
            });
        }
    }

    /**
     * Parent row
     * @type {Colibri.UI.Grid.Row}
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
        if(this.next instanceof Colibri.UI.Grid.Cell) {
            return this.next;
        }
        return null;
    }

    /**
     * Previous cell
     * @type {Colibri.UI.Grid.Cell}
     */
    get prevCell() {
        if(this.prev instanceof Colibri.UI.Grid.Cell && this.prev.name !== 'button-container-for-row-selection') {
            return this.prev;
        }
        return null;
    }

    _generateViewFromParams(value) {
        const column = this.grid.header.FindColumn(this.columnName);
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
            const cell = this;
            const viewer = eval(this._viewer);
            if(!viewer) {
                throw 'Can not find viewer component: ' + this._viewer;
            }
            this._viewerObject = new viewer(this.name + '_viewer', this);
            this._viewerObject.AddHandler('Clicked', (event, args) => this.Dispatch('ViewerClicked', Object.assign(args, {value: event.sender.value})));
            this._viewerObject.shown = true;
            this._viewerObject.field = this.parentColumn.tag;
            this._viewerObject.download = this.parentColumn.download;
            this._viewerObject.tag = {column: this.parentColumn, row: this.parentRow, cell: this};
            Object.forEach(this.parentColumn.tag.viewerAttrs, (name, value) => {
                this._viewerObject[name] = value;
            });

            this._valueContainer.shown = false;
        }
        else if(!this._viewer && this._viewerObject) {
            this._viewerObject.Dispose();
            this._valueContainer.shown = true;
        }
    }

    _createEditor() {
        if(this._editor && !this._editorObject) {
            const editor = eval(this._editor);
            this._editorObject = new editor(this.name + '_editor', this);
            this._editorObject.field = this.parentColumn.tag;
            this._editorObject.download = this.parentColumn.download;  
            this._editorObject.tag = {column: this.parentColumn, row: this.parentRow, cell: this};
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
        else if(!this._editor && this._editorObject) {
            this._editorObject.Dispose();
        }
    }

    EditValue(setFocus = true) {
        if(this._editorObject) {
            Colibri.Common.Delay(50).then(() => {
                this.AddClass('-editing');
                this.parentRow && this.parentRow.AddClass('-editing');
                this._valueContainer.Hide();
                this._viewerObject && this._viewerObject.Hide();
                this._editorObject.field = this._parentColumn.tag;
                this._editorObject.Show();
                if(setFocus) {
                    this._editorObject.Focus();
                }
                this._editorObject.editedObject = this.parentRow ? this.parentRow.value : null; 
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