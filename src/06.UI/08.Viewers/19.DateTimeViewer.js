/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.DateTimeViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-datetime-viewer-component');

        let dateformat = App.DateFormat || 'ru-RU';
        this._format = new Intl.DateTimeFormat(dateformat, {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});
        
        this._value = null;

    }

    get value() {
        return this._value;
    }

    set value(value) {
        value = this._convertValue(value);
        if(typeof value === 'string') {
            value = value.toDate();
        }
        else if(typeof value === 'number') {
            value = value.toDateFromUnixTime();
        }
        this._value = value;
    
        try {
            super.value = this._value && this._format.format(this._value);
        } catch(e) {
            super.value = '';
        }

    }

}
Colibri.UI.Viewer.Register('Colibri.UI.DateTimeViewer', '#{ui-viewers-datetime}');