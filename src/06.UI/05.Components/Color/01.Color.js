Colibri.UI.Color = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-color-component');

        this.RegisterEvent('Changed', false, 'Когда значение изменилось');

        this._colorGrad = new Colibri.UI.Color.Line(this.name + '_grad', this);

        this._colorSelectedColorGrad = new Colibri.UI.Color.Block(this.name + '_block', this);

        this._colorOpacityGrad = new Colibri.UI.Color.Alpha(this.name + '_alpha', this);

        this._colorHex = Element.create('input', {class: 'app-color-hex-component'});
        this._colorSelected = Element.create('div', {class: 'app-color-selected-component'});

        this._element.append(this._colorHex);
        this._element.append(this._colorSelected);

        this._colorGrad.shown = true;
        this._colorSelectedColorGrad.shown = true;
        this._colorOpacityGrad.shown = true;

        this._colorGrad.AddHandler('Changed', (event, args) => this.__lineValueChanged(event, args));
        this._colorSelectedColorGrad.AddHandler('Changed', (event, args) => this.__blockValueChanged(event, args));
        this._colorOpacityGrad.AddHandler('Changed', (event, args) => this.__opacityValueChanged(event, args));

        this._colorHex.addEventListener('change', (e) => {
            this.value = this._colorHex.value;
        });
    }

    _updateUIComponents() {
        this._colorGrad.value = this._value.hue;
        this._colorSelectedColorGrad.value = this._value;
        this._colorOpacityGrad.value = this._value.alpha;
    }

    _showValue() {
        this._colorHex.value = this._value.hex;
        this._colorSelected.css('background-color', this._colorHex.value);
        this.Dispatch('Changed');
    }

    __lineValueChanged(event, args) {
        const alpha = this._value.alpha;
        this._colorSelectedColorGrad.color = this._colorGrad.value;
        this._value = this._colorSelectedColorGrad.value;
        this._value.alpha = alpha;
        this._showValue();
    }

    __blockValueChanged(event, args) {
        const alpha = this._value.alpha;
        this._value = this._colorSelectedColorGrad.value;
        this._value.alpha = alpha;
        this._showValue();
    }

    __opacityValueChanged(event, args) {
        this._value.alpha = this._colorOpacityGrad.value;
        this._showValue();
    }

    Focus() {
        this._colorHex.focus();
    }
    
    get readonly() {
        return this._colorHex.attr('readonly') === 'readonly';
    }

    set readonly(value) {
        if(value === true || value === 'true') {
            this._colorHex.attr('readonly', 'readonly');
        }
        else {
            this._colorHex.attr('readonly', null);
        }
    }

    get placeholder() {
        return this._colorHex.attr('placeholder');
    }

    set placeholder(value) {
        this._colorHex.attr('placeholder', value ? value[Lang.Current] ?? value : '');
    }

    get value() {
        let value = this._value;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if(this._fieldData?.params?.eval) {
            value = eval(this._fieldData?.params?.eval);
        }
        return value;
    }

    set value(value) {
        if(typeof value == 'string') {
            this._value = Colibri.UI.Rgb.Create().fromHex(value);
        }
        else if(typeof value == 'number') {
            this._value = Colibri.UI.Rgb.Create().fromHue(value);
        }
        else if(value instanceof Colibri.UI.Rgb) {
            this._value = value;
        }
        else if(value instanceof Object) {
            this._value = Colibri.UI.Rgb.Create().fromObject(value);
        }
        this._updateUIComponents();
        this._showValue();
    }

    
    get enabled() {
        return this._colorHex.attr('disabled') != 'disabled';
    }

    set enabled(value) {
        if(value) {
            this.RemoveClass('app-component-disabled');
            this._colorHex.attr('disabled', null);
        }
        else {
            this.AddClass('app-component-disabled');
            this._colorHex.attr('disabled', 'disabled');
        }
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._colorHex && this._colorHex.attr('tabIndex');
    }
    set tabIndex(value) {
        this._colorHex && this._colorHex.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }


}