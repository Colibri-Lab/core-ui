/**
 * Array data viewer
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.ArrayViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {Element|string} element element for create childrens
     * @param {Colibri.UI.Component} root root component
     */
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-array-viewer-component');
    }

    /**
     * @private
     */
    _showValue() {
        let ret = [];
        if(isIterable(this._value)) {
            this._value.forEach(value => {
                ret.push(Object.toQueryString(value, [',<br />', ': ']));
            });
        }
        this._element.html(ret.join(', '));
    }

    /**
     * Value of component
     * @type {Array}
     */
    get value() {
        return this._value;
    }

    /**
     * Value of component
     * @type {Array}
     */
    set value(value) {
        value = this._convertValue(value);
        this._value = value;
        this._showValue();
    }

}
Colibri.UI.Viewer.Register('Colibri.UI.ArrayViewer', '#{ui-viewers-array}');