

Colibri.IO.RpcRequest = class extends Colibri.Events.Dispatcher {

    /** 
     * @constructor
     * @param {string} moduleEntry - наименование модуля
     * @param {string} [type] - типе данных 
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

    get remoteDomain() {
        return this._remoteDomain;
    }
    set remoteDomain(value) {
        this._remoteDomain = value;
    }

    get requestType() {
        return this._requestType;
    }
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
     * Преобразует строку
     * @param {string} string строка для преобразования 
     */
    _prepareStrings(string) {
        return string.split('\\').map((v) => v.fromCamelCase()).join('/');
    }

    Requests() {
        return this._workingRequests;
    }

    ClearCache() {
        this._requestsCache = {};
    }

    /**
     * 
     * @param {string} controller - наименование контролера 
     * @param {string} method - метод, который нужно выполнить
     * @param {Object} params - параметры которые нужно передать
     * @param {Object} headers - заголовки 
     */
    Call(controller, method, params = null, headers= {}, withCredentials= true, requestKeyword = Date.Mc()) {

        const request = new Colibri.IO.Request();
        this._workingRequests[requestKeyword] = request;
        
        const requestMethod = params && params._requestMethod && params._requestMethod === 'get' ? 'Get' : 'Post'; 
        const requestType = params && params._requestType ? params._requestType : this._requestType;
        const requestCache = params && params._requestCache ? params._requestCache : false;
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

                data.result = JSON.parse(data?.result || '{}');
                this.Dispatch('CallError', {error: data.result, status: data.status});
                reject(data);
            });
        });

    }



}