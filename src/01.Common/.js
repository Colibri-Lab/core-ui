/**
 * Represents common utility functions.
 * @namespace Colibri.Common
 */
Colibri.Common = class {

    /** @constructor */
    constructor() {
        // Do nothing
    } 

    
    /**
     * Delays execution for a specified time.
     * @param {number} timeout - The time to wait in milliseconds.
     * @return {Promise} - A promise that resolves after the specified time.
     */
    static Delay(timeout) {
        return new Promise((resolve, reject) => setTimeout(() => resolve(), timeout));
    }

    /** @type {Object.<string, number>} */
    static _timers = {};

    /**
     * Starts a timer with the specified name.
     * @param {string} name - The name of the timer.
     * @param {number} timeout - The interval of the timer in milliseconds.
     * @param {Function} tickFunction - The function to execute on each tick of the timer.
     */
    static StartTimer(name, timeout, tickFunction) {
        if(Colibri.Common._timers[name]) {
            clearTimeout(Colibri.Common._timers[name]);
        }
        Colibri.Common._timers[name] = setInterval(tickFunction, timeout);
    }

    /**
     * Stops the timer with the specified name.
     * @param {string} name - The name of the timer to stop.
     */
    static StopTimer(name) {
        clearInterval(Colibri.Common._timers[name]);
        delete Colibri.Common._timers[name];
    }

    /**
     * Waits for a condition to be true.
     * @param {Function} action - The function to check the condition.
     * @param {number} [maxTimeout=0] - The maximum time to wait in milliseconds.
     * @param {number} [interval=100] - The interval to check the condition in milliseconds.
     * @returns {Promise} - A promise that resolves when the condition is true or the timeout occurs.
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
     * Waits for the document to be ready.
     * @return {Promise} - A promise that resolves when the document is ready.
     */
    static WaitForDocumentReady() {
        return Colibri.Common.Wait(() => document.readyState === 'complete');
    }

    /**
     * Waits for the body element to be available.
     * @return {Promise} - A promise that resolves when the body element exists.
     */
    static WaitForBody() {
        return Colibri.Common.Wait(() => document.body != null);
    }

    /**
     * Loads a script from a URL.
     * @param {string} url - The URL of the script.
     * @param {string} [id=null] - The ID to assign to the script element.
     * @returns {Promise} - A promise that resolves with the ID of the loaded script.
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
     * Loads styles from a URL.
     * @param {string} url - The URL of the styles.
     * @param {string} [id=null] - The ID to assign to the link element.
     * @returns {Promise} - A promise that resolves with the ID of the loaded styles.
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

    /**
     * Executes a callback function for each item in an array with a delay between each execution.
     * @param {Array} array - The array of items.
     * @param {number} timeout - The delay between executions in milliseconds.
     * @param {Function} callback - The callback function to execute for each item.
     */
    static Tick(array, timeout, callback) {
        array.forEach((v, i) => {
            Colibri.Common.Delay(i * timeout).then(() => {
                callback(v);
            });
        }); 
    }

}