/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Array = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-array-field');

        this._enabled = true;

        const contentContainer = this.contentContainer;
        this._itemsContainer = new Colibri.UI.Pane(this.name + '-items', contentContainer);
        this._itemsContainer.shown = true;

        if (this._fieldData?.params?.initempty === undefined || this._fieldData?.params?.initempty === true) {
            this._addNew();
        }

        this._createAddNewLink();

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
        
        if(this._fieldData?.params?.hasscroll === false) {
            this.AddClass('app-field-noscroll');
        } else {
            this.RemoveClass('app-field-noscroll');
        }

        this.RegisterEvent('ObjectRemoved', false, 'Object in array removed');

    }

    /** @private */
    _createAddNewLink() {
        if (!this._fieldData?.params) {
            this._fieldData.params = {};
        }
        if (this._fieldData?.params && this._fieldData.params?.addlink === null) {
            return;
        }

        this.contentContainer.Children('add-new') && this.contentContainer.Children('add-new').Dispose();
        if (typeof Lang.Translate(this._fieldData.params?.addlink) === 'object') {
            const linkData = this._fieldData.params?.addlink;
            const c = eval(linkData.component);
            this._link = new c('add-new', this.contentContainer);
            Object.forEach(linkData.attrs, (name, value) => {
                this._link[name] = value;
            });

        } else {
            this._fieldData.desc = this._fieldData.desc ? this._fieldData.desc[Lang.Current] ?? this._fieldData.desc : '';
            this._fieldData.params.addlink = this._fieldData?.params?.addlink ? this._fieldData.params?.addlink[Lang.Current] ?? this._fieldData.params?.addlink : '';
            this._link = new Colibri.UI.Link('add-new', this.contentContainer);
            this._link.value = this._fieldData.params && this._fieldData.params?.addlink || '#{ui-array-add} «' + (this._fieldData.desc) + '»';
        }


        this._link.shown = true;
        this._link.AddHandler('Clicked', this.__linkClicked, false, this);
        if (this.readonly || !this.enabled) {
            this._link.Hide();
        }
        return this._link;
    }

    __linkClicked(event, args) {
        if (this.readonly || !this.enabled) {
            return;
        }
        this.AddNew();
    }

    /** @private */
    __updateObjectFields(fieldData) {
        return fieldData;
    }

    /**
     * Adds new object to array
     * @param {Object} value add new row
     * @returns {Colibri.UI.Forms.Object}
     */
    AddNew(value) {
        if (this._link.ContainsClass('ui-disabled')) {
            return;
        }
        const object = this._addNew(value);
        this.Dispatch('Changed', { component: this });

        return object;
    }

    /**
     * Adds new object
     * @private
     * @param {object} value object for add
     * @returns {Colibri.UI.Forms.Object}
     */
    _addNew(value = null) {
        // const containerElement = this.contentContainer.container.querySelector('.array-component-container');
        let fieldData = Object.cloneRecursive(this._fieldData);
        delete fieldData?.note;
        delete fieldData?.params?.validate;
        delete fieldData?.params?.fieldgenerator;
        if (fieldData?.params) {
            fieldData.params.validate = [{ message: '', method: () => true }];
        }
        fieldData = this.__updateObjectFields(fieldData);
        const object = new Colibri.UI.Forms.Object('object-' + Date.Now().getTime(), this._itemsContainer, fieldData, this, this.root);
        object.shown = true;
        object.title = '';
        object.enabled = this.enabled;

        if (this._fieldData.params && this._fieldData.params.removelink !== false && !this.readonly && this.enabled && (!this._fieldData.params?.mincount || this._fieldData.params?.mincount < Object.countKeys(this.Fields()))) {
            object.AddRemoveLink(() => {

                if (this.readonly || !this.enabled) {
                    return;
                }

                Object.forEach(this.Fields(), (name, field) => {
                    if (field instanceof Colibri.UI.Forms.Field) {
                        field.Dispatch('Changed', {});
                    }
                });
                this.Dispatch('Changed', { component: this });

                if (this._fieldData.params && !!this._fieldData.params.maxadd) {
                    const count = Object.countKeys(this.Fields());
                    if (count < parseInt(this._fieldData.params.maxadd)) {
                        this._link.Show();
                    }
                }

                if (this._fieldData.params && this._fieldData.params?.showObjectCount) {
                    if (typeof this._fieldData.params?.showObjectCount === 'function') {
                        const f = this._fieldData.params?.showObjectCount;
                        f(this.itemsContainer.children, this);
                    } else {
                        this.title = this._fieldData.desc + ' (' + this.itemsContainer.children + ')';
                    }
                }

                this.Dispatch('ObjectRemoved', { component: this });

                if (!this.root) {
                    this._hideAndShow();
                }

            });
        }
        if (this._fieldData.params && this._fieldData.params.updownlink !== false && !this.readonly && this.enabled) {
            object.AddUpDownLink(() => {
                object.MoveUp();
                object.Focus();
                this.Dispatch('Changed', { component: this });
            }, () => {
                object.MoveDown();
                object.Focus();
                this.Dispatch('Changed', { component: this });
            });
        }

        object.AddHandler('Changed', this.__objectChanged, false, this);
        this._itemsContainer.Children(object.name, object);
        if (this._fieldData.params && this._fieldData.params.title !== null) {
            const f = typeof this._fieldData.params.title == 'string' ? eval(this._fieldData.params.title) : this._fieldData.params.title;
            f && f(object, this);
        }

        if (this._fieldData.params && !!this._fieldData.params.maxadd) {
            const count = Object.countKeys(this.Fields());
            if (count >= parseInt(this._fieldData.params.maxadd)) {
                this._link && this._link.Hide();
            }
        }

        this.Dispatch('FieldsRendered');
        if (value) {
            object.value = value;
        }

        if (this._fieldData.params && this._fieldData.params?.showObjectCount) {
            if (typeof this._fieldData.params?.showObjectCount === 'function') {
                const f = this._fieldData.params?.showObjectCount;
                f(this.itemsContainer.children, this);
            } else {
                this.title = this._fieldData.desc + ' (' + this.itemsContainer.children + ')';
            }
        }

        // object.Focus();
        return object;
    }

    __objectChanged(event, args) {
        if (this._fieldData.params && this._fieldData.params.title !== null) {
            const f = eval(this._fieldData.params.title);
            f && f(object, this);
        }
        
        // return this.Dispatch('Changed', Object.assign(args ?? {}, {component: this}));
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    /**
     * Focus on component to the first object of array
     */
    Focus() {
        if (this._itemsContainer.Children('firstChild')) {
            this._itemsContainer.Children('firstChild').Focus();
        }
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this._readonly;
    }

    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        this._readonly = value;
        this._itemsContainer.ForEach((name, component) => {
            component.readonly = value;
        });
        this._link && (this._link.shown = !value);

    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this._enabled ?? true;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        if (this._enabled != value) {
            this._enabled = value;
            this._itemsContainer.ForEach((name, component) => {
                component.enabled = this._enabled;
            });
            this._link && (this._link.enabled = this._enabled);
        }
    }

    /**
     * Value
     * @type {Array}
     */
    get value() {

        let data = [];
        this._itemsContainer.ForEach((name, component) => {
            if (component instanceof Colibri.UI.Forms.Object) {
                data.push(component.value);
            }
        });

        return data;

    }

    /**
     * Value
     * @type {Array}
     */
    set value(value) {

        value = eval_default_values(value);
        if (!value || !Array.isArray(value)) {
            return;
        }

        this._itemsContainer.Clear();
        if (value.length > 0) {
            for (const v of value) {
                this._addNew(v);
            }
        } else if (this._fieldData?.params?.initempty) {
            this._addNew();
        }


    }

    /**
     * Searches for objects in array
     * @param {string} name field to search for
     * @returns {Array<Colibri.UI.Forms.Object>}
     */
    Fields(name) {
        if (!this._itemsContainer) {
            return [];
        }

        if (name) {
            return this._itemsContainer.Children(name);
        }

        let ret = {};
        this._itemsContainer.ForEach((name, component) => {
            if (component instanceof Colibri.UI.Forms.Field) {
                ret[name] = component;
            }
        });

        return ret;
    }

    /**
     * Cycles all rows in array
     * @param {Function} callback callback for each item
     */
    ForEveryField(callback) {
        this._itemsContainer.ForEach(callback);
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
        const first = this._itemsContainer.Children('firstChild');
        return first?.tabIndex ?? 0;
    }

    /**
     * Items container
     * @type {Colibri.UI.Component}
     */
    get itemsContainer() {
        return this._itemsContainer;
    }

    /** @proptected */
    _calcRuntimeValues(rootValue = null) {
        if (!this.needRecalc) {
            return;
        }

        const formValue = rootValue ?? this.root?.value ?? {};
        this.itemsContainer.ForEach((name, rowObject) => {
            rowObject._calcRuntimeValues(formValue);
        });
    }

    /**
     * Items container component
     * @type {Colibri.UI.Component}
     * @readonly
     */
    get itemsContainer() {
        return this._itemsContainer;
    }

    /** @private */
    _hideAndShow() {
        if (!this.needHideAndShow) {
            return;
        }
        this.ForEveryField((name, component) => component._hideAndShow());
    }

    ClearAllRows() {
        this._itemsContainer.Clear();
    }

    HideAddLink() {
        this._linkCanBeShown = false;
        this._link.shown = false;
    }
    ShowAddLink() {
        this._linkCanBeShown = true;
        this._link.shown = true;
    }


}
Colibri.UI.Forms.Field.RegisterFieldComponent('Array', 'Colibri.UI.Forms.Array', '#{ui-fields-array}', null, ['required', 'enabled', 'canbeempty', 'readonly', 'list', 'template', 'greed', 'viewer', 'fieldgenerator', 'generator', 'noteClass', 'validate', 'valuegenerator', 'onchangehandler', 'vertical', 'addlink', 'removelink', 'updownlink', 'hasscroll', 'initempty', 'maxadd', 'title', 'removedesc'])
