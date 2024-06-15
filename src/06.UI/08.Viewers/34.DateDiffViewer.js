/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.DateDiffViewer = class extends Colibri.UI.Viewer {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */ 
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-daterangeviewer');

        this._value = null;
    }

    /**
     * Value
     * @type {Array|string}
     */
    get value() {
        return this._value;
    }

    /**
     * Value
     * @type {Array|string}
     */
    set value(value) {
        if(!Array.isArray(value)) {
            value = [value, (new Date()).toDbDate()];
        }

        this._value = value;
    
        try {
            super.value = value[0].toDate().DiffFullTokens(value[1].toDate());
        } catch(e) {
            super.value = '';
        }

    }
}
Colibri.UI.Viewer.Register('Colibri.UI.DateDiffViewer', '#{ui-viewers-datediff}');