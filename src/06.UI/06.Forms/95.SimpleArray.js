/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.SimpleArray = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-simplearray-field');
        this._enabled = true;

        const contentContainer = this.contentContainer;

        this._grid = new Colibri.UI.Grid('grid', contentContainer);
        this._grid.shown = true;
        this._grid.rows.title = '';

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

        const column = this._grid.header.columns.Add('col0', '');
        column.width = 50;
        column.align = 'right';
        
        for(let i=0; i < this._fieldData.params?.simplearraywidth; i++) {
            const column = this._grid.header.columns.Add('col' + (i + 1), (i + 1));
            column.editor = Colibri.UI.TextEditor;
            column.editorAllways = true;
        }

        for(let j=0; j < this._fieldData.params?.simplearrayheight; j++) {
            let val = {col0: j + 1};
            for(let i=0; i < this._fieldData.params?.simplearraywidth; i++) {
                val['col' + (i + 1)] = '';
            }   
            this._grid.rows.Add('item' + (j + 1), val);
        }

        this._grid.AddHandler('CellEditorChanged', (event, args) => this.Dispatch('Changed', {component: this}));

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

        let val = [];
        this._grid.ForEveryRow((name, row) => {
            let v = [];
            Object.forEach(row.value, (key, value) => {
                if(key != 'col0') {
                    v.push(value);
                }
            });
            val.push(v);
        });
        return val;
    }

    set value(value) {
        if(!Array.isArray(value)) {
            value = [];
        }
        for(let i=0; i < value.length; i++) {
            let v = {col0: i + 1};
            for(let j=0; j < value[i].length; j++) {
                v['col' + (j + 1)] = value[i][j] ?? '';
            }    
            this._grid.rows.Children('item' + (i + 1)).value = v;
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

    // /**
    //  * Ширина
    //  * @type {number}
    //  */
    // get width() {
    //     return this._grid.width;
    // }
    // /**
    //  * Высота
    //  * @type {number}
    //  */
    // set width(value) {
    //     this._element.css('width', value + 'px');
    // }
    

}
Colibri.UI.Forms.Field.RegisterFieldComponent('SimpleArray', 'Colibri.UI.Forms.SimpleArray', '#{ui-fields-simplearray}')
