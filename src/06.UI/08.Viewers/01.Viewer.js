/**
 * Используется отображения ячеек
 * viewer="Colibri.UI.Viewer"
 * 
 * при использовании внутри можно 
 * 
 * 
 */
Colibri.UI.Viewer = class extends Colibri.UI.Component {

    constructor(name, container, element, root) {
        super(name, container, element || '<span />');
        this.AddClass('app-viewer-component');
        this.root = root;
    }

    get viewedObject() {
        return this._object;
    }

    set viewedObject(value) {
        this._object = value;
    }

    set field(value) {
        this._field = value;
    }

    get field() {
        return this._field;
    }

    get root() {
        return this._root;
    }

    set root(value) {
        this._root = value;
    }
}