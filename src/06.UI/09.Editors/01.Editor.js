/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Editor = class extends Colibri.UI.Component {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     */ 
    constructor(name, container, element) {
        super(name, container, element || '<input />');
        this.AddClass('app-editor-component');

        this._editedObject = null;

        this._element.addEventListener('change', (e) => this.Dispatch('Changed', {domEvent: e}));
        this._element.addEventListener('keyup', (e) => this.Dispatch('KeyUp', {domEvent: e}));
        this._element.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));
        this._element.addEventListener('click', (e) => {
            this.Focus();
            e.stopPropagation();
            return false;
        });

        this.AddHandler('Changed', (event, args) => this.Validate());
        this.AddHandler('KeyUp', (event, args) => this.Validate());
        this.AddHandler('ReceiveFocus', (event, args) => this.__thisFocused(event, args));
        this.AddHandler('LoosedFocus', (event, args) => this.__thisUnfocused(event, args));

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __thisFocused(event, args) {
        const fieldEditoPane = this._element.closest('.app-field-pane-editor');
        if(fieldEditoPane && fieldEditoPane.tag('component')) {
            fieldEditoPane.tag('component').AddClass('-focused');
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __thisUnfocused(event, args) {
        const fieldEditoPane = this._element.closest('.app-field-pane-editor');
        if(fieldEditoPane && fieldEditoPane.tag('component')) {
            fieldEditoPane.tag('component').RemoveClass('-focused');
        }
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Прозошло изменение данных компонента')
    }

    /**
     * Is editor data is invalid
     * @type {boolean}
     * @readonly
     */
    get invalid() {
        return this.ContainsClass('-invalid');
    }

    /**
     * Edited object
     * @type {object}
     */
    get editedObject() {
        return this._editedObject;
    }

    /**
     * Edited object
     * @type {object}
     */
    set editedObject(value) {
        this._editedObject = value;
    }

    /**
     * Field object
     * @type {object}
     */
    set field(value) {
        this._fieldData = value;
        if(this._updateFieldData) {
            this._updateFieldData();
        }
    }

    /**
     * Field object
     * @type {object}
     */
    get field() {
        return this._fieldData;
    }

    /** @protected */
    _setFilled() {
        const fieldEditoPane = this._element.closest('.app-field-pane-editor');
        if(fieldEditoPane && fieldEditoPane.tag('component')) {
            fieldEditoPane.tag('component').AddClass('-filled');
        }
    }

    /** @protected */
    _unsetFilled() {
        const fieldEditoPane = this._element.closest('.app-field-pane-editor');
        if(fieldEditoPane && fieldEditoPane.tag('component')) {
            fieldEditoPane.tag('component').RemoveClass('-filled');
        }
    }



}