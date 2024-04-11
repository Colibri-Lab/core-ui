/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Radio = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {string} fieldName name of field to generate
     */
    constructor(name, container, fieldName) {
        super(name, container, Element.create('span'));
        this.AddClass('app-component-radio');

        this._fieldName = fieldName;
        this._renderInput();

        this._enabled = true;
        this._readonly = false;

        this._handleEvents();
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Поднимается, когда изменил состояние');
    }

    /** @protected */
    _handleEvents() {
        this.AddHandler('Clicked', (event, args) => {
            if (!this._readonly && this._enabled) {
                this._setChecked(!this._input.checked);
                this.Dispatch('Changed', {value: this._input.checked});
            }

            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });
        this.AddHandler('KeyUp', (event, args) => {
            if(args.domEvent.code === 'Space') {
                this.Dispatch('Clicked', args);
            }
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });
        this._checkIcon.AddHandler('ReceiveFocus', (event, args) => this.Dispatch('ReceiveFocus', args));
        this._checkIcon.AddHandler('LoosedFocus', (event, args) => this.Dispatch('LoosedFocus', args));

    }

    /**
     * Render input
     * @private
     */
    _renderInput() {
        this._checkIcon = new Colibri.UI.Icon(this.name + '-icon', this);
        this._checkIcon.shown = true;
        this._setIcon();

        this._input = Element.create('input', {id: this.name + '-input-' + Date.Now().getTime(), name: this._fieldName, type: 'radio'});
        this._input.tag('component', this);
        this._element.append(this._input);
    }

    /**
     * Set the icon
     * @private
     */
    _setIcon() {
        this._checkIcon.value = Colibri.UI.AltRadioMarkIcon;
    }

    /**
     * Focus on input
     */
    Focus() {
        this._input.focus();
    }

    /**
     * Checkbox is checked
     * @type {boolean}
     */
    get checked() {
        return this._input.checked;
    }
    /**
     * Checkbox is checked
     * @type {boolean}
     */
    set checked(value) {
        this._setChecked(value);
    }
    /** @private */
    _setChecked(value, process = true) {
        this._input.checked = value;
        if (value) {
            this.AddClass('-checked');
        } else {
            this.RemoveClass('-checked');
        }

        if(process) {
            this._unsetAllByGroup();
        }

    }

    /** @private */
    _unsetAllByGroup() {
        document.querySelectorAll('input[type=radio][name="' + this._fieldName + '"]').forEach(el => {
            if(el != this._input) {
                const component = el.tag('component');
                component._setChecked(false, false);
            }
        });
    }

    /**
     * Enable/Disable component
     * @type {boolean}
     */
    set enabled(value) {
        this._enabled = (value === true || value === 'true')
        this._input.disabled = !this._enabled;
        super.enabled = value;
    }
    /**
     * Enable/Disable component
     * @type {boolean}
     */
    get enabled() {
        return this._enabled;
    }

    /**
     * Is checkbox readonly
     * @type {boolean}
     */
    get readonly() {
        return this._readonly;
    }
    /**
     * Is checkbox readonly
     * @type {boolean}
     */
    set readonly(value) {
        this._readonly = (value === true || value === 'true');
        super.readonly = this._readonly;
    }

    /**
     * Placeholder
     * @type {string}
     */
    get placeholder() {
        return this._placeholder?.value;
    }
    /**
     * Placeholder
     * @type {string}
     */
    set placeholder(value) {
        this._setPlaceholder(value ? value[Lang.Current] ?? value : '');
    }
    /** @private */
    _setPlaceholder(value) {
        if(!value) {
            this._placeholder.Dispose();
        }
        else {
            this._placeholder = new Colibri.UI.TextSpan(this.name + '_placeholder', this);
            this._placeholder.shown = true;
            this._placeholder.value = value;
        }
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        if (this._placeholder) {
            return this._placeholder && this._placeholder.tabIndex;
        }
        else if(this._checkIcon) {
            return this._checkIcon && this._checkIcon.tabIndex;
        }
        
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        if (this._placeholder) {
            this._placeholder.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
        else if(this._checkIcon) {
            this._checkIcon.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }

}