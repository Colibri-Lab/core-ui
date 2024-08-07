/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.DateViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-date-viewer-component');

        let dateformat = App.DateFormat || 'ru-RU';
        this._format = new Intl.DateTimeFormat(dateformat, {day: '2-digit', month: 'short', year: 'numeric'});
        this._value = null;

    }

    /**
     * Value
     * @type {Date|string}
     */
    get value() {
        return this.ContainsClass('app-is-read-component');
    }

    /**
     * Value
     * @type {Date|string}
     */
    set value(value) {
        if(typeof value === 'string') {
            value = value.toDate();
        }

        this._value = value;
        if(this._field?.params?.format) {
            let dateformat = App.DateFormat || 'ru-RU';
            this._format = new Intl.DateTimeFormat(dateformat, this._field?.params?.format);
        }
    
        try {
            super.value = this._value && this._format.format(this._value);
        } catch(e) {
            super.value = '&mdash;';
        }

    }

}
Colibri.UI.Viewer.Register('Colibri.UI.DateViewer', '#{ui-viewers-date}');