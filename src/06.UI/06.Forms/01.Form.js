
Colibri.UI.Forms.Form = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<form />');
        this.AddClass('app-form-component');
        this._fields = {};
        this._download = null;
        this._shuffleFieldNames = false;
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
            else if(fieldData.params && fieldData.params.hidden) {
                fieldComponent.shown = false;
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
                if(component instanceof Colibri.UI.Forms.Field) {
                    if(name == '_adds') {
                        // если наткнулись на _adds
                        component.ForEveryField((name, field) => {
                            let def = field?.field?.default;
                            if(field?.field?.params?.generator) {
                                const gen = eval(component.field.params.generator);
                                def = gen(value);
                            }    
                            if(!this._value) {
                                field.value = def ?? null;    
                            }
                            else {
                                field.value = this._value[name] ?? def ?? null;
                            }
                        });
                    }
                    else {
                        let def = component?.field?.default;
                        if(component?.field?.params?.generator) {
                            const gen = eval(component.field.params.generator);
                            def = gen(value);
                        }
                        if(!this._value) {
                            component.value = def ?? null;    
                        }
                        else {
                            component.value = this._value[name] ?? def ?? null;
                        }
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
            if(component instanceof Colibri.UI.Forms.Field) {
                if(name == '_adds') {
                    data = Object.assign(data, component.value);
                }
                else {
                    data[name] = component.value;
                }
            }
        });

        data = this._prepareOneOf(data);

        return data;
    }

    set shuffleFieldNames(value) {
        this._shuffleFieldNames = value === true || value === 'true';
        if(this._shuffleFieldNames) {
            this._element.attr('autocomplete', 'off');
        }
    }

    get shuffleFieldNames() {
        return this._shuffleFieldNames;
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

    _renderField(name, fieldData, value, shown = true) {
        const root = this.root || this;
        const component = Colibri.UI.Forms.Field.Create(name, this, fieldData, null, root);
        component.shown = shown;
        component.AddHandler('Validated', (event, args) => this.Dispatch('Validated', args));
        component.AddHandler('Changed', (event, args) => {
            args = args ? args : {};
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
    }

    _renderFields(value) {
        
        let hasGroups = false;
        Object.forEach(this._fields, (name, fieldData) => {
            if(!fieldData.group || fieldData.group === 'window') {
                this._renderField(name, fieldData, value, true);
            }
            else {
                hasGroups = true;
            }
        });

        let groups = null;
        if(hasGroups) {
            groups = new Colibri.UI.ButtonGroup('groups', this);
            groups.shown = true;
            Object.forEach(this._fields,(name, fieldData) => {
                if(fieldData.group && fieldData.group !== 'window') {
                    groups.AddButton(fieldData.group, fieldData.group);
                }
            });
            groups.AddHandler('Changed', (event, args) => {
                const groupName = args.button.name;
                Object.forEach(this._fields, (name, fieldData) => {
                    if(fieldData.group !== 'window') {
                        if(fieldData.group === groupName) {
                            this.Children(name).shown = true;
                        }
                        else {
                            this.Children(name).shown = false;
                        }
                    }
                });
            });
        }
        
        Object.forEach(this._fields, (name, fieldData) => {
            if(fieldData.group && fieldData.group !== 'window') {
                this._renderField(name, fieldData, value, false);
            }
        });

        
        groups && groups.SelectButton('firstChild');

        this.Dispatch('FieldsRendered');
    }

    __renderBoundedValues(values) {
        Object.forEach(values, (name, value) => {
            this.Children(name).value = value;
        });
    }

    Focus() {
        const firstComponent = this.Children('firstChild');
        if(firstComponent) {
            firstComponent.Focus();
        }
    }

} 