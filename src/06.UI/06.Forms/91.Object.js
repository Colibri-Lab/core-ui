Colibri.UI.Forms.Object = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {
        this.AddClass('app-component-object-field');

        this._renderFields();
        this._hideAndShow();

        this.AddHandler('Changed', (event, args) => this._hideAndShow());

        if(this._fieldData.className) {
            this.AddClass(this._fieldData.className);
        }

    }

    _renderFields() {

        (this._fieldData?.vertical || this._fieldData?.params?.vertical) && this.AddClass('app-field-vertical');
        this._fieldData?.params?.merged && this.AddClass('app-merged-object-component');
        this._fieldData?.params?.wrap && this.AddClass('app-field-wrap');

        Object.forEach(this._fieldData.fields, (name, fieldData) => {
            
            const field = Object.assign({}, fieldData);
            const placeholder = (this._fieldData?.vertical || this._fieldData?.params?.vertical) ? field.placeholder : field.desc;
            (!this._fieldData?.vertical && !this._fieldData?.params?.vertical) && delete field.desc;
            
            const component = Colibri.UI.Forms.Field.Create(name, this.contentContainer, field, this, this.root);
            component.placeholder = placeholder;
            component.message = false;
            component.shown = true;
            component.AddHandler('Changed', (event, args) => this.Dispatch('Changed'))
            
        });


        this.Dispatch('FieldsRendered');
    }

    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    Focus() {
        this.contentContainer.Children('firstChild').Focus();
    }

    get value() {

        let data = {};
        this.contentContainer.ForEach((name, component) => {
            data[name] = component.value;
        });
        
        return data;

    }

    set value(value) {
        if(value && !(value instanceof Object)) {
            // throw new Error('Передайте обьект')
            return;
        }

        value && Object.forEach(value, (name, v) => {
            this.contentContainer.Children(name).value = v;
        });

        this._hideAndShow();

        this.readonly = this._fieldData.readonly;

    }

    set tabIndex(value) {
        // do nothing
    }

    get tabIndex() {
        const first = this.contentContainer.Children('firstChild');
        return first.tabIndex;
    }

    
    _hideAndShow() {

        const data = this.value;
        const formData = this.root.value;

        Object.forEach(this._fieldData.fields, (name, fieldData) => {
            const fieldComponent = this.contentContainer.Children(name);
            if(fieldComponent && fieldData.params && fieldData.params.condition) {
                const condition = fieldData.params.condition;
                if(condition.field) {        
                    const type = condition?.type == 'disable' ? 'enabled' : 'shown';            
                    const empty = condition?.empty || false;
                    let fieldValue = eval('data?.' + condition.field.split('.').join('?.'));
                    if(!fieldValue) {
                        fieldValue = eval('formData?.' + condition.field.split('.').join('?.'));
                    }
                    fieldValue = fieldValue?.value ?? fieldValue;
                    let conditionResult = true;
                    if(Array.isArray(condition.value)) {
                        conditionResult = !fieldValue !== undefined || condition.value.indexOf(fieldValue) !== -1;
                    }
                    else {
                        conditionResult = !fieldValue !== undefined || fieldValue === condition.value;
                    }
                    fieldComponent[type] = conditionResult;
                    if(!conditionResult && empty) {
                        fieldComponent.value = null;  
                    }
                }
                else {
                    fieldComponent.shown = true;
                    fieldComponent.enable = true;
                }
            }
        });

    }

    Fields(name) {
        return this.contentContainer.Children(name);
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Object', 'Colibri.UI.Forms.Object', 'Обьект с полями')
