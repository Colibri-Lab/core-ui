/**
 * Date diff viewer component
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 * @example
 * ```
 * const dateDiffViewer = new Colibri.UI.DateDiffViewer('dateDiffViewer', this);
 * dateDiffViewer.value = ['2023-06-01', '2023-06-15']; // set date range
 * dateDiffViewer.value = [new Date(2023, 5, 1), new Date(2023, 5, 15)]; // set date range with Date objects
 * ```
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
        this.AddClass('colibri-ui-datediffviewer');

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