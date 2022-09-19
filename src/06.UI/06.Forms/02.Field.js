Colibri.UI.Forms.Field = class extends Colibri.UI.Component {

    static Components = {};
    static RegisterFieldComponent(name, className, description, icon) {
        if(!icon) {
            icon = Colibri.UI.FieldIcons[className];
        }
        Colibri.UI.Forms.Field.Components[name] = {className, description, icon};
    }
    static UnregisterFieldComponent(name) {
        delete Colibri.UI.Forms.Field.Components[name];
    }

    static Create(name, container, field, parent, root = null) {

        if(!field.component && !field.type) {
            return ;
        }

        let component = field.component || '';
        if(!component) {

            if(field.values !== undefined || field.lookup !== undefined) {
                component = 'Select';
            }
            else if(['varchar', 'char'].indexOf(field.type) !== -1 && field.class === 'string') {
                component = 'Text';
            }
            else if(['text', 'longtext', 'tinytext', 'mediumtext'].indexOf(field.type) !== -1 && field.class === 'string') {
                component = 'TextArea';
            }
            else if(['date', 'datetime', 'timestamp'].indexOf(field.type)) {
                component = 'Date';
            }
            else if(['tinyint'].indexOf(field.type) !== -1) {
                component = 'Bool';
            }
            else if(['int', 'integer', 'bigint', 'float', 'decimal', 'double', 'real', 'smallint'].indexOf(field.type) !== -1) {
                component = 'Number';
            }
            else if(['json', 'longtext'].indexOf(field.type) !== -1) {
                if(field.class.indexOf('ArrayField') !== -1) {
                    component = 'Object';
                }
                else {
                    component = 'Array';
                }   
            }
        }

        if(!component) {
            return null;
        }

        let componentObject = null;

        if(component === 'Hidden') {
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

        return componentObject;
    }

    constructor(name, container, fieldData, parent, root) {
        super(name, container, '<div />');

        this._fieldData = fieldData;
        this._parentField = parent;
        this.root = root;

        this.AddClass('app-component-field');

        new Colibri.UI.TextSpan(this._name + '-title', this);
        this._content = new Colibri.UI.Pane(this._name + '-content', this);
        new Colibri.UI.Pane(this._name + '-container', this._content);
        new Colibri.UI.TextSpan(this._name + '-note', this._content);
        new Colibri.UI.TextSpan(this._name + '-message', this._content);

        this._validated = true;

        this.Children(this._name + '-title').shown = true;
        this._content.shown = true;
        this._content.Children(this._name + '-container').shown = true;
        this._content.Children(this._name + '-note').shown = true;
        this._content.Children(this._name + '-message').shown = false;

        this.RenderFieldContainer();

        this.title = this._fieldData.desc;
        this.note = this._fieldData.note;
        this.placeholder = this._fieldData?.placeholder;

        if(this._fieldData.attrs) {
            Object.assign(this, this._fieldData.attrs);
        }

        this.AddHandler(['Changed', 'KeyUp', 'KeyDown'], (event, args) => {
            if(event.name == 'Changed') {
                this._applyRuntimes();
                this._setFilledMark();
            }
            if(this._parentField) {
                this._parentField.Dispatch(event.name, Object.assign({component: event.sender}, args));
            }
            args && args.domEvent && args.domEvent.stopPropagation();
            return true;
        });

        this.AddHandler('ReceiveFocus', (event, args) => this.AddClass('-focused'));
        this.AddHandler('LoosedFocus', (event, args) => this.RemoveClass('-focused'));

        if(this._fieldData.hidden && this._fieldData.hidden === true) {
            this.AddClass('app-component-field-hidden');
        }

        if(this._fieldData?.break) {
            this._element.before(Element.create('div', {class: 'break'}, {}));
        }

    }

    AddRemoveLink(callback) {
        const removeLink = new Colibri.UI.Icon(this._name + '-remove', this);
        removeLink.AddClass('app-component-remove-field')
        removeLink.shown = true;
        removeLink.value = Colibri.UI.CloseIcon;
        removeLink.AddHandler('Clicked', (event, args) => {
            if(!this.enabled) {
                return;
            }
            this.Dispose();
            callback && callback();
        });
    }

    _registerEvents() { 
        super._registerEvents();  
        this.RegisterEvent('Validated', false, 'Прошла валидация')
        this.RegisterEvent('Changed', false, 'Прозошло изменение данных компонента') 
        this.RegisterEvent('KeyDown', false, 'Когда кнопка нажата')
        this.RegisterEvent('KeyUp', false, 'Когда кнопка отжата')
        this.RegisterEvent('FieldsRendered', false, 'Когда поля созданы');
    }

    _applyRuntimes() {
        let runtime = this._fieldData?.params?.runtime;
        if(runtime) {
            runtime = eval(runtime);
            runtime(this, this.root);
        }
    }

    _setFilledMark() {
        if(this instanceof Colibri.UI.Forms.Array || this instanceof Colibri.UI.Forms.ArrayGrid) {
            this.contentContainer.ForEach((name, component) => {
                component instanceof Colibri.UI.Forms.Field && component._setFilledMark()
            });
        }
        else if(this instanceof Colibri.UI.Forms.Object) {
            Object.forEach(this._fieldData?.fields, (name, fieldData) => this.contentContainer.Children(name) instanceof Colibri.UI.Forms.Field && this.contentContainer.Children(name)._setFilledMark());   
        }
        else {
            if((Array.isArray(this.value) ? this.value.length > 0 : this.value)) {
                this.AddClass('-filled');
            }
            else {
                this.RemoveClass('-filled');
            }    
        }

    }

    Validate() {
        this._validated = true;
    }

    RenderFieldContainer() {
        throw new Error('#{app-field-needtooverload-error;Нужно переопределить}');
    }

    ResetValidation() {
        this.params && (this.params.validated = true);
        this.RemoveClass('app-validate-error');
        this.message = '';
    }

    get message() {
        const message = this._content.Children(this._name + '-message');
        if(!message) {
            return null;
        }
        return message.value;
    }

    set message(value) {
        const message = this._content.Children(this._name + '-message');
        if(!message) {
            return;
        }
        message.shown = !!value;
        message.value = value;
    }

    get title() {
        return this.Children(this._name + '-title').value;
    }
    set title(value) {
        this.Children(this._name + '-title').value = value;
        if(!value) {
            this.AddClass('-without-title');
        }
        else {
            this.RemoveClass('-without-title');
        }
    }

    get note() {
        return this._content.Children(this._name + '-note').value;
    }
    set note(value) {
        this._content.Children(this._name + '-note').value = value;
    }

    get contentContainer() {
        return this._content.Children(this._name + '-container');
    }

    get field() {
        return this._fieldData;
    }

    set inputWidth(value) {
        this._content.Children(this._name + '-container').width = value;
    }

    get inputWidth() {
        return this._content.Children(this._name + '-container').width;
    }

    get root() {
        return this._root;
    }

    set root(value) {
        this._root = value;
    }

    get form() {
        const formElement = this._element.closest('.app-form-component');
        return formElement ? formElement.tag('component') : null;
    }


}

Colibri.UI.Forms.HiddenField = class extends Colibri.UI.Component {
    constructor(name, container, fieldData) {
        super(name, container, '<input type="hidden" />');
        this._fieldData = fieldData;
        this._validated = true;
    }

    get value() {
        return this._element.value;
    }

    set value(value) {
        this._element.value = value;
    }

    Validate() {
        this._validated = true;
    }

    get validated() {
        return this._validated;
    }

    get field() {
        return {};
    }

}