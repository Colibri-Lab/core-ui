Colibri.UI.Checkbox = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<span />');
        this.AddClass('app-component-checkbox');

        this._renderInput();

        this._enabled = true;
        this._readonly = false;

        this._hasThirdState = false;
        this._thirdState = false;

        this._handleEvents();
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Поднимается, когда изменил состояние');
    }

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
        this._checkIcon.AddHandler('ReceiveFocus', (event, args) => this.Dispath('ReceiveFocus', args));
        this._checkIcon.AddHandler('LoosedFocus', (event, args) => this.Dispath('LoosedFocus', args));
    }

    /**
     * Нарисовать инпут
     * @private
     */
    _renderInput() {
        this._checkIcon = new Colibri.UI.Icon(this.name + '-icon', this);
        this._checkIcon.shown = true;
        this._setIcon();

        this._input = Element.create('input', {id: this.name + '-input-' + Date.Now().getTime()});
        this._element.append(this._input);
    }

    /**
     * Установить нужную иконку
     * @private
     */
    _setIcon() {
        this._checkIcon.value = (this._hasThirdState && this._thirdState) ? Colibri.UI.MinusIcon : Colibri.UI.AltCheckMarkIcon;
    }

    Focus() {
        this._input.focus();
    }

    /**
     * Чекбокс отмечен
     * @type {boolean}
     */
    get checked() {
        return this._input.checked;
    }
    set checked(value) {
        this._setChecked(value);
    }
    _setChecked(value) {
        // if (this._readonly || !this._enabled) {
        //     return;
        // }

        this._input.checked = value;
        if (value) {
            this.AddClass('-checked');
        } else {
            this.RemoveClass('-checked');
        }
    }

    /**
     * Элемент выключен
     * @type {boolean}
     */
    set enabled(value) {
        this._enabled = (value === true || value === 'true')
        this._input.disabled = !this._enabled;
        super.enabled = value;
    }
    get enabled() {
        return this._enabled;
    }

    /**
     * Только для чтения
     * @type {boolean}
     */
    get readonly() {
        return this._readonly;
    }
    set readonly(value) {
        this._readonly = (value === true || value === 'true');
        super.readonly = this._readonly;
    }

    /**
     * Есть ли третье состояние у чекбокса
     * @type {boolean}
     */
    get hasThirdState() {
        return this._hasThirdState;
    }
    set hasThirdState(value) {
        this._hasThirdState = (value === true || value === 'true');
    }

    /**
     * Третье состояние активно
     * @type {boolean}
     */
    get thirdState() {
        return this._thirdState;
    }
    set thirdState(value) {
        this._thirdState = (value === true || value === 'true');
        this._thirdState ? this.AddClass('-third-state') : this.RemoveClass('-third-state');
        this._setIcon();
    }

    get placeholder() {
        return this._placeholder?.value;
    }
    set placeholder(value) {
        this._setPlaceholder(value);
    }
    
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
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
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
    set tabIndex(value) {
        if (this._placeholder) {
            this._placeholder.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
        else if(this._checkIcon) {
            this._checkIcon.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }


}