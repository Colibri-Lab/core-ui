/**
 * Icon viewer
 * @class
 * @extends Colibri.UI.Icon
 * @memberof Colibri.UI
 */
Colibri.UI.IconViewer = class extends Colibri.UI.Viewer {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.from);
        this.AddClass('colibri-ui-iconviewer');

    }

    /**
     * Value String
     * @type {String}
     */
    get value() {
        return super.value;
    }
    /**
     * Value String
     * @type {String}
     */
    set value(value) {
        super.value = value;
    }

}

Colibri.UI.Viewer.Register('Colibri.UI.IconViewer', '#{ui-viewers-icon-viewer}');