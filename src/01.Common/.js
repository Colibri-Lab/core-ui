Colibri.Common = class {

    /** @constructor */
    constructor() {
        // Do nothing
    }

    
    /**
     * Ожидание
     * @param {number} timeout время ожидания в милисекундах 
     * @return {Promise} 
     */
    static Delay(timeout) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), timeout);
        });
    }

    static _timers = {};

    static StartTimer(name, timeout, tickFunction) {
        if(Colibri.Common._timers[name]) {
            clearTimeout(Colibri.Common._timers[name]);
        }
        Colibri.Common._timers[name] = setInterval(tickFunction, timeout);
    }

    static StopTimer(name) {
        clearInterval(Colibri.Common._timers[name]);
        delete Colibri.Common._timers[name];
    }

    /**
     *
     * @param {Function} action метод проверки
     * @param maxTimeout
     * @param interval
     * @returns {Promise}
     * @constructor
     */
    static Wait(action, maxTimeout = 0, interval = 100) {
        let waiting = 0;
        const _checkAction = (a, h) => {
            try {
                if(a() || (maxTimeout && waiting >= maxTimeout)) {
                    h();
                }
                else {
                    Colibri.Common.Delay(interval).then(() => _checkAction(a, h));
                }
            }
            catch(e) {
                Colibri.Common.Delay(interval).then(() => _checkAction(a, h));
            } finally {
                waiting += interval;
            }
        }
        
        return new Promise((resolve, reject) => {

            _checkAction(action, () => {
                resolve();
            })

        });
        
    }

    /**
     * Ожидает появления документа
     * @return {Promise}
     */
    static WaitForDocumentReady() {
        return Colibri.Common.Wait(() => document.readyState === 'complete');
    }

    /**
     * Ожидает появления документа
     * @return {Promise}
     */
    static WaitForBody() {
        return Colibri.Common.Wait(() => document.body != null);
    }

    /**
     * Загружает скрипт по URL
     * @param {string} url ссылка на скрипт
     */
    static LoadScript(url, id = null) {

        if(document.getElementById(id)) {
            return new Promise((resolve, reject) => {
                resolve(id);
            });
        }

        return new Promise((resolve, reject) => {
            var script = document.createElement('script');
            script.async = true;
            script.defer = true;
            script.src = url;
            script.onload = () => {
                resolve(script.id);
            };
            script.onerror = (e) => {
                reject(e);
            };
            script.id = id ? id : 'script_' + (new Date()).getTime();
            document.getElementsByTagName('head')[0].appendChild(script);
        });

    }

    /**
     * Загружает стили по URL
     * @param {string} url ссылка на стили
     */
     static LoadStyles(url, id = null) {

        if(document.getElementById(id)) {
            return new Promise((resolve, reject) => {
                resolve(id);
            });
        }

        return new Promise((resolve, reject) => {
            var link = document.createElement('link');
            link.async = true;
            link.defer = true;
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = () => {
                resolve(link.id);
            };
            link.onerror = (e) => {
                reject(e);
            };
            link.id = id ? id : 'link_' + (new Date()).getTime();
            document.getElementsByTagName('head')[0].appendChild(link);
        });

    }

    static Tick(array, timeout, callback) {
        array.forEach((v, i) => {
            Colibri.Common.Delay(i * timeout).then(() => {
                callback(v);
            });
        }); 
    }

}