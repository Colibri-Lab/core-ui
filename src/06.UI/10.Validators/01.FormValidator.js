Colibri.UI.FormValidator = class extends Colibri.Events.Dispatcher {

    _form = null;
    _validators = null;

    constructor(form) {
        super();

        this.RegisterEvent('Validated', false, 'Когда валидатор завершил валидацию');

        this._validators = [];
        this._form = form;
        this._form.AddHandler('FieldsRendered', (event, args) => {
            this._createValidators();
        });
        this._createValidators();
    }

    _createValidators() {
        this._validators = [];
        this._form.ForEach((name, component) => {
            const fieldValidator = new Colibri.UI.FieldValidator(component, this._form);
            fieldValidator.AddHandler('Validated', (event, args) => {
                this.Dispatch('Validated', args);
            });
            this._validators.push(fieldValidator);
        });
    }

    /**
     *
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

        if(breakFirst) {
            this._validators.forEach(validator => validator.Clear());
        }

        this._validated = true;
        for (let validator of this._validators) {
            const _validated = validator.Validate(messages, className);
            if(!_validated) {
                this._validated = false;
                if(breakFirst) {
                    break;
                }
            }
        }

        return this._validated;
    }

    Invalidate(field, message, className = 'app-validate-error') {
        const validator = this._form.FindField(field).container.tag('validator');
        validator.Invalidate(message, className);
    }

    get form() {
        return this._form;
    }
}