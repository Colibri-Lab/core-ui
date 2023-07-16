Colibri.UI.Forms.Tabs = class extends Colibri.UI.Forms.Object {

    RenderFieldContainer() {
        this.AddClass('app-component-tabs-field');

        this._tabs = new Colibri.UI.Tabs('tabs', this.contentContainer);
        this._tabs.shown = true;

        this._tabs.AddHandler('SelectionChanged', (event, args) => {
            // ! нужно видимо убрать событие TabChanged
            this.Dispatch('TabChanged', args);
            this.Dispatch('Changed', args);
        });

        this._renderFields();
        this._hideAndShow();

        this._tabs.selectedIndex = 0;

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

        // this._fieldData.vertical && this.AddClass('app-field-vertical');
        // this._fieldData.params && this._fieldData.params.merged && this.AddClass('app-merged-object-component');

        Object.forEach(this._fieldData.fields, (name, fieldData) => {

            const field = Object.cloneRecursive(fieldData);
            const tabTitle = field.desc[Lang.Current] ?? field.desc ?? '';

            delete field.desc;
            
            const component = Colibri.UI.Forms.Field.Create(name, this._tabs.container, field, this, this.root);
            component.message = false;
            component.shown = true;
            component.AddHandler('Changed', (event, args) => this.Dispatch('Changed', {component: this}))

            const tabButton = new Colibri.UI.Button(component.name + '-button', this._tabs.header);
            tabButton.value = tabTitle;
            tabButton.shown = true;

            this._tabs.AddTab(tabButton, component);
            
            
        });

        this.Dispatch('FieldsRendered');
    }

    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
        this.RegisterEvent('TabChanged', false, 'Когда вкладка переключена');
    }

    Focus() {
        this.contentContainer.Children('firstChild').Focus();
    }

    get readonly() {
        const first = this.contentContainer.Children('firstChild');
        return first.readonly;
    }

    set readonly(value) {
        this.contentContainer.ForEach((name, component) => {
            component.readonly = value; 
        });
    }

    get value() {

        let data = {};
        Object.forEach(this._tabs.components, (name, component) => {
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
        value = eval_default_values(value);
        
        Object.forEach(this._tabs.components, (name, component) => {
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
            const oneof = this._tabs.components['_oneof'];
            if(oneof) {
                const keys = Object.keys(value);
                oneof.value = keys[0];
            }
        }
    }

    _hideAndShow() {

        const data = this.value;
        const formData = this.root.value;

        Object.forEach(this._fieldData.fields, (name, fieldData) => {
            if(!fieldData || !this.contentContainer) {
                return true;
            }
            
            const fieldComponent = this.contentContainer.Children(name);
            if(fieldData?.params?.fieldgenerator) {
                const gen = eval(fieldData.params.fieldgenerator);
                gen(fieldData, fieldComponent, this);
            } 
            if(fieldComponent && fieldData.params && fieldData.params.condition) {
                const condition = fieldData.params.condition;
                if(condition.field) {        
                    const type = condition?.type == 'disable' ? 'enabled' : 'shown';            
                    const empty = condition?.empty || false;
                    const inverse = condition?.inverse || false;
                    let fieldValue = eval('data?.' + condition.field.split('.').join('?.'));
                    if(!fieldValue) {
                        fieldValue = eval('formData?.' + condition.field.split('.').join('?.'));
                    }
                    fieldValue = fieldValue?.value ?? fieldValue;
                    let conditionResult = true;
                    if((condition?.value ?? null) !== null) {
                        if(Array.isArray(condition.value)) {
                            conditionResult = fieldValue === undefined || (fieldValue !== undefined && condition.value.indexOf(fieldValue) !== -1);
                        }
                        else {
                            conditionResult = fieldValue === undefined || (fieldValue !== undefined && fieldValue === condition.value);
                        }
                    } else if(condition?.method) {
                        conditionResult = eval(condition.method);
                    }
                    if(inverse) {
                        conditionResult = !conditionResult;
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
        });

    }

    Fields(name = null) {
        if(!this._tabs) {
            return [];
        }
        return name ? this._tabs.components[name] : this._tabs.components;
    }

    ForEveryField(callback) {
        Object.forEach(this._tabs.components, callback);
    }

    set selectedIndex(value) {
        this._tabs.selectedIndex = value;
    }
    get selectedIndex() {
        return this._tabs.selectedIndex;
    }

    get buttons() {
        return this._tabs.buttons;
    }

    get panes() {
        return this._tabs.components;
    }

    _calcRuntimeValues(rootValue = null) {
        const parentValue = this.value;
        const formValue = rootValue ?? this.root?.value ?? {};
        Object.forEach(this._fieldData.fields, (name, fieldData) => {
            const fieldComponent = this.Fields(name);         
            if(fieldComponent instanceof Colibri.UI.Forms.Object || fieldComponent instanceof Colibri.UI.Forms.Array || fieldComponent instanceof Colibri.UI.Forms.Tabs) {
                fieldComponent._calcRuntimeValues(formValue);
            } else {
                if(fieldData?.params?.valuegenerator) {
                    const f = eval(fieldData?.params?.valuegenerator);
                    const v = f(parentValue, formValue, fieldComponent, this.root);
                    if(v != fieldComponent.value) {
                        fieldComponent.value = v;
                    }
                }
            }
        });
    }
    

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Tabs', 'Colibri.UI.Forms.Tabs', '#{ui-fields-tabs}')
