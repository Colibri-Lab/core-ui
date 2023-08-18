Colibri.Web.Router = class extends Colibri.Events.Dispatcher {

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

    CreateUri() {
        return this._url + '?' + Object.toQueryString(this._options, ['&', '=']);
    }

    HandleDomReady() {
        this._url = App.Request.uri;
        this._path = App.Request.uri.split('/').filter(v => v != '');
        this._options = App.Request.query;
        this._history.push({url: this._url, options: this._options});
        this._processRoutePatterns();
        this.Dispatch('RouteChanged', {url: this._url, options: this._options});
    }

    _registerEvents() {
        this.RegisterEvent('RouteChanged', false, 'При изменении раута');
    }

    ProcessPatterns() {
        this._processRoutePatterns();
    }

    _initRouterOnHash() {
        window.removeEventListener('popstate', this._handlePopState);
        window.addEventListener('hashchange', this._handleHashChange);
    }

    _initRouterOnHistory() {
        console.trace();
        window.removeEventListener('hashchange', this._handleHashChange);
        window.addEventListener('popstate', this._handlePopState);
    }

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
     * Добавляет обработчик
     * @param {string} routePattern шаблон поиска
     * @param {Function} handler хендлер
     * @param {boolean} prepend добавить в начало
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

    Url(url, options) {
        return url + (Object.countKeys(options) > 0 ? '?' + String.fromObject(options, ['&', '=']) : '');
    }

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

    _setToAddressBar(url, options, replaceOnHistory = false, preventNextEvent = false) {
        
        this._preventNextEvent = preventNextEvent;

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
     * Переадресация
     * @param {string} url куда
     * @param {object} options параметры
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

    DispatchRouteChanged() {
        this.Dispatch('RouteChanged', {url: this._url, options: this._options});
    }

    get current() {
        return this._url;
    }

    get path() {
        return this._path;
    }

    get options() {
        return this._options;
    }

    get type() {
        return this._type;
    }

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

}

/** Раутинг на основе Hash */
Colibri.Web.Router.RouteOnHash = 'hash';
/** Роутинг на основе истории */
Colibri.Web.Router.RouteOnHistory = 'history';