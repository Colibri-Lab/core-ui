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

    _injectParams() {
        if(this._field?.params && this._field?.params?.className) {
            this.AddClass(this._field?.params?.className);
        }
        if(this._field?.params?.fieldgenerator) {
            const f = eval(this._field?.params?.fieldgenerator);
            f(this._field);
        }
    }

    get viewedObject() {
        return this._object;
    }

    set viewedObject(value) {
        this._object = value;
    }

    set field(value) {
        this._field = value;
        this._injectParams();
    }

    get field() {
        return this._field;
    }

    set value(value) {
        if(this.field?.params?.post) {
            value = value + ' ' + this.field?.params?.post;
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

    get root() {
        return this._root;
    }

    set root(value) {
        this._root = value;
    }

    static _registered = [];
    static Register(name, desc) {
        Colibri.UI.Viewer._registered.push({value: name, title: desc});
    }
    static Enum() {
        return Colibri.UI.Viewer._registered;
    }
}