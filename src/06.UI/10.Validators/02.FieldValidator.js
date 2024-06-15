/**
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.UI
 */
Colibri.UI.FieldValidator = class extends Colibri.Events.Dispatcher {

    _field = null;
    _form = null;

    _validated = true;
    _message = '';

    _className = null;
    _validating = false;
    _validators = [];

    /**
     * @constructor
     * @param {Colibri.UI.Forms.Field} fieldComponent field component
     * @param {Colibri.UI.Forms.Form} formComponent form component
     */ 
    constructor(fieldComponent, formComponent) {
        super();
        this.RegisterEvent('Validated', false, 'Когда поле валидировано');
        this._form = formComponent;
        this._field = fieldComponent;
        fieldComponent.container.tag('validator', this);
        this._field.AddHandler(['Changed', 'KeyUp', 'Pasted'], (event, args) => {
            Colibri.Common.Delay(100).then(() => {
                this.Clear();
                const messages = !(event.sender._fieldData?.params && event.sender._fieldData.params.messages === false);
                this.Validate(messages, this._className);
                this.Dispatch('Validated', {messages: messages});    
            });
        });
        this._field.AddHandler('FieldsRendered', (event, args) => {
            this._createValidators();
        });
        this._createValidators();
    }

    /** @private */
    _createValidators() {
        if (this._field?.Fields) {
            this._validators = [];
            Object.forEach(this._field.Fields(), (name, component) => {
                const validator = new Colibri.UI.FieldValidator(component, this._form);
                validator.AddHandler('Validated', (event, args) => {
                    this.Dispatch('Validated', args);
                });
                this._validators.push(validator);
            })
        }
    }

    /**
     * Clear validation
     * @param {string} className class name
     */
    Clear(className = null) {
        this._validated = true;
        this._message = '';
        this._field.message = '';
        className && this._field.RemoveClass(className);
        this._className && this._field.RemoveClass(this._className);

        if (this._validators.length > 0) {
            this._validators.forEach(validator => validator.Clear());
        }
    }

    /**
     * Validate form
     * @param {Array<string>} messages messages
     * @param {string} className class name
     * @returns {boolean}
     */
    Validate(messages = true, className = null) {
        this._className = className;
        // валидируем и потом выставляем поля validated и message
        let message;
        this._validated = true;

        
        if (this._validators.length > 0) {
            this._validators.forEach((validator) => {
                const v = validator.Validate(messages, className);
                this._validated = this._validated && v;
            });
        }

        if (this._field?.field?.params?.validate) {
            // есть валидатор
            let validate = this._field.field.params.validate;
            if (!Array.isArray(validate)) {
                validate = [validate];
            }

            for (const key in validate) {
                if (!validate.hasOwnProperty(key)) {
                    continue;
                }

                const v = validate[key]; 
                const method = typeof v.method === 'string' ? eval(v.method) : v.method;
                if (!method(this._field, this)) {
                    this._validated = false;
                    message = v.message instanceof Function ? v.message(this._field, this) : v.message;
                    break;
                }
            }
        }

        if (this._validated) {
            this._field.message = '';
            className && this.Clear(className);
        } else {
            messages && message && (this._field.message = (message instanceof Function ? message(this._field, this) : message));
            className && this._field.AddClass(className);
        }

        return this._validated;
    }

    /**
     * Invalidate form
     * @param {string} message message
     * @param {string} className class name
     */
    Invalidate(message, className) {
        this._validated = false;
        this._field.message = message;
        this._field.AddClass(className);    
    }

    /**
     * Is form validated
     * @type {boolean}
     * @readonly
     */
    get validated() {
        return this._validated;
    }

    /**
     * Message
     * @type {string}
     * @readonly
     */
    get message() {
        if (this._validators.length > 0) {
            let messages = [];
            this._validators.forEach((validator) => {
                if (!validator.validated) {
                    messages.push(validator.message);
                }
            });
            return messages.join(', ');
        } else {
            return this._message;
        }
    }

    /**
     * Field object
     * @type {object}
     * @readonly
     */
    get field() {
        return this._field;
    }

    /**
     * Form object
     * @type {object}
     * @readonly
     */
    get form() {
        return this._form;
    }
}