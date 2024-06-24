/**
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.Popup = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {*} element element to create in
     */    
    constructor(name, container, element) {
        super(name, container, element);
        this.AddClass('app-popup-component');
        
        this.tabIndex = null;
        this.AddHandler('ShadowClicked', (event, args) => {
            this.Hide();
        });

        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', (event, args) => {
            if(this.parent && this._positionOnParent) {
                const bounds = this.container.bounds(true, true);
                if(!args.state) {
                    
                    if(this.isComponentWentOutOfRight) {
                        this.right = 0;
                        this.left = null;
                    } else if(this.isComponentWentOutOfLeft) {
                        this.left = 0;
                        this.right = null;
                    } 
                    if(this.isComponentWentOutOfBottom) {
                        this.bottom = 0;
                        this.top = null;
                    } else if(this.isComponentWentOutOfTop) {
                        this.bottom = null;
                        this.top = 0;
                    }
                }
            }
        });

        this._positionOnParent = true;

    }

    /**
     * Float on parent
     * @type {right,left}
     */
    get float() {
        return this._float;
    }
    /**
     * Float on parent
     * @type {right,left}
     */
    set float(value) {
        this._float = value;
    }

    /**
     * Position over parent
     * @type {Boolean}
     */
    get positionOnParent() {
        return this._positionOnParent;
    }
    /**
     * Position over parent
     * @type {Boolean}
     */
    set positionOnParent(value) {
        this._positionOnParent = value;
    }

    /**
     * Show/Hide component
     * @type {boolean}
     */
    set shown(value) {

        value = value === true || value === 'true';
        super.shown = value;

        if(this.parent && this._positionOnParent) {
            this.container.hideShowProcess(() => {
                if(this.parent) {
                    const bounds = this.parent.container.bounds();
                    const thisBounds = this.container.bounds();
                    if(this._float === 'right') {
                        this.top = bounds.top;
                        // this.height = '100%';
                        this.right = bounds.left - thisBounds.outerWidth;
                        this.bottom = null;
                    } else if (this._float === 'left') {
                        this.top = bounds.top;
                        // this.height = '100%';
                        this.left = bounds.left + bounds.outerWidth;
                        this.bottom = null;
                    } else {
                        this.top = this._connectToBody ? (bounds.top + bounds.outerHeight) : bounds.outerHeight;
                        this.bottom = null;
                        if(this._align === 'right') {
                            this.right = this._connectToBody ? (window.innerWidth - (bounds.left + bounds.outerWidth)) : 0;
                        } else {
                            this.left = this._connectToBody ? bounds.left : 0;
                        }    
                        if(this.isComponentWentOutOfRight) {
                            this.right = 0;
                            this.left = null;
                        } else if(this.isComponentWentOutOfLeft) {
                            this.left = 0;
                            this.right = null;
                        } 
                        if(this.isComponentWentOutOfBottom) {
                            this.bottom = 0;
                            this.top = null;
                        } else if(this.isComponentWentOutOfTop) {
                            this.bottom = null;
                            this.top = 0;
                        }
                    }
                    if(value) {
                        this.AddClass(this.parent.name + '-selector-popup');
                        this.BringToFront();
                    } else {
                        this.RemoveClass(this.parent.name + '-selector-popup');
                        this.SendToBack();
                    }    
                }
                this.hasShadow = value;
                this.Dispatch('VisibilityChanged', {state: true});
                
            });
        }

        if(!super.shown && this._connectToBody) {
            this.Disconnect();
            this.ConnectTo(this.parent.container);
            this.hasShadow = value;
        }
    }

    /**
     * Show/Hide component
     * @type {boolean}
     */
    get shown() {
        return super.shown;
    }

    /**
     * Align popup to left or right of parent
     * @type {left,right}
     */
    get align() {
        return this._align;
    }
    /**
     * Align popup to left or right of parent
     * @type {left,right}
     */
    set align(value) {
        this._align = value;
    }

    get connectedToBody() {
        return this._connectToBody;
    }

    /**
     * Show popup
     * @param {Colibri.UI.Component} parent parent of popup
     * @param {boolean} connectToBody connect to body
     */
    Show(parent, connectToBody = false) {
        this._connectToBody = connectToBody;
        if(parent) {
            this.parent = parent;
        }
        if(this._connectToBody) {
            this.Disconnect();
            this.ConnectTo(document.body);
            this.namespace = parent.namespace;
            this.container.data('for', parent.path);
        }
        this.shown = true;
        this.BringToFront();
    }
    
}
