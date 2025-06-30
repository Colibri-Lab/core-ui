/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.FilesViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('div'), root);
        this.AddClass('app-files-viewer-component');

        this._value = null;
        this._download = null;
        this._fileNotExistText = '&mdash;';

        this._list = new Colibri.UI.List('viewer-list', this);
        this._list.AddGroup('group', '');
        this._list.__renderItemContent = (itemData, container) => {

            if (itemData.file !== null) {
                const icon = new Colibri.UI.Icon('icon', container);
                icon.shown = true;
                icon.value = Colibri.UI.FileLinkIcon;
            }

            const filename = new Colibri.UI.TextSpan('span', container);
            filename.value = itemData.title;
            filename.shown = true;
            if (itemData.file === null) {
                filename.AddClass('gray');
            }
        }

        this._list.AddHandler('ItemClicked', this.__listItemClicked, false, this);


    }

    __listItemClicked(event, args) {
        const value = args.item.value;
        if (value && value.file && this._download) {
            window.open((window.rpchandler ? window.rpchandler : '') + this._download + '?guid=' + value.file.guid);
        }
    }


    /** @private */
    _showValue() {

        const group = this._list.Children('group');
        group.Clear();

        this._value && this._value.forEach((file) => {
            try {
                group.AddItem({ title: file.name, file: file });
            }
            catch (e) { }
        });
        this._list.shown = true;
        if (!this._value || Object.countKeys(this._value) == 0) {
            group.AddItem({ title: this._field && this._field.params && this._field.params.text || this._fileNotExistText, file: null });

        }

    }

    /**
     * Value
     * @type {Array<{file, name}>}
     */
    get value() {
        return this._value;
    }

    /**
     * Value
     * @type {Array<{file, name}>}
     */
    set value(value) {
        this._value = this._convertValue(Object.isObject(value) ? Object.values(value) : value);
        this._showValue();
    }

    /**
     * Field object
     * @type {object}
     */
    get field() {
        return this._field;
    }

    /**
     * Field object
     * @type {object}
     */
    set field(field) {
        this._field = field;
        this._showValue();
    }

    /**
     * Download url address
     * @type {string}
     */
    get download() {
        return this._download;
    }
    /**
     * Download url address
     * @type {string}
     */
    set download(value) {
        this._download = value;
    }

    /**
     * File not exists text
     * @type {string}
     */
    get fileNotExistText() {
        return this._fileNotExistText
    }

    /**
     * File not exists text
     * @type {string}
     */
    set fileNotExistText(value) {
        this._fileNotExistText = value
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.FilesViewer', '#{ui-viewers-files}');