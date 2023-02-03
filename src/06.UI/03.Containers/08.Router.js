Colibri.UI.Router = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, '<div />');
        this.AddClass('colibri-ui-router');

        this._currentChild = null;
        this._patterns = {};

        this.AddHandler('ChildsProcessed', (event, args) => this.ForEach((name, component) => component.Disconnect()));
        App.Router.AddHandler('RouteChanged', (event, args) => this.__appRouteChanged(event, args));

    }

    /**
     * 
     * @type {}
     */
    get basePattern() {
        return this._current;
    }
    /**
     * 
     * @type {}
     */
    set basePattern(value) {
        this._current = value;
    }

    __appRouteChanged(event, args) {

        if(new RegExp(this._current).test(args.url)) {

            this.ForEach((name, component) => {
                const reg = new RegExp(component.routePattern);
                if(reg.test(args.url)) {
                    if(!component.isConnected) {
                        component.ConnectTo(this);
                        component.__processChangeOnRouteSwitch(reg.all(args.url));
                    }
                } else {
                    if(component.isConnected) {
                        component.Disconnect();
                    }
                }
            });
    
        }


    }

}