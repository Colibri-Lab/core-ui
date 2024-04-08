/**
 * Defines the object for making requests.
 * If the XMLHttpRequest object doesn't have the sendAsBinary method, it adds it.
 */
if (!XMLHttpRequest.prototype.sendAsBinary) {
    XMLHttpRequest.prototype.sendAsBinary = function (sData) {
        var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
        for (var nIdx = 0; nIdx < nBytes; nIdx++) {
            ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff; 
        }
        this.send(ui8Data);
    }; 
}

/**
 * Represents the request class for handling HTTP requests.
 * @author Vahan P. Grigoran
 */
Colibri.IO.Request = class extends Destructable {

    /**
     * Represents the type of request encoding as simple.
     * @type {string}
     */
    static RequestEncodeTypeSimple = 'simple';

    /**
     * Represents the type of request encoding as encrypted.
     * @type {string}
     */
    static RequestEncodeTypeEncrypted = 'encrypted';

    /**
     * Represents the default request type.
     * @type {string}
     */
    static type = 'simple';

    /**
     * Constructor for the Colibri.IO.Request class.
     * @param {string} [base] - The base URL for the request.
     */
    constructor(base) { 
        super();
        this._base = base ? base : '';
        this._headers = {};
    }

    /**
     * Appends parameters to a URL.
     * @param {string} url The URL.
     * @param {object} params The parameters.
     * @returns {string} The modified URL.
     */
    _paramsAddToUrl(url, params) {
        let urlWithParams = this._base + url;
        urlWithParams += (Object.countKeys(params) > 0 ? '?' + String.fromObject(params, ['&', '='], v => encodeURIComponent(v)) : '');
        return urlWithParams;
    
    }

    /**
     * Creates a FormData object from an object.
     * @param {object} params The object containing the data.
     * @param {string} [keyBefore=''] The key before the current key.
     * @param {FormData} [fd=null] The FormData object to append to (optional, default is null).
     * @returns {FormData} The FormData object containing the data.
     */
    _createFormData(params, keyBefore = '', fd = null) {
        let mainThread = false;
        if(!fd) {
            mainThread = true;
            fd = new FormData();
            fd._files = {};
        }

        if(Array.isArray(params)) {
            params.forEach((param, index) => {
                if(param instanceof File) {
                    // если это файл тогда нужно пихнуть обязательнов в первый уровень
                    const fileKey = 'file' + String.MD5(param.name);
                    if(fd._files[fileKey] === undefined) {
                        fd._files[fileKey] = param;
                    }
                    fd.append(keyBefore + '[' + index + ']', 'file(' + fileKey + ')');
                }
                this._createFormData(param, keyBefore + '[' + index + ']', fd);
            });
        }
        else {

            if(typeof params == 'string' && params.isDate()) {
                fd.append(keyBefore, params);
            } else {
                Object.forEach(params, (key, value) => {
                    if(Array.isArray(value) || (value instanceof Object && !(value instanceof File))) {
                        this._createFormData(value, keyBefore ? keyBefore + '[' + key + ']' : key, fd);
                    }
                    else if(params[key] !== null) {
                        fd.append(keyBefore ? keyBefore + '[' + key + ']' : key, params[key]);
                    }
                });
            }
            
        }

        if(mainThread) {
            Object.forEach(fd._files, (name, file) => {
                fd.append(name, file);
            }); 
        }

        return fd;

    }

    /**
     * Finds files in an object and replaces them with 'file(md5)'.
     * @param {object} params The object containing parameters.
     * @param {object} files The resulting files object.
     */
    _findFiles(params, files) {

        if(Array.isArray(params)) {
            params.forEach((param, index) => {
                if(param instanceof File) {
                    // если это файл тогда нужно пихнуть обязательнов в первый уровень
                    const fileKey = 'file' + String.MD5(param.name);
                    files[fileKey] = param;
                    params[index] = 'file(' + fileKey + ')';
                }
                else {
                    this._findFiles(param, files);
                }
            });
        }
        else if(Object.isObject(params)) {
            Object.forEach(params, (key, param) => {
                if(param instanceof File) {
                    // если это файл тогда нужно пихнуть обязательнов в первый уровень
                    const fileKey = 'file' + String.MD5(param.name);
                    files[fileKey] = param;
                    params[key] = 'file(' + fileKey + ')';
                } 
                else {
                    this._findFiles(param, files);
                }
            });
        }

    }

    /**
     * Encodes data into JSON and encodes it.
     * @param {object} params The form data.
     * @returns {FormData} The encoded data.
     */
    _encryptData(params) {
        // ищем файлы и впихиваем в FormData как файлы
        let files = {};
        this._findFiles(params, files);
        const fd = new FormData();
        if(Object.countKeys(params) > 0) {
            fd.append('json_encoded_data', Colibri.Common.Base64.encode(JSON.stringify(params)));
        }
        Object.forEach(files, (name, file) => {
            fd.append(name, file);
        });
        return fd;
    }

    /**
     * Retrieves the response headers from the XMLHttpRequest object.
     * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
     * @returns {object} The response headers.
     */
    _getResponseHeaders(xhr) {
        let responseHeaders = xhr.getAllResponseHeaders();
        let arr = responseHeaders.trimString().split(/[\r\n]+/);
        let headerMap = {};
        arr.forEach(function (line) {
            let parts = line.split(': ');
            let header = parts.shift();
            let value = parts.join(': ');
            const map = header.split('_');
            let t = 'headerMap';
            map.forEach((k) => { eval(t + '[\'' + k + '\'] = ' + t + '[\'' + k + '\'] || {};');  t += '[\'' + k + '\']'; });    
            eval('headerMap[\'' + map.join('\'][\'') + '\'] = unescape(decodeURI(value)).replaceAll(\'+\', \' \')');
        });
        return headerMap;

    }

    /**
     * Adds a single header to the request headers.
     * @param {string} name The name of the header.
     * @param {string} value The value of the header.
     * @returns {Colibri.IO.Request} The modified request object.
     */
    AddHeader(name, value) {
        this._headers[name] = value;
        return this;
    }

    /**
     * Adds multiple headers to the request headers.
     * @param {object} headers The headers to add.
     * @returns {Colibri.IO.Request} The modified request object.
     */
    AddHeaders(headers) {
        this._headers = Object.assign({}, this._headers, headers);
        return this;
    }

    /**
     * Executes a GET request.
     * @param {string} url The URL to send the request to.
     * @param {object} params The parameters to include in the request URL.
     * @param {boolean} [withCredentials=true] Indicates whether to include cookies in the request.
     * @param {function} [onprogressCallback=undefined] A callback function to handle progress events.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    Get(url, params, withCredentials = true, onprogressCallback = undefined) {
        
        const handleProcessEvent = (e) => {
            if(onprogressCallback) {
                onprogressCallback(e);
            }
        }

        return new Promise((resolve, reject) => {
            if(!params) {
                params = {};
            }
            const req = new XMLHttpRequest();
            req.onreadystatechange = () => {
                if (req.readyState == 4) {
                    if(req.status != 200) {
                        reject({status: req.status, result: req.responseText, headers: this._getResponseHeaders(req)});
                    }
                    else {
                        resolve({status: req.status, result: req.responseText, headers: this._getResponseHeaders(req)});    
                    }
                }
            };
            req.onerror = (e) => {
                reject({status: 500, result: e, headers: this._getResponseHeaders(req)});
            };
            if(onprogressCallback) {
                req.upload.onloadstart = handleProcessEvent;
                req.upload.onload = handleProcessEvent;
                req.upload.onloadend = handleProcessEvent;
                req.upload.onprogress = handleProcessEvent;    
            }

            req.withCredentials = withCredentials;
            req.open('GET', this._paramsAddToUrl(url, params), true);
            Object.keys(this._headers).forEach((name) => {
                req.setRequestHeader(name, this._headers[name]);
            });
            req.send();
            this._currentRequest = req;
        });
        
    }

    /**
     * Executes a POST request.
     * @param {string} url The URL to send the request to.
     * @param {object} params The parameters to include in the request body.
     * @param {boolean} [withCredentials=true] Indicates whether to include cookies in the request.
     * @param {function} [onprogressCallback=undefined] A callback function to handle progress events.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    Post(url, params, withCredentials = true, onprogressCallback = undefined) {
        
        const handleProcessEvent = (e) => {
            if(onprogressCallback) {
                onprogressCallback(e);
            }
        }

        return new Promise((resolve, reject) => {
            if(!params) {
                params = {};
            }
            const req = new XMLHttpRequest();
            req.onreadystatechange = () => {
                if (req.readyState == 4) {
                    if(req.status != 200) {
                        reject({status: req.status, result: req.responseText, headers: this._getResponseHeaders(req)});
                    }
                    else {
                        resolve({status: req.status, result: req.responseText, headers: this._getResponseHeaders(req)});    
                    }
                }
            };
            req.onerror = (e) => {
                reject({status: 500, result: e, headers: this._getResponseHeaders(req)});
            };
            if(onprogressCallback) {
                req.upload.onloadstart = handleProcessEvent;
                req.upload.onload = handleProcessEvent;
                req.upload.onloadend = handleProcessEvent;
                req.upload.onprogress = handleProcessEvent;    
            }
            req.withCredentials = withCredentials;
            req.open('POST', url, true);
            Object.keys(this._headers).forEach((name) => {
                req.setRequestHeader(name, this._headers[name]);
            });
            let data = params;
            if (typeof params === 'object')  {
                if(Colibri.IO.Request.type == Colibri.IO.Request.RequestEncodeTypeEncrypted) {
                    data = this._encryptData(params);
                }
                else {
                    data = this._createFormData(params);
                }
            }
            req.send(data);
            this._currentRequest = req;
        });
        
    }

    /**
     * Aborts the current XMLHttpRequest request.
     */
    Abort() {
        if(this._currentRequest) {
            this._currentRequest.abort();
        }
    }
}

/**
 * Static method to execute a POST request.
 * @param {string} url - The URL for the request.
 * @param {object} params - The parameters for the request.
 * @param {object} headers - The headers for the request.
 * @param {boolean} withCredentials - Whether to use credentials.
 * @param {function} onprogressCallback - Callback function for progress.
 * @returns {Promise} - A Promise representing the result of the request.
 */
Colibri.IO.Request.Post = (url, params, headers, withCredentials, onprogressCallback) => {
    const request = new Colibri.IO.Request();
    return request.AddHeaders(headers).Post(url, params, withCredentials, onprogressCallback);
}

/**
 * Static method to execute a GET request.
 * @param {string} url - The URL for the request.
 * @param {object} params - The parameters for the request.
 * @param {object} headers - The headers for the request.
 * @param {boolean} withCredentials - Whether to use credentials.
 * @param {function} onprogressCallback - Callback function for progress.
 * @returns {Promise} - A Promise representing the result of the request.
 */
Colibri.IO.Request.Get = (url, params, headers, withCredentials, onprogressCallback) => {
    const request = new Colibri.IO.Request();
    return request.AddHeaders(headers).Get(url, params, withCredentials, onprogressCallback);
}
