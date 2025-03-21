/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.File = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-file-field');
        const contentContainer = this.contentContainer;

        this._value = null;
        this._valueData = null;
        this._maxCount = 1;
        this._allowedExtensions = null;
        this._maxFileSize = null;

        this._validated = false;
        this._errorMessage = '';

        if(this._fieldData?.params?.allow && !Array.isArray(this._fieldData?.params?.allow)) {
            this._fieldData.params.allow = this._fieldData.params.allow.split(',');
        }

        this._allowedExtensions = this._fieldData?.params?.allow ?? null;
        this._maxFileSize = this._fieldData?.params?.size ?? null;

        this._dropAreaEnabled = false;
        if (this._fieldData.params && this._fieldData.params.droparea) {
            this._dropAreaEnabled = this._fieldData.params.droparea;
        }

        this._renderInput();
        this._handleEvents();
        

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

    }

    /** @private */
    _clicked(value) {
        if (this._value instanceof File) {
            this._value.download();
        }
        else if (this._fieldData.params?.download && value.file?.guid) {
            window.open((window.rpchandler ?? '') + this._fieldData.params.download + '?guid=' + this._value.guid);
        }
    }

    /** @protected */
    _handleEvents() {

        this.AddHandler('Clicked', (event, args) => this._clicked(args));

        this._input.AddHandler('InputFileChanged', (event, args) => {
            this._value = this._input.Files();
            this.Dispatch('Changed', Object.assign(args, {component: this}));
        });

        if (this._dropAreaEnabled) {
            /* Валидация выбранных файлов, отображение одного файла, вывод ошибок */
            this._input.AddHandler('InputFileChosen', (event, args) => {
                if (args.files) {
                    this._validate(args.files);

                    if (this._validated) {
                        this._value = args.files[0];
                        this._showFile();
                    }
                    else {
                        this._value = null;
                        this._showError();
                    }
                    this.Dispatch('Changed', args);
                }
            });

            this._removeButton.AddHandler('Clicked', (event, args) => {
                this._value = null;
                this._clearInput();
                this.Dispatch('Changed', args);
            });
        }
    }

    /** @private */
    _renderInput() {
        if (!this._dropAreaEnabled) {
            this._input = new Colibri.UI.Input.File('input', this.contentContainer);
            this.AddClass('-input-file-enabled');
        }
        else {
            this._input = new Colibri.UI.FilesDragAndDrop('drag-and-drop', this.contentContainer);
            this.AddClass('-drop-area-enabled');
            this._input.extensionsLabel.value = this._extensionsToString();

            this._inputFileContainer = new Colibri.UI.Pane(this._name + '-file-container', this.contentContainer);
            this._fileTitleContainer = new Colibri.UI.Pane(this._name + '-file-title-container', this._inputFileContainer);

            this._fileTitleContainer._fileIcon = new Colibri.UI.Icon(this._name + '-file-icon', this._fileTitleContainer);
            this._fileTitleContainer._fileIcon.value = Colibri.UI.FileLinkIcon;
            this._fileTitleContainer._filePicture = new Colibri.UI.Image(this._name + '-file-image', this._fileTitleContainer);
            this._fileTitleContainer._fileTitle = new Colibri.UI.TextSpan(this._name + '-file-title', this._fileTitleContainer);

            this._removeButton = new Colibri.UI.Icon(this._name + '-remove-icon', this._inputFileContainer);
            this._removeButton.value = Colibri.UI.ClearIcon;
        }

        this._input.shown = true;
        this._input.multiple = false;
        if (this._fieldData.params && this._fieldData.params.button) {
            this._input.title = this._fieldData.params.button;
        }
    }

    /** @private */
    _showFile() {
        if (this._dropAreaEnabled && this._value) {
            let file = this._value;
            const picture = this._fileTitleContainer._filePicture;
            this.AddClass('-file-chosen');
            this._input.shown = false;

            this._fileTitleContainer._fileTitle.value = file.name ?? '-';

            this._inputFileContainer.shown = true;
            this._fileTitleContainer.shown = true;

            if (file.type.match('image.*')) {
                picture.shown = true;
                picture.image = file;
                picture.width = picture.height = 40;
                this._fileTitleContainer._fileIcon.shown = false;
            } else {
                this._fileTitleContainer._fileIcon.shown = true;
                this._fileTitleContainer._filePicture.shown = false;
            }
            this._fileTitleContainer._fileTitle.shown = true;
            this._removeButton.shown = true;
        }
    }

    /** @private */
    _clearInput() {
        if (this._dropAreaEnabled) {
            this.RemoveClass('-file-chosen');
            this._input.RemoveClass('-validation-error');

            this._fileTitleContainer._fileTitle.value = '';
            this._input.errorMessage = '';

            this._inputFileContainer.shown = false;
            this._input.shown = true;
        }
    }

    /** @private */
    _showError() {
        if (this._dropAreaEnabled) {
            this._input.AddClass('-validation-error');
            this._input.errorMessage = this._errorMessage;

            this._input.shown = true;
            this._input.extensionsLabel.shown = false;
            this._inputFileContainer.shown = false;
        }
    }

    /** @private */
    _extensionsToString() {
        let extensionsString = '';

        if (Array.isArray(this._allowedExtensions)) {
            let extensions = this._allowedExtensions.map((item) => String(item).toUpperCase());
            extensionsString = extensions.join(', ');
        }
        return extensionsString;
    }

    /** @private */
    _validate(filesList) {
        let error = false;

        if (this._maxCount && (filesList.length > this._maxCount)) {
            error = true;
            this._errorMessage = '#{ui-files-error-max}'.replaceAll('%s', this._maxCount);
        }

        if (!error && this._allowedExtensions) {
            let extensions = this._allowedExtensions.map((item) => item.toLowerCase());
            let fileName = filesList[0].name;
            let ext = '';

            if (fileName.includes('.')) {
                ext = fileName.substring(fileName.lastIndexOf('.') + 1);
                ext = ext.toLowerCase();
            }

            if (!extensions.includes(ext)) {
                error = true;
                this._errorMessage = '#{ui-files-error-format} (' + this._extensionsToString() + ')';
            }
        }

        if (!error && this._maxFileSize && (filesList[0].size > this._maxFileSize)) {
            error = true;
            this._errorMessage = '#{ui-files-error-size}';
        }

        if (error) {
            this._validated = false;
        }
        else {
            this._errorMessage = '';
            this._validated = true;
        }
    }

    /**
     * Focus on component
     */
    Focus() {
        this._input.Focus();
    }

    /**
     * Show drop container
     * @type {boolean}
     */
    get dropAreaEnabled() {
        return this._dropAreaEnabled;
    }

    /**
     * Show drop container
     * @type {boolean}
     */
    set dropAreaEnabled(value) {
        value = this._convertProperty('Boolean', value);
        this._dropAreaEnabled = value;
    }

    /**
     * Value
     * @type {File}
     */
    get value() {
        return this._value;
    }
    /**
     * Value
     * @type {File}
     */
    set value(value) {
        if(value instanceof File) {
            this._value = value;
            this._showFile();
        }
        else if(value?.guid) {
            Colibri.IO.Request.Get('/file.stream', {storage: value.storage, field: value.field, guid: value.guid}).then((response) => {
                if(response.status == 200) {
                    value.data = response.result;
                    this._valueData = value;
                    this._value = Base2File(value.data, value.name, value.mimetype);
                    this._showFile();
                }
            });
        }

    }

    /**
     * Download the file
     * @type {boolean}
     */ 
    set download(value) {
        value = this._convertProperty('String', value);
        this._download = value;
    }

    /**
     * Download the file
     * @type {boolean}
     */ 
    get download() {
        return this._download;
    }

    /**
     * Allowed extensions
     * @type {array|null}
     */
    get allowedExtensions() {
        return this._allowedExtensions;
    }
    /**
     * Allowed extensions
     * @type {array|null}
     */
    set allowedExtensions(value) {
        this._allowedExtensions = value;
        if (this._dropAreaEnabled) { 
            this._input.extensionsLabel.value = this._extensionsToString(); 
        }
    }

    /**
     * Max allowed file size
     * @type {number|null}
     */
    get maxFileSize() {
        return this._maxFileSize;
    }
    /**
     * Max allowed file size
     * @type {number|null}
     */
    set maxFileSize(value) {
        value = this._convertProperty('Number', value);
        this._maxFileSize = value;
    }

    /**
     * Max allowed files
     * @type {number|null}
     */
    get maxCount() {
        return this._maxCount;
    }
    /**
     * Max allowed files
     * @type {number|null}
     */
    set maxCount(value) {
        value = this._convertProperty('Number', value);
        this._maxCount = value;
    }

    /**
     * Tab index
     * @type {number|boolean}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    /**
     * Tab index
     * @type {number|boolean}
     */
    set tabIndex(value) {
        if (this._input) {
            this._input.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('File', 'Colibri.UI.Forms.File', '#{ui-fields-file}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler','allow','size'])
