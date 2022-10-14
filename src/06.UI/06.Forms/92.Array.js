Colibri.UI.Forms.Array = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-array-field');

        const contentContainer = this.contentContainer;

        // const containerElement = Element.create('div', {class: 'array-component-container'});
        // contentContainer.container.append(containerElement);

        this.AddNew();

        this._link = this._createAddNewLink();
        

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

        const link = new Colibri.UI.Link('add-new', this.contentContainer);
        link.value = this._fieldData.params && this._fieldData.params.addlink || '#{app-array-add;Добавить еще} «' + (this._fieldData.desc) + '»';
        link.shown = true;
        link.AddHandler('Clicked', (event, args) => {
            this.AddNew();
            this.Dispatch('Changed');            
        });
        return link;
    }

    AddNew() {
        // const containerElement = this.contentContainer.container.querySelector('.array-component-container');
        const object = new Colibri.UI.Forms.Object('object-' + Date.Now().getTime(), this.contentContainer, this._fieldData, this, this.root);
        // object.parent = this.contentContainer;
        object.shown = true;
        object.title = '';
        object.enabled = this.enabled;
        if(this._fieldData.params && this._fieldData.params.removelink !== false) {
            object.AddRemoveLink(() => {
                Object.forEach(this.Fields(), (name, field) => {
                    field.Dispatch('Changed');
                });
                this.Dispatch('Changed');

                if(this._fieldData.params && this._fieldData.params.maxadd !== null) {
                    const count = Object.countKeys(this.Fields());
                    if(count < this._fieldData.params.maxadd && !this._link) {
                        this._link = this._createAddNewLink();
                    }
                }

            });
            object.AddUpDownLink(() => {
                object.MoveUp();
                this.Dispatch('Changed');
            }, () => {
                object.MoveDown();
                this.Dispatch('Changed');
            });

        }
        object.AddHandler('Changed', (event, args) => {
            if(this._fieldData.params && this._fieldData.params.title !== null) {
                const f = eval(this._fieldData.params.title);
                f && f(object, this);
            }
            return this.Dispatch('Changed', args);
        });
        this.contentContainer.Children(object.name, object);
        if(this._fieldData.params && this._fieldData.params.title !== null) {
            const f = eval(this._fieldData.params.title);
            f && f(object, this);
        }

        if(this._fieldData.params && this._fieldData.params.maxadd !== null) {
            const count = Object.countKeys(this.Fields());
            if(count >= this._fieldData.params.maxadd) {
                this._link && this._link.Dispose();
                this._link = null;
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
        this._link && (this._link.enabled = value);
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
            const object = this.AddNew();
            object.value = v;
        });
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
Colibri.UI.Forms.Field.RegisterFieldComponent('Array', 'Colibri.UI.Forms.Array', '#{app-fields-array;Массив обьектов}')
