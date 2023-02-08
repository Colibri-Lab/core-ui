Colibri.UI.Frame = class extends Colibri.UI.Component {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, '<iframe />');
        this.AddClass('colibri-ui-frame');

    }

    /**
     * Url of frame
     * @type {string}
     */
    get url() {
        return this._element.attr('src');
    }
    /**
     * Url of frame
     * @type {string}
     */
    set url(value) {
        this._element.attr('src', value);
    }

}