Colibri.UI.FieldValidator = class extends Colibri.Events.Dispatcher {

    _field = null;
    _form = null;

    _validated = true;
    _message = '';

    _validators = [];

    constructor(fieldComponent, formComponent) {
        super();
        this.RegisterEvent('Validated', false, 'Когда поле валидировано');
        this._form = formComponent;
        this._field = fieldComponent;
        this._field.AddHandler(['Changed', 'KeyUp', 'Pasted'], (event, args) => {
            const messages = !(event.sender._fieldData?.params && event.sender._fieldData.params.messages === false);
            this.Validate(messages);
            this.Dispatch('Validated', {messages: messages});
        });
        this._field.AddHandler('FieldsRendered', (event, args) => {
            this._createValidators();
        });
        this._createValidators();
    }

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

    Clear(className = null) {
        this._field.message = '';
        className && this._field.RemoveClass(className);

        if (this._field?.Fields) {
            Object.forEach(this._field.Fields(),
                (name, component) => {
                    className && component.RemoveClass(className);
                    component.field?.message && (component.field.message = '');
                })
        }
    }

    Validate(messages = true, className = null) {
        // валидируем и потом выставляем поля validated и message
        let message;
        this._validated = true;

        if (this._validators.length > 0) {
            this._validators.forEach((validator) => {
                this._validated = this._validated && validator.Validate(messages, className);
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

                const v = validate[key],
                      method = eval(v.method);

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

    Invalidate(message, className) {
        this._validated = false;
        if (this._validators.length > 0) {
            this._validators.forEach((validator) => {
                validator.Invalidate(message, className);
            });
        }
        else {
            this._field.message = message;
            this._field.AddClass(className);    
        }
    }

    get validated() {
        return this._validated;
    }

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

    get field() {
        return this._field;
    }

    get form() {
        return this._form;
    }
}