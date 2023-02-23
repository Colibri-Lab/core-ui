Colibri.UI.DocumentViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('div'), root);
        this.AddClass('app-document-viewer-component');
    }

    /**
     * Метод для скачивания данных
     * @type {Function}
     */
    get downloadHandler() {
        return this._downloadHandler;
    }
    /**
     * Метод для скачивания данных
     * @type {Function}
     */
    set downloadHandler(value) {
        this._downloadHandler = value;
    }
    
    /**
     * Неизвестный формат, сообщение
     * @type {string}
     */
    get unknownFormatText() {
        return this._unknownFormatText;
    }
    /**
     * Неизвестный формат, сообщение
     * @type {string}
     */
    set unknownFormatText(value) {
        this._unknownFormatText = value;
    }

    _isFileViewable(mimetype) {
        let found = false;
        ['application/pdf', 'image/'].forEach((m) => {
            if(mimetype.indexOf(m) === 0) {
                found = true;
                return false;
            }
        });
        return found;
    }

    set value(value) {

        this._value = value;
        
        
        if(value instanceof Object) {
            // remote file
            this._downloadHandler(value.guid).then((data) => {
                this._element.html('');
                const uri = window.URL.createObjectURL(Base2File(data.data, value.name, value.mimetype, true), {type: value.mimetype});
                if(this._isFileViewable(value.mimetype)) {
                    const ext = Colibri.Common.MimeType.type2ext(value.mimetype);
                    if(Colibri.Common.MimeType.isImage(ext)) {
                        this._element.append(Element.fromHtml('<div style="background-image: url(' + uri + ')"></div>'));
                    }
                    else {
                        this._element.append(Element.fromHtml('<iframe src="' + uri + '" />'));
                    }
                }
                else {
                    this._element.append(Element.fromHtml('<div class="download"><div>' + (this._unknownFormatText ? this._unknownFormatText : '#{ui-viewers-document-unknownformat}') + '<a href="' + uri + '" class="app-component-button app-extended-button-component app-success-button-component" download="' + value.name + '">' + value.name +  '</a></div></div>'));
               }
            });

        }
        else if(typeof value === 'string') {
            this._element.html('');
            const pathinfo = value.pathinfo();
            const mimetype = Colibri.Common.MimeType.ext2type(pathinfo.ext);
            if(this._isFileViewable(mimetype)) {
                if(Colibri.Common.MimeType.isImage(pathinfo.ext)) {
                    this._element.append(Element.fromHtml('<div style="background-image: url(' + uri + ')"></div>'));
                }
                else {
                    this._element.append(Element.fromHtml('<iframe src="' + uri + '" />'));
                }
            }
            else {
                this._element.append(Element.fromHtml('<div class="download"><div>' + (this._unknownFormatText ? this._unknownFormatText : '#{ui-viewers-document-unknownformat}') + '<a href="' + value + '" class="app-extended-button-component app-success-button-component" download="' + pathinfo.filename + '">Download ' + pathinfo.filename +  '</a></div></div>'));
            }

        }

    }


}
Colibri.UI.Viewer.Register('Colibri.UI.DocumentViewer', '#{ui-viewers-document}');