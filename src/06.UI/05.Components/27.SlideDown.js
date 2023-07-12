
Colibri.UI.SlideDown = class extends Colibri.UI.Pane {

    constructor(name, container, element) {
        super(name, container, element);
        this.AddClass('app-component-slidedown-component');
        
        this.tabIndex = null;
        this.AddHandler('ShadowClicked', (event, args) => {
            this.Hide();
        });

        this.AddHandler('ChildsProcessed', (event, args) => this.__componentRendered(event, args));

    }

    __componentRendered(event, args) {
        if(this._handler) {
            Colibri.Common.Wait(() => Colibri.UI.Find(this._handler)).then(() => {
                const component = Colibri.UI.Find(this._handler);
                if(component) {
                    component.AddHandler('Clicked', (event, args) => this.__handlerClicked(event, args));
                }
            });
        }
    }

    __handlerClicked(event, args) {
        if(this.shown) {
            this.shown = false;
            event.sender.state = 'collapsed';
        } else {
            this.shown = true;
            event.sender.state = 'expanded';
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
        this._handler = value;
    }



}
