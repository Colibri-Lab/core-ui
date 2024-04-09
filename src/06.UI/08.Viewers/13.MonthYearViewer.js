/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
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