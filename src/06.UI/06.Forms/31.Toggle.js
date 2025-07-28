/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Toggle = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-toggle-field');

        const contentContainer = this.contentContainer;

        this._input = new Colibri.UI.ToggleBox(this._name + '-input', contentContainer);
        this._input.shown = true;
        this._input.label = this._fieldData.placeholder ? this._fieldData.placeholder[Lang.Current] ?? this._fieldData.placeholder : '';

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
        this.value = this._fieldData?.default ?? false;

        this._handleEvents();
    }

    /** @protected */
    _handleEvents() {
        this._input.AddHandler('Changed', this.__thisBubbleWithComponent, false, this);
        this._input.AddHandler('Clicked', this.__thisBubblePreventDefault, false, this);
        this._input.AddHandler('ReceiveFocus', this.__thisBubble, false, this);
        this._input.AddHandler('LoosedFocus', this.__thisBubble, false, this);
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
        this._input.readonly = value;
        if(value) {
            this.AddClass('app-component-readonly');
        } else {
            this.RemoveClass('app-component-readonly');
        }
    }

    /**
     * Value
     * @type {boolean}
     */
    get value() {
        return this._input.checked;
    }

    /**
     * Value
     * @type {boolean}
     */
    set value(value) {
        this._input.checked = value === 'true' || value === true || value === 1 || value === '1';
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
        this._input.enabled = value;
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
        if (this._input) {
            this._input.tabIndex = value;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Toggle', 'Colibri.UI.Forms.Toggle', '#{ui-fields-toggle}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler'])
