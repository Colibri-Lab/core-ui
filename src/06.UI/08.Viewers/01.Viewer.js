/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Component
 */
Colibri.UI.Viewer = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element, root) {
        super(name, container, element || Element.create('span'));
        this.AddClass('app-viewer-component');
        this.root = root;
    }

    /** @private */
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

    /**
     * Value object
     * @type {object}
     */
    get viewedObject() {
        return this._object;
    }

    /**
     * Value object
     * @type {object}
     */
    set viewedObject(value) {
        this._object = value;
    }

    /**
     * Field object
     * @type {object}
     */
    set field(value) {
        this._field = value;
        this._injectParams();
    }

    /**
     * Field object
     * @type {object}
     */
    get field() {
        return this._field;
    }

    /**
     * Value object
     * @type {object}
     */
    set value(value) {
        if(this.field?.params?.pre) {
            value = this.field?.params?.pre + ' ' + value;
        }
        if(this.field?.params?.post) {
            value = value + ' ' + this.field?.params?.post;
        }
        super.value = this._convertValue(value);
    }

    /**
     * Value object
     * @type {object}
     */
    get value() {
        return super.value;
    }

    /**
     * Root component
     * @type {Colibri.UI.Component}
     */
    get root() {
        return this._root;
    }

    /**
     * Root component
     * @type {Colibri.UI.Component}
     */
    set root(value) {
        this._root = value;
    }

    /** @private */
    _convertValue(value) {
        
        if(this.field?.params?.converter) {
            const f = this.field.params?.converter;
            value = f(value, this);
        }

        return value;
    }

    /**
     * Registered viewers
     * @private
     * @static
     * @type {Array}
     */
    static _registered = [];
    /**
     * Registers the viewer
     * @static
     * @param {string} name name of viewer
     * @param {string} desc description of viewer
     */
    static Register(name, desc) {
        Colibri.UI.Viewer._registered.push({value: name, title: desc});
    }
    /**
     * Enums the registered viewers
     * @static
     * @returns Array
     */
    static Enum() {
        return Colibri.UI.Viewer._registered;
    }
}