Colibri.UI.FieldsViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-fields-viewer-component');

        this._fields = {};
        this._value = {};
        this._download = null;
        this._downloadlink = null;
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
        this._createFields();
    }

    get root() {
        return this._root;
    }

    set root(value) {
        this._root = value;
    }

    _createFields(fields = null, value = null, contentElement = null, showTitles = true) {
        const root = this.root || this;
        contentElement = contentElement || this;
        fields = fields || this._fields;
        value = value || this._value;

        Object.forEach(fields, (name, field) => {

            if(field.component == 'Hidden') {
                return true;
            }

            const pane = new Colibri.UI.Pane(name + 'pane', contentElement);
            const shortComponentName = field.component.substr(field.component.lastIndexOf('.') + 1).toLowerCase();

            pane.AddClass(`app-field-pane app-${shortComponentName}-pane`);
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
            }

            if(value[name] !== undefined) {

                const fieldContainer = new Colibri.UI.Pane(name + '-fields-pane', pane);
                fieldContainer.AddClass('app-field-container');
                fieldContainer.AddClass('app-field-' + shortComponentName);
                fieldContainer.shown = field.hidden === undefined || field.hidden === true;

                if(field.component == 'Array') {
                    if(value[name] instanceof Object) {
                        value[name] = Object.values(value[name]);
                    }
                    value[name].forEach((v) => {
                        this._createFields(field.fields, v, fieldContainer, false);
                    });
                }
                else if(field.component == 'Object' && !field.params && !field.params.single) {
                    this._createFields(field.fields, value[name], fieldContainer, false);
                }
                else {
                    const viewerComponentName = field.viewer || ('Colibri.UI.' + field.component + 'Viewer');
                    const viewer = eval('new '+ viewerComponentName + '(name + \'-viewer\', fieldContainer, null, root)');
                    viewer.field = field;
                    viewer.shown = true;
                    viewer.download = this._download;
                    viewer.downloadlink = this._downloadlink;
                    viewer.value = value[name];
                }
    
            }

        });


    }

}
Colibri.UI.Viewer.Register('Colibri.UI.FieldsViewer', 'Поля (JSON)');