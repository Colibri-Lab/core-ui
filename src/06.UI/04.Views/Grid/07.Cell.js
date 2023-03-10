/**
 * Класс ячейки
 */
Colibri.UI.Grid.Cell = class extends Colibri.UI.Pane {

    constructor(name, container) {
        super(name, container, Element.create('td'));

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
        this.valign = this._parentColumn.valign;
        this.halign = this._parentColumn.halign;

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

    get valign() {
        return this._element.css('vertical-align');
    }
    set valign(value) {
        this._element.css('vertical-align', value || 'middle');
    }
    get halign() {
        return this._element.css('text-align');
    }
    set halign(value) {
        this._element.css('text-align', value || 'left');
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
            if(!viewer) {
                throw 'Can not find viewer component: ' + this._viewer;
            }
            this._viewerObject = new viewer(this.name + '_viewer', this);
            this._viewerObject.AddHandler('Clicked', (event, args) => this.Dispatch('ViewerClicked', {value: event.sender.value}));
            this._viewerObject.shown = true;
            this._viewerObject.field = this.parentColumn.tag;
            this._viewerObject.download = this.parentColumn.download;

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