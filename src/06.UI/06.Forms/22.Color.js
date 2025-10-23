/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Color = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-color-field');

        const contentContainer = this.contentContainer;

        this._flex = new Colibri.UI.FlexBox(this.name + '_flex', contentContainer);
        this._color = new Colibri.UI.Pane(this._name + '_color', this._flex);
        this._input = new Colibri.UI.Input(this.name + '_input', this._flex);
        this._button = new Colibri.UI.Button(this.name + '_button', this._flex);
        this._flex.shown = this._color.shown = this._input.shown = this._button.shown = true;
        this._input.loading = this._input.hasIcon = this._input.hasClearIcon = false;

        const icon = new Colibri.UI.Icon(this.name + '_buttonicon', this._button);
        icon.shown = true;
        icon.value = Colibri.UI.SelectArrowIcon;

        if (this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if (this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

        this.placeholder = this._fieldData?.placeholder;

        this.value = this._fieldData?.default ?? '';

        this._button.AddHandler('Clicked', this.__buttonClicked, false, this);

        this._input.AddHandler('Changed', this.__inputChanged, false, this);
        this._input.AddHandler('KeyUp', this.__thisBubble, false, this);
        this._input.AddHandler('KeyDown', this.__thisBubble, false, this);
        this._input.AddHandler('Clicked', this.__thisBubble, false, this);

    }

    __inputChanged(event, args) {
        this._color.styles = { backgroundColor: this._input.value };
        this.Dispatch('Changed', Object.assign(args, { component: this }));
    }

    /** @private */
    _showPopup() {

        this._colorPopupObject = new Colibri.UI.Popup(this.name + '_color_popup', this.contentContainer);
        this._colorPopupObject.parent = this;

        this._colorPopup = new Colibri.UI.Color(this.name + '_color', this._colorPopupObject);
        this._colorPopup.styles = { position: 'static' };
        this._colorPopup.shown = true;
        this._colorPopup.AddHandler('Changed', this.__coloPopupChanged, false, this);
        this._colorPopup.AddHandler('ShadowClicked', this.__colorPopupShadowClicked, false, this);
        this._colorPopup.value = this._input.value;
        this._colorPopup.top = this._input.top + this._input.height;
        this._colorPopup.left = this._input.left;
        this._colorPopup.width = Math.max(this._input.width, 379);

        this._colorPopupObject.Show(this.contentContainer, true);

    }

    __colorPopupShadowClicked(event, args) {
        console.log('disposing');
        this._colorPopupObject.Dispose();
    }

    __coloPopupChanged(event, args) {
        this._input.value = this._colorPopup.value.hex;
        this._color.styles = { backgroundColor: this._input.value };
        this.Dispatch('Changed', args);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __buttonClicked(event, args) {
        this._showPopup();
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
        this._input.readonly = value;
        this._button.enabled = !value;
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
        this._input.placeholder = value;
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        let value = this._input.value;
        if (this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if (this._fieldData?.params?.eval) {
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
        this._color.styles = { backgroundColor: this._input.value };
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
        this._button.enabled = value;
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

Colibri.UI.Forms.Field.RegisterFieldComponent('Color', 'Colibri.UI.Forms.Color', '#{ui-fields-color}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'fieldgenerator', 'generator', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler']);
