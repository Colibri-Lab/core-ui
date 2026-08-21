/**
 * Window with form for object editing
 * @class
 * @extends Colibri.UI.ModelessWindow
 * @memberof Colibri.UI.Forms.ArrayGrid
 */
Colibri.UI.Forms.ArrayGrid.ObjectWindow = class extends Colibri.UI.Window {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-component-array-grid-object-window');

        this.title = '#{ui-arraygrid-title}';

        this._containsNewObject = true;

        this._form = new Colibri.UI.Forms.Form(this._name + '-form', this.container);
        this._saveButton = new Colibri.UI.SuccessButton(this._name + '-save-button', this.footer);
        this._saveButton.value = '#{ui-arraygrid-save}';
        this._saveButton.AddHandler('Clicked', this.__saveButtonClicked, false, this);

        this._form.shown = true;
        this._saveButton.shown = true;
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __saveButtonClicked(event, args) {
        this.Dispatch('FormSubmitted', { value: this._form.value });
        this.Hide();
    }

    /**
     * @ignore 
     * @protected 
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('FormSubmitted', 'Когда форма внутри окна отправлена');
    }

    /**
     * Set a window params
     * @param {Object} params
     * @public
     */
    setParams(params) {
        this.title = params.title;
        this.width = params.width;
        this.height = params.height;
        this.sticky = params.sticky;
        this.stickyX = params.sticky_x;
        this.stickyY = params.sticky_y;
        this.startPointX = params.start_point_x;
        this.startPointY = params.start_point_y;
        this.disposeOnClose = params.dispose_on_close;
    }

    /**
     * Form with object
     * @type {Colibri.UI.Forms.Form}
     */
    get form() {
        return this._form;
    }

    /**
     * Form fields
     * @type {Object}
     */
    get fields() {
        return this._form.fields;
    }
    /**
     * Form fields
     * @param {string|Object} value
     */
    set fields(value) {
        this._form.fields = value;
    }

    /**
     * Form values
     * @type {Object|null}
     */
    get value() {
        return this._form.value;
    }
    /**
     * Form values
     * @type {Object|null}
     */
    set value(value) {
        this._form.value = value || this._form.defaultValues();
    }

    /**
     * Is form contains new object
     * @type {boolean}
     */
    get containsNewObject() {
        return this._containsNewObject;
    }
    /**
     * Is form contains new object
     * @type {boolean}
     */
    set containsNewObject(value) {
        this._containsNewObject = (value === true || value === 'true');
    }

    /**
     * Returns root object
     * @type {object}
     */
    get root() {
        return this._form.root;
    }

    /**
     * Returns root object
     * @type {object}
     */
    set root(value) {
        this._form.root = value;
    }

}
