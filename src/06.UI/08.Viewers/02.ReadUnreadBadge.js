/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.ReadUnreadBadge = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-read-unread-badge-component');

    }

    get value() {
        return this.ContainsClass('app-is-read-component');
    }

    set value(value) {
        value = this._convertValue(value);

        if(value) {
            this.AddClass('app-is-read-component');
        }
        else {
            this.RemoveClass('app-is-read-component');
        }
    }

}
Colibri.UI.Viewer.Register('Colibri.UI.ReadUnreadBadge', '#{ui-viewers-badge}');