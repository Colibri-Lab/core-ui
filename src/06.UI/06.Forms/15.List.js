/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.List = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-list-field');

        this._validated = false;

        const contentContainer = this.contentContainer;
        this._list = new Colibri.UI.List('list', contentContainer);
        this._group = this._list.AddGroup('group', '');
        this._list.shown = true;
        
        this._list.AddHandler('SelectionChanged', (event, args) => this.Dispatch('Changed', Object.assign(args, {component: this})));
        this._list.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._list.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown', args));

        if(this._fieldData?.params?.rendererComponent) {
            this._list.rendererComponent = this._fieldData.params?.rendererComponent;
        } else {
            this._list.__renderItemContent = (itemData) => {
                return this._fieldData.selector && this._fieldData.selector.title ? itemData[this._fieldData.selector.title] : itemData.title;
            };
        }

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

    /**
     * Reload values to component
     */
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

    /**
     * Focus on component
     */
    Focus() {
        this._list.focus();
    }

    /**
     * Value
     * @type {Object|string}
     */
    get value() {
        return this._list.selectedValue;
    }

    /**
     * Value
     * @type {Object|string}
     */
    set value(value) {
        if(!Object.isObject(value)) {
            this._list.selectedValue = Array.findObject(this._fieldData.values, 'value', value);
        } else {
            this._list.selectedValue = value;
        }
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._list.tabIndex;
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        this._list.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('List', 'Colibri.UI.Forms.List', '#{ui-fields-list}')
