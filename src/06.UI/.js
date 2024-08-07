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



}
Colibri.Common.Wait(() => !!document.body).then(() => {
    Colibri.UI.registerMutationObserver();
});
