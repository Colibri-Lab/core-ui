Colibri.Web.Router = class extends Colibri.Events.Dispatcher {

    constructor(type) {
        super();

        this._type = type;
        this._history = [];
        this._url = null;
        this._options = {};
        this._routeHandlers = [];

        this._registerEvents();
        this._preventNextEvent = false;

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
            this._setCurrentUrl(App.Request.uri, Object.assign(App.Request.query, e.state));
        }
        this._processRoutePatterns();
    }

    _registerEvents() {
        this.RegisterEvent('RouteChanged', false, 'При изменении раута');
    }

    _setCurrentUrl(url, options) {

        this._url = url;
        this._options = options;
        this._history.push({url: this._url, options: this._options});

        this.Dispatch('RouteChanged', {url: url, options: options});
        if(this._preventNextEvent === true) {
            this._preventNextEvent = false;
            return;
        }
        
        this._processRoutePatterns();
    }

    _initRouterOnHash() {
        window.addEventListener('hashchange', (e) => {
            this._setCurrentUrl(App.Request.uri, App.Request.query);
        });
    }

    _initRouterOnHistory() {
        window.addEventListener('popstate', (e) => {
            this._setCurrentUrl(App.Request.uri, Object.assign(App.Request.query, e.state));
        })
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
                    if(handler(this._url, this._options) === false) {
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
    Navigate(url, options, processPatterns = true, setImmediately = false) {
        if(!processPatterns) {
            this._preventNextEvent = true;
        }
        const u = url + (Object.countKeys(options) > 0 ? '?' + String.fromObject(options, ['&', '=']) : '');
        let isChanged = false;
        if(this._type == Colibri.Web.Router.RouteOnHash) {
            isChanged = location.hash != '#' + u;
            location.hash = '#' + u;
        }
        else if(this._type == Colibri.Web.Router.RouteOnHistory) {
            isChanged = location.href != u;
            history.pushState({}, "", u);
        }

        if(setImmediately) {
            this._setCurrentUrl(u, options);
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

    get options() {
        return this._options;
    }

}

/** Раутинг на основе Hash */
Colibri.Web.Router.RouteOnHash = 'hash';
/** Роутинг на основе истории */
Colibri.Web.Router.RouteOnHistory = 'hash';