/**
 * ОБьект UI
 */
Colibri.UI = class {

    /**
     * Указывает изменяется ли в текущий момент размер какого либо обьекта
     */
    static Resizing = false;

    /**
     * Таб индекс элемента
     */
    static tabIndex = 1;

    static maxZIndex = 0;

    static _getZIndex(elements = null) {
        return (elements ?? [...document.querySelectorAll('body *')]).reduce((accumulator, current_value) => {
            current_value = +getComputedStyle(current_value).zIndex;
            if (current_value === current_value) {
                return Math.max(accumulator, current_value) 
            }
            return accumulator;
        }, 0);
    }

    static registerObserver() {

        // fixing start max z-index 
        Colibri.UI.maxZIndex = Colibri.UI._getZIndex();
        Colibri.Common.StartTimer('z-index-timer', 10000, () => {
            Colibri.UI.maxZIndex = Colibri.UI._getZIndex();
            console.log(Colibri.UI.maxZIndex);
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

    /**
     * Возвращает самый высокий z-index на странице
     * @returns number
     */
    static zIndex() {
        return Colibri.UI.maxZIndex; 
    }

    /**
     * Находит компонент по пути (имя/имя/имя/имя...) на странице
     * @param {string} componentPath путь к компоненту, например: имя/имя/имя
     * @returns Colibri.UI.Component компонент или наследники
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

Colibri.UI.registerObserver();
