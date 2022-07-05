Colibri.UI.Color = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<div />');
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
        this._colorHex.attr('placeholder', value);
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

Colibri.UI.Color.Line = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<div />');
        this.AddClass('app-color-line-component');

        this.RegisterEvent('Changed', false, 'Когда значение изменилось');

        this._canvas = new Colibri.UI.Component(this.name + '_canvas', this, '<canvas />');
        this._canvas.AddClass('app-color-line-canvas-component');
        this._canvas.shown = true;

        this._pointer = new Colibri.UI.Pane(this.name + '_pointer', this);
        this._pointer.AddClass('app-color-line-pointer-component');
        this._pointer.shown = true;

        this.AddHandler('Clicked', (event, args) => this.__lineClicked(event, args));
        this.handleResize = true;
        this.AddHandler('Resized', (event, args) => this._renderGradient());
        this.tabIndex = 0;
        this.AddHandler('KeyDown', (event, args) => this.__keyDown(event, args));

        new Colibri.UI.Drag(this._pointer.container, this.container, (left, top) => {
            console.log(left);
            this._pointer.styles = {left: left + 'px'};
            this._setNewValue(left);            
        });

        Colibri.Common.Delay(100).then(() => {
            this._renderGradient();
        });
        
    }

    __keyDown(event, args) {
        if(['ArrowLeft', 'ArrowRight'].indexOf(args.domEvent.code) !== -1) {
            if(args.domEvent.code == 'ArrowLeft') {
                this.value += 0.01;
            }
            else if(args.domEvent.code == 'ArrowRight') {
                this.value -= 0.01;
            }
        }
    }

    set width(value) {
        super.width = value;
        this._renderGradient();
    }
    set height(value) {
        super.height = value;
        this._renderGradient();
    }

    _setNewValue(left) {
        left += 5;
        const bounds = this._element.bounds();
        let t = Math.round(left / (bounds.outerWidth / 360));
        t = Math.abs(t - 360);
        t = (t == 360) ? 0 : t;
        t = Math.round(t * 100 / 360) / 100;

        this.value = t;
        this.Dispatch('Changed', {value: this.value}); 
    }

    _showValue() {
        let t = this.value;
        const bounds = this._element.bounds();
        const pointerBounds = this._pointer.container.bounds();

        // процент
        let left = bounds.outerWidth - ((t * 100) * bounds.outerWidth / 100);
        this._pointer.styles = {backgroundColor: Colibri.UI.Rgb.Create().fromHSV(t, 1, 1).hex, left: (left - pointerBounds.outerWidth / 2)  + 'px'};

    }

    _renderGradient() {
        const bounds = this._element.bounds(); 
		const canva = this._canvas.container.getContext("2d");

		const gradient = canva.createLinearGradient(bounds.outerWidth, bounds.outerHeight / 2, 0, bounds.outerHeight);
	    const hue = [[255, 0, 0], [255, 255, 0], [0, 255, 0], [0, 255, 255], [0, 0, 255], [255, 0, 255], [255, 0, 0]];
		for (var i = 0; i <= 6; i++) {
			gradient.addColorStop(i * 1 / 6, 'rgb(' + hue[i][0] + ',' + hue[i][1] + ',' + hue[i][2] + ')');
		}

        canva.fillStyle = gradient;
        console.log(bounds);
		canva.fillRect(0, 0, bounds.outerWidth + 100, bounds.outerHeight * 100);
    }

    __lineClicked(event, args) {
        const bounds = this._element.bounds();
        const e = args.domEvent;
        let left = e.pageX - bounds.left - 5;
        this._pointer.styles = {left: left + 'px'};
        this._setNewValue(left);
    }
    

    get value() {
        return this._value;
    }
    set value(value) {
        if(value <= 0) {
            value = 0;
        }
        if(value >= 1) {
            value = 1;
        }
        this._value = value;
        this._renderGradient();
        this._showValue();
    }

}
Colibri.UI.Color.Block = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<div><div class="grad"></div></div>');
        this.AddClass('app-color-block-component');
        
        this._pointer = new Colibri.UI.Pane(this.name + '_pointer', this);
        this._pointer.AddClass('app-color-block-pointer-component');
        this._pointer.shown = true;

        this.RegisterEvent('Changed', false, 'Когда значение изменилось');

        new Colibri.UI.Drag(this._pointer.container, this.container, (left, top) => {
            this._pointer.styles = {left: left + 'px', top: top + 'px'};
            this._setNewColor(left, top);     
        });

        this.AddHandler('Clicked', (event, args) => this.__blockClicked(event, args));

    }

    _setNewColor(left, top) {
        const bounds = this._element.bounds();

        left = left + this._pointer.container.bounds().outerWidth / 2;
        top = top + this._pointer.container.bounds().outerHeight / 2;

        let S = Math.ceil(left / (bounds.outerWidth / 100));
        let V = Math.ceil(Math.abs(top / (bounds.outerHeight / 100) - 100));

        this._S = S / 100;
        this._V = V / 100;

        this._setPoint();
        this.Dispatch('Changed', {value: this.value});

    }

    __blockClicked(event, args) {
        const bounds = this._element.bounds();
        const e = args.domEvent;
        let top = e.pageY - bounds.top;
        let left = e.pageX - bounds.left;
        this._setNewColor(left, top);     
    }

    _setPoint() {
        const bounds = this._element.bounds();
        const pointBounds = this._pointer.container.bounds();
        let S = this._S * 100;
        let V = this._V * 100;

        let left = bounds.outerWidth * S / 100 - pointBounds.outerWidth / 2;
        let top = bounds.outerHeight - bounds.outerHeight * V / 100 - pointBounds.outerHeight / 2;
        this._pointer.styles = {left: (left) + 'px', top: (top) + 'px'};
    }

    
    _showColor() {
        this.styles = {backgroundImage: 'linear-gradient(to right, #ffffff, ' + this._color + ')'};
    }
    set color(value) {
        if(value instanceof Colibri.UI.Rgb) {
            value = value.hex;
        }
        else if(value instanceof Object) {
            value = Colibri.UI.Rgb.Create().fromObject(value).hex;
        }
        else if(typeof value == 'number') {
            // hue
            value = Colibri.UI.Rgb.Create().fromHue(value).hex;
        }
        this._color = value;
        this._hue = Colibri.UI.Rgb.Create().fromHex(this._color).hue;
        this._showColor();
    }

    set value(value) {
        if(typeof value == 'string') {
            value = Colibri.UI.Rgb.Create().fromHex(value);
        }
        else if(typeof value == 'number') {
            value = Colibri.UI.Rgb.Create().fromHue(value);
        }
        
        this._S = value.hsv.s;
        this._V = value.hsv.v;
        this._hue = value.hsv.h;
        this.color = value.hsv.h;
        this._setPoint();
    }

    get value() {
        return Colibri.UI.Rgb.Create().fromHSV(this._hue, this._S, this._V);
    }

}
Colibri.UI.Color.Alpha = class extends Colibri.UI.Component {
    constructor(name, container) {
        super(name, container, '<div />');
        this.AddClass('app-color-alpha-component');

        this.RegisterEvent('Changed', false, 'Когда значение изменилось');

        this._pointer = new Colibri.UI.Pane(this.name + '_pointer', this);
        this._pointer.AddClass('app-color-alpha-pointer-component');
        this._pointer.shown = true;

        this.AddHandler('Clicked', (event, args) => this.__lineClicked(event, args));
        this.tabIndex = 0;
        this.AddHandler('KeyDown', (event, args) => this.__keyDown(event, args));

        new Colibri.UI.Drag(this._pointer.container, this.container, (left, top) => {
            this._pointer.styles = {top: top + 'px'};
            this._setNewValue(top);
        });
        
    }

    _setNewValue(top) {
        const bounds = this._element.bounds();
        const trackbounds = this._pointer.container.bounds();

        top = top + trackbounds.outerHeight / 2;
        const percent = top * 100 / bounds.outerHeight;
        const alpha = percent * 255 / 100;
        
        this._value = Math.round(alpha);
        this.Dispatch('Changed');          
    }

    __keyDown(event, args) {
        if(['ArrowUp', 'ArrowDown'].indexOf(args.domEvent.code) !== -1) {
            if(args.domEvent.code == 'ArrowUp') {
                this._value -= 1;
                this._setTrackPosition();
                this.Dispatch('Changed'); 
            }
            else if(args.domEvent.code == 'ArrowDown') {
                this._value += 1;
                this._setTrackPosition();
                this.Dispatch('Changed'); 
            }
        }
    }

    __lineClicked(event, args) {
        const bounds = this._element.bounds();
        const trackbounds = this._pointer.container.bounds();
        const e = args.domEvent;
        let top = e.pageY - bounds.top - trackbounds.outerHeight / 2;
        this._pointer.styles = {top: top + 'px'};
        this._setNewValue(top);
    }

    _setTrackPosition() {
        const bounds = this._element.bounds()
        const topPercent = this._value * 100 / 255;
        const top = topPercent * bounds.outerHeight / 100;
        this._pointer.styles = {top: top + 'px'};
    }
    
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this._setTrackPosition();
    }

}