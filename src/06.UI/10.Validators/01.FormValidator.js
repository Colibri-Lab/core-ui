/**
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.UI
 * @example
 * ```
 * const form = new Colibri.UI.Forms.Form('form', this);
 * const validator = new Colibri.UI.FormValidator(form);
 * 
 * validator.Validate();
 * 
 * ```
 */
Colibri.UI.FormValidator = class extends Colibri.Events.Dispatcher {

    /**
     * Form component
     * @type {Colibri.UI.Forms.Form}
     * @private
     */
    _form = null;

    /**
     * Field validators
     * @type {Array<Colibri.UI.FieldValidator>}
     * @private
     */
    _validators = null;

    /**
     * @constructor
     * @param {Colibri.UI.Forms.Form} form form component
     */
    constructor(form) {
        super();

        this.RegisterEvent('Validated', false, 'Когда валидатор завершил валидацию');

        this._validators = [];
        this._form = form;
        this._form.AddHandler('FieldsRendered', this.__formFieldsRendered, false, this);
        this._createValidators();
    }

    /**
     * When form fields rendered
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {object} args log message arguments
     * @ignore 
     */
    __formFieldsRendered(event, args) {
        this._createValidators();
    }

    /**
     * Create validators for each field in the form
     * @private
     */
    _createValidators() {
        this._validators = [];
        this._form.ForEach((name, component) => {
            const fieldValidator = new Colibri.UI.FieldValidator(component, this._form);
            fieldValidator.AddHandler('Validated', this.__fieldsValidatorValidated, false, this);
            this._validators.push(fieldValidator);
        });
    }

    /**
     * When field validator validated
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {object} args log message arguments
     * @ignore 
     */
    __fieldsValidatorValidated(event, args) {
        this.Dispatch('Validated', args);
    }

    /**
     * Validate form
     * @param {boolean} messages отображать ли сообщения
     * @param {boolean} breakFirst прерывается на первом не валидном поле
     * @param {string} className
     * @returns {boolean}
     * @public
     */
    Validate(messages = true, breakFirst = true, className = 'app-validate-error') {

        let needValidate = true;
        if (this._form.tag.params && this._form.tag.params.validate) {
            const method = eval(this._form.tag.params.validate);
            needValidate = method(this._form, this);
        }

        if (!needValidate) {
            return true;
        }

        if (breakFirst) {
            this._validators.forEach(validator => validator.Clear());
        }

        this._validated = true;
        for (let validator of this._validators) {
            const _validated = validator.Validate(messages, className);
            if (!_validated) {
                this._validated = false;
                if (breakFirst) {
                    break;
                }
            }
        }

        return this._validated;
    }

    /**
     * Invalidate field
     * @param {string} field field to invalidate
     * @param {string} message message to show
     * @param {string} className classname for error
     * @public
     */
    Invalidate(field, message, className = 'app-validate-error') {
        const fieldObject = this._form.FindField(field);
        if (!fieldObject) {
            return;
        }

        const validator = fieldObject.container.tag('validator');
        validator.Invalidate(message, className);
    }

    /**
     * Form object
     * @type {Colibri.UI.Forms.Form}
     */
    get form() {
        return this._form;
    }
}