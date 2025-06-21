/**
 * Shown progress
 * @class
 * @extends Colibri.UI.Viewer
 * @memberof Colibri.UI
 */
Colibri.UI.ProgressViewer = class extends Colibri.UI.Viewer {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-progressviewer');

        this._bar = new Colibri.UI.Pane('bar', this);
        this._view = new Colibri.UI.Pane('view', this._bar);
        this._text = new Colibri.UI.Pane('text', this._bar);
        this._bar.shown = this._view.shown = this._text.shown = true;

    }

    /**
     * Value Object
     * @type {Object}
     */
    get value() {
        return this._value;
    }
    /**
     * Value Object
     * @type {Object}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        
        const max = this._value?.max ?? 100;
        const min = this._value?.min ?? 0; 
        const value = this._value.value;

        this._view.width = value === 0 ? 0 : (value * 100 / (max - min)) + '%';
        this._text.value = value === 0 ? '0%' : (value * 100 / (max - min)).toMoney(2) + '%'

    }

}
Colibri.UI.Viewer.Register('Colibri.UI.ProgressViewer', '#{ui-viewers-progress-viewer}');