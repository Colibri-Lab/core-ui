/**
 * Time line component
 * @class
 * @extends Colibri.UI.PaneGrid
 * @memberof Colibri.UI
 */
Colibri.UI.Timeline = class extends Colibri.UI.PaneGrid {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Timeline']);
        this.AddClass('colibri-ui-timeline');
        
        this.rows = '1fr';
        this.columns = 'auto 100%';

        this._form = this.Children('form');
        this._timelinePane = this.Children('timeline-pane');
        this._timelinePaneStart = this.Children('timeline-pane/start');
        this._timelinePaneEnd = this.Children('timeline-pane/end');
        
    }

    /**
     * Value Array
     * @type {Array}
     */
    get value() {
        return this._value;
    }
    /**
     * Value Array
     * @type {Array}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        
    }

    /**
     * Date of the timeline start
     * @type {Date}
     */
    get dts() {
        return this._dts;
    }
    /**
     * Date of the timeline start
     * @type {Date}
     */
    set dts(value) {
        this._dts = value;
        this._showDts();
    }
    _showDts() {
        const v = this._form.value;
        v.dts = this._dts ?? Date.Now();
        this._form.value = v;
    }

    /**
     * Date of the timeline end
     * @type {Date}
     */
    get dte() {
        return this._dte;
    }
    /**
     * Date of the timeline end
     * @type {Date}
     */
    set dte(value) {
        this._dte = value;
        this._showdte();
    }
    _showdte() {
        const v = this._form.value;
        v.dte = this._dte ?? Date.Now();
        this._form.value = v;        
    }

}