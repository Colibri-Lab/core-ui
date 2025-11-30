/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Object = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {
        this.AddClass('app-component-object-field');

        this._enabled = true;

        this._renderFields();
        this._hideAndShow();
        this._runGenerateOfFieldData();

        this.AddHandler('Changed', this.__thisChanged);

        if (this._fieldData.className) {
            this.AddClass(this._fieldData.className);
        }

        if (this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if (this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

    }

    __thisChanged(event, args) {
        if (!this.root) {
            this._hideAndShow();
        }
    }

    _renderField(name, fieldData, value, shown = true) {
        const component = Colibri.UI.Forms.Field.Create(name, this.contentContainer, fieldData, this, this.root);
        if (!component) {
            return true;
        }
        if (this._fieldData?.params?.removedesc !== false) {
            let placeholder = this._fieldData?.params?.vertical ? fieldData.placeholder : fieldData.desc;
            placeholder = placeholder ? placeholder[Lang.Current] ?? placeholder : '';
            if (!this._fieldData?.params?.vertical) {
                delete fieldData.desc;
            }
            component.placeholder = placeholder;
        }

        component.message = false;
        component.shown = shown;
        if (value) {
            component.value = value;
        }
    }

    /** @protected */
    _renderFields() {

        this._fieldData?.params?.vertical && this.AddClass('app-field-vertical');
        this._fieldData?.params?.merged && this.AddClass('app-merged-object-component');
        this._fieldData?.params?.wrap && this.AddClass('app-field-wrap');

        if (!this._fieldData.fields || this._fieldData.fields.length == 0) {

            const component = Colibri.UI.Forms.Field.Create('nofields', this.contentContainer, {
                component: 'TextArea'
            }, this, this.root);
            
            component.placeholder = 'Введите JSON обьекта';
            component.message = false;
            component.shown = true;
            component.AddHandler('Changed', this.__thisBubbleWithComponent, false, this);

        }
        else {
            Object.forEach(this._fieldData.fields, (name, fieldData) => {

                const field = Object.cloneRecursive(fieldData);

                this._renderField(name, field, null, true);

            });
        }



        this.Dispatch('FieldsRendered');
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    /**
     * Focus on component
     */
    Focus() {
        if (this.contentContainer.Children('firstChild')) {
            this.contentContainer.Children('firstChild').Focus();
        }
    }

    /**
     * Value
     * @type {Object}
     */
    get value() {

        if (this.contentContainer?.Children('nofields')) {
            const v = this.contentContainer.Children('nofields').value;
            if (!v) {
                return {};
            }
            return JSON.parse(v);
        }

        let data = {};
        this.contentContainer && this.contentContainer.ForEach((name, component) => {
            if (name == '_adds') {
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
     * @type {Object}
     */
    set value(value) {

        if (this.contentContainer?.Children('nofields')) {
            this.contentContainer.Children('nofields').value = JSON.stringify(value);
            return
        }

        value = eval_default_values(value);

        this.contentContainer && this.contentContainer.ForEach((name, component) => {
            if (name == '_adds') {
                // если наткнулись на _adds
                component.ForEveryField((name, field) => {
                    let def = field?.field?.default;
                    if (field?.field?.params?.generator) {
                        const gen = typeof field?.field?.params?.generator === 'string' ? eval(field.field.params.generator) : field.field.params.generator;
                        def = gen(value, component, this);
                    }
                    if (!this._value) {
                        field.value = def ?? null;
                    }
                    else {
                        field.value = this._value[name] ?? def ?? null;
                    }
                });
            }
            else {
                let def = component?.field?.default;
                if (component?.field?.params?.generator) {
                    const gen = typeof component?.field?.params?.generator === 'string' ? eval(component.field.params.generator) : component?.field?.params?.generator;
                    def = gen(value, component, this);
                }
                if (!value) {
                    component.value = def ?? null;
                }
                else {
                    component.value = value[name] ?? def ?? null;
                }
            }
        });


        if (value && this.contentContainer) {
            const oneof = this.contentContainer?.Children('_oneof');
            if (oneof) {
                const keys = Object.keys(value);
                oneof.value = keys[0];
            }
        }

        Colibri.Common.Wait(() => {
            let loading = false;
            this.ForEveryField((name, component) => {
                if (component.loading) {
                    loading = true;
                    return false;
                }
                return true;
            });
            return !loading;
        }).then(() => {
            this._hideAndShow();
        });

        this.readonly = !!this._fieldData?.params?.readonly;

    }

    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        // do nothing
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        const first = this.contentContainer.Children('firstChild');
        return first && first.tabIndex;
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        const first = this.contentContainer.Children('firstChild');
        return first && first.readonly;
    }

    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        super.readonly = value;
        this.contentContainer && this.contentContainer.ForEach((name, component) => {
            // const allreadyReadonly = component.readonly;
            component.readonly = value;
        });
        if (this._removeLink) {
            this._removeLink.shown = !value;
        }
        if (this._upLink) {
            this._upLink.shown = !value;
        }
        if (this._downLink) {
            this._downLink.shown = !value;
        }
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this._enabled;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        if (this._enabled != value) {
            this._enabled = value;
            this.ForEveryField((name, component) => {
                component.enabled = this._enabled;
            });
            if (value) {
                this._hideAndShow();
            }
        }
    }

    /** @protected */
    _calcRuntimeValues(changedComponent = null) {
        if (!this.needRecalc) {
            return;
        }

        this.ForEveryField((name, fieldComponent) => {
            if (!fieldComponent || !fieldComponent.needRecalc) {
                return true;
            }

            const fieldData = fieldComponent.field;
            if (fieldComponent instanceof Colibri.UI.Forms.Object || fieldComponent instanceof Colibri.UI.Forms.Array || fieldComponent instanceof Colibri.UI.Forms.Tabs) {
                fieldComponent._calcRuntimeValues(changedComponent);
            } else {
                if (fieldData?.params?.valuegenerator) {
                    try {
                        const f = typeof fieldData?.params?.valuegenerator === 'string' ? eval(fieldData?.params?.valuegenerator) : fieldData?.params?.valuegenerator;
                        const isOldVersion = typeof fieldData?.params?.valuegenerator === 'string' && fieldData?.params?.valuegenerator.indexOf('(parentValue, formValue') !== -1;
                        const v = isOldVersion ? f(this.value, this.root?.value, fieldComponent, this) : f(this.value, this.root?.value, fieldComponent, this.root, changedComponent);
                        if (v !== undefined) {
                            fieldComponent.value = v;
                        }
                    } catch (e) {
                        console.log('Error in ValueGenerator', name, fieldData, fieldData?.params?.valuegenerator, e);
                    }
                }
            }
        });
    
    }

    
    _runGenerateOfFieldData() {
        
        Object.forEach(this._fieldData.fields, (name, fieldData) => {
            
            let fieldComponent = this.contentContainer.Children(name);
            if (!fieldComponent || !fieldComponent.needHideAndShow) {
                return true;
            }

            if (fieldData?.params?.fieldgenerator) {
                const gen = eval(fieldData.params.fieldgenerator);
                gen(fieldData, fieldComponent, this);
                if (fieldData?.replace ?? false) {
                    fieldComponent.Dispose();
                    fieldComponent = this._renderField(name, fieldData, data[name] ?? null, true);
                }
            }

            if (fieldComponent._runGenerateOfFieldData) {
                fieldComponent._runGenerateOfFieldData();
            }

        });
    }

    /** @protected */
    _hideAndShow() {

        if (!this.needHideAndShow) {
            return;
        }

        const data = this.value;
        const formData = this.root.value;
        
        Object.forEach(this._fieldData.fields, (name, fieldData) => {
            if (!fieldData || !this.contentContainer) {
                return true;
            }

            let fieldComponent = this.contentContainer.Children(name);
            if (fieldComponent && fieldData.params && fieldData.params.condition) {

                const condition = fieldData.params.condition;
                if (condition.field) {
                    const type = condition?.type == 'disable' ? 'enabled' : 'shown';
                    const empty = condition?.empty || false;
                    const inverse = condition?.inverse || false;
                    let fieldValue = eval('data?.' + condition.field.split('.').join('?.'));
                    if (!fieldValue) {
                        fieldValue = eval('formData?.' + condition.field.split('.').join('?.'));
                    }
                    let conditionResult = true;
                    if ((condition?.value ?? null) !== null) {
                        fieldValue = fieldValue?.value ?? fieldValue;
                        if (Array.isArray(condition.value)) {
                            conditionResult = fieldValue === undefined || (fieldValue !== undefined && condition.value.indexOf(fieldValue) !== -1);
                        }
                        else {
                            conditionResult = fieldValue === undefined || (fieldValue !== undefined && fieldValue === condition.value);
                        }
                    } else if (condition?.method) {
                        if (typeof condition.method === 'string') {
                            conditionResult = eval(condition.method);
                        } else {
                            conditionResult = condition.method(fieldValue, data, type, empty, inverse, fieldData);
                        }
                    }
                    if (inverse) {
                        conditionResult = !conditionResult;
                    }
                    fieldComponent[type] = conditionResult;
                    if (!conditionResult && empty) {
                        fieldComponent.value = null;
                    }
                }
                else {
                    fieldComponent.shown = true;
                    fieldComponent.enable = true;
                }
            }
            else if (fieldData.params && fieldData.params.hidden) {
                fieldComponent.shown = false;
            }
        });

    }

    /**
     * Searches for field or returns all fields
     * @param {string|null} name name of field to find
     * @returns 
     */
    Fields(name = null) {
        if (!this.contentContainer) {
            return [];
        }
        return name ? this.contentContainer.Children(name) : this.contentContainer.Children();
    }

    /**
     * Cycles all fields
     * @param {Function} callback callback for each field
     */
    ForEveryField(callback) {
        this.contentContainer && this.contentContainer.ForEach(callback);
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Object', 'Colibri.UI.Forms.Object', '#{ui-fields-object}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'fieldgenerator', 'generator', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler', 'vertical', 'removedesc']);
