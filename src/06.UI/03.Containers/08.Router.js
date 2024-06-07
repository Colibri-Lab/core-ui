/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Router = class extends Colibri.UI.Pane {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
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

    /**
     * Disposes the component
     */
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
        if(Object.isObject(value)) {
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
    /** @private */
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

    /**
     * Creates plane object with keys separated by dot
     * @param {object} object object to plain
     * @param {string} prefix prefix to add in keys
     * @returns object
     */
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
     * Base route pattern
     * @type {string}
     */
    get basePattern() {
        return this._current;
    }
    /**
     * Base route pattern
     * @type {string}
     */
    set basePattern(value) {
        this._current = value;
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __appRouteChanged(event, args) {
        if(args.url.substring(0, this._current.length) === this._current) {
            this.ForEach((name, component) => {
                let isPattern = component.routePattern === args.url;
                let match = args.url;
                if(component.routeIsRegExp) {
                    const pattern = this._current + (component.routePattern ?? '').replace('#', '.+').replaceAll('?', '.*') + '$';
                    const reg = new RegExp(pattern);
                    isPattern = reg.test(args.url);
                    match = reg.all(args.url);
                }
                if(isPattern) {
                    if(!component.isConnected) {
                        component.ConnectTo(this, null, true);
                    }
                    component.__processChangeOnRouteSwitch(match);
                } else {
                    if(component.isConnected) {
                        component.Disconnect();
                    }
                }
            });
        }


    }

}