Colibri.UI.Forms.Array = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-array-field');

        const contentContainer = this.contentContainer;
        this._itemsContainer = new Colibri.UI.Pane(this.name + '-items', contentContainer);
        this._itemsContainer.shown = true;

        if(this._fieldData?.params?.initempty === undefined || this._fieldData?.params?.initempty === true) {
            this._addNew();
        }

        this._createAddNewLink();
        

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

        this.RegisterEvent('ObjectRemoved', false, 'Object in array removed');

    } 

    _createAddNewLink() {
        if(this._fieldData.params && this._fieldData.params.addlink === null) {
            return;
        }

        this.contentContainer.Children('add-new') && this.contentContainer.Children('add-new').Dispose();
        if(typeof Lang.Translate(this._fieldData.params.addlink) === 'object') {
            const linkData = this._fieldData.params.addlink;
            const c = eval(linkData.component);
            this._link = new c('add-new', this.contentContainer);
            Object.forEach(linkData.attrs, (name, value) => {
                console.log(name, value);
                this._link[name] = value;
            });

        } else {
            this._fieldData.desc = this._fieldData.desc ? this._fieldData.desc[Lang.Current] ?? this._fieldData.desc : ''; 
            this._fieldData.params.addlink = this._fieldData?.params?.addlink ? this._fieldData.params.addlink[Lang.Current] ?? this._fieldData.params.addlink : '';
            this._link = new Colibri.UI.Link('add-new', this.contentContainer);
            this._link.value = this._fieldData.params && this._fieldData.params.addlink || '#{ui-array-add} «' + (this._fieldData.desc) + '»';    
        }
        

        this._link.shown = true;
        this._link.AddHandler('Clicked', (event, args) => {
            this.AddNew();
        });
        return this._link;
    }

    __updateObjectFields(fieldData) {
        return fieldData;
    }

    AddNew(value) {
        if(this._link.ContainsClass('ui-disabled')) {
            return;
        }
        const object = this._addNew(value);
        this.Dispatch('Changed', {component: this});
        return object;
    }

    _addNew(value = null) {
        // const containerElement = this.contentContainer.container.querySelector('.array-component-container');
        let fieldData = Object.cloneRecursive(this._fieldData);
        delete fieldData?.note;
        delete fieldData?.params?.validate;
        delete fieldData?.params?.fieldgenerator;
        if(fieldData?.params){
            fieldData.params.validate = [{message: '', method: () => true}];
        }
        fieldData = this.__updateObjectFields(fieldData);
        const object = new Colibri.UI.Forms.Object('object-' + Date.Now().getTime(), this._itemsContainer, fieldData, this, this.root);
        object.shown = true;
        object.title = '';
        object.enabled = this.enabled;
        if(this._fieldData.params && this._fieldData.params.removelink !== false) {
            object.AddRemoveLink(() => {
                 
                Object.forEach(this.Fields(), (name, field) => {
                    if(field instanceof Colibri.UI.Forms.Field) {
                        field.Dispatch('Changed', {});
                    }
                });
                this.Dispatch('Changed', {component: this});
                
                if(this._fieldData.params && !!this._fieldData.params.maxadd) {
                    const count = Object.countKeys(this.Fields());
                    if(count < parseInt(this._fieldData.params.maxadd)) {
                        this._link.Show();
                    }
                }

                this.Dispatch('ObjectRemoved', {component: this});

            });
        }
        if(this._fieldData.params && this._fieldData.params.updownlink !== false) {
            object.AddUpDownLink(() => {
                object.MoveUp();
                object.Focus();
                this.Dispatch('Changed', {component: this});
            }, () => {
                object.MoveDown();
                object.Focus();
                this.Dispatch('Changed', {component: this});
            });
        }

        object.AddHandler('Changed', (event, args) => {
            if(this._fieldData.params && this._fieldData.params.title !== null) {
                const f = eval(this._fieldData.params.title);
                f && f(object, this);
            }
            return this.Dispatch('Changed', Object.assign(args ?? {}, {component: this}));
        });
        this._itemsContainer.Children(object.name, object);
        if(this._fieldData.params && this._fieldData.params.title !== null) {
            const f = eval(this._fieldData.params.title);
            f && f(object, this);
        }

        if(this._fieldData.params && !!this._fieldData.params.maxadd) {
            const count = Object.countKeys(this.Fields());
            if(count >= parseInt(this._fieldData.params.maxadd)) {
                this._link.Hide();
            }
        }

        this.Dispatch('FieldsRendered');
        if(value) {
            object.value = value;
        }
        // object.Focus();
        return object;
    }

    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    Focus() {
        if(this._itemsContainer.Children('firstChild')) {
            this._itemsContainer.Children('firstChild').Focus();
        }
    }

    get readonly() {
        const first = this._itemsContainer.Children('firstChild');
        return first?.readonly ?? false;
    }

    set readonly(value) {
        this._itemsContainer.ForEach((name, component) => {
            component.readonly = value; 
        });
        this._link && (this._link.enabled = !value);
    }

    get enabled() {
        return this._enabled ?? true;
    }

    set enabled(value) {
        this._enabled = value;
        this._itemsContainer.ForEach((name, component) => {
            component.enabled = this._enabled; 
        });
        this._link && (this._link.enabled = this._enabled);
    }

    get value() {

        let data = [];
        this._itemsContainer.ForEach((name, component) => {
            if(component instanceof Colibri.UI.Forms.Object) {
                data.push(component.value);
            }
        });

        return data;

    }

    set value(value) {
        
        value = eval_default_values(value);
        if(!value || !Array.isArray(value)) {
            return;
        }

        this._itemsContainer.Clear();
        if(value.length > 0) {
            for(const v of value) {
                this._addNew(v);
            }
        } else if(this._fieldData?.params?.initempty) {
            this._addNew();            
        }


    }

    Fields(name) {
        if(!this._itemsContainer) {
            return [];
        }

        if(name) {
            return this._itemsContainer.Children(name);
        }

        let ret = {};
        this._itemsContainer.ForEach((name, component) => {
            if(component instanceof Colibri.UI.Forms.Field) {
                ret[name] = component;
            }
        });

        return ret;
    }

    set tabIndex(value) {
        // do nothing
    }


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

    _calcRuntimeValues(rootValue = null) {
        const parentValue = this.value;
        const formValue = rootValue ?? this.root?.value ?? {};

        this.itemsContainer.ForEach((name, rowObject) => {
            rowObject._calcRuntimeValues(formValue);
        });
    }
    

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Array', 'Colibri.UI.Forms.Array', '#{ui-fields-array}')
