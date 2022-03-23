Colibri.UI.Forms.Tabs = class extends Colibri.UI.Forms.Object {

    RenderFieldContainer() {
        this.AddClass('app-component-object-field');

        this._tabs = new Colibri.UI.Tabs('tabs', this.contentContainer);
        this._tabs.shown = true;

        this._renderFields();
        this._hideAndShow();

        this._tabs.selectedIndex = 0;

        this.AddHandler('Changed', (event, args) => this._hideAndShow());

        if(this._fieldData.className) {
            this.AddClass(this._fieldData.className);
        }

    }

    _renderFields() {

        // this._fieldData.vertical && this.AddClass('app-field-vertical');
        // this._fieldData.params && this._fieldData.params.merged && this.AddClass('app-merged-object-component');

        Object.forEach(this._fieldData.fields, (name, fieldData) => {

            const field = Object.assign({}, fieldData);
            const tabTitle = field.desc;
            delete field.desc;
            
            const component = Colibri.UI.Forms.Field.Create(name, this._tabs.container, field, this, this.root);
            component.message = false;
            component.shown = true;
            component.AddHandler('Changed', (event, args) => this.Dispatch('Changed'))

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
            data[name] = component.value;
        });

        return data;

    }

    set value(value) {
        if(value && !(value instanceof Object)) {
            throw new Error('Передайте обьект')
        }

        value && Object.forEach(value, (name, v) => {
            this._tabs.components[name].value = v;
        });

    }

    
    _hideAndShow() {

        const data = this.value;

        Object.forEach(this._fieldData.fields, (name, fieldData) => {
            const fieldComponent = this.contentContainer.Children(name);
            if(fieldComponent && fieldData.params && fieldData.params.condition) {
                const condition = fieldData.params.condition;
                if(condition.field) {
                    const fieldValue = data[condition.field];
                    if(fieldValue && fieldValue.value !== condition.value) {
                        fieldComponent.shown = false;
                    }
                    else {
                        fieldComponent.shown = true;
                    }
                }
                else {
                    fieldComponent.shown = true;
                }
            }
        });

    }

    Fields(name) {
        return this.contentContainer.Children(name);
    }

}