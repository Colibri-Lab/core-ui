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

        this.AddHandler('Clicked', (event, args) => this.__lineClicked(event, args));
        this.handleResize = true;
        this.AddHandler('Resized', (event, args) => this._renderGradient());
        this.tabIndex = 0;
        this.AddHandler('KeyDown', (event, args) => this.__keyDown(event, args));

        new Colibri.UI.Drag(this._pointer.container, this.container, (left, top) => {
            this._pointer.styles = {left: left + 'px'};
            this._setNewValue(left);            
        });

        Colibri.Common.Delay(100).then(() => {
            this._renderGradient();
        });
        
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
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
        left += 5;
        const bounds = this._element.bounds();
        let t = Math.round(left / (bounds.outerWidth / 360));
        t = Math.abs(t - 360);
        t = (t == 360) ? 0 : t;
        t = Math.round(t * 100 / 360) / 100;

        this.value = t;
        this.Dispatch('Changed', {value: this.value}); 
    }

    /** @private */
    _showValue() {
        let t = this.value;
        const bounds = this._element.bounds();
        const pointerBounds = this._pointer.container.bounds();

        // процент
        let left = bounds.outerWidth - ((t * 100) * bounds.outerWidth / 100);
        this._pointer.styles = {backgroundColor: Colibri.UI.Rgb.Create().fromHSV(t, 1, 1).hex, left: (left - pointerBounds.outerWidth / 2)  + 'px'};

    }

    /** @private */
    _renderGradient() {
        const bounds = this._element.bounds(); 
		const canva = this._canvas.container.getContext("2d");

		const gradient = canva.createLinearGradient(bounds.outerWidth, bounds.outerHeight / 2, 0, bounds.outerHeight);
	    const hue = [[255, 0, 0], [255, 255, 0], [0, 255, 0], [0, 255, 255], [0, 0, 255], [255, 0, 255], [255, 0, 0]];
		for (var i = 0; i <= 6; i++) {
			gradient.addColorStop(i * 1 / 6, 'rgb(' + hue[i][0] + ',' + hue[i][1] + ',' + hue[i][2] + ')');
		}

        canva.fillStyle = gradient;
		canva.fillRect(0, 0, bounds.outerWidth + 100, bounds.outerHeight * 100);
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
        this._pointer.styles = {left: left + 'px'};
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