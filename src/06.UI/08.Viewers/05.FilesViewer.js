Colibri.UI.FilesViewer = class extends Colibri.UI.Viewer {
    
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('div'), root);
        this.AddClass('app-files-viewer-component');

        this._value = null;
        this._download = null;
        this._fileNotExistText = '&mdash;';

        this._list = new Colibri.UI.List('viewer-list', this);
        this._list.AddGroup('group', '');
        this._list.__renderItemContent = (itemData, container) => {

            if(itemData.file !== null) {
                const icon = new Colibri.UI.Icon('icon', container);
                icon.shown = true;
                icon.value = Colibri.UI.FileLinkIcon;    
            }

            const filename = new Colibri.UI.TextSpan('span', container);
            filename.value = itemData.title;
            filename.shown = true;
            if(itemData.file === null) {
                filename.AddClass('gray');
            }
        }

        this._list.AddHandler('ItemClicked', (event, args) => {

            const value = args.item.value;
            if(value && value.file && this._download) {
                window.open((window.rpchandler ? window.rpchandler : '') + this._download + '?guid=' + value.file.guid);
            }

        });


    }

    _showValue() {

        const group = this._list.Children('group');
        group.Clear();

        this._value && this._value.forEach((file) => {
            try {
                group.AddItem({title: file.name, file: file});
            }
            catch(e) {}
        });
        this._list.shown = true;
        if(!this._value || Object.countKeys(this._value) == 0) {
            group.AddItem({title: this._field && this._field.params && this._field.params.text || this._fileNotExistText, file: null});

        }
        
    }
    
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value instanceof Object ? Object.values(value) : value;
        this._showValue();
    }

    get field() {
        return this._field;
    }

    set field(field) {
        this._field = field;
        this._showValue();
    }

    set download(value) {
        this._download = value;
    }

    get fileNotExistText() {
        return this._fileNotExistText
    }

    set fileNotExistText(value) {
        this._fileNotExistText = value
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.FilesViewer', '#{ui-viewers-files}');