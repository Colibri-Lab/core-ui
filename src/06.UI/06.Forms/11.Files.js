/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Files = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-files-field');

        this._maxCount = null;
        this._allowedExtensions = null;
        this._maxFileSize = null;

        if(!Array.isArray(this._fieldData.params.allow)) {
            this._fieldData.params.allow = this._fieldData.params.allow.split(',');
        }
        
        if(typeof this._fieldData.params.size === 'string') {
            this._fieldData.params.size = parseInt(this._fieldData.params.size);
        }
        
        this._allowedExtensions = this._fieldData.params.allow ?? null;
        this._maxFileSize = this._fieldData.params.size ?? null;
        this._maxCount = this._fieldData.params.maxadd ?? null;

        this._validated = false;
        this._errorMessages = [];

        this._dropAreaEnabled = false;
        if (this._fieldData.params && this._fieldData.params.droparea) {
            this._dropAreaEnabled = this._fieldData.params.droparea;
        }

        if (this._fieldData.params && this._fieldData.params.reverse) {
            this.AddClass('-reverse');
        }
        else {
            this.RemoveClass('-reverse');
        }

        this._renderFilesList();
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

    /** @protected */
    _handleEvents() {

        this._files.AddHandler('ItemClicked', (event, args) => this._itemClicked(args.item.value));

        if (this.dropAreaEnabled) {
            /* Валидация выбранных файлов, отображение файлов, прошедших проверку, вывод ошибок */
            this._input.AddHandler('InputFileChosen', (event, args) => {
                if (args.files) {
                    let validatedFiles = this._validate(args.files);

                    if (validatedFiles.length > 0) {
                        this._addValue(validatedFiles);
                        this._clearInput();

                        if (this._fieldData.params && this._fieldData.params.more) {
                            this._input.title = this._fieldData.params.more;
                            this._input.AddClass('-full');
                        }
                    }

                    if (!this._validated) {
                        this._showError();
                    }
                    this.Dispatch('Changed', Object.assign(args, {component: this}));
                }
            });
        }
        else {

            this._input.AddHandler('InputFileChanged', (event, args) => {
                this._files.shown = true;
                this.lastValue = this.value;
                let validatedFiles = this._validate(this._input.Files());
                this._addValue(validatedFiles);

                if (this._fieldData.params && this._fieldData.params.more) {
                    this._input.title = this._fieldData.params.more;
                    this._input.AddClass('-full');
                }

                this.Dispatch('Changed', Object.assign(args, {component: this}));

            });
        }
    }

    /** @private */
    _renderFilesList() {
        this._files = new Colibri.UI.List('list', this.contentContainer);
        this._filesGroup = this._files.AddGroup('group', '');
        this._files.__renderItemContent = (itemData, container) => {
            const picture = new Colibri.UI.Image('picture', container);
            const icon = new Colibri.UI.Icon('icon', container);
            const filename = new Colibri.UI.TextSpan('span', container);
            let sign = null;
            if (this._fieldData?.params?.canbesigned) {
                sign = new Colibri.UI.TextSpan('sign', container);
            }
            const size = new Colibri.UI.TextSpan('size', container);
            size.shown = true;
            size.value = itemData.file.size.toSizeString(['bytes', 'Kb', 'Mb', 'Gb'], 1024);
            const deleteIcon = new Colibri.UI.TextSpan('delete', container);

            filename.AddClass('files-file-name');
            if ((itemData.file?.type ?? itemData.file?.mimetype)?.match('image.*') ?? false) {
                picture.shown = filename.shown = deleteIcon.shown = true;
                picture.image = itemData.file;
                picture.width = picture.height = 40;
                
            } else {
                icon.shown = filename.shown = deleteIcon.shown = true;
                icon.value = Colibri.UI.FileLinkIcon;
                deleteIcon.value = Colibri.UI.ClearIcon;
            }

            if (sign) {
                sign.shown = true;
            }

            deleteIcon.value = Colibri.UI.ClearIcon;

            if (sign) {
                sign.value = '#{ui-files-sign}';
            }

            deleteIcon.AddHandler('Clicked', (event, args) => {
                const value = this.value,
                    delParams = this._delDialog,
                    delAction = () => {
                        this.lastValue = value;
                        args.removed = itemData.file || null;
                        event.sender.parent.Dispose();
                        if (this._filesGroup.children == 0) {
                            this._files.shown = false;
                            if (this._fieldData.params && this._fieldData.params.button) {
                                this._input.title = this._fieldData.params.button;
                                this._input.RemoveClass('-full');
                            }
                        }
                        this.Dispatch('Changed', Object.assign(args, {component: this}));
                    };

                if (delParams) {
                    const dialog = new Colibri.UI.ConfirmDialog(this.name + '-confirm-delete-dialog', document.body);
                    dialog.Show(delParams.title, delParams.message.replace(/{([^{}]+)}/g, (keyExpr, key) => {
                        return itemData.file[key] || "";
                    }), delParams.button ?? 'Удалить', (result) => {
                        if (result === true) {
                            delAction.call(this);
                        }
                    });
                } else {
                    delAction.call(this);
                }

                args.domEvent?.stopPropagation();
                return false;
            })

            sign && sign.AddHandler('Clicked', (event, args) => {

                const component = eval(this._fieldData?.params?.sign_component);
                component.Show(itemData.file, (signedFile) => {
                    container.value.file = signedFile;
                    container.value.title = signedFile.name;
                    sign.value = 'Файл подписан';
                    sign.shown = false;
                    filename.value = signedFile.name;
                });

                args.domEvent?.stopPropagation();
                return false;
            });
            filename.value = itemData.title;
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
        }

        this._input.shown = true;
        this._input.multiple = true;
        if (this._fieldData.params?.button) {
            this._input.title = this._fieldData.params.button;
        }
        this._delDialog = this._fieldData.params?.deletedialog ?? false;
    }

    /** @private */
    _clearInput() {
        if (this._dropAreaEnabled) {
            this._input.errorMessages = [];
            this._input.shown = true;
        }
    }

    /** @private */
    _showError() {
        this._errorMessages.forEach((message) => {
            App.Notices.Add({
                severity: 'error',
                title: message,
                timeout: 5000
            });
        });

        this._errorMessages = [];
    }

    /** @private */
    _extensionsToString() {
        let extensionsString = [];

        if (Array.isArray(this._allowedExtensions)) {
            let extensions = this._allowedExtensions.map((item) => String(item).toUpperCase());
            extensionsString.push(extensions.join(', '));
        }

        if (this._maxCount) {
            extensionsString.push('#{ui-files-filescount}'.replaceAll('%s', this._maxCount));
        }

        if (this._maxFileSize) {
            extensionsString.push('#{ui-files-size}'.replaceAll('%s', (this._maxFileSize + 0).toSizeString(['байт', 'Кб', 'Мб'], 1024, true)));
        }


        return extensionsString.join(' ');
    }

    /** @private */
    _validate(filesList) {
        let error = false;
        let validatedList = filesList;

        if (this._maxCount) {
            if ((this._getValue().length + filesList.length) > this._maxCount) {
                error = true;
                this._validated = false;

                let countAvailable = this._maxCount - this._getValue().length;
                validatedList.splice(countAvailable);
                this._errorMessages.push('#{ui-files-filescount2}'.replaceAll('%s', this._maxCount));
            }
        }

        if (this._maxFileSize) {
            validatedList.forEach((file, index) => {
                if (file.size > this._maxFileSize) {
                    error = true;
                    this._validated = false;

                    validatedList.splice(index, 1);
                    this._errorMessages.push('#{ui-files-filehuge}'.replaceAll('%s', file.name));
                }
            });
        }
        debugger;
        this._allowedExtensions = this._allowedExtensions.filter(v => !!v);
        if (this._allowedExtensions && 
            (Array.isArray(this._allowedExtensions) ? 
                (this._allowedExtensions.includes('*') || this._allowedExtensions.includes('*.*')) : 
                (this._allowedExtensions != '*' && this._allowedExtensions != '*.*'))
        ) {
            let extensions = this._allowedExtensions.map((item) => item.toLowerCase());
            if(!(extensions.includes('*') || extensions.includes('*.*'))) {
                filesList.forEach((file, index) => {
                    let fileName = file.name;
                    let ext = '';
    
                    if (fileName.includes('.')) {
                        ext = fileName.substring(fileName.lastIndexOf('.') + 1);
                        ext = ext.toLowerCase();
                    }
    
                    if (!extensions.includes(ext)) {
                        error = true;
                        this._validated = false;
    
                        validatedList.splice(index, 1);
                        this._errorMessages.push('#{ui-files-format} ' + fileName);
                    }
                });    
            }
        }

        if (!error) {
            this._errorMessages = [];
            this._validated = true;
        }

        return validatedList;
    }

    /** @private */
    _itemClicked(value) {
        if (value.file instanceof File) {
            value.file.download();
        }
        else if (this._fieldData.params?.download && value.file?.guid) {
            window.open((window.rpchandler ?? '') + this._fieldData.params.download + '?guid=' + value.file.guid);
        }
    }

    /**
     * Rollback to the last selection
     */
    Rollback() {
        if (this.lastValue !== undefined) {
            this._filesGroup.Clear();
            this.value = this.lastValue;
            if (this._filesGroup.children && !(this._filesGroup.Children('lastChild').value instanceof File)) {
                this._input._input.value = null;
                this._input._inputFiles.pop();
            }
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
     * Value array
     * @type {File[]}
     */
    get value() {
        return this._getValue();
    }
    /**
     * Value array
     * @type {File[]}
     */
    set value(value) {
        this._setValue(value);
    }

    /** @private */
    _getValue() {
        let ret = [];
        this._filesGroup.ForEach((name, item) => {
            ret.push(item.value.file);
        })
        return ret;
    }
    /** @private */
    _setValue(value) {
        if(Array.isArray(value)) {
            this._filesGroup.value = [];
            for(const file of value) {
                this._filesGroup.AddItem({title: file.name, file: file});
            }            
        } else if( !value) {
            this._filesGroup.value = [];
        } else {
            this._filesGroup.AddItem({title: value.name, file: value});
        }
        
        this._files.shown = this._filesGroup.value.length > 0;

    }
    /** @private */
    _addValue(value) {
        if(Array.isArray(value)) {
            for(const file of value) {
                this._filesGroup.AddItem({title: file.name, file: file});
            }            
        } else {
            this._filesGroup.AddItem({title: value.name, file: value});
        }
        this._files.shown = true;
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
        if (this._dropAreaEnabled) { this._input.extensionsLabel.value = this._extensionsToString(); }
    }

    /**
     * Maximum file size
     * @type {number|null}
     */
    get maxFileSize() {
        return this._maxFileSize;
    }
    /**
     * Maximum file size
     * @type {number|null}
     */
    set maxFileSize(value) {
        value = this._convertProperty('Number', value);
        this._maxFileSize = value;
    }

    /**
     * Max files
     * @type {number|null}
     */
    get maxCount() {
        return this._maxCount;
    }
    /**
     * Max files
     * @type {number|null}
     */
    set maxCount(value) {
        value = this._convertProperty('Number', value);
        this._maxCount = value;
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    } 
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        if (this._input) {
            this._input.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Files', 'Colibri.UI.Forms.Files', '#{ui-fields-files}')
