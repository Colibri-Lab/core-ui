Colibri.UI.Forms.Array = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-array-field');

        const contentContainer = this.contentContainer;

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


    } 

    _createAddNewLink() {
        if(this._fieldData.params && this._fieldData.params.addlink === null) {
            return;
        }

        this._fieldData.desc = this._fieldData.desc ? this._fieldData.desc[Lang.Current] ?? this._fieldData.desc : '';
        this._fieldData.params.addlink = this._fieldData.params.addlink ? this._fieldData.params.addlink[Lang.Current] ?? this._fieldData.params.addlink : '';

        this.contentContainer.Children('add-new') && this.contentContainer.Children('add-new').Dispose();
        this._link = new Colibri.UI.Link('add-new', this.contentContainer);
        this._link.value = this._fieldData.params && this._fieldData.params.addlink || '#{ui-array-add} «' + (this._fieldData.desc) + '»';
        this._link.shown = true;
        this._link.AddHandler('Clicked', (event, args) => {

            this.AddNew();
            
        });
        return this._link;
    }

    __updateObjectFields(fieldData) {
        return fieldData;
    }

    AddNew() {
        if(this._link.ContainsClass('ui-disabled')) {
            return;
        }

        const object = this._addNew();
        object.MoveUp();
        this._link = this.contentContainer.Children('add-new');
        this.Dispatch('Changed', {component: this});
    }

    _addNew() {
        // const containerElement = this.contentContainer.container.querySelector('.array-component-container');
        let fieldData = Object.cloneRecursive(this._fieldData);
        delete fieldData.note;
        fieldData = this.__updateObjectFields(fieldData);
        const object = new Colibri.UI.Forms.Object('object-' + Date.Now().getTime(), this.contentContainer, fieldData, this, this.root);
        // object.parent = this.contentContainer;
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

            });
        }
        if(this._fieldData.params && this._fieldData.params.updownlink !== false) {
            object.AddUpDownLink(() => {
                object.MoveUp();
                this.Dispatch('Changed', {component: this});
            }, () => {
                if(object.childIndex < this.children - 1) {
                    object.MoveDown();
                }
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
        this.contentContainer.Children(object.name, object);
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
        return object;
    }

    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    Focus() {
        if(this.contentContainer.Children('firstChild')) {
            this.contentContainer.Children('firstChild').Focus();
        }
    }

    get readonly() {
        const first = this.contentContainer.Children('firstChild');
        return first.readonly;
    }

    set readonly(value) {
        this.contentContainer.ForEach((name, component) => {
            component.readonly = value; 
        });
        this._link && (this._link.enabled = !value);
    }

    get enabled() {
        return this._enabled ?? true;
    }

    set enabled(value) {
        this._enabled = value;
        this.contentContainer.ForEach((name, component) => {
            component.enabled = this._enabled; 
        });
        this._link && (this._link.enabled = this._enabled);
    }

    get value() {

        let data = [];
        this.contentContainer.ForEach((name, component) => {
            if(component instanceof Colibri.UI.Forms.Object) {
                data.push(component.value);
            }
        });

        return data;

    }

    set value(value) {
        
        value = eval_default_values(value);
        if(value && !Array.isArray(value)) {
            // throw new Error('Передайте массив')
            return;
        }

        this.contentContainer.Clear();
        value && value.forEach((v) => {
            const object = this._addNew();
            object.value = v;
        });

        if(Array.isArray(value) && value.length === 0 && this._fieldData?.params?.initempty) {
            this._addNew();            
        }

        this._createAddNewLink();

    }

    Fields(name) {
        if(!this.contentContainer) {
            return [];
        }

        if(name) {
            return this.contentContainer.Children(name);
        }

        let ret = {};
        this.contentContainer.ForEach((name, component) => {
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
        const first = this.contentContainer.Children('firstChild');
        return first.tabIndex;
    }
    

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Array', 'Colibri.UI.Forms.Array', '#{ui-fields-array}')
