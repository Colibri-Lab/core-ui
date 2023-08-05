
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
                    this.top = bounds.outerHeight;
                    this.bottom = null;
                    this.left = 0;
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
    }

    get shown() {
        return super.shown;
    }
    
}
