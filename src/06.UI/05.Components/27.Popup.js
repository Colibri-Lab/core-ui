
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
            const bounds = this.parent.container.bounds(true, true);
            if(!args.state) {
                this.top = null;
                this.bottom = bounds.outerHeight;
            }
        });

    }


    set shown(value) {
        super.shown = value;
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

    get shown() {
        return super.shown;
    }
    
}
