
Colibri.Modules.Module = class extends Colibri.IO.RpcRequest {

    /** 
     * @constructor 
     * @param {string} entryName - наименование модуля
     * @param {string} [type] - тип данных
     */ 
    constructor(entryName, type, remoteDomain, urlResolver) {
        super(entryName, type, remoteDomain, urlResolver);

        this._routes = {};

        this.RegisterEvents();
        this.RegisterEventHandlers();
        
    }

    /**
     * Инициализация модуля, запускается автоматически
     */
    InitializeModule() {

        this._authorizationCookieName = 'ss-jwt';
        this._useAuthorizationCookie = true;
        if(!this.remoteDomain && App.RemoteDomain) {
            this.remoteDomain = App.RemoteDomain;
        }

    }

    /**
     * Метод для регистрации событий, запускается автоматически
     */
    RegisterEvents() {
        // Тут регистрируем все события (свои события)
    }

    /**
     * Метод для регистрации обработчиков событий
     */
    RegisterEventHandlers() {
        // Тут регистрируем обарботчики событий
    }

    HandleRoute(pattern, event) {
        pattern = ('/' + this._moduleEntry.fromCamelCase('-') + '/' + pattern).replaceAll('//', '/');
        let handler = event;
        if(typeof event === 'string') {
            handler = (url, options) => this.Dispatch(event, {url: url, options: options});
        }
        App.Router.AddRoutePattern(pattern, handler);
    }

    RouteTo(url, options = {}) {
        url = ('/' + this._moduleEntry.fromCamelCase('-') + '/' + url).replaceAll('//', '/');
        App.Router.Navigate(url, options);
    }

    set useAuthorizationCookie(value) {
        this._useAuthorizationCookie = value;
    }

    get useAuthorizationCookie() {
        return this._useAuthorizationCookie;
    }

    get authorizationCookieName() {
        return this._authorizationCookieName;
    }

    set authorizationCookieName(value) {
        this._authorizationCookieName = value;
    }

    Call(controller, method, params = null, headers= {}, withCredentials= true, requestKeyword = Date.Mc()) {
        if(!this._useAuthorizationCookie) {
            headers = Object.assign(headers, {
                Authorization: Colibri.Common.Cookie.Get(this._authorizationCookieName)
            });
            return super.Call(controller, method, params, headers, withCredentials, requestKeyword);
        }
        else { 
            return super.Call(controller, method, params, headers, withCredentials, requestKeyword);
        }
    }

}