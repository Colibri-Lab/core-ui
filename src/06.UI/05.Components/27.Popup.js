
Colibri.UI.Popup = class extends Colibri.UI.Pane {

    constructor(name, container, element) {
        super(name, container, element);
        this.AddClass('app-component-popup-component');
        
        this.tabIndex = null;
        this.AddHandler('ShadowClicked', (event, args) => {
            this.Hide();
        });

        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', (event, args) => {
            if(this.parent && this._positionOnParent) {
                const bounds = this.parent.container.bounds(true, true);
                if(!args.state) {
                    this.top = null;
                    this.bottom = bounds.outerHeight;
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

    set shown(value) {
        value = value === true || value === 'true';
        super.shown = value;

        if(this.parent && this._positionOnParent) {
            this.container.hideShowProcess(() => {
                if(this.parent) {
                    const bounds = this.parent.container.bounds();
                    if(this._float === 'right') {
                        this.top = 0;
                        this.height = '100%';
                        this.right = 0;
                        this.bottom = null;
                    } else if (this._float === 'left') {
                        this.top = 0;
                        this.height = '100%';
                        this.left = 0;
                        this.bottom = null;
                    } else {
                        this.top = this._connectToBody ? (bounds.top + bounds.outerHeight) : bounds.outerHeight;
                        this.bottom = null;
                        if(this._align === 'right') {
                            this.right = this._connectToBody ? (window.innerWidth - (bounds.left + bounds.outerWidth)) : 0;
                        } else {
                            this.left = this._connectToBody ? bounds.left : 0;
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

    Show(parent, connectToBody = false) {
        this._connectToBody = connectToBody;
        if(parent) {
            this.parent = parent;
        }
        if(this._connectToBody) {
            this.Disconnect();
            this.ConnectTo(document.body);
            this.namespace = parent.namespace;
        }
        this.shown = true;
    }
    
}
