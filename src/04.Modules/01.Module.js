/**
 * Represents a module class in the Colibri framework.
 * This class extends Colibri.IO.RpcRequest and provides functionality for managing modules.
 * @class 
 * @extends Colibri.IO.RpcRequest
 * @memberof Colibri.Modules
 */
Colibri.Modules.Module = class extends Colibri.IO.RpcRequest {

    /**
     * Constructs an instance of the Colibri.Modules.Module class.
     * @public 
     * @param {string} entryName - The name of the module.
     * @param {string} [type] - The type of data.
     * @param {string} remoteDomain - The remote domain for the module.
     * @param {string} urlResolver - The URL resolver for the module.
     */
    constructor(entryName, type, remoteDomain, urlResolver) {
        super(entryName, type, remoteDomain, urlResolver);

        this._routes = {};

        this.RegisterEvents();
        this.RegisterEventHandlers();
        
    }

    
    destructor() {
        this._stopDeferedTimer();
    }

    /**
     * Initializes the module.
     * This method is automatically called during module construction.
     * @public 
     */
    InitializeModule() {

        this._authorizationCookieName = 'ss-jwt';
        this._useAuthorizationCookie = true;
        if(!this.remoteDomain && App.RemoteDomain) {
            this.remoteDomain = App.RemoteDomain;
        }

    }

    /**
     * Registers events for the module.
     * This method is automatically called during module construction.
     * @public 
     */
    RegisterEvents() {
        // Тут регистрируем все события (свои события)
    }

    /**
     * Registers event handlers for the module.
     * This method is automatically called during module construction.
     * @public 
     */
    RegisterEventHandlers() {
        // Тут регистрируем обарботчики событий
    }

    /**
     * Handles routing for the module.
     * @param {string} pattern - The routing pattern.
     * @param {string|Function} event - The event associated with the routing pattern.
     * @public 
     */
    HandleRoute(pattern, event) {
        pattern = ('/' + this._moduleEntry.fromCamelCase('-') + '/' + pattern).replaceAll('//', '/');
        let handler = event;
        if(typeof event === 'string') {
            handler = (url, options) => this.Dispatch(event, {url: url, options: options});
        }
        App.Router.AddRoutePattern(pattern, handler);
    }

    /**
     * Navigates to a specified URL within the module.
     * @param {string} url - The URL to navigate to.
     * @param {Object} options - Additional navigation options.
     * @public 
     */
    RouteTo(url, options = {}) {
        url = ('/' + this._moduleEntry.fromCamelCase('-') + '/' + url).replaceAll('//', '/');
        App.Router.Navigate(url, options);
    }

    /**
     * Setter for enabling/disabling the use of authorization cookies.
     * @param {boolean} value - Whether to use authorization cookies.
     * @public 
     */
    set useAuthorizationCookie(value) {
        this._useAuthorizationCookie = value;
    }

    /**
     * Getter for checking if authorization cookies are enabled.
     * @returns {boolean} - Whether authorization cookies are used.
     * @public 
     */
    get useAuthorizationCookie() {
        return this._useAuthorizationCookie;
    }

    /**
     * Getter for retrieving the name of the authorization cookie.
     * @returns {string} - The name of the authorization cookie.
     * @public 
     */
    get authorizationCookieName() {
        return this._authorizationCookieName;
    }

    /**
     * Setter for defining the name of the authorization cookie.
     * @param {string} value - The name of the authorization cookie.
     * @public 
     */
    set authorizationCookieName(value) {
        this._authorizationCookieName = value;
    }

    /**
     * Makes an RPC (Remote Procedure Call) to the specified controller and method.
     * @param {string} controller - The name of the controller to call.
     * @param {string} method - The name of the method to call.
     * @param {Object|null} params - Parameters to pass to the method.
     * @param {Object} headers - Additional headers for the RPC request.
     * @param {boolean} withCredentials - Whether to include credentials in the request.
     * @param {string} requestKeyword - The request keyword.
     * @returns {Promise} - A promise representing the result of the RPC call.
     * @public 
     */
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

    /**
     * Calls saved to next launch
     * @protected
     */
    _deferedCalls = [];

    /**
     * Call results by requestKeyword
     * @protected
     */
    _deferedResults = {};

    /**
     * Start timer for defered calls
     * @param {number} timeout timeout for defer call
     * @param {string} deferedController controller for executing defered calls
     * @param {string} deferedMethod defered calls method
     */
    _startDeferedTimer(timeout = 500, deferedController, deferedMethod) {

        Colibri.Common.StartTimer(this._moduleEntry.toLowerCase() + '-defered-timer', timeout, () => {

            if(this._deferedCalls.length > 0) {
                const currentCalls = [].concat(this._deferedCalls);
                this._deferedCalls = [];
                this.Call(deferedController, deferedMethod, {calls: currentCalls}).then((response) => {
                    const results = response.result;
                    for(const result of results) {
                        this._deferedResults['_' + result.requestKeyword] = result;
                    }
                });

                
            }

        });

    }

    /**
     * Stop timer
     */
    _stopDeferedTimer() {
        Colibri.Common.StopTimer(this.name + '-defered-timer');
    }

    /**
     * Makes an RPC (Remote Procedure Call) to the specified controller and method.
     * @param {string} controller - The name of the controller to call.
     * @param {string} method - The name of the method to call.
     * @param {Object|null} params - Parameters to pass to the method.
     * @param {Object} headers - Additional headers for the RPC request.
     * @param {boolean} withCredentials - Whether to include credentials in the request.
     * @param {string} requestKeyword - The request keyword.
     * @returns {Promise} - A promise representing the result of the RPC call.
     * @public 
     */
    Defer(controller, method, params = null, headers= {}, withCredentials= true, requestKeyword = Date.Mc()) {

        this._deferedCalls.push({
            controller, 
            method, 
            params, 
            headers, 
            withCredentials, 
            requestKeyword
        });

        return new Promise((resolve, reject) => {
            Colibri.Common.StartTimer('request_' + requestKeyword, 100, () => {
                if(!!this._deferedResults['_' + requestKeyword]) {
                    Colibri.Common.StopTimer('request_' + requestKeyword);
                    const response = this._deferedResults['_' + requestKeyword];
                    delete this._deferedResults['_' + requestKeyword];
                    if(response.code != 200) {
                        reject(response);
                    } else {
                        resolve(response);
                    }    
                }
            });
        }); 
        
        
    }


}