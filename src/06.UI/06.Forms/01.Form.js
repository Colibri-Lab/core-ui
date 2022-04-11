
Colibri.UI.Forms.Form = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<form />');
        this.AddClass('app-form-component');
        this._fields = {};
        this._download = null;
        this._value = {};
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Validated', false, 'Когда форма полностью валидирована');
        this.RegisterEvent('Changed', false, 'Прозошло изменение данных компонента')
        this.RegisterEvent('KeyDown', false, 'Когда кнопка нажата');
        this.RegisterEvent('KeyUp', false, 'Когда кнопка отжата');
        this.RegisterEvent('Click', false, 'Когда кликнули');
        this.RegisterEvent('FieldsRendered', false, 'Когда поля созданы');
    }

    _registerEventHandlers() {
        this.AddHandler('Changed', (event, args) => this._hideAndShow());
    }

    _hideAndShow() {

        const data = this.value;

        Object.forEach(this._fields, (name, fieldData) => {
            const fieldComponent = this.Children(name);
            if(fieldData.params && fieldData.params.condition) {
                const condition = fieldData.params.condition;
                if(condition.field) {
                    const type = condition?.type == 'disable' ? 'enabled' : 'shown';
                    const empty = condition?.empty || false;
                    let fieldValue = eval('data?.' + condition.field.split('.').join('?.'));
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
            if(fieldComponent._hideAndShow) {
                fieldComponent._hideAndShow();
            }
        });

    }

    set download(value) {
        this._download = value;
    }

    set fields(fields) {
        if(typeof fields == 'string') {
            fields = this._storage.Query(fields);
        }
        this._fields = fields;
        this.Clear();
        this._renderFields();
        this._hideAndShow();
    }
    get fields() {
        return this._fields;
    }

    set value(value) {

        
        this._value = Object.assign({}, value);
        if ([false, null, undefined].includes(value)) {
            this.ForEach((name, component) => component.value = null);
        }
        else {
            this.ForEach((name, component) => {
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
                    if(!this._value) {
                        component.value = component.field.default ?? null;    
                    }
                    else {
                        component.value = this._value[name] ?? component.field.default ?? null;
                    }
                }
            });

            const oneof = this.Children('_oneof');
            if(oneof) {
                const keys = Object.keys(this._value);
                oneof.value = keys[0];
            }

        }

        this._hideAndShow();
        this.Dispatch('Validated');
    }

    get value() {
        let data = Object.assign({}, this._value);
        this.ForEach((name, component) => {
            if(name == '_adds') {
                data = Object.assign(data, component.value);
            }
            else {
                data[name] = component.value;
            }
        });

        data = this._prepareOneOf(data);

        return data;
    }

    _prepareOneOf(data) {
        if(data instanceof Object) {
            Object.forEach(data, (n, v) => {
                data[n] = this._prepareOneOf(v);
            });
            if(Object.keys(data).indexOf('_oneof') !== -1) {
                const oneof = {};
                oneof[data['_oneof']] = data[data['_oneof']] ?? null;
                data = oneof;
            }
        }
        return data;
    }

    FindField(fieldName) {
        let field = null,
            queryString = fieldName.split('/')
                .map(field => `[data-object-name="${field}"]`)
                .join(' ');

        let fields = this._element.querySelectorAll(queryString);

        if(fields) {
            if(fields.length === 1) {
                field = fields[0].tag('component');
            } else {
                for(let _fieldEl of fields) {
                    let _field = _fieldEl.tag('component');
                    if(_field instanceof Colibri.UI.Forms.Field) {
                        field = _field;
                        break;
                    }
                }
            }
        }
        return field;
    }

    _renderFields(value) {
        const root = this.root || this;
        Object.forEach(this._fields, (name, fieldData) => {
            const component = Colibri.UI.Forms.Field.Create(name, this, fieldData, null, root);
            component.AddHandler('Validated', (event, args) => this.Dispatch('Validated', args));
            component.AddHandler('Changed', (event, args) => {
                args ??= {};
                if(component._timeout) {
                    clearTimeout(component._timeout);
                    component._timeout = null;
                }
                args.component = component;
                component._timeout = setTimeout(() => this.Dispatch('Changed', args), 50);
            });
            component.download = this._download;
            if(value && value[name] !== undefined) {
                component.value = value[name];
            }
        });
        this.Dispatch('FieldsRendered');
    }

    __renderBoundedValues(values) {
        Object.forEach(values, (name, value) => {
            this.Children(name).value = value;
        });
    }
}