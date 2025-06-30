/**
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.UI
 */
Colibri.UI.FormValidator = class extends Colibri.Events.Dispatcher {

    _form = null;
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

    __formFieldsRendered(event, args) {
        this._createValidators();
    }

    /** @private */
    _createValidators() {
        this._validators = [];
        this._form.ForEach((name, component) => {
            const fieldValidator = new Colibri.UI.FieldValidator(component, this._form);
            fieldValidator.AddHandler('Validated', this.__fieldsValidatorValidated, false, this);
            this._validators.push(fieldValidator);
        });
    }

    __fieldsValidatorValidated(event, args) {
        this.Dispatch('Validated', args);
    }

    /**
     * Validate form
     * @param {boolean} messages отображать ли сообщения
     * @param {boolean} breakFirst прерывается на первом не валидном поле
     * @param {string} className
     * @returns {boolean}
     * @constructor
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
     * @readonly
     */
    get form() {
        return this._form;
    }
}