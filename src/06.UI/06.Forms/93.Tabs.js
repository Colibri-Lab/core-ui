/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Tabs = class extends Colibri.UI.Forms.Object {

    /**
     * Render field component
     */
    RenderFieldContainer() {
        this.AddClass('app-component-tabs-field');

        this._tabs = new Colibri.UI.Tabs('tabs', this.contentContainer);
        this._tabs.shown = true;
        this._tabs.allTabsInDoc = true;

        this._tabs.AddHandler('SelectionChanged', (event, args) => {
            // ! нужно видимо убрать событие TabChanged
            // this.Dispatch('TabChanged', args);
            this.Dispatch('Changed', args);
        });

        this._renderFields();
        this._hideAndShow();

        this._tabs.selectedIndex = 0;

        this.AddHandler('Changed', (event, args) => {
            if(!this.root) {
                this._hideAndShow();
            }
        });

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

    _renderField(name, fieldData, value, shown = true) {
        
        const field = Object.cloneRecursive(fieldData);
        const tabTitle = field.desc[Lang.Current] ?? field.desc ?? '';

        delete field.desc;

        const component = Colibri.UI.Forms.Field.Create(name, this._tabs.container, fieldData, this, this.root);
        component.message = false;
        component.shown = shown;
        // component.AddHandler('Changed', (event, args) => {
        //     this.Dispatch('Changed', {component: this});
        // });

        const tabButton = new Colibri.UI.Button(component.name + '-button', this._tabs.header);
        tabButton.value = tabTitle;
        tabButton.shown = shown;

        if(value) {
            component.value = value;
        }

        this._tabs.AddTab(tabButton, component);
    }

    /** @protected */
    _renderFields() {

        // this._fieldData.vertical && this.AddClass('app-field-vertical');
        // this._fieldData.params && this._fieldData.params.merged && this.AddClass('app-merged-object-component');

        Object.forEach(this._fieldData.fields, (name, fieldData) => {
            this._renderField(name, fieldData, null, true);
        });

        this.Dispatch('FieldsRendered');
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
        this.RegisterEvent('TabChanged', false, 'Когда вкладка переключена');
    }

    /**
     * Focus on component to the first object of array
     */
    Focus() {
        this.contentContainer.Children('firstChild').Focus();
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        const first = this.contentContainer.Children('firstChild');
        return first.readonly;
    }

    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        super.readonly = value;
        Object.forEach(this._tabs.components, (name, component) => {
            component.readonly = value; 
        });
    }

    /**
     * Value
     * @type {object}
     */
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

    /**
     * Value
     * @type {object}
     */
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

        Colibri.Common.Wait(() => {
            let loading = false;
            this.ForEveryField((name, component) => {
                if(component.loading) {
                    loading = true;
                    return false;
                }
                return true;
            });
            return !loading;
        }).then(() => {
            this._hideAndShow();
        });

        
    }

    /** @protected */
    _hideAndShow() {
        if(!this.needHideAndShow) {
            return;
        }

        const data = this.value;
        const formData = this.root.value;

        Object.forEach(this._fieldData.fields, (name, fieldData) => {
            if(!fieldData || !this.contentContainer) {
                return true;
            }
            
            let fieldComponent = this.contentContainer.Children(name);
            if(fieldData?.params?.fieldgenerator) {
                const gen = eval(fieldData.params.fieldgenerator);
                gen(fieldData, fieldComponent, this);
                if(fieldData?.replace ?? false) {
                    fieldComponent.Dispose();
                    fieldComponent = this._renderField(name, fieldData, data[name] ?? null, true);
                }

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
                        if(typeof condition.method === 'string') {
                            conditionResult = eval(condition.method);
                        } else {
                            conditionResult = condition.method(fieldValue, data, type, empty, inverse, fieldData);
                        }
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

    /**
     * Searches for field
     * @param {string} name field to search for
     * @returns {Array<Colibri.UI.Forms.Object>}
     */
    Fields(name = null) {
        if(!this._tabs) {
            return [];
        }
        return name ? this._tabs.components[name] : this._tabs.components;
    }

    /**
     * Cycles all rows in array
     * @param {Function} callback callback for each item
     */
    ForEveryField(callback) {
        Object.forEach(this._tabs.components, callback);
    }

    /**
     * Selected index
     * @type {number}
     */
    set selectedIndex(value) {
        value = this._convertProperty('Number', value);
        this._tabs.selectedIndex = value;
    }
    /**
     * Selected index
     * @type {number}
     */
    get selectedIndex() {
        return this._tabs.selectedIndex;
    }

    /**
     * Buttons
     * @type {Array}
     */
    get buttons() {
        return this._tabs.buttons;
    }

    /**
     * Components
     * @type {Array}
     */
    get panes() {
        return this._tabs.components;
    }

    /** @protected */
    _calcRuntimeValues(rootValue = null) {
        if(!this.needRecalc) {
            return;
        }

        Object.forEach(this._fieldData.fields, (name, fieldData) => {

            const fieldComponent = this.Fields(name);         
            if(!fieldComponent || !fieldComponent.needRecalc) {
                return true;
            }
            
            if(fieldComponent instanceof Colibri.UI.Forms.Object || fieldComponent instanceof Colibri.UI.Forms.Array || fieldComponent instanceof Colibri.UI.Forms.Tabs) {
                fieldComponent._calcRuntimeValues();
            } else {
                if(fieldData?.params?.valuegenerator) {
                    const f = eval(fieldData?.params?.valuegenerator);
                    const v = f(this.value, this.root?.value, fieldComponent, this.root);
                    fieldComponent.value = v;
                }
            }
        });
    }
    
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Tabs', 'Colibri.UI.Forms.Tabs', '#{ui-fields-tabs}')
