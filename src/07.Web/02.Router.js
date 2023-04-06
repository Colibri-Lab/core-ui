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
            this._setCurrentUrl(App.Request.uri, App.Request.query);
        };
        this._handlePopState = (e) => {
            this._setCurrentUrl(App.Request.uri, App.Request.query);
        };
        
        if(type == Colibri.Web.Router.RouteOnHash) {
            this._initRouterOnHash();
        }
        else if(type == Colibri.Web.Router.RouteOnHistory) {
            this._initRouterOnHistory();
        }

        
    }

    HandleDomReady() {
        if(this._type == Colibri.Web.Router.RouteOnHash) {
            this._setCurrentUrl(App.Request.uri, App.Request.query);
        }
        else if(this._type == Colibri.Web.Router.RouteOnHistory) {
            this._setCurrentUrl(App.Request.uri, App.Request.query);
        }
    }

    _registerEvents() {
        this.RegisterEvent('RouteChanged', false, 'При изменении раута');
    }

    _setCurrentUrl(url, options) {

        const oldUrl = this._url;
        const oldOptions = this._options;

        this._url = url;
        this._path = url.split('/').filter(v => v != '');
        this._options = options;

        if(this._url !== oldUrl || JSON.stringify(this._options) !== JSON.stringify(oldOptions)) {
            this._history.push({url: this._url, options: this._options});
            this.Dispatch('RouteChanged', {url: url, options: options});
        }

        if(this._preventNextEvent === true) {
            this._preventNextEvent = false;
            return;
        }
        
        this._processRoutePatterns();
    }

    ProcessPatterns() {
        this._processRoutePatterns();
    }

    _initRouterOnHash() {
        window.removeEventListener('popstate', this._handlePopState);
        window.addEventListener('hashchange', this._handleHashChange);
    }

    _initRouterOnHistory() {
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

    /**
     * Переадресация
     * @param {string} url куда
     * @param {object} options параметры
     */
    Navigate(url, options = {}, processPatterns = true, setImmediately = false) {
        if(!processPatterns) {
            this._preventNextEvent = true;
        }
        const u = url + (Object.countKeys(options) > 0 ? '?' + String.fromObject(options, ['&', '=']) : '');
        let isChanged = false;
        if(this._type == Colibri.Web.Router.RouteOnHash) {
            isChanged = location.hash != '#' + u;
        }
        else if(this._type == Colibri.Web.Router.RouteOnHistory) {
            isChanged = location.pathname != u;
        }

        if(setImmediately) {
            if(this._type == Colibri.Web.Router.RouteOnHash) {
                location.hash = '#' + u;
            }
            else if(this._type == Colibri.Web.Router.RouteOnHistory) {
                history.pushState({}, "", u);
            }
            this._setCurrentUrl(url, options);
        }

        if(isChanged) {
            this._processRoutePatterns();
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