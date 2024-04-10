/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Color.Block = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.fromHtml('<div><div class="grad"></div></div>')[0]);
        this.AddClass('app-color-block-component');
        
        this._pointer = new Colibri.UI.Pane(this.name + '_pointer', this);
        this._pointer.AddClass('app-color-block-pointer-component');
        this._pointer.shown = true;

        this.RegisterEvent('Changed', false, 'Когда значение изменилось');

        new Colibri.UI.Drag(this._pointer.container, this.container, (left, top) => {
            this._setNewColor(left, top);     
        });

        this.AddHandler('Clicked', (event, args) => this.__blockClicked(event, args));

    }

    _setNewColor(left, top) {
        this._setPoint(left, top);

        const bounds = this._element.bounds();

        left = left + this._pointer.container.bounds().outerWidth / 2;
        top = top + this._pointer.container.bounds().outerHeight / 2;

        let S = Math.ceil(left / (bounds.outerWidth / 100));
        let V = Math.ceil(Math.abs(top / (bounds.outerHeight / 100) - 100));

        this._S = S / 100;
        this._V = V / 100;

        this.Dispatch('Changed', {value: this.value});

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __blockClicked(event, args) {
        const bounds = this._element.bounds();
        const pointBounds = this._pointer.container.bounds();
        const e = args.domEvent;
        let top = e.pageY - bounds.top - pointBounds.outerHeight / 2;
        let left = e.pageX - bounds.left - pointBounds.outerWidth / 2;
        this._setNewColor(left, top);     
    }

    _setPoint(left = null, top = null) {
        const bounds = this._element.bounds();
        const pointBounds = this._pointer.container.bounds();
        let S = this._S * 100;
        let V = this._V * 100;

        left = left ? left : bounds.outerWidth * S / 100 - pointBounds.outerWidth / 2;
        top = top ? top : bounds.outerHeight - bounds.outerHeight * V / 100 - pointBounds.outerHeight / 2;
        this._pointer.styles = {left: (left) + 'px', top: (top) + 'px'};
    }

    
    _showColor() {
        this.styles = {backgroundImage: 'linear-gradient(to right, #ffffff, ' + this._color + ')'};
    }
    set color(value) {
        if(value instanceof Colibri.UI.Rgb) {
            value = value.hex;
        }
        else if(Object.isObject(value)) {
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