/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Form = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('form'));
        this.AddClass('app-form-component');
        this._fields = {};
        this._download = null;
        this._shuffleFieldNames = false;
        this._value = {};
        this._storage = App.Store;

        this._element.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Validated', false, 'When form validated');
        this.RegisterEvent('Changed', false, 'When components in form are changed')
        this.RegisterEvent('KeyDown', false, 'When key is down');
        this.RegisterEvent('KeyUp', false, 'When key is up');
        this.RegisterEvent('Click', false, 'When clicked on form');
        this.RegisterEvent('FieldsRendered', false, 'When all fields are rendered');
        this.RegisterEvent('ActiveFieldChanged', false, 'When active field changed');
        this.RegisterEvent('GroupChanged', false, 'When group (if it exists) changed');
    }

    /** @protected */
    _registerEventHandlers() {
        this.AddHandler('Changed', this.__thisChanged);
    }

    __thisChanged(event, args) {
        this._hideAndShow();
        this._calcRuntimeValues(args?.component ?? null);
    }

    /** @protected */
    _setFilledMark() {
        Object.forEach(this._fields, (name, fieldData) => {
            const fieldComponent = this.Children(name);
            fieldComponent?._setFilledMark && fieldComponent?._setFilledMark();
        });
    }

    /** @protected */
    _calcRuntimeValues(changedComponent = null) {
        if (this._calculating || !this.needRecalc) {
            return;
        }

        this._calculating = true;
        try {

            Object.forEach(this._fields, (name, fieldData) => {
                const fieldComponent = this.Children(name);
                if (!fieldComponent || !fieldComponent.needRecalc) {
                    return true;
                }

                if (fieldComponent instanceof Colibri.UI.Forms.Object || fieldComponent instanceof Colibri.UI.Forms.Array || fieldComponent instanceof Colibri.UI.Forms.Tabs) {
                    fieldComponent._calcRuntimeValues(changedComponent);
                } else {
                    try {
                        if (fieldData?.params?.valuegenerator) {
                            const f = typeof fieldData?.params?.valuegenerator === 'string' ? eval(fieldData?.params?.valuegenerator) : fieldData?.params?.valuegenerator;
                            const isOldVersion = typeof fieldData?.params?.valuegenerator === 'string' && fieldData?.params?.valuegenerator.indexOf('(parentValue, formValue') !== -1;
                            const v = isOldVersion ? f(this.value, this.value, fieldComponent, this) : f(this.value, this.value, fieldComponent, this, changedComponent);
                            if (v !== undefined) {
                                fieldComponent.value = v;
                            }
                        }
                    } catch (e) {
                        console.log('Error in ValueGenerator', name, fieldData, fieldData?.params?.valuegenerator, e);
                    }
                }
            });
        } catch (e) {
            console.log(e);
            console.trace();
        } finally {
            this._calculating = false;
        }

    }

    _runGenerateOfFieldData() {
        Object.forEach(this._fields, (name, fieldData) => {
            
            let fieldComponent = this.Children(name);
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

        Object.forEach(this._fields, (name, fieldData) => {
            let fieldComponent = this.Children(name);
            if (!fieldComponent || !fieldComponent.needHideAndShow) {
                return true;
            }

            if (fieldData.params && fieldData.params.condition) {
                const condition = fieldData.params.condition;
                if (condition.field) {

                    const type = condition?.type == 'disable' ? 'enabled' : 'shown';
                    const empty = condition?.empty || false;
                    const inverse = condition?.inverse || false;
                    let fieldValue = eval('data?.' + condition.field.split('.').join('?.'));
                    fieldValue = fieldValue?.value ?? fieldValue;
                    let conditionResult = true;
                    if ((condition?.value ?? null) !== null) {
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
                            conditionResult = condition.method(fieldValue, data, type, empty, inverse, fieldData, this);
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

            if (fieldComponent._hideAndShow) {
                fieldComponent._hideAndShow();
            }
        });

    }

    /**
     * Download attribute
     * @type {string|boolean}
     */
    set download(value) {
        this._download = value;
    }
    /**
     * Download attribute
     * @type {string|boolean}
     */
    get download() {
        return this._download;
    }

    /**
     * Fields object
     * @type {object}
     */
    set fields(fields) {
        if (typeof fields == 'string') {
            fields = this._storage.Query(fields);
        }
        this._fields = fields;
        this.Clear();
        this._renderFields();
        this._hideAndShow();
        this._runGenerateOfFieldData();
        this._setFilledMark();
    }
    /**
     * Fields object
     * @type {object}
     */
    get fields() {
        return this._fields;
    }

    /**
     * Searches for field
     * @param {string} name name of field to find
     * @returns Colibri.UI.Forms.Field
     */
    Fields(name = null) {

        if (name) {
            return this.Children(name);
        }

        const ret = {};
        this.ForEach((name, component) => {
            if (component instanceof Colibri.UI.Forms.Field) {
                ret[name] = component;
            }
        });
        return ret;
    }

    /**
     * Value object
     * @type {object}
     */
    set value(value) {

        if (!this._checkIfChanged(value)) {
            return;
        }

        this._value = Object.assign({}, value);
        if ([false, null, undefined].includes(value)) {
            this.ForEach((name, component) => component.value = null);
        }
        else {
            this.ForEach((name, component) => {
                if (component instanceof Colibri.UI.Forms.Field) {
                    if (name == '_adds') {
                        // если наткнулись на _adds
                        component.ForEveryField((name, field) => {
                            let def = field?.field?.default;
                            if (field?.field?.params?.generator) {
                                const gen = typeof field?.field?.params?.generator === 'string' ? eval(field.field.params.generator) : field?.field?.params?.generator;
                                def = gen(value, component, this);
                            }
                            if (!this._value) {
                                field.value = def ?? null;
                            }
                            else {
                                field.value = this._value[name] ?? def ?? null;
                            }
                            
                            if(field.value === null) {
                                field.checkableChecked = false;
                            }
                        });
                    }
                    else {
                        let def = component?.field?.default;
                        if (component?.field?.params?.generator) {
                            const gen = typeof component?.field?.params?.generator === 'string' ? eval(component.field.params.generator) : component.field.params.generator;
                            def = gen(value, component, this);
                        }
                        if (!this._value) {
                            component.value = def ?? null;
                        }
                        else {
                            component.value = this._value[name] ?? def ?? null;
                        }

                        if(component.value === null || Array.shallowEqual(component.value, [null, null]) || Array.shallowEqual(component.value, ['', ''])) {
                            component.checkableChecked = false;
                        }
                    }

                }
            });

            const oneof = this.Children('_oneof');
            if (oneof) {
                const keys = Object.keys(this._value);
                oneof.value = keys[0];
            }

        }

        this._hideAndShow();
        this.Dispatch('Validated');
        this._setFilledMark();
    }

    /**
     * Value object
     * @type {object}
     */
    get value() {
        let data = Object.assign({}, this._value);
        this.ForEach((name, component) => {
            if (component instanceof Colibri.UI.Forms.Field) {

                if(component.hasCheckable && !component.checkableChecked) {
                    return true;
                }

                if (name == '_adds') {
                    data = Object.assign(data, component.value);
                }
                else {
                    data[name] = component.value;
                }
            }
        });

        data = this._prepareOneOf(data, this);

        return data;
    }

    /**
     * Message string
     * @type {string}
     */
    set message(value) {
        this._error && (this._error.value = value);
    }
    /**
     * Message string
     * @type {string}
     */
    get message() {
        return this._error?.value ?? '';
    }

    /**
     * Shuffle field names to prevent autofill
     * @type {boolean}
     */
    set shuffleFieldNames(value) {
        this._shuffleFieldNames = value === true || value === 'true';
        if (this._shuffleFieldNames) {
            this._element.attr('autocomplete', 'off');
        }
    }

    /**
     * Shuffle field names to prevent autofill
     * @type {boolean}
     */
    get shuffleFieldNames() {
        return this._shuffleFieldNames;
    }

    /** @private */
    _prepareOneOf(data, field) {
        if (Object.isObject(data)) {
            Object.forEach(data, (n, v) => {
                data[n] = this._prepareOneOf(v, this._fields[n]);
            });
            if (Object.keys(data).indexOf('_oneof') !== -1) {
                const oneof = {};
                const allfields = Object.keys(field.fields);
                const oneofvalues = field.fields['_oneof'].values.map((f) => f.value);
                const otherfields = allfields.filter((v) => !oneofvalues.includes(v));
                otherfields.forEach((f) => {
                    if (data[f] && f != '_oneof') {
                        oneof[f] = data[f];
                    }
                })
                oneof[data['_oneof']] = data[data['_oneof']] ?? null;
                data = oneof;
            }
        }
        return data;
    }

    /**
     * Searches for field in all debt
     * @param {string} fieldName field name or path
     * @returns {Colibri.UI.Forms.Field}
     */
    FindField(fieldName) {
        let field = null,
            queryString = fieldName.split('/')
                .map(field => `[data-object-name="${field}"]`)
                .join(' ');

        let fields = this._element.querySelectorAll(queryString);

        if (fields) {
            if (fields.length === 1) {
                // field = fields[0].getUIComponent();
                field = fields[0].getUIComponent();
            } else {
                for (let _fieldEl of fields) {
                    // let _field = _fieldEl.getUIComponent();
                    let _field = _fieldEl.getUIComponent();
                    if (_field instanceof Colibri.UI.Forms.Field) {
                        field = _field;
                        break;
                    }
                }
            }
        }
        return field;
    }

    /** @private */
    _renderField(name, fieldData, value, shown = true) {

        const root = this.root || this;
        const component = Colibri.UI.Forms.Field.Create(name, this, fieldData, null, root);
        if (!component) {
            console.log('Can not create component ', fieldData);
            console.trace();
            throw new Error('component ' + name + ' not found');
        }
        component.shown = shown;
        component.AddHandler('Validated', this.__thisBubble, false, this);
        component.AddHandler('Changed', this.__componentChanged, false, this);
        component.download = this._download;
        if (value && value[name] !== undefined) {
            component.value = value[name];
        }

    }

    __componentChanged(event, args) {
        const component = event.sender;
        args = args ? args : {};
        if (component._timeout) {
            clearTimeout(component._timeout);
            component._timeout = null;
        }
        if (!args.component) {
            args.component = component;
        }
        component._timeout = setTimeout(() => this.Dispatch('Changed', args), 50);
    }

    get needRecalc() {
        let nr = false;
        this.ForEach((n, c) => {
            nr = nr || c.needRecalc;
        });
        return nr;
    }

    get needHideAndShow() {
        let nr = false;
        this.ForEach((n, c) => {
            nr = nr || c.needHideAndShow;
        });
        return nr;
    }

    /** @private */
    _renderFields(value) {
        
        let hasGroups = false;
        Object.forEach(this._fields, (name, fieldData) => {
            fieldData = Object.cloneRecursive(fieldData);
            if (fieldData.virtual) {
                return true;
            }
            fieldData.group && (fieldData.group = fieldData.group[Lang.Current] ?? fieldData.group);
            if (!fieldData.group || fieldData.group === 'window') {
                this._renderField(name, fieldData, value, true);
            }
            else {
                hasGroups = true;
            }
        });


        this._groups = null;
        if (hasGroups) {
            this._groups = new Colibri.UI.ButtonGroup('groups', this);
            this._groups.shown = true;
            Object.forEach(this._fields, (name, fieldData) => {
                fieldData = Object.cloneRecursive(fieldData);
                fieldData.group && (fieldData.group = fieldData.group[Lang.Current] ?? fieldData.group);
                if (fieldData.group && fieldData.group !== 'window') {
                    this._groups.AddButton(fieldData.group, fieldData.group);
                }
            });
            this._groups.AddHandler('Changed', this.__groupsChanged, false, this);
        }

        Object.forEach(this._fields, (name, fieldData) => {
            fieldData = Object.cloneRecursive(fieldData);
            fieldData.group && (fieldData.group = fieldData.group[Lang.Current] ?? fieldData.group);
            if (fieldData.group && fieldData.group !== 'window') {
                this._renderField(name, fieldData, value, true);
            }
        });


        this._groups && this._groups.SelectButton('firstChild', true);
        this._groups && this.__groupsChanged(null, { index: 0, button: this._groups.Children('firstChild'), noevent: true });

        this._error = new Colibri.UI.Pane('form-message', this);
        this._error.shown = true;

        this.Dispatch('FieldsRendered');
    }

    __groupsChanged(event, args) {
        const groupName = args.button.name;
        Object.forReverseEach(this._fields, (name, fieldData) => {
            fieldData = Object.cloneRecursive(fieldData);
            fieldData.group && (fieldData.group = fieldData.group[Lang.Current] ?? fieldData.group);
            if (fieldData.group !== 'window') {
                if (fieldData.group === groupName) {
                    this.Children(name).Retreive();
                }
                else {
                    this.Children(name).KeepInMind();
                }
            }
        });

        if (args?.noevent) {
            return;
        }
        this.Dispatch('GroupChanged', args);
    }

    /** @private */
    __renderBoundedValues(values) {
        Object.forEach(values, (name, value) => {
            this.Children(name).value = value;
        });
    }

    /**
     * Focus on form (to the first component)
     */
    Focus() {
        const firstComponent = this.Children('firstChild');
        if (firstComponent) {
            firstComponent.Focus();
        }
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return super.enabled;
    }
    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        super.enabled = value;
        if (value) {
            this._hideAndShow();
        }
    }

    /**
     * Active field
     * @type {Colibri.UI.Form.Field}
     */
    get activeField() {
        return this._activeField;
    }
    /**
     * Active field
     * @type {Colibri.UI.Form.Field}
     */
    set activeField(value) {
        if (
            (this._activeField &&
                !(this._activeField instanceof Colibri.UI.Forms.Object) &&
                !(this._activeField instanceof Colibri.UI.Forms.Array) &&
                !(this._activeField instanceof Colibri.UI.Forms.Tabs) && (
                    value &&
                    !(value instanceof Colibri.UI.Forms.Object) &&
                    !(value instanceof Colibri.UI.Forms.Array) &&
                    !(value instanceof Colibri.UI.Forms.Tabs)
                )
            ) || !this._activeField
        ) {

            const changed = this._activeField !== value;
            this._activeField = value;
            if (changed) {
                this.Dispatch('ActiveFieldChanged', { field: this._activeField });
            }

        }
    }

    defaultValues(fields = null) {
        let ret = {};
        Object.forEach(fields || this._fields, (name, field) => {
            if (field.fields) {
                ret[name] = this.defaultValues(field.fields);
            } else if (field.default) {
                ret[name] = field.default
            } else {
                ret[name] = null;
            }
        });
        return ret;
    }

    SelectGroup(index) {
        if (!this._groups) {
            return;
        }

        this._groups.SelectButton(index);
    }

    _checkIfChanged(value) {
        return JSON.stringify(this.value) !== JSON.stringify(value);
    }

} 