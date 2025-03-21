/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Bool = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-bool-field');

        const contentContainer = this.contentContainer;

        this._uniqueString = Number.unique();

        this._input = contentContainer.container.append(Element.create('input', {type: 'checkbox', id: this._name + '-id-' + this._uniqueString, name: this._name + '-input'}));
        this._label = contentContainer.container.append(Element.create('label', {for: this._name + '-id-' + this._uniqueString}));
        
        this._input.addEventListener('change', (e) => this.Dispatch('Changed', {domEvent: e, component: this}));
        this._input.addEventListener('keyup', (e) => this.Dispatch('KeyUp', {domEvent: e}));
        this._input.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));
        this._input.addEventListener('click', (e) => {
            this.Focus();
            this.Dispatch('Clicked', {domEvent: e})
            e.stopPropagation();
            return false;
        });

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

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    /**
     * Focus on component
     */
    Focus() {
        this._input.focus();
        this._input.select();
    }

    /**
     * Label for checkbox
     * @type {string}
     */
    get title() {
        return this._label.html();
    }
    /**
     * Label for checkbox
     * @type {string}
     */
    set title(value) {
        value = this._convertProperty('String', value);
        this._label.html(value);
    }

    /**
     * Field is readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input.attr('readonly') === 'readonly';
    }
    /**
     * Field is readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this._input.attr('readonly', 'readonly');
        }
        else {
            this._input.attr('readonly', null);
        }
    }

    /**
     * Field placeholder
     * @type {string}
     */
    get placeholder() {
        return '';
    }

    /**
     * Field placeholder
     * @type {string}
     */
    set placeholder(value) {
        // do nothing
    }

    /**
     * Value
     * @type {boolean}
     */
    get value() {
        return this._input.is(':checked');
    }

    /**
     * Value
     * @type {boolean}
     */
    set value(value) {
        
        if(value === null) {
            value = {};
        }

        const _value = value[this._fieldData?.selector?.value ?? 'value'] ?? value;
        if(_value === '1' || _value === 'true' || _value === true) {
            this._input.attr('checked', 'checked');
        }
        else {
            this._input.attr('checked', null);
        }
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */    
    get enabled() {
        return this._input.attr('disabled') != 'disabled';
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */    
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this.RemoveClass('app-component-disabled');
            this._input.attr('disabled', null);
        }
        else {
            this.AddClass('app-component-disabled');
            this._input.attr('disabled', 'disabled');
        }
    }

    /**
     * Tab index
     * @type {number|boolean}
     */
    get tabIndex() {
        return this._input && this._input.attr('tabIndex');
    }
    /**
     * Tab index
     * @type {number|boolean}
     */
    set tabIndex(value) {
        this._input && this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }


}
Colibri.UI.Forms.Field.RegisterFieldComponent('Bool', 'Colibri.UI.Forms.Bool', '#{ui-fields-bool}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler']);