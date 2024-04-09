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
                this._history.push({url: this._url, options: this._options});
                this._processRoutePatterns();
                this.Dispatch('RouteChanged', {url: this._url, options: this._options});
            }
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
        this._url = App.Request.uri;
        this._path = App.Request.uri.split('/').filter(v => v != '');
        this._options = App.Request.query;
        this._history.push({url: this._url, options: this._options});
        this._processRoutePatterns();
        this.Dispatch('RouteChanged', {url: this._url, options: this._options});
    }

    /**
     * Registers events for the router.
     * @private
     */
    _registerEvents() {
        this.RegisterEvent('RouteChanged', false, 'При изменении раута');
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
    }

    /**
     * Initializes the router based on history changes.
     * @private
     */
    _initRouterOnHistory() {
        window.removeEventListener('hashchange', this._handleHashChange);
        window.addEventListener('popstate', this._handlePopState);
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
            const u = this._url + (Object.countKeys(this._options) > 0 ? '?' + String.fromObject(this._options, ['&', '=']) : '');
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

        const u = url + (Object.countKeys(options) > 0 ? '?' + String.fromObject(options, ['&', '=']) : '') + this.GetSafeParamsAsString();
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
     * Возвращается на шаг назад, добавляет в историю пункт
     */
    Back() {
        history.back();
    }

    /**
     * Возвращается в начало истории
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
     * @returns {string} - The current URL.
     */
    get current() {
        return this._url;
    }

    /**
     * Returns the path segments of the current URL.
     * @returns {Array} - The path segments of the current URL.
     */
    get path() {
        return this._path;
    }

    /**
     * Returns the query parameters of the current URL.
     * @returns {Object} - The query parameters of the current URL.
     */
    get options() {
        return this._options;
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

}

/** Routing based on hash */
Colibri.Web.Router.RouteOnHash = 'hash';
/** Routing based on history */
Colibri.Web.Router.RouteOnHistory = 'history';