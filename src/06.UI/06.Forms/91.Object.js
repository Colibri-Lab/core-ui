Colibri.UI.Forms.Object = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {
        this.AddClass('app-component-object-field');

        this._renderFields();
        this._hideAndShow();

        this.AddHandler('Changed', (event, args) => this._hideAndShow());

        if(this._fieldData.className) {
            this.AddClass(this._fieldData.className);
        }

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

    }

    _renderFields() {

        (this._fieldData?.vertical || this._fieldData?.params?.vertical) && this.AddClass('app-field-vertical');
        this._fieldData?.params?.merged && this.AddClass('app-merged-object-component');
        this._fieldData?.params?.wrap && this.AddClass('app-field-wrap');

        if(!this._fieldData.fields) {

            const component = Colibri.UI.Forms.Field.Create('nofields', this.contentContainer, {
                component: 'TextArea'
            }, this, this.root);
            component.placeholder = 'Введите JSON обьекта';
            component.message = false;
            component.shown = true;
            component.AddHandler('Changed', (event, args) => this.Dispatch('Changed'))
        
        }
        else {
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
        }



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

        if(this.contentContainer.Children('nofields')) {
            const v = this.contentContainer.Children('nofields').value;
            if(!v) {
                return {};
            }
            return JSON.parse(v);
        }

        let data = {};
        this.contentContainer.ForEach((name, component) => {
            if(name == '_adds') {
                data = Object.assign(data, component.value);
            }
            else {
                data[name] = component.value;
            }
        });
        
        return data;

    }

    set value(value) {

        if(this.contentContainer.Children('nofields')) {
            this.contentContainer.Children('nofields').value = JSON.stringify(value);
            return 
        }

        value = eval_default_values(value);

        this.contentContainer.ForEach((name, component) => {
            if(name == '_adds') {
                // если наткнулись на _adds
                component.ForEveryField((name, field) => {
                    if(!this._value) {
                        field.value = component.field.default ?? null;    
                    }
                    else {
                        field.value = this._value[name] ?? field?.field?.default ?? null;
                    }
                });
            }
            else {
                
                if(!value) {
                    component.value = component.field.default ?? null;    
                }
                else {
                    component.value = value[name] ?? component.field.default ?? null;
                }
            }
        });

        
        if(value) {
            const oneof = this.contentContainer.Children('_oneof');
            if(oneof) {
                const keys = Object.keys(value);
                oneof.value = keys[0];
            }    
        }

        this._hideAndShow();

        this.readonly = !!this._fieldData?.params?.readonly;

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
                        conditionResult = fieldValue === undefined || (fieldValue !== undefined && condition.value.indexOf(fieldValue) !== -1);
                    }
                    else {
                        conditionResult = fieldValue === undefined || (fieldValue !== undefined && fieldValue === condition.value);
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
        return this.contentContainer ? this.contentContainer.Children(name) : {};
    }

    ForEveryField(callback) {
        this.contentContainer && this.contentContainer.ForEach(callback);
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Object', 'Colibri.UI.Forms.Object', '#{app-fields-object;Обьект с полями}')
