Colibri.UI.SimpleFormValidator = class {

    constructor(form) {
        this._form = form;
        this._init(this._form.Fields());
        this._form.AddHandler('FieldsRendered', (event, args) => {
            this._init(this._form.Fields());            
        });
    }

    _init(fields) {
        if(fields.length == 0) {
            return;
        }
        Object.forEach(fields, (name, field) => {
            field.field.params && (field.field.params.validated = true);
            field.AddHandler('Changed', (event, args) => this.__validateField(field));
            this._init(field.Fields ? field.Fields() : []);
        });
    }

    __validateField(field) {
        console.log('validation')
        field.message = '';
        field.RemoveClass('app-validate-error');
        field.field.params && (field.field.params.validated = true);

        const validate = field.field?.params?.validate;
        if(!validate) {
            return;
        }

        for(const v of validate) {
            const message = v.message instanceof Function ? v.message(field, this) : v.message;
            const method = eval(v.method);
            if(!method(field, this)) {
                field.field.params && (field.field.params.validated = false);
                field.message = message;
                field.AddClass('app-validate-error');
                break;
            }
        }

    }

    Status(fields = null) {

        if(!fields) {
            fields = this._form.Fields();
        }

        if(fields.length == 0) {
            return true;
        }

        for(const field of fields) {
            if(field.field.params && !field.field.params.validated) {
                return false;
            }
            if(!this.Status(field.Fields ? field.Fields() : [])) {
                return false;
            }
        }

        return true;

    }

    Clear(fields = null) {
        if(!fields) {
            fields = this._form.Fields();
        }

        if(fields.length == 0) {
            return;
        }

        for(const field of fields) {
            field.message = '';
            field.RemoveClass('app-validate-error');
            field.field.params && (field.field.params.validated = true);

            this.Clear(field.Fields ? field.Fields() : []);
        }

    }

    ValidateAll(fields = null) {
        if(!fields) {
            fields = this._form.Fields();
        }

        if(fields.length == 0) {
            return;
        }

        for(const field of fields) {
            this.__validateField(field);
            this.ValidateAll(field.Fields ? field.Fields() : []);
        }

        return this.Status();

    }

    Invalidate(field, message) {
        const f = this._form.FindField(field);
        if(!f) {
            return;
        }
        f.field.params.validated = false;
        f.message = message;
        f.AddClass('app-validate-error');
    }

    get form() {
        return this._form;
    }


}
