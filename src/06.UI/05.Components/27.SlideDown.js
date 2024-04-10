/**
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.SlideDown = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {*} element element to create in
     */    
    constructor(name, container, element) {
        super(name, container, element);
        this.AddClass('app-component-slidedown-component');
        
        this.tabIndex = null;
        this.AddHandler('ShadowClicked', (event, args) => {
            this.Hide();
        });

    }

    Toggle() {
        this.__handlerClicked();    
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __handlerClicked(event, args) {
        if(this.shown) {
            this.shown = false;
            this.handler.state = 'collapsed';
        } else {
            this.shown = true;
            this.handler.state = 'expanded';
        }
    }


    /**
     * Name of object with is the handler
     * @type {string}
     */
    get handler() {
        return this._handler;
    }
    /**
     * Name of object with is the handler
     * @type {string}
     */
    set handler(value) {
        if(!value && this._handler) {
            this._handler.ClearHandlers();
        }
        this._handler = value;
        if(typeof this._handler === 'string') {
            Colibri.Common.Wait(() => Colibri.UI.Find(this._handler)).then(() => {
                this._handler = Colibri.UI.Find(this._handler);
                if(this._handler) {
                    this._handler.AddHandler('Clicked', (event, args) => this.__handlerClicked(event, args));
                }
            });
        } else {
            this._handler.AddHandler('Clicked', (event, args) => this.__handlerClicked(event, args));
        }
    }



}
