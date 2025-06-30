/**
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.UI
 */
Colibri.UI.SimpleFormValidator = class {

    /**
     * @constructor
     * @param {Colibri.UI.Forms.Form} form form component
     */
    constructor(form) {
        this._form = form;
        this._init(this._form.Fields());
        this._form.AddHandler('FieldsRendered', this.__formFieldsRendered, false, this);
        this._form.AddHandler('Changed', this.__formChanged, false, this);
    }

    __formChanged(event, args) {
        this._form.message = '';
    }

    __formFieldsRendered(event, args) {
        this._init(this._form.Fields());
    }

    /**
     * Init
     * @private
     * @param {object} fields fields object
     */
    _init(fields) {
        if (fields.length == 0) {
            return;
        }
        Object.forEach(fields, (name, field) => {
            field.field.params && (field.field.params.validated = 'not-validated-yet');
            field.AddHandler('Changed', this.__fieldChanged, false, this);
            field.AddHandler('FieldsRendered', this.__fieldFieldsRendered, false, this);
            this._init(field.Fields ? field.Fields() : []);
        });
    }

    __fieldFieldsRendered(event, args) {
        return this._init(event.sender.Fields());
    }

    __fieldChanged(event, args) {
        return this.__validateField(event.sender);
    }

    /**
     * Validate field
     * @param {object} field field object
     */
    __validateField(field, showMessages = true) {

        field.field.params && (field.field.params.validated = 'success');
        field.message = '';
        field.RemoveClass('app-validate-error');

        if (!field.shown) {
            return;
        }

        const validate = field.field?.params?.validate;
        if (!validate) {
            return;
        }

        for (const v of validate) {
            const message = v.message instanceof Function ? v.message(field, this) : v.message;
            const method = typeof v.method !== 'function' ? eval(v.method) : v.method;
            if (!method(field, this)) {
                field.field.params && (field.field.params.validated = 'error');
                if (showMessages) {
                    field.message = message;
                    field.AddClass('app-validate-error');
                }
                break;
            } else {

            }
        }

    }

    /**
     * Status of validation
     * @param {object} fields fields object
     */
    Status(fields = null) {

        if (!fields) {
            fields = this._form.Fields();
        }

        if (!Array.isArray(fields)) {
            fields = Object.values(fields);
        }

        if (fields.length == 0) {
            return true;
        }

        for (const field of fields) {
            // if(field.field?.params?.validate) {    
            if (field.field.params && field.field.params.validated !== 'success') {
                return false;
            }
            if (!this.Status(field.Fields ? field.Fields() : [])) {
                return false;
            }
            //}
        }

        return true;

    }

    /**
     * Clear messages of validation
     * @param {object} fields fields object
     */
    Clear(fields = null) {

        this._form.message = '';

        if (!fields) {
            fields = this._form.Fields();
        }

        if (!Array.isArray(fields)) {
            fields = Object.values(fields);
        }

        if (fields.length == 0) {
            return;
        }

        for (const field of fields) {
            field.message = '';
            field.RemoveClass('app-validate-error');
            field.field.params && (field.field.params.validated = true);

            this.Clear(field.Fields ? field.Fields() : []);
        }


    }

    /**
     * Validate all fields
     * @param {object|null} fields fields object
     */
    ValidateAll(fields = null, showMessages = true) {

        this._form.message = '';

        if (!fields) {
            fields = this._form.Fields();
        }

        if (!Array.isArray(fields)) {
            fields = Object.values(fields);
        }

        if (fields.length == 0) {
            return;
        }

        for (const field of fields) {
            this.__validateField(field, showMessages);
            this.ValidateAll(field.Fields ? field.Fields() : [], showMessages);
        }

        return this.Status();

    }

    /**
     * Set field as valid
     * @param {object|string} field field object
     */
    SetAsValid(field) {
        const f = typeof field === 'string' ? this._form.FindField(field) : field;
        if (!f) {
            return;
        }
        f.field.params.validated = 'success';
        f.message = '';
        f.RemoveClass('app-validate-error');
    }

    /**
     * Invalidate field
     * @param {object|string"} field field object 
     * @param {string} message validation message 
     */
    Invalidate(field, message) {
        if (field == 'form' || field instanceof Colibri.UI.Forms.Form) {
            this._form.message = message;
            return;
        }
        const f = typeof field === 'string' ? this._form.FindField(field) : field;
        if (!f) {
            return;
        }
        f.field.params.validated = 'error';
        message && (f.message = message);
        f.AddClass('app-validate-error');
    }

    /**
     * Form object
     * @type {object}
     * @readonly
     */
    get form() {
        return this._form;
    }

    GetFirstInvalid(fields = null) {
        let found = null;
        if (!fields) {
            fields = this._form.Fields();
        }
        Object.forEach(fields, (name, field) => {
            if (field.field.params.validated === 'error') {
                found = field;
                return false;
            }
            if (field.Fields && (found = this.GetFirstInvalid(field.Fields()))) {
                return false;
            }
        });
        return found;
    }


}
