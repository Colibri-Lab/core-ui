/**
 * Month year viewer component
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 * @example
 * ```
 * const monthYearViewer = new Colibri.UI.MonthYearViewer('monthYearViewer', this);
 * monthYearViewer.value = '2023-06';
 * monthYearViewer.value = new Date(2023, 5, 1); // June is month 5 (0-indexed)
 * monthYearViewer.value = '2023-06-15'; // will be converted to '2023-06'
 * monthYearViewer.value = '2023-06-15T12:00:00Z'; // will be converted to '2023-06'
 * monthYearViewer.value = '2023-06-15T12:00:00+03:00'; // will be converted to '2023-06'
 * monthYearViewer.value = '2023-06-15T12:00:00-03:00'; // will be converted to '2023-06'
 * monthYearViewer.value = '2023-06-15T12:00:00.000Z'; // will be converted to '2023-06'
 * monthYearViewer.value = '2023-06-15T12:00:00.000+03:00'; // will be converted to '2023-06'
 * ```
 */
Colibri.UI.MonthYearViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-monthyear-viewer-component');
    }

    /**
     * Value
     * @type {Date|string}
     */
    get value() {
        return super.value;
    }
    /**
     * Value
     * @type {Date|string}
     */
    set value(value) {
        value = this._convertValue(value);
        if(typeof value == 'string') {
            value = (value + '-01').toDate();
        }
        const formatter = new Intl.DateTimeFormat('ru-RU', {month: 'short', year: 'numeric'});
        super.value = formatter.format(value)
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.MonthYearViewer', '#{ui-viewers-monthyear}');