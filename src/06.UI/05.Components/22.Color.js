Colibri.UI.Color = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<div />');
        this.AddClass('app-color-component');

        this._input = Element.create('input', {type: 'color'});
        this._element.append(this._input);

        this._value = Element.create('input', {type: 'text', disabled: 'disabled'});
        this._element.append(this._value);

        this._input.addEventListener('change', (e) => {
            this._changeView();
            this.Dispatch('Changed', {domEvent: e});
        });
        this._input.addEventListener('click', (e) => this.Dispatch('Clicked', {domEvent: e}));
        this._input.addEventListener('keyup', (e) => this.Dispatch('KeyUp', {domEvent: e}));
        this._input.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));

        this._changeView();

    }

    _changeView() {
        this._value.value = this._input.value;
    }

    
    Focus() {
        this._input.focus();
        //this._input.select();
    }
    
    get readonly() {
        return this._input.attr('readonly') === 'readonly';
    }

    set readonly(value) {
        if(value === true || value === 'true') {
            this._input.attr('readonly', 'readonly');
        }
        else {
            this._input.attr('readonly', null);
        }
    }

    get placeholder() {
        return this._value.attr('placeholder');
    }

    set placeholder(value) {
        this._value.attr('placeholder', value);
    }

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

    set value(value) {
        this._input.value = value ?? '';
    }

    
    get enabled() {
        return this._input.attr('disabled') != 'disabled';
    }

    set enabled(value) {
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
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.attr('tabIndex');
    }
    set tabIndex(value) {
        this._input && this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }


}