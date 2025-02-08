/**
 * @namespace
 * @class
 */
Colibri.UI = class {

    /** 
     * Resizing indicator
     * @type {boolean} 
     * @static
     */
    static Resizing = false;

    /** 
     * Maximum tab index fo elements
     * @type {string} 
     * @static
     */
    static tabIndex = 1;
 
    /** 
     * Maximum of z-index css property
     * @type {string} 
     * @static
     */
    static maxZIndex = 0;

    /** 
     * Private max z-index calculator 
     * @static
     */
    static _getZIndex(elements = null) {
        // return (elements ?? [...document.querySelectorAll('body *')]).reduce((accumulator, current_value) => {
        //     current_value = +getComputedStyle(current_value).zIndex;
        //     if (current_value === current_value) {
        //         return Math.max(accumulator, current_value) 
        //     }
        //     return accumulator;
        // }, 0);
        return (elements ?? [...document.querySelectorAll('body *')])
            .map(elt => parseFloat(getComputedStyle(elt).zIndex))
            .reduce((highest, z) => z > highest ? z : highest, 1);
    }

    /** 
     * Registers mutation observer for calculating current maximum of z-index
     * @static 
     */
    static registerMutationObserver() {
        // fixing start max z-index 
        Colibri.UI.maxZIndex = Colibri.UI._getZIndex();
        Colibri.Common.StartTimer('z-index-timer', 30000, () => {
            Colibri.UI.maxZIndex = Colibri.UI._getZIndex();
        });
        if(document.body) {
            new MutationObserver((mutationList, observer) => {
                let elements = [];
                for(const mut of mutationList) {
                    elements.push(mut.target);
                }
                Colibri.UI.maxZIndex = Math.max(Colibri.UI.maxZIndex, Colibri.UI._getZIndex(elements));
            }).observe(document.body, {
                attributes: true, 
                attributeFilter: ['style', 'class'], 
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * Updates max z-index in static property
     * @static
     */
    static UpdateMaxZIndex() {
        Colibri.UI.maxZIndex = Colibri.UI._getZIndex();
    }


    /**
     * Search for the component by path in document or given parent
     * @param {string} componentPath path for searching
     * @param {Colibri.UI.Component} parent search component within given parent component
     * @returns {Colibri.UI.Component}
     * @static
     */
    static Find(componentPath, parent = null) {
        const path = componentPath.split('/');
        const query = '[data-object-name="' + path.join('"] [data-object-name="') + '"]';
        const component = (parent ? parent._element : document).querySelector(query);
        if(!component) {
            return null;
        }
        return component.tag('component') || null;
    }

    /**
     * Search for the component by path in document or given parent
     * @param {string} componentPath path for searching
     * @param {Colibri.UI.Component} parent search component within given parent component
     * @returns {Colibri.UI.Component}
     * @static
     */
    static FindAll(componentPath, parent = null) {
        const path = componentPath.split('/');
        const query = '[data-object-name="' + path.join('"] [data-object-name="') + '"]';
        const components = (parent ? parent._element : document).querySelectorAll(query);
        const ret = [];
        for(const component of components) {            
            ret.push(component.tag('component'));
        }
        return ret;
    }


    /**
     * Loads css and javascripts and fires a promise
     * @param {Array<string>} css string array of css files
     * @param {Array<string>} js string array of js files 
     * @returns Promise
     * @static
     */
    static Require(css, js) { 
        return new Promise((resolve, reject) => {

            let loading = 0;

            css.forEach((c) => { 
                var res = hex_md5(c); 
                if(!document.querySelector('#res' + res)) { 
                    loading++;
                    const style = document.createElement('link');
                    style.id = 'res' + res;
                    style.type = 'text/css';
                    style.href = c;
                    style.rel = 'stylesheet';
                    style.onload = () => {
                        loading--;
                    }
                    document.querySelector('head').append(style);
                }; 
            });

            js.forEach((j) => { 
                var res = hex_md5(j); 
                if(!document.querySelector('#res' + res)) { 
                    loading++;
                    const script = document.createElement('script');
                    script.id = 'res' + res;
                    script.src = j;
                    script.async = true;
                    script.onload = () => {
                        loading--;
                    }
                    document.querySelector('head').append(script);
                }; 
            }); 

            Colibri.Common.Wait(() => loading === 0).then(() => {
                resolve();
            });
        });

    }

    static GetLookupPromise(component, value, term, getDependsValueMethod) {
        let lookupPromise;
        
        if (typeof value == 'function' || typeof value == 'string') {
            if(typeof value == 'string') {
                value = eval(value);
            }

            let dependsValue = getDependsValueMethod();
            let dependsField = value.depends ?? null;
    
            const lookupMethodRun = value(term, dependsValue, dependsField, component);
            lookupPromise = lookupMethodRun instanceof Promise ? lookupMethodRun : new Promise((resolve, reject) => {
                resolve({
                    result: value()
                });
            });
        }
        else if (typeof value == 'object') {

            if(value?.method) {
                let lookupMethod = value.method;
                if (typeof lookupMethod == 'string') {
                    lookupMethod = eval(value.method);
                }

                if(typeof lookupMethod !== 'function') {
                    lookupPromise = new Promise((resolve, reject) => { resolve({result: ''}); })
                }
                else {
                    let dependsValue = getDependsValueMethod();
                    let dependsField = value.depends ?? null;   
                    lookupPromise = lookupMethod(term, dependsValue, dependsField, component);
                    if(!(lookupPromise instanceof Promise)) {
                        lookupPromise = Promise.resolve(lookupPromise);
                    }
                }
            }
            else if(value?.binding) {
                let binding = value.binding;
                let dependsField = '';
                if(typeof binding == 'object') {
                    dependsField = binding.depends;
                    binding = binding.query;
                }
                if (typeof binding == 'string') {
                    let dependsValue = getDependsValueMethod('binding');
                    lookupPromise = new Promise((resolve, reject) => {
                        App.Store.AsyncQuery(binding).then((results) => {
                            if(!Array.isArray(results)) {
                                results = [results];
                            }
                            let ret = [];
                            for(const result of results) {
                                if(!dependsField || !dependsValue || (Array.isArray(result[dependsField]) ? result[dependsField].indexOf(dependsValue) !== -1 : result[dependsField] == dependsValue)) {
                                    ret.push(result);
                                }
                            }
                            resolve(ret);
                        });
                    });
                }
            }
            else if(value?.controller) {
                let controller = value.controller;
                let module = eval(controller.module);
                let dependsValue = getDependsValueMethod('controller');
                let dependsField = value.controller.depends ?? null;
                let cacheResults = value.controller?.cache ?? false;
                lookupPromise = module.Call(controller.class, controller.method, {term: term, param: dependsValue, depends: dependsField, lookup: value, _requestCache: cacheResults});
            }
            else if(value?.storage) {
                let controller = value?.storage?.controller;
                let module = eval(controller?.module);
                let dependsValue = getDependsValueMethod('storage');
                let dependsField = value?.storage?.depends ?? null;
                let cacheResults = value?.storage?.cache ?? false;
                lookupPromise = module.Call(controller.class, controller.method, {term: term, param: dependsValue, depends: dependsField, lookup: value, _requestCache: cacheResults});
            }
            else if(value?.accesspoint) {
                let controller = value?.accesspoint?.controller;
                let module = eval(controller?.module);
                let dependsValue = getDependsValueMethod('accesspoint');
                let dependsField = value?.storage?.depends ?? null;
                let cacheResults = value?.storage?.cache ?? false;
                lookupPromise = module.Call(controller.class, controller.method, {term: term, param: dependsValue, depends: dependsField, lookup: value, _requestCache: cacheResults});
            }
            else {
                lookupPromise = new Promise((resolve, reject) => { resolve({result: ''}); })
            }
        }

        // каждый метод должен возвращать промис
        return lookupPromise;
    }

}
Colibri.Common.Wait(() => !!document.body).then(() => {
    Colibri.UI.registerMutationObserver();
});
