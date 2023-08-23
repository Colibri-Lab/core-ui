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
        super(name, container, element || Element.create('span'));
        this.AddClass('app-viewer-component');
        this.root = root;
    }

    _injectParams() {
        if(this._field?.params && this._field?.params?.className) {
            let className = this._field?.params?.className;
            if(typeof className === 'function') {
                className = className(this, this.value);
            }
            this.AddClass(className);
        }
        if(this._field?.params?.fieldgenerator) {
            const f = eval(this._field?.params?.fieldgenerator);
            f(this._field);
        }

        if(this._field?.params?.copy) {
            this.copy = this._field?.params?.copy;
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
        super.value = this._convertValue(value);
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

    _convertValue(value) {
        
        if(this.field?.params?.converter) {
            const f = this.field.params?.converter;
            value = f(value, this);
        }

        return value;
    }

    static _registered = [];
    static Register(name, desc) {
        Colibri.UI.Viewer._registered.push({value: name, title: desc});
    }
    static Enum() {
        return Colibri.UI.Viewer._registered;
    }
}