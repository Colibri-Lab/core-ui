Colibri.UI.Forms.Array = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-array-field');

        const contentContainer = this.contentContainer;

        const containerElement = Element.create('div', {class: 'array-component-container'});
        contentContainer.container.append(containerElement);

        this._addNew();

        new Colibri.UI.Link('add-new', contentContainer);

        contentContainer.Children('add-new').value = this._fieldData.params && this._fieldData.params.addlink || 'Добавить еще «' + (this._fieldData.desc) + '»';
        contentContainer.Children('add-new').shown = true;
        contentContainer.Children('add-new').AddHandler('Clicked', (event, args) => {
            this._addNew();
        });

    }

    _addNew() {
        const containerElement = this.contentContainer.container.querySelector('.array-component-container');
        const object = new Colibri.UI.Forms.Object('object-' + Date.Now().getTime(), containerElement, this._fieldData, this, this.root);
        object.parent = this.contentContainer;
        object.shown = true;
        object.title = '';
        object.AddRemoveLink('удалить');
        object.AddHandler('Changed', (event, args) => this.Dispatch('Changed', args));
        this.contentContainer.Children(object.name, object);
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
        if(value && !Array.isArray(value)) {
            throw new Error('Передайте массив')
        }

        this.contentContainer.Clear()
        value && value.forEach((v) => {
            const object = this._addNew();
            object.value = v;
        });

    }

    Fields(name) {

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