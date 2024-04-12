/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.TextViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-text-viewer-component');
        this._emptyMessage = '&mdash;'
    }

    /**
     * Message if empty
     * @type {String}
     */
    get emptyMessage() {
        return this._emptyMessage;
    }
    /**
     * Message if empty
     * @type {String}
     */
    set emptyMessage(value) {
        this._emptyMessage = value;
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        return super.value;
    }

    /**
     * Value
     * @type {string}
     */
    set value(value) {
        const emptyMessage = this.field?.params?.empty ?? this._emptyMessage ?? '';
        super.value = !value ? emptyMessage : value;
    }



}
Colibri.UI.Viewer.Register('Colibri.UI.TextViewer', '#{ui-viewers-text}');