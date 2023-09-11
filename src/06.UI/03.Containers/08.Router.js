Colibri.UI.Router = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('div'));
        this.AddClass('colibri-ui-router');

        this._currentChild = null;
        this._patterns = {};

        this._routeChangedEvent = (event, args) => this.__appRouteChanged(event, args);

        this.AddHandler('ChildsProcessed', (event, args) => this.ForEach((name, component) => component.Disconnect()));
        App.Router.AddHandler('RouteChanged', this._routeChangedEvent);

    }

    Dispose() {
        App.Router.RemoveHandler('RouteChanged', this._routeChangedEvent);
        super.Dispose();
    }

    /**
     * Route structure Object
     * @type {Object}
     */
    get structure() {
        return this._structure;
    }
    /**
     * Route structure Object
     * @type {Object|Function}
     */
    set structure(value) {
        let struct = {};
        if(value instanceof Object) {
            struct = value;
        } else if(typeof value === 'string') {
            struct = eval(value);
        } else if(typeof value === 'function') {
            struct = value();
        }

        if(struct instanceof Promise) {
            struct.then(structure => {
                this._structure = this.toPlain(structure, '');
                this._initStructure();        
            });
        } else {
            this._structure = this.toPlain(struct, '/');
            this._initStructure();    
        }

    }
    _initStructure() {
        
        for(const pattern of Object.keys(this._structure)) {
            const route = this._structure[pattern];
            let component = null;
            if(route?.component ?? null) {
                let componentObject = route.component;
                if(typeof componentObject === 'string') {
                    componentObject = eval(componentObject);
                }
                if(componentObject) {
                    component = new componentObject(route?.name ?? ('component-' + Date.Mc()), this);
                }
            } else {
                component = new route('component-' + Date.Mc(), this);
            }

            if(component) {
                component.routePattern = pattern.substring(this.basePattern.length); 
                if(route?.attrs ?? null) {
                    Object.forEach(route?.attrs, (attrName, attrValue) => {
                        component[attrName] = attrValue;
                    });
                }
    
                component.Disconnect();
                component.shown = true;    
            }
        }


    }

    toPlain(object, prefix = '') {
        let ret = {};
        object = Object.cloneRecursive(object, null, ['parent']);
        for(const name of Object.keys(object)) {
            const value = object[name];
            ret[prefix + name] = value;
            if(value?.childs ?? null) {
                ret = Object.assign(ret, this.toPlain(value.childs, prefix + name + '/'));
                delete value.childs;
            }
        }
        return ret;
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
        if(args.url.substring(0, this._current.length) === this._current) {
            this.ForEach((name, component) => {
                const pattern = this._current + component.routePattern.replace('#', '.+').replaceAll('?', '.*') + '$';
                const reg = new RegExp(pattern);
                if(reg.test(args.url)) {
                    if(!component.isConnected) {
                        component.ConnectTo(this, null, true);
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