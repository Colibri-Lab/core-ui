Colibri.UI.FilesEditor = class extends Colibri.UI.Editor {
    
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-files-editor-component');

        this._value = null;

        this._maxCount = null;
        this._allowedExtensions = null;
        this._maxFileSize = null;

        this._files = new Colibri.UI.List('files-list', this);
        this._filesGroup = this._files.AddGroup('group', '');
        this._files.__renderItemContent = (itemData, container) => {

            const icon = new Colibri.UI.Icon('icon', container);
            const filename = new Colibri.UI.TextSpan('span', container);
            let sign = null;
            if(this._fieldData?.params?.canbesigned && itemData.title.indexOf('-signed') === -1) {
                sign = new Colibri.UI.TextSpan('sign', container);
                sign.value = 'Подписать';
            }
            const deleteIcon = new Colibri.UI.TextSpan('delete', container);
            icon.shown = filename.shown = deleteIcon.shown = true;
            if(sign) {
                sign.shown = true;
            }
            icon.value = Colibri.UI.FileLinkIcon;
            deleteIcon.value = Colibri.UI.ClearIcon;
            deleteIcon.AddHandler('Clicked', (event, args) => {
                event.sender.parent.Dispose();
                if(this._filesGroup.children == 0) {
                    this._files.shown = false;
                }
                this.Dispatch('Changed');
            });
            sign && sign.AddHandler('Clicked', (event, args) => {
                const component = eval(this._fieldData?.params?.sign_component);
                component.Show(itemData.file, (signedFile) => {
                    const idata = container.value;
                    idata.file = signedFile;
                    idata.title = signedFile.name;
                    container.value = idata;
                });
                args.domEvent?.stopPropagation();
                return false;
            });

            filename.value = itemData.title;

        }
        this._input = new Colibri.UI.Input.File('input', this);
        this._input.shown = true;
        this._input.multiple = true;

        this._input.AddHandler('InputFileChanged', (event, args) => {

            let validatedFiles = this._validate(this._input.Files());

            this._files.shown = true;
            validatedFiles.forEach((file) => {
                const item = {title: file.name, file: file};
                this._filesGroup.AddItem(item);    
            });

            
            if (!this._validated) {
                this._showError();
            }

            this.Dispatch('Changed');
        });

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Когда файлы выбраны');
    }

    
    /**
     * Валидация выбранного списка файлов
     * @param {array} filesList
     * @return {array} список файлов, прошедших проверку
     * @private
     */
    _validate(filesList) {
        let error = false;
        let validatedList = filesList;

        if (this._maxCount) {
            if ((this.value.length + filesList.length) > this._maxCount) {
                error = true;
                this._validated = false;

                let countAvailable = this._maxCount - this.value.length;
                validatedList.splice(countAvailable);
                this._errorMessages.push('#{ui-editors-files-message}'.replaceAll('%s', this._maxCount));
            }
        }

        if (this._maxFileSize) {
            validatedList.forEach((file, index) => {
                if (file.size > this._maxFileSize) {
                    error = true;
                    this._validated = false;

                    validatedList.splice(index, 1);
                    this._errorMessages.push('#{ui-editors-files-message3}'.replaceAll('%s', file.name));
                }
            });
        }

        if (this._allowedExtensions) {
            let extensions = this._allowedExtensions.map((item) => item.toLowerCase());

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
                    this._errorMessages.push('#{ui-editors-files-message5} ' + fileName);
                }
            });
        }

        if (!error) {
            this._errorMessages = [];
            this._validated = true;
        }

        return validatedList;
    }

    /**
     * Показать ошибки валидации
     * @private
     */
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

    
    Validate() {
        
    }

    get value() {
        let ret = [];
        this._filesGroup.ForEach((name, item) => {
            ret.push(item.value.file);
        })
        return ret;
    }

    set value(value) {
        this._filesGroup.Clear();
        value && value.forEach((file) => {
            const item = {title: file.name, file: file};
            this._filesGroup.AddItem(item);
        });
        
        if(value && value.length > 0) {
            this._setFilled();
        } else {
            this._unsetFilled();
        }

    }
    
    
    set field(value) {
        this._fieldData = value;

        if (this._fieldData?.params && this._fieldData?.params.allow) {
            this._allowedExtensions = this._fieldData.params.allow.exts ?? null;
            this._maxFileSize = this._fieldData.params.allow.size ?? null;
            this._maxCount = this._fieldData.params.allow.count ?? null;
        }

    }

    get field() {
        return this._fieldData;
    }

}