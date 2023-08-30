Colibri.UI.TextViewer = class extends Colibri.UI.Viewer {

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

    get value() {
        return super.value;
    }

    set value(value) {
        const emptyMessage = this.field?.params?.empty ?? this._emptyMessage ?? '';
        super.value = !value ? emptyMessage : value;
    }



}
Colibri.UI.Viewer.Register('Colibri.UI.TextViewer', '#{ui-viewers-text}');