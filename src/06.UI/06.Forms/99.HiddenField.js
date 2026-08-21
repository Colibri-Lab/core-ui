/**
 * Hidden field component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.HiddenField = class extends Colibri.UI.Component {
    /**
     * Creates a new field object
     * @param {string} name name of field
     * @param {Colibri.UI.Component} container container of component
     * @param {object} fieldData field data
     */
    constructor(name, container, fieldData) {
        super(name, container, Element.create('input', { type: 'hidden' }));
        this._fieldData = fieldData;
        this._validated = true;
    }

    /**
     * Value string
     * @type {string}
     */
    get value() {
        return this._element.value;
    }

    /**
     * Value string
     * @type {string}
     */
    set value(value) {
        this._element.value = value;
    }

    /**
     * Field data
     * @type {Object}
     */
    get field() {
        return this._fieldData;
    }

    /**
     * Field data
     * @type {Object}
     */
    set field(value) {
        this._fieldData = value;
    }

    /**
     * Validate field
     * @public
     */
    Validate() {
        this._validated = true;
    }

    /**
     * Is field validated
     * @type {boolean}
     */
    get validated() {
        return this._validated;
    }

    /**
     * Reset validation results of field
     * @public
     */
    ResetValidation() {
        // Do nothing
    }

    /**
     * Whether the field needs recalc every time when changed to form field
     * @type {Boolean}
     */
    get needRecalc() {
        return false;
    }

    /**
     * Whether the field needs hide and show when changed the form
     * @type {Boolean}
     */
    get loading() {
        return this._loading ?? false;
    }

    /**
     * Whether the field needs hide and show when changed the form
     * @type {Boolean}
     */
    set loading(value) {
        this._loading = value;
    }


}