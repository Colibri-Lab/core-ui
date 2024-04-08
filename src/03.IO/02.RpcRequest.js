/**
 * Represents a remote procedure call (RPC) request.
 * @class 
 * @extends Colibri.Events.Dispatcher
 */
Colibri.IO.RpcRequest = class extends Colibri.Events.Dispatcher {

    /**
     * Creates an instance of RpcRequest.
     * @param {string} moduleEntry - The name of the module.
     * @param {string} [type] - The type of data.
     * @param {string|null} [remoteDomain=null] - The remote domain.
     * @param {Function|null} [urlResolver=null] - The URL resolver function.
     */
    constructor(moduleEntry, type, remoteDomain = null, urlResolver = null) {
        super();

        this._moduleEntry = moduleEntry;
        this._requestType = type || 'json';
        this._remoteDomain = remoteDomain || null;
        this._urlResolver = urlResolver || null;
        this._requestsCache = {};

        this._workingRequests = {};

        this.RegisterEvent('CallCompleted', false, 'Обработка запроса завершена');
        this.RegisterEvent('CallProgress', false, 'Событие прогресса');
        this.RegisterEvent('CallError', false, 'Ошибка обработки запроса');
        this.RegisterEvent('ResultsProcessed', false, 'Обработка результатов завершена');
    }

    /**
     * Gets or sets the remote domain for RPC requests.
     * @type {string|null}
     */
    get remoteDomain() {
        return this._remoteDomain;
    }
    /**
     * Gets or sets the remote domain for RPC requests.
     * @type {string|null}
     */
    set remoteDomain(value) {
        this._remoteDomain = value;
    }

    /**
     * Gets or sets the request type for RPC requests.
     * @type {string}
     */
    get requestType() {
        return this._requestType;
    }
    /**
     * Gets or sets the request type for RPC requests.
     * @type {string}
     */
    set requestType(value) {
        this._requestType = value;
    }

    /**
     * Url resolver function
     * @type {Function}
     */
    get urlResolver() {
        return this._urlResolver;
    }
    /**
     * Url resolver function
     * @type {Function}
     */
    set urlResolver(value) {
        this._urlResolver = value;
    }

    /**
     * Prepares a string for use.
     * @param {string} string - The string to prepare.
     * @returns {string} The prepared string.
     * @private
     */
    _prepareStrings(string) {
        return string.split('\\').map((v) => v.fromCamelCase()).join('/');
    }

    /**
     * Gets the requests being processed.
     * @returns {Object} The working requests.
     */
    Requests() {
        return this._workingRequests;
    }

    /**
     * Clears the request cache.
     */
    ClearCache() {
        this._requestsCache = {};
    }

    /**
     * Makes a remote procedure call.
     * @param {string} controller - The controller name.
     * @param {string} method - The method to execute.
     * @param {Object} [params=null] - The parameters to pass.
     * @param {Object} [headers={}] - The headers.
     * @param {boolean} [withCredentials=true] - Whether to include credentials.
     * @param {string} [requestKeyword=Date.Mc()] - The request keyword.
     * @returns {Promise} The result of the RPC call.
     */
    Call(controller, method, params = null, headers = {}, withCredentials = true, requestKeyword = Date.Mc()) {

        const request = new Colibri.IO.Request();
        this._workingRequests[requestKeyword] = request;
        
        const requestMethod = params && params._requestMethod && params._requestMethod === 'get' ? 'Get' : 'Post'; 
        const requestType = params && params._requestType ? params._requestType : this._requestType;
        const requestCache = params && params._requestCache ? params._requestCache : false;
        const uploadProgress = params && params._uploadProgress ? params._uploadProgress : false;
        params && delete params._requestMethod;
        params && delete params._requestCache;
        headers.requester = location.hostname;

        return new Promise((resolve, reject) => {
            
            let url = null;
            
            // if url resolver is not set
            if(!this._urlResolver || typeof this._urlResolver !== 'function') {
                url = this._prepareStrings((this._moduleEntry ? '\\Modules\\' + this._moduleEntry : '') + '\\' +  controller + '\\' + method + '.' + requestType);
            } else {
                url = this._urlResolver(this._moduleEntry, controller, method, requestType, params, headers, withCredentials);
            }

            if(this._remoteDomain) {
                url = this._remoteDomain + url;
            }

            const requestUnique = String.MD5(JSON.stringify(Object.sortPropertiesRecursive({url: url, params: params, headers: headers})));
            if(requestCache && this._requestsCache['cache' + requestUnique]) {
                Colibri.Common.Wait(() => this._requestsCache['cache' + requestUnique].working !== true).then(() => {
                    const data = this._requestsCache['cache' + requestUnique];
                    delete this._workingRequests[requestKeyword];
                    this.Dispatch('CallCompleted', {result: data.result, request: requestKeyword});
                    this.Dispatch('ResultsProcessed', {result: data.result});
                    resolve(data);    
                });
                return;
            } else {
                this._requestsCache['cache' + requestUnique] = {working: true};
            }

            request.AddHeaders(headers);
            request[requestMethod](url, params, withCredentials, (progressEvent) => {
                if(uploadProgress) {
                    uploadProgress(progressEvent, requestKeyword);
                }
                this.Dispatch('CallProgress', {event: progressEvent, request: requestKeyword});
            }).then((data) => {
                
                delete this._workingRequests[requestKeyword];

                this.Dispatch('CallCompleted', {result: data.result, request: requestKeyword});

                try {
                    if(requestType == 'json') {
                        data.result = JSON.parse(data.result);
                    } else if(requestType == 'xml') {
                        data.result = new DOMParser().parseFromString(data.result, "text/xml");
                    } else if(requestType == 'stream') {
                        const disposition = data.headers['content-disposition'];
                        let name = '';
                        let ext = '';
                        if(disposition) {
                            name = disposition.split('filename=')[1].replaceAll('"', '');
                            ext = name.split('.').pop();
                        }
                        data.result = {
                            name: name,
                            ext: ext,
                            mimetype: Colibri.Common.MimeType.ext2type(ext),
                            content: data.result
                        };
                    }
                }
                catch(e) {
                    console.log(url, params, withCredentials, e);
                    data.result = {};
                }

                // ! для конвертации 
                // data.result = Object.cloneRecursive(data.result, Object.convertToExtended);

                this.Dispatch('ResultsProcessed', {result: data.result});

                if(requestCache) {
                    this._requestsCache['cache' + requestUnique] = Object.cloneRecursive(data);
                }

                resolve(data); 

            }).catch((data) => {
                delete this._workingRequests[requestKeyword];
                try {
                    data.result = JSON.parse(data?.result || '{}');
                } catch(e) {}
                this.Dispatch('CallError', {error: data.result, status: data.status});
                reject(data);

            });
        });

    }



}