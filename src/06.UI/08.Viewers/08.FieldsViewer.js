Colibri.UI.FieldsViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-fields-viewer-component');

        this._fields = {};
        this._value = {};
        this._download = null;
        this._downloadlink = null;
        this._showUnsetFields = true;
        this._hideFields = [];

        this.RegisterEvent('FieldsToggled', false, 'Когда скрытое открыто или закрыто');
        this.RegisterEvent('EditorChanged', false, 'Когда редактор изменился');
    }

    set download(value) {
        this._download = value;
    }

    set downloadlink(value) {
        this._downloadlink = value;
    }

    set fields(value) {
        this._fields = value;
    }

    get fields() {
        return this._fields;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this._updateFields();
    }

    get root() {
        return this._root;
    }

    set root(value) {
        this._root = value;
    }

    __toggleHidden(event, args) {
        this._hidden.shown = !this._hidden.shown;
        this._hiddenLink1.shown = !this._hiddenLink1.shown;
        this._hiddenLink2.shown = !this._hiddenLink2.shown;
        this.Dispatch('FieldsToggled', {});
    }

    _createFields(fields = null, value = null, contentElement = null, showTitles = true) {
        const root = this.root || this;
        contentElement = contentElement || this;
        fields = fields || this._fields;
        value = value || this._value;

        contentElement.Clear();

        this._shown = new Colibri.UI.Pane(this.name + '_shown', contentElement);
        this._shown.shown = true;

        let isHidden = false;
        Object.forEach(fields, (name, field) => {
            if(field?.params?.fieldsviewer && field?.params?.fieldsviewer.hidden === true) {
                isHidden = true;
            }
        });

        if(isHidden) {
            this._hidden = new Colibri.UI.Pane(this.name + '_hidden', contentElement);
            this._hiddenLink1 = new Colibri.UI.Link(this.name + '_link1', contentElement);
            this._hiddenLink2 = new Colibri.UI.Link(this.name + '_link2', contentElement);
            this._hidden.shown = false;
            this._hiddenLink1.shown = true;
            this._hiddenLink2.shown = false;
            this._hiddenLink1.value = Colibri.UI.SortDescIcon + '&nbsp;#{ui-viewers-fields-expand}';
            this._hiddenLink2.value = Colibri.UI.SortAscIcon + '&nbsp;#{ui-viewers-fields-collapse}';

            this._hiddenLink1.AddHandler('Clicked', (event, args) => this.__toggleHidden(event, args));
            this._hiddenLink2.AddHandler('Clicked', (event, args) => this.__toggleHidden(event, args));

        }

        Object.forEach(fields, (name, field) => {

            if(!field) {
                return true;
            }

            if(field.component == 'Hidden') {
                return true;
            }

            if(!this._showUnsetFields && (value[name] === undefined || value[name] === null || value[name] === '' || (Array.isArray(value[name]) && value[name].length === 0))) {
                return true;
            }

            if(this._hideFields.indexOf(name) !== -1) {
                return true;
            }

            const pane = new Colibri.UI.Pane(name + 'pane', isHidden && (field?.params?.fieldsviewer && field?.params?.fieldsviewer.hidden) ? this._hidden : this._shown);
            const shortComponentName = field.component.substr(field.component.lastIndexOf('.') + 1).toLowerCase();

            pane.AddClass(`app-field-pane app-${shortComponentName}-pane`);
            if(field?.params?.className) {
                pane.AddClass(field.params.className);
            }
            pane.shown = field.hidden === undefined || field.hidden === true;

            field.name = name;
            field.params = Object.assign(field.params ?? {}, {data: this.tag.data});
            
            if(field.params && field.params.condition) {
                const condition = field.params.condition;
                if(condition.field) {
                    const fieldValue = value[condition.field];
                    if(fieldValue && fieldValue.value !== condition.value) {
                        pane.shown = false;
                    }
                    else {
                        pane.shown = true;
                    }
                }
                else {
                    pane.shown = true;
                }
            }

            if(field.desc !== false) {
                const title = new Colibri.UI.TextSpan(name + '-title', pane);
                title.AddClass('app-field-title');
                title.value = field.desc;
                title.shown = showTitles;
                if(field?.params?.fieldsviewer?.info) {
                    const icon = new Colibri.UI.Icon(name + '-icon', title);
                    icon.shown = true;
                    icon.iconSVG = field?.params?.fieldsviewer?.info?.icon;
                    icon.toolTip = field?.params?.fieldsviewer?.info.text;
                }
            }

            if(value[name] !== undefined) {

                const fieldContainer = new Colibri.UI.Pane(name + '-fields-pane', pane);
                fieldContainer.AddClass('app-field-container');
                fieldContainer.AddClass('app-field-' + shortComponentName);
                fieldContainer.shown = field.hidden === undefined || field.hidden === true;

                if(field.component == 'Colibri.UI.Forms.Array') {
                    if(value[name] instanceof Object) {
                        value[name] = Object.values(value[name]);
                    }
                    value[name].forEach((v) => {
                        this._createFields(field.fields, v, fieldContainer, false);
                    });
                }
                else if(field.component == 'Colibri.UI.Forms.Object' && !field.params && !field.params.single) {
                    this._createFields(field.fields, value[name], fieldContainer, false);
                }
                else {
                    const componentName = field.component.replaceAll('Colibri.UI.Forms.', '');
                    const viewerComponentName = field.viewer || field.params.viewer || (field.params?.editor ? 'Colibri.UI.' + componentName + 'Editor' : 'Colibri.UI.' + componentName + 'Viewer');
                    let viewer = null;
                    try {
                        viewer = eval('new '+ viewerComponentName + '(name + \'-viewer\', fieldContainer, null, root)');
                    }
                    catch(e) { 
                        viewer = new Colibri.UI.TextViewer(name + '-viewer', fieldContainer, null, root);
                    }
                    viewer.field = field;
                    viewer.shown = true;
                    viewer.download = this._download;
                    viewer.downloadlink = this._downloadlink;
                    viewer.value = value[name];
                    viewer.AddHandler('Changed', (event, args) => this.Dispatch('EditorChanged', {domEvent: args.domEvent, editor: viewer, field: field, name: name}));
                }

    
            }

        });


    }

    _updateFields(fields = null, value = null, contentElement = null, showTitles = true) {
        const root = this.root || this;
        contentElement = contentElement || this;
        fields = fields || this._fields;
        value = value || this._value;

        if(Object.countKeys(value) === 0 || Object.countKeys(fields) === 0) {
            return;
        }
        
        if(contentElement.children < 4) {
            this._createFields(fields, value, contentElement, showTitles);
        }
        else {
            Object.forEach(fields, (name, field) => {
                const component = this.FindByName(name + '-viewer');
                if(component) {
                    component.value = value[name] ?? null;
                }
            });
        }

    }

    /**
     * Отображать поля без значения
     * @type {boolean}
     */
    get showUnsetFields() {
        return this._showUnsetFields;
    }
    /**
     * Отображать поля без значения
     * @type {boolean}
     */
    set showUnsetFields(value) {
        this._showUnsetFields = value === 'true' || value === true;
        this._showShowUnsetFields();
    }
    _showShowUnsetFields() {
        this._createFields();
    }

    /**
     * Не отображать поля
     * @type {string|Array}
     */
    get hideFields() {
        return this._hideFields;
    }
    /**
     * Не отображать поля
     * @type {string|Array}
     */
    set hideFields(value) {
        this._hideFields = typeof value === 'string' ? value.split(',') : value;
        this._showHideFields();
    }
    _showHideFields() {
        this._createFields();
    }

}
Colibri.UI.Viewer.Register('Colibri.UI.FieldsViewer', '#{ui-viewers-fields}');