/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Checkbox = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-checkbox-field');

        const contentContainer = this.contentContainer;

        this._input = new Colibri.UI.Checkbox(this._name + '-input', contentContainer);
        this._input.shown = true;

        this._label = new Colibri.UI.TextSpan(this._name + '-label', contentContainer);
        this._label.shown = true;
        this._label.AddClass('app-component-checkbox-label');
        this._label.value = this._fieldData.placeholder ? this._fieldData.placeholder[Lang.Current] ?? this._fieldData.placeholder : '';

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
        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args || {}, {component: this})));
        this._input.AddHandler('Clicked', (event, args) => {
            this.Dispatch('Clicked', args)
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });
        this._input.AddHandler('ReceiveFocus', (event, args) => this.Dispatch('ReceiveFocus', args));
        this._input.AddHandler('LoosedFocus', (event, args) => this.Dispatch('LoosedFocus', args));

        this._label.AddHandler('Clicked', (event, args) => {
            this._input.Dispatch('Clicked', args);
            args.domEvent.stopPropagation();
            return false;
        });
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
Colibri.UI.Forms.Field.RegisterFieldComponent('Checkbox', 'Colibri.UI.Forms.Checkbox', '#{ui-fields-checkbox}')
