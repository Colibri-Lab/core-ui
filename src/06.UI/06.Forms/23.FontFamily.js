/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.FontFamily = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-color-field');

        const contentContainer = this.contentContainer;
        
        this._input = new Colibri.UI.FontFamilySelector(this.name + '_selector', contentContainer);
        this._input.shown = true;

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
        this.value = this._fieldData?.default ?? '';

        this._input.AddHandler('Changed', this.__thisBubbleWithComponent, false, this);
        this._input.AddHandler('KeyUp', this.__thisBubble, false, this);
        this._input.AddHandler('KeyDown', this.__thisBubble, false, this);
        this._input.AddHandler('Clicked', this.__thisBubble, false, this);

    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    /**
     * Focus on component
     */
    Focus() {
        this._input.Focus();
    }
    
    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input.readonly;
    }

    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        this._input.readonly = value
    }

    /**
     * Placeholder
     * @type {string}
     */
    get placeholder() {
        return this._input.placeholder;
    }

    /**
     * Placeholder
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._input.placeholder = value ? value[Lang.Current] ?? value : '';
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        let value = this._input.value;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if(this._fieldData?.params?.eval) {
            value = eval(this._fieldData?.params?.eval);
        }
        return value;
    }

    /**
     * Value
     * @type {string}
     */
    set value(value) {
        this._input.value = value ?? '';
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this._input.enabled;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        this._input.enabled = value
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        this._input && (this._input.tabIndex = value === true ? Colibri.UI.tabIndex++ : value);
    }


}
Colibri.UI.Forms.Field.RegisterFieldComponent('FontFamily', 'Colibri.UI.Forms.FontFamily', '#{ui-fields-fontfamily}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler']);
