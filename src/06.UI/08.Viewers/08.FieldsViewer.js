Colibri.UI.FieldsViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-fields-viewer-component');

        this._fields = {};
        this._value = {};
        this._download = null;
        this._downloadlink = null;

        this.RegisterEvent('FieldsToggled', false, 'Когда скрытое открыто или закрыто');
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
            isHidden = field?.params?.fieldsviewer && field?.params?.fieldsviewer.hidden;
        });

        if(isHidden) {
            this._hidden = new Colibri.UI.Pane(this.name + '_hidden', contentElement);
            this._hiddenLink1 = new Colibri.UI.Link(this.name + '_link1', contentElement);
            this._hiddenLink2 = new Colibri.UI.Link(this.name + '_link2', contentElement);
            this._hidden.shown = false;
            this._hiddenLink1.shown = true;
            this._hiddenLink2.shown = false;
            this._hiddenLink1.value = '<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 9L9.5 13L15 9" stroke="#0074FF" stroke-width="1.7" stroke-linecap="round"/></svg>&nbsp;Развернуть';
            this._hiddenLink2.value = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.25 9.5L7 4.5L0.75 9.5" stroke="#0074FF" stroke-width="1.5" stroke-linecap="round"/></svg>&nbsp;Свернуть';

            this._hiddenLink1.AddHandler('Clicked', (event, args) => this.__toggleHidden(event, args));
            this._hiddenLink2.AddHandler('Clicked', (event, args) => this.__toggleHidden(event, args));

        }

        Object.forEach(fields, (name, field) => {

            if(field.component == 'Hidden') {
                return true;
            }

            const pane = new Colibri.UI.Pane(name + 'pane', isHidden && (field?.params?.fieldsviewer && field?.params?.fieldsviewer.hidden) ? this._hidden : this._shown);
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
                    const viewerComponentName = field.viewer || field.params.viewer || ('Colibri.UI.' + componentName + 'Viewer');
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
                }
    
            }

        });


    }

}
Colibri.UI.Viewer.Register('Colibri.UI.FieldsViewer', '#{app-viewers-fields;Поля (JSON)}');