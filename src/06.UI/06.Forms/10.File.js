Colibri.UI.Forms.File = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-file-field');
        const contentContainer = this.contentContainer;

        // this.AddHandler('Clicked', (event, args) => {
        //     const value = args.item.value;
        //     if(this._field && this._field.params && this._field.params.download) {
        //         window.open(window.rpchandler + this._download + '?guid=' + value.file.guid);
        //     }
        // });

        this._value = null;
        this._valueData = null;
        this._maxCount = 1;
        this._allowedExtensions = null;
        this._maxFileSize = null;

        this._validated = false;
        this._errorMessage = '';

        if (this._fieldData.params && this._fieldData.params.allow) {
            this._allowedExtensions = this._fieldData.params.allow.exts ?? null;
            this._maxFileSize = this._fieldData.params.allow.size ?? null;
        }

        this._dropAreaEnabled = false;
        if (this._fieldData.params && this._fieldData.params.droparea) {
            this._dropAreaEnabled = this._fieldData.params.droparea;
        }

        this._renderInput();
        this._handleEvents();
    }

    _clicked(value) {
        if (this._value instanceof File) {
            this._value.download();
        }
        else if (this._fieldData.params?.download && value.file?.guid) {
            window.open((window.rpchandler ?? '') + this._fieldData.params.download + '?guid=' + this._value.guid);
        }
    }

    _handleEvents() {

        this.AddHandler('Clicked', (event, args) => this._clicked(args));

        this._input.AddHandler('InputFileChanged', (event, args) => {
            this._value = this._input.Files();
            this.Dispatch('Changed', args);
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

    /**
     * Нарисовать инпут и контейнер для отображения выбранного файла
     * @private
     */
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

    /**
     * Отобразить выбранный файл
     * @private
     */
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

    /**
     * Очистить инпут от файла и ошибок
     * @private
     */
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

    /**
     * Показать ошибки валидации
     * @private
     */
    _showError() {
        if (this._dropAreaEnabled) {
            this._input.AddClass('-validation-error');
            this._input.errorMessage = this._errorMessage;

            this._input.shown = true;
            this._input.extensionsLabel.shown = false;
            this._inputFileContainer.shown = false;
        }
    }

    /**
     * Собрать список разрешенных расширений в строку нужного формата
     * @return {string}
     * @private
     */
    _extensionsToString() {
        let extensionsString = '';

        if (Array.isArray(this._allowedExtensions)) {
            let extensions = this._allowedExtensions.map((item) => String(item).toUpperCase());
            extensionsString = extensions.join(', ');
        }
        return extensionsString;
    }

    /**
     * Валидация выбранного списка файлов
     * @param {array} filesList
     * @private
     */
    _validate(filesList) {
        let error = false;

        if (this._maxCount && (filesList.length > this._maxCount)) {
            error = true;
            this._errorMessage = 'Можно выбрать не более ' + this._maxCount;
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
                this._errorMessage = 'Недопустимый формат файла (' + this._extensionsToString() + ')';
            }
        }

        if (!error && this._maxFileSize && (filesList[0].size > this._maxFileSize)) {
            error = true;
            this._errorMessage = 'Выбранный файл слишком большой';
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
     * Поставить фокус
     */
    Focus() {
        this._input.Focus();
    }

    /**
     * Отображать ли drag-and-drop
     * @return {boolean}
     */
    get dropAreaEnabled() {
        return this._dropAreaEnabled;
    }

    /**
     * Отображать ли drag-and-drop
     * @param {boolean|string} value
     */
    set dropAreaEnabled(value) {
        this._dropAreaEnabled = (value === true || value === 'true');
    }

    /**
     * Значение поля (выбранный файл)
     * @type {File}
     */
    get value() {
        return this._value;
    }
    set value(value) {
        if(value instanceof File) {
            this._value = value;
            this._showFile();
        }
        else if(value.guid) {
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

    set download(value) {
        this._download = value;
    }

    /**
     * Максимальное количество выбранных файлов
     * @type {array|null}
     */
    get allowedExtensions() {
        return this._allowedExtensions;
    }
    set allowedExtensions(value) {
        this._allowedExtensions = value;
        if (this._dropAreaEnabled) { this._input.extensionsLabel.value = this._extensionsToString(); }
    }

    /**
     * Максимальный размер одного файла
     * @type {number|null}
     */
    get maxFileSize() {
        return this._maxFileSize;
    }
    set maxFileSize(value) {
        this._maxFileSize = value;
    }

    /**
     * Максимальное количество выбранных файлов
     * @type {number|null}
     */
    get maxCount() {
        return this._maxCount;
    }
    set maxCount(value) {
        this._maxCount = value;
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    set tabIndex(value) {
        if (this._input) {
            this._input.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('File', 'Colibri.UI.Forms.File', 'Файл')
