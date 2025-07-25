/**
 * Represents a router for handling web routes.
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.Web
 */
Colibri.Web.Router = class extends Colibri.Events.Dispatcher {

    /**
     * @constructor
     * @param {string} type - The type of router ('hash' or 'history').
     */
    constructor(type) {
        super();

        this._type = type;
        this._history = [];
        this._url = null;
        this._path = null;
        this._options = {};
        this._routeHandlers = [];
        this._urlToOptionsHandler = [];

        this._registerEvents();
        this._preventNextEvent = false;

        this._handleHashChange = (e) => {
            if(this._preventNextEvent) {
                this._preventNextEvent = false;
                return;
            }
            if(this._url !== App.Request.uri || this._options !== App.Request.query) {
                this._url = App.Request.uri;
                this._path = App.Request.uri.split('/').filter(v => v != '');
                this._options = App.Request.query;
                
                const args = this.ProcessUrlToOptionsHandlers('forward', this._url, this._options);
                this._url = args.url;
                this._options = args.options;

                this._history.push({url: this._url, options: this._options});
                this._processRoutePatterns();
                this.Dispatch('RouteChanged', {url: this._url, options: this._options});
            }
        };
        this._handlePopState = (e) => {
            if(this._preventNextEvent) {
                this._preventNextEvent = false;
                return;
            }
            if(this._url !== App.Request.uri || this._options !== App.Request.query) {
                this._url = App.Request.uri;
                this._path = App.Request.uri.split('/').filter(v => v != '');
                this._options = App.Request.query;
                const args = this.ProcessUrlToOptionsHandlers('forward', this._url, this._options);
                this._url = args.url;
                this._options = args.options;


                this._history.push({url: this._url, options: this._options});
                this._processRoutePatterns();
                this.Dispatch('RouteChanged', {url: this._url, options: this._options});
            }
        };
        this._handleNavigate = (e) => {
            let url = '';
            let options = {};
            if(!e.destination || !e.destination.sameDocument) {
                return;
            }
            if(this._type == Colibri.Web.Router.RouteOnHash) {
                url = e.destination.url;
                options = url.split('#')[1]?.toObject(['&', '=']) || {};
                this._url = url.split('#')[0];
            } else if(this._type == Colibri.Web.Router.RouteOnHistory) {
                url = e.destination.url;
                options = url.split('?')[1]?.toObject(['&', '=']) || {};
                this._url = url.split('?')[0];
                this._url = this._url.replaceAll(location.protocol + '//' + location.hostname, '');
            }
            this._path = this._url.split('/').filter(v => v != '');
            this._options = options;
            
            const args = this.ProcessUrlToOptionsHandlers('forward', this._url, this._options);
            this._url = args.url;
            this._options = args.options;

            this._history.push({url: this._url, options: this._options});
            
        };

        if(type == Colibri.Web.Router.RouteOnHash) {
            this._initRouterOnHash();
        }
        else if(type == Colibri.Web.Router.RouteOnHistory) {
            this._initRouterOnHistory();
        }

        
    }

    /**
     * Creates a URI string with the current URL and query parameters.
     * @returns {string} - The URI string.
     */
    CreateUri() {
        return this._url + '?' + Object.toQueryString(this._options, ['&', '=']);
    }

    /**
     * Handles the DOM ready event. Initializes the router with the current URL and query parameters.
     */
    HandleDomReady() {
        const args = this.ProcessUrlToOptionsHandlers('forward', App.Request.uri, App.Request.query);
        this._url = args.url;
        this._options = args.options;
        this._path = args.url.split('/').filter(v => v != '');
        this._history.push({url: this._url, options: this._options});
        this._processRoutePatterns();
        this.Dispatch('RouterReady', {});
        this.Dispatch('RouteChanged', {url: this._url, options: this._options});
    }

    /**
     * Registers events for the router.
     * @private
     */
    /** @protected */
    _registerEvents() {
        this.RegisterEvent('RouterReady', false, 'When the router is ready.');
        this.RegisterEvent('RouteChanged', false, 'When the route changes.');
    }

    /**
     * Processes route patterns.
     */
    ProcessPatterns() {
        this._processRoutePatterns();
    }

    /**
     * Initializes the router based on hash changes.
     * @private
     */
    _initRouterOnHash() {
        window.removeEventListener('popstate', this._handlePopState);
        window.addEventListener('hashchange', this._handleHashChange);
        try { navigation.addEventListener('navigate', this._handleNavigate); } catch(e) {}
    }

    /**
     * Initializes the router based on history changes.
     * @private
     */
    _initRouterOnHistory() {
        window.removeEventListener('hashchange', this._handleHashChange);
        window.addEventListener('popstate', this._handlePopState);
        try { navigation.addEventListener('navigate', this._handleNavigate); } catch(e) {}
    }

    /**
     * Processes route patterns.
     * @private
     */
    _processRoutePatterns() {
        const routePatters = Object.keys(this._routeHandlers);
        for(let i=0; i < routePatters.length; i++) {
            const pattern = routePatters[i];
            const rex = new RegExp(pattern);
            let u = this._url + (Object.countKeys(this._options) > 0 ? '?' + String.fromObject(this._options, ['&', '=']) : '');
            if(u === '') {
                u = '/';
            }
            if(rex.test(u)) {
                const handlers = this._routeHandlers[pattern];
                for(let j=0; j < handlers.length; j++) {
                    const handler = handlers[j];
                    if(handler(this._url, this._options, this._path) === false) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Adds a route pattern and its handler.
     * @param {string} routePattern - The route pattern to match.
     * @param {Function} handler - The handler function for the route.
     * @param {boolean} [prepend=false] - Whether to add the handler at the beginning.
     */
    AddRoutePattern(routePattern, handler, prepend = false) {

        if(routePattern instanceof Array) {
            routePattern.forEach((en) => {
                this.AddRoutePattern(en, handler, prepend);
            });
        }
        else {
            if(!this._routeHandlers[routePattern]) {
                this._routeHandlers[routePattern] = [];
            }
    
            for (let i = 0; i < this._routeHandlers[routePattern].length; i++) {
                const h = this._routeHandlers[routePattern][i];
                if (h === handler) {
                    this._routeHandlers[routePattern].splice(i, 1);
                }
            }
    
            if (prepend) {
                this._routeHandlers[routePattern].splice(0, 0, handler);
            } else {
                this._routeHandlers[routePattern].push(handler);
            }    
        }


    }

    /**
     * Constructs a URL with query parameters.
     * @param {string} url The base URL.
     * @param {object} options The query parameters.
     * @returns {string} The constructed URL.
     */
    Url(url, options) {
        return url + (Object.countKeys(options) > 0 ? '?' + String.fromObject(options, ['&', '=']) : '');
    }

    /**
     * Checks if the URL has changed.
     * @param {string} url - The URL to check.
     * @param {Object} options - The options for the URL.
     * @returns {boolean} - Whether the URL has changed.
     * @private
     */
    _isChanged(url, options) {
        const u = url + (Object.countKeys(options) > 0 ? '?' + String.fromObject(options, ['&', '=']) : '');
        let isChanged = false;
        if(this._type == Colibri.Web.Router.RouteOnHash) {
            isChanged = location.hash != '#' + u;
        }
        else if(this._type == Colibri.Web.Router.RouteOnHistory) {
            isChanged = location.pathname + location.search != u;
        }
        return isChanged;
    }

    /**
     * Sets the URL and options in the address bar.
     * @param {string} url - The URL to set.
     * @param {Object} options - The options for the URL.
     * @param {boolean} replaceOnHistory - Whether to replace the current entry in the history.
     * @param {boolean} preventNextEvent - Whether to prevent the next event.
     * @private
     */
    _setToAddressBar(url, options, replaceOnHistory = false, preventNextEvent = false) {

        this._preventNextEvent = preventNextEvent;

        const saveParams = this.GetSafeParamsAsObject();
        if(Object.countKeys(saveParams)) {
            options = Object.assign(options, saveParams);
        }
        const u = url + (Object.countKeys(options) > 0 ? '?' + String.fromObject(options, ['&', '=']) : '');
        if(this._type == Colibri.Web.Router.RouteOnHash) {
            location.hash = '#' + u;
        } else if(this._type == Colibri.Web.Router.RouteOnHistory) {
            const state = {url: this._url, options: this._options};
            if(replaceOnHistory) {
                history.replaceState(state, '', u);
            } else {
                history.pushState(state, '', u);
            }
            dispatchEvent(new PopStateEvent('popstate', { state: state }));
        }
    }

    /**
     * Navigates to a URL with options.
     * @param {string} url - The URL to navigate to.
     * @param {Object} [options={}] - The options for the URL.
     * @param {boolean} [replaceOnHistory=false] - Whether to replace the current entry in the history.
     * @param {boolean} [setOnHistory=false] - Whether to add the navigation to the history.
     * @param {string} [target='_self'] - The target window or tab.
     * @returns {string} - The URL that was navigated to.
     */
    Navigate(url, options = {}, replaceOnHistory = false, setOnHistory = false, target = '_self') {
        const args = this.ProcessUrlToOptionsHandlers('back', url, options);
        url = args.url;
        options = args.options;

        const isChanged = this._isChanged(url, options);

        const u = url + (Object.countKeys(options) > 0 ? '?' + String.fromObject(options, ['&', '=']) : '');
        if(target === '_blank') {
            window.open(this._type == Colibri.Web.Router.RouteOnHash ? '#' + u : u);
            return u;
        }

        if(setOnHistory) {
            this._url = url;
            this._path = (this._url ?? '/').split('/').filter(v => v != '');
            this._options = options;
            this._history.push({url: this._url, options: this._options});
            
            this._setToAddressBar(url, options, replaceOnHistory, true);

            return;
        }


        if(isChanged) {
            this._setToAddressBar(url, options, replaceOnHistory);
        } else {
            
            // this._url = url;
            // this._path = (this._url ?? '/').split('/').filter(v => v != '');
            // this._options = options;
            // this._history.push({url: this._url, options: this._options});

            // this._processRoutePatterns();
            // this.Dispatch('RouteChanged', {url: this._url, options: this._options});

        }

        return u;

    }

    /**
     * Gets back
     */
    Back() {
        history.back();
    }

    /**
     * Returns to start of navigation
     */
    Pop() {
        const data = this._history.pop();
        this.Navigate(data.url, data.options);
    }

    /**
     * Dispatches the 'RouteChanged' event with the current URL and options.
     */
    DispatchRouteChanged() {
        this.Dispatch('RouteChanged', {url: this._url, options: this._options});
    }

    /**
     * Returns the current URL.
     * @type {string} - The current URL.
     */
    get current() {
        return this._url;
    }

    /**
     * Returns the path segments of the current URL.
     * @type {Array} - The path segments of the current URL.
     */
    get path() {
        return this._path;
    }

    /**
     * Returns the query parameters of the current URL.
     * @type {Object} - The query parameters of the current URL.
     */
    get options() {
        return this._options;
    }

    /**
     * History object
     * @type {Array}
     * @readonly
     */
    get history() {
        return this._history;
    }

    /**
     * Returns the type of the router.
     * @returns {string} - The type of the router.
     */
    get type() {
        return this._type;
    }

    /**
     * Sets the type of the router.
     * @param {string} value - The type of the router.
     */
    set type(value) {
        this._type = value;
        if(this._type == Colibri.Web.Router.RouteOnHash) {
            this._initRouterOnHash();
        }
        else if(this._type == Colibri.Web.Router.RouteOnHistory) {
            this._initRouterOnHistory();
        }
        this.HandleDomReady();
    }

    /**
     * Array of query params to save in query string
     * @type {Array}
     */
    get safeParams() {
        return this._safeParams ?? [];
    }
    /**
     * Array of query params to save in query string
     * @type {Array}
     */
    set safeParams(value) {
        this._safeParams = value;
    }

    /**
     * Gets the string representation of safe query parameters.
     * @returns {string} - The string representation of safe query parameters.
     * @private
     */
    GetSafeParamsAsString() {
        let ret = [];
        for(const param of this.safeParams) {
            if(this.options[param]) {
                ret.push(param + '=' + this.options[param]);
            }
        }
        return ret.join('&');
    }
    
    /**
     * Gets the object representation of safe query parameters.
     * @returns {string} - The string representation of safe query parameters.
     * @private
     */
    GetSafeParamsAsObject() {
        let ret = {};
        for(const param of this.safeParams) {
            if(this.options[param]) {
                ret[param] = this.options[param];
            }
        }
        return ret;
    }

    AddUrlToOptionsHandler(handlers, prepend = false) {
        if(prepend) {
            this._urlToOptionsHandler.splice(0, 0, handlers);;
        } else {
            this._urlToOptionsHandler.push(handlers);
        }
    }

    ProcessUrlToOptionsHandlers(direction = 'forward', url, options) {
        options = Object.cloneRecursive(options);
        for(const handler of this._urlToOptionsHandler) {
            const args = {url: url, options: options};
            handler[direction == 'forward' ? 0 : 1](args);
            url = args.url;
            options = args.options;
        }
        return {url: url, options: options};
    }

}

/** Routing based on hash */
Colibri.Web.Router.RouteOnHash = 'hash';
/** Routing based on history */
Colibri.Web.Router.RouteOnHistory = 'history';