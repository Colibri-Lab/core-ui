Colibri.UI.Forms.List = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-list-field');

        this._validated = false;

        const contentContainer = this.contentContainer;
        this._list = new Colibri.UI.List('list', contentContainer);
        this._group = this._list.AddGroup('group', '');
        this._list.shown = true;
        this._list.__renderItemContent = (itemData) => {
            return this._fieldData.selector && this._fieldData.selector.title ? itemData[this._fieldData.selector.title] : itemData.title;
        };
        
        this._list.AddHandler('SelectionChanged', (event, args) => this.Dispatch('Changed', args));
        this._list.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._list.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown', args));

        this.ReloadValues();

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

    } 

    
    ReloadValues() {

        let values = this._fieldData.values;
        if(this._fieldData.lookup && typeof this._fieldData.lookup == 'function') {
            values = this._fieldData.lookup();
        }

        this._group.Clear();
        Object.values(values).forEach((item) => {
            this._group.AddItem(item);
        });

    }

    Focus() {
        this._list.focus();
    }

    get value() {
        return this._list.selectedValue;
    }

    set value(value) {
        this._list.selectedValue = value;
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._list.tabIndex;
    }
    set tabIndex(value) {
        this._list.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('List', 'Colibri.UI.Forms.List', '#{ui-fields-list}')
