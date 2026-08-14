/**
 * Represents common utility functions.
 * @namespace
 * @class
 * @memberof Colibri
 */
Colibri.Common = class {

    /**
     * Constructs Colibri.Common object 
     * @constructor 
     */
    constructor() {
        // Do nothing
    } 

    
    /**
     * Delays execution for a specified time.
     * @param {number} timeout - The time to wait in milliseconds.
     * @return {Promise} - A promise that resolves after the specified time.
     * @static
     * @async
     * @public
     * @example
     * ```
     * /// without any arguments
     * Colibri.Common.Delay(1000).then(() => {
     *     console.log('Executed after 1 second');
     * });
     * /// send the arguments to the resolve function
     * Colibri.Common.Delay(1000, 'Hello').then((message) => {
     *     console.log(message); // Outputs: Hello
     * });
     * /// use async/await syntax
     * async function example() {
     *     await Colibri.Common.Delay(1000);
     *     console.log('Executed after 1 second');
     * }
     * example();
     * ```
     */
    static Delay(timeout, args) {
        return new Promise((resolve, reject) => setTimeout(() => resolve(args), timeout));
    }

    /**
     * A collection of timers identified by their names. 
     * @type {Object.<string, number>}
     * @static
     * @private
     */
    static _timers = {};

    /**
     * Starts a timer with the specified name.
     * @param {string} name - The name of the timer.
     * @param {number} timeout - The interval of the timer in milliseconds.
     * @param {Function} tickFunction - The function to execute on each tick of the timer.
     * @public
     * @static 
     * @example
     * ```
     * /// Start a timer named 'myTimer' that logs a message every 2 seconds
     * Colibri.Common.StartTimer('myTimer', 2000, () => {
     *     console.log('Timer ticked!');
     * });
     * ```
     */
    static StartTimer(name, timeout, tickFunction) {
        if(Colibri.Common._timers[name]) {
            clearTimeout(Colibri.Common._timers[name].timer);
            delete Colibri.Common._timers[name].tickFunction;
            delete Colibri.Common._timers[name];
        }
        const timer = setInterval(tickFunction, timeout);
        Colibri.Common._timers[name] = {timer, tickFunction};
    }

    /**
     * Stops the timer with the specified name.
     * @param {string} name - The name of the timer to stop.
     * @public
     * @static
     * @example
     * ```
     * /// Stop the timer named 'myTimer'
     * Colibri.Common.StopTimer('myTimer');
     * ```
     */
    static StopTimer(name) {
        if(Colibri.Common._timers[name]) {
            clearInterval(Colibri.Common._timers[name].timer);
            delete Colibri.Common._timers[name].tickFunction;
            delete Colibri.Common._timers[name];
        }
    }

    /**
     * Checks if a timer with the specified name exists.
     * @param {string} name - The name of the timer to check.
     * @returns {boolean} - True if the timer exists, false otherwise.
     * @static
     * @public
     * @example
     * ```
     * /// Check if the timer named 'myTimer' exists
     * const exists = Colibri.Common.TimerExists('myTimer');
     * console.log(exists); // Outputs: true or false
     * ```
     */
    static TimerExists(name) {
        return !!Colibri.Common._timers?.[name];
    }

    /**
     * Waits for a condition to be true.
     * @param {Function} action - The function to check the condition.
     * @param {number} [maxTimeout=0] - The maximum time to wait in milliseconds.
     * @param {number} [interval=100] - The interval to check the condition in milliseconds.
     * @param {boolean} [resolveWhenTimedOut=false] - Whether to resolve the promise when the timeout occurs.
     * @returns {Promise} - A promise that resolves when the condition is true or the timeout occurs.
     * @async
     * @public
     * @static
     * @example
     * ```
     * /// Wait for a condition to be true with a maximum timeout of 5 seconds
     * Colibri.Common.Wait(() => document.readyState === 'complete', 5000, 100, true)
     *     .then(() => {
     *         console.log('Condition met or timeout occurred');
     *     })
     *     .catch(() => {
     *         console.log('Condition not met within the timeout');
     *     });
     * ```
     */
    static Wait(action, maxTimeout = 0, interval = 100, resolveWhenTimedOut = false, params = null) {
        return new Promise((resolve, reject) => {
            
            let waiting = 0;
            const _checkAction = (a, h) => {
                try {
                    if(a(params) || (maxTimeout && waiting >= maxTimeout)) {
                        h((maxTimeout && waiting >= maxTimeout));
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
            };

            _checkAction(action, (timedout) => {
                if(timedout) {
                    resolveWhenTimedOut ? resolve() : reject();
                } else {
                    resolve(params);
                }
            });

        });
        
    }

    /**
     * Waits for the document to be ready.
     * @return {Promise} - A promise that resolves when the document is ready.
     * @public
     * @async
     * @static
     * @example
     * ```
     * /// Wait for the document to be ready
     * Colibri.Common.WaitForDocumentReady()
     *     .then(() => {
     *         console.log('Document is ready');
     *     });
     * ```
     */
    static WaitForDocumentReady() {
        return Colibri.Common.Wait(() => document.readyState === 'complete');
    }

    /**
     * Waits for the body element to be available.
     * @return {Promise} - A promise that resolves when the body element exists.
     * @public
     * @async
     * @static
     * @example
     * ```
     * /// Wait for the body element to be available
     * Colibri.Common.WaitForBody()
     *     .then(() => {
     *         console.log('Body element is available');
     *     });
     * ```
     */
    static WaitForBody() {
        return Colibri.Common.Wait(() => document.body != null);
    }

    /**
     * Loads a script from a URL.
     * @param {string} url - The URL of the script.
     * @param {string} [id=null] - The ID to assign to the script element.
     * @param {Object} [params] - the parameters of script object
     * @returns {Promise} - A promise that resolves with the ID of the loaded script.
     * @public
     * @async
     * @static
     * @example
     * ```
     * /// Load a script from a URL and assign it an ID of 'myScript'
     * Colibri.Common.LoadScript('https://example.com/script.js', 'myScript')
     *     .then((id) => {
     *         console.log(`Script loaded with ID: ${id}`);
     *     })
     *     .catch((error) => {
     *         console.error('Failed to load script:', error);
     *     });
     * ```
     */
    static LoadScript(url, id = null, params = {}) {

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
            Object.forEach(params, (name, value) => {
                script[name] = value;
            });
            script.id = id ? id : 'script_' + (new Date()).getTime();
            document.getElementsByTagName('head')[0].appendChild(script);
        });

    }

    /**
     * Loads styles from a URL.
     * @param {string} url - The URL of the styles.
     * @param {string} [id=null] - The ID to assign to the link element.
     * @returns {Promise} - A promise that resolves with the ID of the loaded styles.
     * @public
     * @async
     * @static
     * @example
     * ```
     * /// Load styles from a URL and assign it an ID of 'myStyles'
     * Colibri.Common.LoadStyles('https://example.com/styles.css', 'myStyles')
     *     .then((id) => {
     *         console.log(`Styles loaded with ID: ${id}`);
     *     })
     *     .catch((error) => {
     *         console.error('Failed to load styles:', error);
     *     });
     * ```
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
     * @public
     * @static
     * @example
     * ```
     * Colibri.Common.Tick([1, 2, 3], 1000, (item) => {
     *     console.log(item);
     * });
     * ```
     */
    static Tick(array, timeout, callback) {
        array.forEach((v, i) => {
            Colibri.Common.Delay(i * timeout).then(() => {
                callback(v);
            });
        }); 
    }

}