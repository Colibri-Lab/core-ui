/**
 * Определение обьекта для запроса
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
 * Класс запросов
 * 
 * @author Vahan P. Grigoran
 * 
 */
Colibri.IO.Request = class extends Destructable {

    static RequestEncodeTypeSimple = 'simple';
    static RequestEncodeTypeEncrypted = 'encrypted';

    static type = 'simple';

    /** @constructor */
    constructor(base) { 
        super();
        this._base = base ? base : '';
        this._headers = {};
    }

    /**
     * Добавляет параметры к URL
     * @param {string} url Ссылка 
     * @param {object} params Параметры
     * @return {string}
     */
    _paramsAddToUrl(url, params) {
        let urlWithParams = this._base + url;
        urlWithParams += (Object.countKeys(params) > 0 ? '?' + String.fromObject(params, ['&', '='], v => encodeURIComponent(v)) : '');
        return urlWithParams;
    
    }

    /**
     * Создает FormData из обьекта
     * @param {object} params 
     * @return {FormData}
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
     * Ищет файлы в обьекте и заменяет на file(md5)
     * @param {object} params обьект параметров
     * @param {object} files файлы, результат
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
        else if(params instanceof Object) {
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
     * Кодирует данные в json и енкодит
     * @param {object} params данные формы
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

    _getResponseHeaders(xhr) {
        let responseHeaders = xhr.getAllResponseHeaders();
        let arr = responseHeaders.trim().split(/[\r\n]+/);
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
     * Добавляет хедер
     * @param {string} name свойство
     * @param {string} value значение
     * @return {Colibri.IO.Request}
     */
    AddHeader(name, value) {
        this._headers[name] = value;
        return this;
    }

    /**
     * Добавляет хедеры
     * @param {object} headers хедеры
     * @return {Colibri.IO.Request}
     */
    AddHeaders(headers) {
        this._headers = Object.assign({}, this._headers, headers);
        console.log(this._headers);
        return this;
    }

    /**
     * Выполняет GET запрос
     * @param {string} url URL
     * @param {object} params Параметры
     * @param {boolean} withCredentials Использовать куки
     * @param {function} onprogressCallback
     * @return {Promise}
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
     * Выполняет POST запрос
     * @param {string} url URL
     * @param {object} params Параметры
     * @param {boolean} withCredentials
     * @param {function} onprogressCallback
     * @return {Promise}
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

    Abort() {
        if(this._currentRequest) {
            this._currentRequest.abort();
        }
    }
}

/**
 * Статическое выполнение POST запроса
 * @param {string} url URL
 * @param {object} params Параметры
 * @param {object} headers Хедеры
 * @param {boolean} withCredentials
 * @param {function} onprogressCallback
 * @return {Promise}
 */
Colibri.IO.Request.Post = (url, params, headers, withCredentials, onprogressCallback) => {
    const request = new Colibri.IO.Request();
    return request.AddHeaders(headers).Post(url, params, withCredentials, onprogressCallback);
}

/**
 * Статическое выполнение GET запроса
 * @param {string} url URL
 * @param {object} params Параметры
 * @param {object} headers Хедеры
 * @param {boolean} withCredentials
 * @param {function} onprogressCallback
 * @return {Promise}
 */
Colibri.IO.Request.Get = (url, params, headers, withCredentials, onprogressCallback) => {
    const request = new Colibri.IO.Request();
    return request.AddHeaders(headers).Get(url, params, withCredentials, onprogressCallback);
}
