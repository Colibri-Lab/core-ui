/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Color.Line = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-color-line-component');

        this.RegisterEvent('Changed', false, 'Когда значение изменилось');

        this._canvas = new Colibri.UI.Component(this.name + '_canvas', this, Element.create('canvas'));
        this._canvas.AddClass('app-color-line-canvas-component');
        this._canvas.shown = true;

        this._pointer = new Colibri.UI.Pane(this.name + '_pointer', this);
        this._pointer.AddClass('app-color-line-pointer-component');
        this._pointer.shown = true;
        this.tabIndex = 0;

        this.handleResize = true;
        this.AddHandler('Resized', this._renderGradient);
        this.AddHandler('Clicked', this.__lineClicked);
        // this.AddHandler('KeyDown', this.__keyDown);

        new Colibri.UI.Drag(this._pointer.container, this.container, (left, top) => {
            this._pointer.styles = { left: left + 'px' };
            this._setNewValue(left + 5);
        });

        Colibri.Common.Delay(100).then(() => {
            this._renderGradient();
            this._showValue();
        });

    }

    // /**
    //  * @private
    //  * @param {Colibri.Events.Event} event event object
    //  * @param {*} args event arguments
    //  */
    // __keyDown(event, args) {
    //     if (['ArrowLeft', 'ArrowRight'].indexOf(args.domEvent.code) !== -1) {
    //         if (args.domEvent.code == 'ArrowLeft') {
    //             this.value += 0.01;
    //         }
    //         else if (args.domEvent.code == 'ArrowRight') {
    //             this.value -= 0.01;
    //         }
    //     }
    // }

    /**
     * Component width
     * @type {number}
     */
    set width(value) {
        super.width = value;
        this._renderGradient();
    }
    /**
     * Component width
     * @type {number}
     */
    set height(value) {
        super.height = value;
        this._renderGradient();
    }
    /** @private */
    _setNewValue(left) {

        const ctx = this._canvas.container.getContext("2d");
        const pixel = ctx.getImageData(left, 0, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        // Переводим RGB в Hue 0..1
        const rr = r / 255, gg = g / 255, bb = b / 255;
        const max = Math.max(rr, gg, bb);
        const min = Math.min(rr, gg, bb);
        const delta = max - min;

        let h = 0;
        if (delta === 0) h = 0;
        else if (max === rr) h = ((gg - bb) / delta) % 6;
        else if (max === gg) h = (bb - rr) / delta + 2;
        else if (max === bb) h = (rr - gg) / delta + 4;

        h = h * 60;
        if (h < 0) h += 360;

        let t = h / 360;

        this._value = t;
        this._pointer.styles = { backgroundColor: Colibri.UI.Rgb.Create().fromHSV(t, 1, 1).hex };
        this.Dispatch('Changed', { value: this.value });
    }

    /** @private */
    _showValue() {
        let t = this.value;
        const bounds = this._element.bounds();
        const pointerBounds = this._pointer.container.bounds();
        let left = ((t * 100) * bounds.outerWidth / 100);
        this._pointer.styles = { backgroundColor: Colibri.UI.Rgb.Create().fromHSV(t, 1, 1).hex, left: (left - pointerBounds.outerWidth / 2) + 'px' };
    }

    /** @private */
    _renderGradient() {
        const bounds = this._element.bounds();
        const ctx = this._canvas.container.getContext("2d");

        const w = bounds.outerWidth;
        const h = bounds.outerHeight + 100;

        // горизонтальный градиент: слева → справа
        const gradient = ctx.createLinearGradient(0, h / 2, w, h / 2);

        const hue = [
            [255, 0, 0],
            [255, 255, 0],
            [0, 255, 0],
            [0, 255, 255],
            [0, 0, 255],
            [255, 0, 255],
            [255, 0, 0]
        ];

        for (let i = 0; i < hue.length; i++) {
            gradient.addColorStop(i / (hue.length - 1), `rgb(${hue[i][0]},${hue[i][1]},${hue[i][2]})`);
        }

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __lineClicked(event, args) {
        const bounds = this._element.bounds();
        const e = args.domEvent;
        let left = e.pageX - bounds.left - 5;
        this._pointer.styles = { left: left + 'px' };
        this._setNewValue(left);
    }

    /**
     * Component value
     * @type {string}
     */
    get value() {
        return this._value;
    }
    /**
     * Component value
     * @type {string}
     */
    set value(value) {
        if (value <= 0) {
            value = 0;
        }
        if (value >= 1) {
            value = 1;
        }
        this._value = value;
        this._renderGradient();
        this._showValue();
    }

}