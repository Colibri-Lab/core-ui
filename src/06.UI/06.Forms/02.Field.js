/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Field = class extends Colibri.UI.Component {

    /**
     * @static
     * @type {object}
     */
    static Components = {};
    /**
     * Registers field to show in backend when choosing component on storage field
     * @param {string} name name of component
     * @param {string} className class name of component
     * @param {string} description component description
     * @param {string} icon icon of component
     * @param {Array} params params of component
     */
    static RegisterFieldComponent(name, className, description, icon, params) {
        if (!icon) {
            icon = Colibri.UI.FieldIcons[className];
        }
        Colibri.UI.Forms.Field.Components[name] = { className, description, icon, params };
    }
    /**
     * Unregisters a field from backend list
     * @param {string} name name of component
     */
    static UnregisterFieldComponent(name) {
        delete Colibri.UI.Forms.Field.Components[name];
    }

    static FindFieldComponent(nameOrClassName) {
        if (Colibri.UI.Forms.Field.Components[nameOrClassName]) {
            return Colibri.UI.Forms.Field.Components[nameOrClassName];
        } else {
            let found = null;
            Object.forEach(Colibri.UI.Forms.Field.Components, (name, componentData) => {
                if (componentData.className === nameOrClassName) {
                    found = componentData;
                    return false;
                }
            });
            return found;
        }
    }

    static HasParam(nameOrClassName, paramName) {
        const paramData = Colibri.UI.Forms.Field.FindFieldComponent(nameOrClassName);
        if (!paramData) {
            return true;
        }
        return paramData.params.indexOf(paramName) !== -1;
    }

    /**
     * Creates a new field object
     * @param {string} name name of field
     * @param {Colibri.UI.Component} container container of component
     * @param {object} field field data
     * @param {Colibri.UI.Forms.Field} parent parent field
     * @param {Colibri.UI.Forms.Form} root form component
     */
    static Create(name, container, field, parent, root = null) {
        if (!field.component && !field.type) {
            return;
        }
        try {

            let component = field.component || '';
            if (!component) {

                if (field.values !== undefined || field.lookup !== undefined) {
                    component = 'Select';
                }
                else if (['varchar', 'char'].indexOf(field.type) !== -1 && field.class === 'string') {
                    component = 'Text';
                }
                else if (['text', 'longtext', 'tinytext', 'mediumtext'].indexOf(field.type) !== -1 && field.class === 'string') {
                    component = 'TextArea';
                }
                else if (['date', 'datetime', 'timestamp'].indexOf(field.type)) {
                    component = 'Date';
                }
                else if (['tinyint'].indexOf(field.type) !== -1) {
                    component = 'Bool';
                }
                else if (['int', 'integer', 'bigint', 'float', 'decimal', 'double', 'real', 'smallint'].indexOf(field.type) !== -1) {
                    component = 'Number';
                }
                else if (['json', 'longtext'].indexOf(field.type) !== -1) {
                    if (field.class.indexOf('ArrayField') !== -1) {
                        component = 'Object';
                    }
                    else {
                        component = 'Array';
                    }
                }
            }

            if (!component) {
                return null;
            }

            let componentObject = null;

            if (component === 'Colibri.UI.Forms.Hidden') {
                componentObject = new Colibri.UI.Forms.HiddenField(name, container, field, parent, root);
            } else {

                if (typeof Colibri.UI.Forms[component] === 'function') {
                    componentObject = new Colibri.UI.Forms[component](name, container, field, parent, root);
                } else if (eval(`typeof ${component}`) === 'function') {
                    componentObject = eval(`new ${component}(name, container, field, parent, root);`);
                }

                if (!componentObject || !(componentObject instanceof Colibri.UI.Forms.Field)) {
                    throw new Error(`${component} is not an Colibri.UI.Forms.Field instance`);
                }
            }

            componentObject.shown = true;
            componentObject.tabIndex = true;
            if (field.attrs) {
                Object.forEach(field.attrs, (attrName, attrValue) => {
                    componentObject[attrName] = attrValue;
                });
            }

            return componentObject;

        } catch (e) {
            debugger;
        }

    }

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {object} fieldData fields object
     * @param {Colibri.UI.Forms.Field} parent parent component
     * @param {Colibri.UI.Forms.Form|Colibri.UI.Forms.Field} root component
     */
    constructor(name, container, fieldData, parent, root) {
        super(name, container, Element.create('div'));

        this._fieldData = fieldData;
        this._parentField = parent;
        this.root = root;

        this.AddClass('app-component-field');

        
        if (this._fieldData?.params?.checkable && this._fieldData?.params?.checkable === true) {
            
            this._checkableTitleContainer = new Colibri.UI.FlexBox('checkable-title-container', this);
            this._checkableTitleContainer.shown = true;

            this._checkableBox = new Colibri.UI.Checkbox('check', this._checkableTitleContainer);
            this._checkableBox.shown = true;
            this._checkableBox.AddHandler('Changed', this.__checkableBoxChanged, false, this);
            this._checkableBox.checked = true;
            this.AddClass('-checkable-box');
            
            this._title = new Colibri.UI.TextSpan(this._name + '-title', this._checkableTitleContainer);
            this._title.AddHandler('Clicked', this._titleClicked, false, this);


        } else {
            this._title = new Colibri.UI.TextSpan(this._name + '-title', this);
        }

        this._before = new Colibri.UI.Pane(this._name + '-before', this);
        this._content = new Colibri.UI.Pane(this._name + '-content', this);
        new Colibri.UI.Pane(this._name + '-container', this._content);
        new Colibri.UI.TextSpan(this._name + '-note', this._content);
        new Colibri.UI.TextSpan(this._name + '-message', this._content);

        this._validated = true;

        this._title.shown = true;
        this._content.shown = true;
        this._content.Children(this._name + '-container').shown = true;
        this._content.Children(this._name + '-note').shown = true;
        this._content.Children(this._name + '-message').shown = false;

        if (this._fieldData?.params?.noteClass) {
            this._content.Children(this._name + '-note').AddClass(this._fieldData.params.noteClass);
        }

        if (this._fieldData?.params?.fieldgenerator) {
            const f = eval(this._fieldData?.params?.fieldgenerator);
            f(this._fieldData, this, this.root);
        }

        this.RenderFieldContainer();

        this.title = this._fieldData?.desc ? this._fieldData?.desc[Lang.Current] ?? this._fieldData?.desc ?? '' : '';
        this.before = this._fieldData?.before ? this._fieldData.before[Lang.Current] ?? this._fieldData.before ?? '' : '';
        this.note = this._fieldData?.note ? this._fieldData?.note[Lang.Current] ?? this._fieldData?.note ?? '' : '';
        this.placeholder = this._fieldData?.placeholder ? this._fieldData?.placeholder[Lang.Current] ?? this._fieldData?.placeholder ?? '' : '';

        if (this._fieldData?.attrs) {
            Object.assign(this, this._fieldData.attrs);
        }

        Object.forEach(this._fieldData?.params, (key, value) => {
            if (key.indexOf('On') === 0) {

                let handler = null;
                if (typeof value === 'string') {
                    handler = eval(value);
                } else if (typeof value === 'Function' || typeof value === 'function') {
                    handler = value;
                }

                if (handler) {
                    this.AddHandler(key.replaceAll('On', ''), handler);
                }
            }
        });

        if (this._fieldData?.params?.copyTitle) {
            this._title.copy = this._fieldData?.params?.copyTitle;
            if (this._fieldData?.params?.copyTitleStyle) {
                this._title.copyStyle = this._fieldData?.params?.copyTitleStyle ?? 'text';
            }
        }

        this.AddHandler(['Changed', 'KeyUp', 'KeyDown'], this.__thisChangedOrKeyUpOrKeyDown);
        this.AddHandler('ReceiveFocus', this.__thisReceiveFocus);
        this.AddHandler('LoosedFocus', this.__thisLoosedFocus);

        if (this._fieldData?.hidden && this._fieldData?.hidden === true) {
            this.AddClass('app-component-field-hidden');
        }

        if (this._fieldData?.params?.className) {
            const className = this._convertProperty('String', this._fieldData?.params?.className);
            this.AddClass(className);
        }
        if (this._fieldData?.attrs?.class) {
            this.AddClass(this._fieldData?.attrs?.class);
        }

        if (this._fieldData?.break) {
            this._element.before(Element.create('div', { class: 'break' }, {}));
        }


        this._content.Children(this._name + '-message').AddHandler('Clicked', this.__messageClicked, false, this);

    }

    _titleClicked(event, args) {
        this._checkableBox.Dispatch('Clicked', args);
    }

    __checkableBoxChanged(event, args) {
        this.enabled = this._checkableBox.checked;
        if(this.enabled) {
            this.RemoveClass('-checkable-checked');
        } else {
            this.AddClass('-checkable-checked');
        }
    }

    __messageClicked(event, args) {
        this.Dispatch('MessageClicked', { domEvent: args.domEvent, field: this });
    }

    __thisChangedOrKeyUpOrKeyDown(event, args) {
        if (event.name == 'Changed') {
            this.note = this._fieldData?.note ? (this._fieldData.note[Lang.Current] ?? this._fieldData.note ?? '') : '';
            this._applyRuntimes();
            this._setFilledMark();
        }
        if (this._parentField) {
            this._parentField.Dispatch(event.name, Object.assign({ component: event.sender }, args));
        }

        if (this._fieldData?.params?.onchangehandler) {
            let handler = null;
            if (typeof this._fieldData?.params?.onchangehandler === 'string') {
                handler = eval(this._fieldData?.params?.onchangehandler);
            } else if (typeof this._fieldData?.params?.onchangehandler === 'Function') {
                handler = this._fieldData?.params?.onchangehandler;
            }
            if (handler) {
                handler(event, args);
            }
        }

        args && args.domEvent && args.domEvent.stopPropagation();
        return true;
    }

    __thisReceiveFocus(event, args) {
        this.AddClass('-focused');
        this.form.activeField = this;
    }
    __thisLoosedFocus(event, args) {
        this.RemoveClass('-focused');
        this.form.activeField = null;
    }

    /**
     * Adds remove link on field
     * @param {Function} callback handle click on remove link
     */
    AddRemoveLink(callback) {
        this._removeLink = new Colibri.UI.Icon(this._name + '-remove', this);
        this._removeLink.AddClass('app-component-remove-field')
        this._removeLink.shown = true;
        this._removeLink.value = Colibri.UI.RemoveIcon;
        this._removeLink.callback = callback;
        this._removeLink.AddHandler('Clicked', this.__removeLinkClicked, false, this);
    }

    __removeLinkClicked(event, args) {
        if (!this.enabled) {
            return;
        }
        this.Dispose();
        event.sender.callback && event.sender.callback();
    }

    /**
     * Adds up and down link on field
     * @param {Function} upCallback handle click on up link
     * @param {Function} downCallback handle click on down link
     */
    AddUpDownLink(upCallback, downCallback) {
        this._upLink = new Colibri.UI.Icon(this._name + '-up', this);
        this._upLink.AddClass('app-component-up-field')
        this._upLink.shown = true;
        this._upLink.value = Colibri.UI.UpIcon;
        this._upLink.callback = upCallback;
        this._upLink.AddHandler('Clicked', this.__upLinkClicked, false, this);

        this._downLink = new Colibri.UI.Icon(this._name + '-down', this);
        this._downLink.AddClass('app-component-down-field')
        this._downLink.shown = true;
        this._downLink.value = Colibri.UI.DownIcon;
        this._downLink.callback = downCallback;
        this._downLink.AddHandler('Clicked', this.__downLinkClicked, false, this);
    }

    __downLinkClicked(event, args) {
        if (!this.enabled) {
            return;
        }
        this._downLink.callback && this._downLink.callback();
    }

    __upLinkClicked(event, args) {
        if (!this.enabled) {
            return;
        }
        this._upLink.callback && this._upLink.callback();
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Validated', false, 'Validation passed')
        this.RegisterEvent('Changed', false, 'A change in component data has occurred')
        this.RegisterEvent('KeyDown', false, 'When the button is pressed')
        this.RegisterEvent('KeyUp', false, 'When the button is released')
        this.RegisterEvent('FieldsRendered', false, 'When the fields are created');
        this.RegisterEvent('MessageClicked', false, 'When you were pointed at an error')
    }


    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
     */
    __renderBoundedValues(data, path) {
        this.value = data;
    }

    /** @private */
    _applyRuntimes() {
        let runtime = this._fieldData?.params?.runtime;
        if (runtime) {
            runtime = eval(runtime);
            runtime(this, this.root);
        }
    }

    /** @protected */
    _setFilledMark() {
        if (this instanceof Colibri.UI.Forms.Array) {
            this.itemsContainer.ForEach((name, component) => component instanceof Colibri.UI.Forms.Field && component._setFilledMark());
        }
        else if (this instanceof Colibri.UI.Forms.ArrayGrid) {
            this.contentContainer.ForEach((name, component) => component instanceof Colibri.UI.Forms.Field && component._setFilledMark());
        }
        else if (this instanceof Colibri.UI.Forms.Object) {
            this.contentContainer && Object.forEach(this._fieldData?.fields, (name, fieldData) => this.contentContainer.Children(name) instanceof Colibri.UI.Forms.Field && this.contentContainer.Children(name)._setFilledMark());
        }
        else {
            if ((Array.isArray(this.value) ? this.value.length > 0 : (this.value !== null && this.value !== undefined && this.value !== ''))) {
                this.AddClass('-filled');
            }
            else {
                this.RemoveClass('-filled');
            }
        }

    }

    /**
     * Validate field
     */
    Validate() {
        this._validated = true;
    }

    /** @protected */
    RenderFieldContainer() {
        throw new Error('#{ui-field-needtooverload-error}');
    }

    /**
     * Reset validation results
     */
    ResetValidation() {
        this.params && (this.params.validated = true);
        this.RemoveClass('app-validate-error');
        this.message = '';
    }

    /**
     * Message component
     * @type {Colibri.UI.Component}
     * @readonly
     */
    get messageObject() {
        return this._content.Children(this._name + '-message');
    }

    /**
     * Message string
     * @type {string}
     */
    get message() {
        const message = this._content.Children(this._name + '-message');
        if (!message) {
            return null;
        }
        return message.value;
    }

    /**
     * Message string
     * @type {string}
     */
    set message(value) {
        const message = this._content.Children(this._name + '-message');
        if (!message) {
            return;
        }
        message.shown = !!value;
        message.value = value ? value[Lang.Current] ?? value : '';
    }

    /**
     * Title object
     * @type {Colibri.UI.Component}
     * @readonly
     */
    get titleObject() {
        return this._content.Children(this._name + '-title');
    }

    /**
     * Title string
     * @type {string}
     */
    get title() {
        return this._title.value;
    }
    /**
     * Title string
     * @type {string}
     */
    set title(value) {
        if (typeof value === 'function') {
            value(this).then((v) => {
                this._title.value = v ? (v[Lang.Current] ?? v) : '';
                if (!value) {
                    this.AddClass('-without-title');
                }
                else {
                    this.RemoveClass('-without-title');
                }
            });
        } else {
            this._title.value = value ? (value[Lang.Current] ?? value) : '';
            if (!value) {
                this.AddClass('-without-title');
            }
            else {
                this.RemoveClass('-without-title');
            }
        }
    }

    /**
     * Before content
     * @type {string}
     */
    get before() {
        return this._before.value;
    }
    /**
     * Before content
     * @type {string}
     */
    set before(value) {
        this._before.value = value;
        this._before.shown = !!value;
    }

    /**
    * Note object
    * @type {Colibri.UI.Component}
    * @readonly
    */
    get noteObject() {
        return this._content.Children(this._name + '-note');
    }

    /**
     * Note string
     * @type {string}
     */
    get note() {
        return this._content.Children(this._name + '-note').value;
    }
    /**
     * Note string
     * @type {string}
     */
    set note(value) {
        value = this._convertProperty('String', value);
        this._content.Children(this._name + '-note').value = value ? value[Lang.Current] ?? value : '';
    }

    /**
     * Content container
     * @type {Element}
     * @readonly
     */
    get contentContainer() {
        return this._content.Children(this._name + '-container');
    }

    /**
     * Content pane component
     * @type {Colibri.UI.Component}
     * @readonly
     */
    get contentPane() {
        return this._content;
    }

    /**
     * Field object
     * @type {object}
     */
    get field() {
        return this._fieldData;
    }

    /**
     * Field object
     * @type {object}
     */
    set field(value) {
        this._fieldData = value;

    }

    /**
     * Field width
     * @type {number}
     */
    set inputWidth(value) {
        this._content.Children(this._name + '-container').width = value;
    }

    /**
     * Field width
     * @type {number}
     */
    get inputWidth() {
        return this._content.Children(this._name + '-container').width;
    }

    /**
     * Height of input
     * @type {number}
     */
    get inputHeight() {
        return this._content.Children(this._name + '-container').height;
    }
    /**
     * Height of input
     * @type {number}
     */
    set inputHeight(value) {
        this._content.Children(this._name + '-container').height = value;
    }

    /**
     * Field root parent
     * @type {Colibri.UI.Forms.Field|Colibri.UI.Forms.Form}
     */
    get root() {
        return this._root;
    }

    /**
     * Field root parent
     * @type {Colibri.UI.Forms.Field|Colibri.UI.Forms.Form}
     */
    set root(value) {
        this._root = value;
    }

    /**
     * Field form
     * @type {Colibri.UI.Forms.Form}
     * @readonly
     */
    get form() {
        const formElement = this._element.closest('.app-form-component');
        // return formElement ? formElement.getUIComponent() : null;
        return formElement ? formElement.getUIComponent() : null;
    }

    /**
     * Field field
     * @type {Colibri.UI.Forms.Field}
     * @readonly
     */
    get parentField() {
        return this._parentField;
    }

    /**
     * Original value, before change
     * @type {*}
     * @readonly
     */
    get original() {
        return this._original;
    }

    _needRecalcF(fields) {
        let nr = false;
        Object.forEach(fields, (n, f) => {
            if (!!f.fields) {
                nr = nr || this._needRecalcF(f.fields);
            } else {
                nr = nr || !!(f?.params?.valuegenerator ?? false);
            }
        });
        return nr;
    }

    _needHideAndShowF(fields) {
        let nr = false;
        Object.forEach(fields, (n, f) => {
            if (!!f.fields) {
                nr = nr || (!!(f?.params?.fieldgenerator ?? false) || !!(f?.params?.condition ?? false) || !!(f?.params?.hidden ?? false)) || this._needHideAndShowF(f.fields);
            } else {
                nr = nr || (!!(f?.params?.fieldgenerator ?? false) || !!(f?.params?.condition ?? false) || !!(f?.params?.hidden ?? false));
            }
        });
        return nr;
    }

    /**
     * Needs recalc every time when changed to form field
     * @readonly
     */
    get needRecalc() {
        if (!!this._fieldData.fields) {
            return !!(this._fieldData?.params?.valuegenerator ?? false) || this._needRecalcF(this._fieldData.fields);
        } else {
            return !!(this._fieldData?.params?.valuegenerator ?? false);
        }
    }

    /**
     * Needs hide and show when changed the form
     * @readonly
     */
    get needHideAndShow() {
        if (!!this._fieldData.fields) {
            return (!!(this._fieldData?.params?.fieldgenerator ?? false) || !!(this._fieldData?.params?.condition ?? false) || !!(this._fieldData?.params?.hidden ?? false)) || this._needHideAndShowF(this._fieldData.fields);
        } else {
            return (!!(this._fieldData?.params?.fieldgenerator ?? false) || !!(this._fieldData?.params?.condition ?? false) || !!(this._fieldData?.params?.hidden ?? false));
        }
    }

    get hasCheckable() {
        return !!this._checkableBox;
    }
    
    /**
     * When checkable is checked
     * @type {Boolean}
     */
    get checkableChecked() {
        return this._checkableBox.checked;
    }
    /**
     * When checkable is checked
     * @type {Boolean}
     */
    set checkableChecked(value) {
        this._checkableBox.checked = value;
        this._checkableBox.Dispatch('Changed', {component: this._checkableBox});
    }

}

/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.HiddenField = class extends Colibri.UI.Component {
    /**
     * Creates a new field object
     * @param {string} name name of field
     * @param {Colibri.UI.Component} container container of component
     * @param {object} fieldData field data
     */
    constructor(name, container, fieldData) {
        super(name, container, Element.create('input', { type: 'hidden' }));
        this._fieldData = fieldData;
        this._validated = true;
    }

    /**
     * Value string
     * @type {string}
     */
    get value() {
        return this._element.value;
    }

    /**
     * Value string
     * @type {string}
     */
    set value(value) {
        this._element.value = value;
    }

    /**
     * Validate field
     */
    Validate() {
        this._validated = true;
    }

    /**
     * Is field validated
     * @type {boolean}
     * @readonly
     */
    get validated() {
        return this._validated;
    }

    /**
     * Return field object
     * @type {object}
     * @readonly
     */
    get field() {
        return {};
    }

    /**
     * Reset validation results of field
     */
    ResetValidation() {
        // Do nothing
    }

    get needRecalc() {
        return false;
    }

    get loading() {
        return this._loading ?? false;
    }

    set loading(value) {
        this._loading = value;
    }


}