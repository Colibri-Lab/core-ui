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

    _convertRouteTo

    __appRouteChanged(event, args) {
        if(args.url.substring(0, this._current.length) === this._current) {
            this.ForEach((name, component) => {
                const pattern = this._current + component.routePattern.replace('#', '.+').replaceAll('?', '.*') + '$';
                const reg = new RegExp(pattern);
                if(reg.test(args.url)) {
                    if(!component.isConnected) {
                        component.ConnectTo(this);
                    }
                    component.__processChangeOnRouteSwitch(reg.all(args.url));
                } else {
                    if(component.isConnected) {
                        component.Disconnect();
                    }
                }
            });
        }


    }

}