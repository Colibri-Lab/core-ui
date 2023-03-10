/**
 * ОБьект UI
 */
Colibri.UI = class {

    /** Resizing indicator */
    static Resizing = false;

    /** Maximum tab index fo elements */
    static tabIndex = 1;

    /** Maximum of z-index css property */
    static maxZIndex = 0;

    /** Private max z-index calculator */
    static _getZIndex(elements = null) {
        return (elements ?? [...document.querySelectorAll('body *')]).reduce((accumulator, current_value) => {
            current_value = +getComputedStyle(current_value).zIndex;
            if (current_value === current_value) {
                return Math.max(accumulator, current_value) 
            }
            return accumulator;
        }, 0);
    }

    /** Registers mutation observer for calculating current maximum of z-index */
    static registerMutationObserver() {
        // fixing start max z-index 
        Colibri.UI.maxZIndex = Colibri.UI._getZIndex();
        Colibri.Common.StartTimer('z-index-timer', 10000, () => {
            Colibri.UI.maxZIndex = Colibri.UI._getZIndex();
        });
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

    static UpdateMaxZIndex() {
        Colibri.UI.maxZIndex = Colibri.UI._getZIndex();
    }


    /**
     * Search for the component by path in document or given parent
     * @param {string} componentPath path for searching
     * @param {Colibri.UI.Component} parent search component within given parent component
     * @returns {Colibri.UI.Component}
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
     * Loads css and javascripts and fires a promise
     * @param {Array<string>} css string array of css files
     * @param {Array<string>} js string array of js files 
     * @returns Promise
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

Colibri.UI.registerMutationObserver();
