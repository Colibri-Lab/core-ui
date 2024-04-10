/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.KeyValueObject = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-simplearray-field');
        this._enabled = true;

        const contentContainer = this.contentContainer;

        this._grid = new Colibri.UI.Grid('grid', contentContainer);
        this._grid.shown = true;
        this._grid.rows.title = '';
        this._grid.height = 200;

        this._link = new Colibri.UI.Link('link', contentContainer);
        this._link.shown = true;
        this._link.value = '#{ui-fields-keyvalueobject-add}'

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

        this._fieldData.params.simplearraywidth = (this._fieldData.params?.simplearraywidth ?? 1);
        this._fieldData.params.simplearrayheight = (this._fieldData.params?.simplearrayheight ?? 1);

        const column1 = this._grid.header.columns.Add('key', '');
        column1.width = '50%';
        column1.align = 'left';
        column1.editor = Colibri.UI.TextEditor;
        column1.editorAllways = true;
        column1.resizable = true;
        column1.value = '#{ui-fields-keyvalueobject-key}';

        const column2 = this._grid.header.columns.Add('value', '');
        column2.width = '50%';
        column2.align = 'left';
        column2.editorAllways = true;
        column2.editor = Colibri.UI.TextEditor;
        column2.value = '#{ui-fields-keyvalueobject-value}';

        this._grid.AddHandler('CellEditorChanged', (event, args) => this.Dispatch('Changed', {component: this}));
        this._link.AddHandler('Clicked', (event, args) => this._grid.rows.Add('row' + Date.Mc(), {key: 'new-key-' + (this._grid.rows.children - 1), value: ''}));

    } 

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    Focus() {
        this.contentContainer.Children('firstChild').Focus();
    }

    get readonly() {
        return this._grid.readonly;
    }

    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        this._grid.readonly = value;
    }

    get enabled() {
        return this._enabled ?? true;
    }

    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        if(this._enabled != value) {
            this._enabled = value;
            this.contentContainer.ForEach((name, component) => {
                component.enabled = this._enabled; 
            });
            this._link && (this._link.enabled = this._enabled);
        }
    }

    get value() {

        let val = {};
        this._grid.ForEveryRow((name, row) => {
            val[row.value.key] = row.value.value;
        });
        return val;
    }

    set value(value) {
        this._grid.ClearAllRows();
        
        Object.forEach(value, (key, value) => {
            this._grid.rows.Add('row' + Date.Mc(), {key: key, value: value});
        });

        if(this._grid.rows.children === 1) {
            this._link.Dispatch('Clicked');
        }

    }


    set tabIndex(value) {
        this._grid.tabIndex = value;
    }


    get tabIndex() {
        return this._grid.tabIndex;
    }

    /**
     * Высота
     * @type {number}
     */
    get height() {
        return this._grid.height;
    }
    /**
     * Высота
     * @type {number}
     */
    set height(value) {
        this._grid.height = value;
    }
    

}
Colibri.UI.Forms.Field.RegisterFieldComponent('KeyValueObject', 'Colibri.UI.Forms.KeyValueObject', '#{ui-fields-keyvalueobject}')
