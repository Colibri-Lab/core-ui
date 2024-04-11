/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Color.Alpha = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('div'));
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

    /** @private */
    _setNewValue(top) {
        const bounds = this._element.bounds();
        const trackbounds = this._pointer.container.bounds();

        top = top + trackbounds.outerHeight / 2;
        const percent = top * 100 / bounds.outerHeight;
        const alpha = percent * 255 / 100;
        
        this._value = Math.round(alpha);
        this.Dispatch('Changed');          
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
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

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __lineClicked(event, args) {
        const bounds = this._element.bounds();
        const trackbounds = this._pointer.container.bounds();
        const e = args.domEvent;
        let top = e.pageY - bounds.top - trackbounds.outerHeight / 2;
        this._pointer.styles = {top: top + 'px'};
        this._setNewValue(top);
    }

    /** @private */
    _setTrackPosition() {
        const bounds = this._element.bounds()
        const topPercent = this._value * 100 / 255;
        const top = topPercent * bounds.outerHeight / 100;
        this._pointer.styles = {top: top + 'px'};
    }
    
    /**
     * Alpha value
     * @type {number}
     */
    get value() {
        return this._value;
    }

    /**
     * Alpha value
     * @type {number}
     */
    set value(value) {
        this._value = value;
        this._setTrackPosition();
    }

}