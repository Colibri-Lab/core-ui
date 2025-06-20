/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.FieldsViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-fields-viewer-component');

        this._fields = {};
        this._value = {};
        this._download = null;
        this._downloadlink = null;
        this._showUnsetFields = true;
        this._hideFields = [];

        this._viewers = [];

        this.RegisterEvent('FieldsToggled', false, 'Когда скрытое открыто или закрыто');
        this.RegisterEvent('EditorChanged', false, 'Когда редактор изменился');
        this.RegisterEvent('ViewerClicked', false, 'Когда вьюер нажат');
    }

    /**
     * Download url string
     * @type {string}
     */
    get download() {
        return this._download;
    }
    /**
     * Download url string
     * @type {string}
     */
    set download(value) {
        this._download = value;
    }

    /**
     * Download url string
     * @type {string}
     */
    get downloadlink() {
        return this._downloadlink;
    }
    /**
     * Download url string
     * @type {string}
     */
    set downloadlink(value) {
        this._downloadlink = value;
    }

    /**
     * Fields object
     * @type {object}
     */
    set fields(value) {
        this._fields = value;
    }

    /**
     * Fields object
     * @type {object}
     */
    get fields() {
        return this._fields;
    }

    /**
     * Value object
     * @type {object}
     */
    get value() {
        return this._value;
    }

    /**
     * Value object
     * @type {object}
     */
    set value(value) {
        value = this._convertValue(value);
        this._value = value;
        this._updateFields();
    }

    /**
     * Root component
     * @type {Colibri.UI.Component}
     */
    get root() {
        return this._root;
    }

    /**
     * Root component
     * @type {Colibri.UI.Component}
     */
    set root(value) {
        this._root = value;
    }

    /**
     * State
     * @type {boolean}
     * @readonly
     */
    get state() {
        return this._hidden.shown;
    }

    Fields(name) {
        return Array.findObject(this._viewers, 'name', name + '-viewer');
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __toggleHidden(event, args) {
        this._hidden.shown = !this._hidden.shown;
        this._hiddenLink1.shown = !this._hiddenLink1.shown;
        this._hiddenLink2.shown = !this._hiddenLink2.shown;
        this.Dispatch('FieldsToggled', {state: this._hidden.shown});
    }

    /**
     * Generate fields
     * @param {object} fields fields object
     * @param {object} value value object
     * @param {Element} contentElement content element
     * @param {boolean} showTitles show titles
     */
    _createFields(fields = null, value = null, contentElement = null, showTitles = true) {
        if(fields === null) {
            this._viewers = [];
        }
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

            if(!this._showUnsetFields && !field.params?.editor && (value[name] === undefined || value[name] === null || value[name] === '' || (Array.isArray(value[name]) && value[name].length === 0))) {
                return true;
            }

            if(this._hideFields.indexOf(name) !== -1) {
                return true;
            }

            const pane = new Colibri.UI.Pane(name + 'pane', isHidden && (field?.params?.fieldsviewer && field?.params?.fieldsviewer.hidden) ? this._hidden : this._shown);
            const shortComponentName = field.component.substr(field.component.lastIndexOf('.') + 1).toLowerCase();

            pane.AddClass(`app-field-pane app-${shortComponentName}-pane`);
            if(field?.params?.className) {
                let className = field.params?.className;
                if(typeof className === 'function') {
                    className = className(pane, value[name]);
                }
                pane.AddClass(className);
            }
            if(field.params?.editor) {
                pane.AddClass('app-field-pane-editor');
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
                try {
                    if(typeof field.desc === 'function') {
                        const tvalue = field.desc;
                        tvalue(field, this).then((value) => {
                            title.value = value;
                        });
                    } else {
                        title.value = Lang !== undefined ? Lang.Translate(field.desc) : field.desc;
                    }
                } catch(e) {
                    title.value = field.desc;
                }
                title.shown = showTitles;
                if(field?.params?.fieldsviewer?.info) {
                    const icon = new Colibri.UI.Icon(name + '-icon', title);
                    icon.shown = true;
                    icon.iconSVG = field?.params?.fieldsviewer?.info?.icon;
                    icon.toolTip = field?.params?.fieldsviewer?.info.text[Lang.Current] ?? field?.params?.fieldsviewer?.info.text;
                }
            }

            if(this._showUnsetFields || value[name] !== undefined) {

                const fieldContainer = new Colibri.UI.Pane(name + '-fields-pane', pane);
                fieldContainer.AddClass('app-field-container');
                fieldContainer.AddClass('app-field-' + shortComponentName);
                fieldContainer.shown = field.hidden === undefined || field.hidden === true;

                if(field.component == 'Colibri.UI.Forms.Array') {
                    if(Object.isObject(value[name])) {
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
                    const viewerComponentName = field?.viewer || field.params?.viewer || (field.params?.editor ? 'Colibri.UI.' + componentName + 'Editor' : 'Colibri.UI.' + componentName + 'Viewer');
                    let viewer = null;
                    let viewerAttrs = field.params?.viewerAttrs ?? {};
                    try {
                        viewer = eval('new '+ viewerComponentName + '(name + \'-viewer\', fieldContainer, null, root)');
                    }
                    catch(e) { 
                        viewer = new Colibri.UI.TextViewer(name + '-viewer', fieldContainer, null, root);
                    }
                    viewer.field = field;
                    viewer.shown = true;
                    viewer.enabled = field.params?.enabled ?? true;
                    viewer.download = this._download;
                    viewer.downloadlink = this._downloadlink;
                    if(field.fields) {
                        viewer.fields = field.fields;
                    }
                    Object.forEach(viewerAttrs, (attr, value) => {
                        viewer[attr] = value;
                    });
                    if(field.attrs) {
                        viewer.width = field.attrs?.width ?? null;
                        viewer.height = field.attrs?.height ?? null;
                    }
                    if(field?.params?.className) {
                        let className = field.params?.className;
                        if(typeof className === 'function') {
                            className = className(viewer, value[name]);
                        }
                        viewer.AddClass(className);
                    }
                    viewer.value = this._generateValue(field, value, name, viewer);

                    if(field.params?.editor) {
                        viewer.AddHandler('Changed', (event, args) => this.Dispatch('EditorChanged', {domEvent: args.domEvent, editor: viewer, field: field, name: name}));
                    } else {
                        viewer.AddHandler('Clicked', (event, args) => this.Dispatch('ViewerClicked', {domEvent: args.domEvent, viewer: viewer, field: field, name: name}));
                    }

                    this._viewers.push(viewer);

                }

    
            }

            if(field.params.generatestyles) {
                let f = field.params.generatestyles;
                if(typeof(f) !== 'function') {
                    pane.styles = f;
                } else {
                    pane.styles = f(field, pane);
                }
            }

            
            let hidden = field?.params?.hidden ?? false;
            if(typeof hidden === 'function') {
                let v = value[name] ?? field.default ?? '';
                try {
                    v = value[name][Lang.Current] ?? value[name] ?? field.default ?? '';
                } catch(e) { }
                hidden = hidden(v, field);
            }
            if(hidden) {
                pane.shown = false;
            }


        });


    }

    /**
     * Update fields
     * @param {object} fields fields object
     * @param {object} value value object
     * @param {Element} contentElement content element
     * @param {boolean} showTitles show titles
     */
    _updateFields(fields = null, value = null, contentElement = null, showTitles = true) {
        const root = this.root || this;
        contentElement = contentElement || this;
        fields = fields || this._fields;
        value = value || this._value;

        if((!this._showUnsetFields && Object.countKeys(value) === 0) || Object.countKeys(fields) === 0) {
            return;
        }
        
        if(contentElement.children < 4) {
            this._createFields(fields, value, contentElement, showTitles);
        }
        else {
            Object.forEach(fields, (name, field) => {
                const component = this.FindByName(name + '-viewer');
                if(component) {
                    component.value = this._generateValue(field, value, name, component);
                }
            });
        }

    }

    _generateValue(field, value, name, component) {
        let vv = null;
        try {
            vv = Lang.Translate(value[name] ?? field.default ?? '' ?? null);
        } catch(e) {
            vv = value[name] ?? field.default ?? '' ?? null;
        }
        if(field.params && field.params.valuegenerator) {
            const f = typeof field?.params?.valuegenerator === 'string' ? eval(field?.params?.valuegenerator) : field?.params?.valuegenerator;
            const isOldVersion = typeof field?.params?.valuegenerator === 'string' && field?.params?.valuegenerator.indexOf('(parentValue, formValue') !== -1;
            const v = isOldVersion ? 
                f(vv, value, component, this) : 
                f(vv, value, component, this, component);
            if(v !== undefined) {
                console.log('generated', v);
                return v;
            }
        } else {
            return vv;
        }
    }

    /**
     * Show fields that does not have values
     * @type {boolean}
     */
    get showUnsetFields() {
        return this._showUnsetFields;
    }
    /**
     * Show fields that does not have values
     * @type {boolean}
     */
    set showUnsetFields(value) {
        this._showUnsetFields = value === 'true' || value === true;
        this._showShowUnsetFields();
    }
    /** @private */
    _showShowUnsetFields() {
        this._createFields();
    }

    /**
     * Hide fields
     * @type {string|Array}
     */
    get hideFields() {
        return this._hideFields;
    }
    /**
     * Hide fields
     * @type {string|Array}
     */
    set hideFields(value) {
        this._hideFields = typeof value === 'string' ? value.split(',') : value;
        this._showHideFields();
    }
    /** @private */
    _showHideFields() {
        this._createFields();
    }

}
Colibri.UI.Viewer.Register('Colibri.UI.FieldsViewer', '#{ui-viewers-fields}');