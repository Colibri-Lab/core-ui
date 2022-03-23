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
    static tabIndex = 0;

    /**
     * Возвращает самый высокий z-index на странице
     * @returns number
     */
    static zIndex(selector = 'body *') {
        return Array.from(typeof selector === 'string' ? document.querySelectorAll(selector) : selector.querySelectorAll('*'))
            .map(a => parseFloat(window.getComputedStyle(a).zIndex))
            .filter(a => !isNaN(a))
            .sort((a, b) => a - b)
            .pop();
    }

    /**
     * Находит компонент по пути (имя/имя/имя/имя...) на странице
     * @param {string} componentPath путь к компоненту, например: имя/имя/имя
     * @returns Colibri.UI.Component компонент или наследники
     */
    static Find(componentPath) {
        const path = componentPath.split('/');
        const query = '[data-object-name="' + path.join('"] [data-object-name="') + '"]';
        const component = document.querySelector(query);
        if(!component) {
            return null;
        }
        return component.tag('component') || null;
    }

}
