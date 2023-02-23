Colibri.UI.FilesDragAndDrop = class extends Colibri.UI.Component {
    constructor(name, container, multiple = false) {
        super(name, container, Element.create('div'));
        this.AddClass('app-component-files-drag-and-drop');

        // внутренний невидимый инпут для выбора файлов из проводника по клику
        this._uniqueString = Number.unique();
        this._innerInput = Element.create('input', {type:'file', id: 'component-' + name + '-' + this._uniqueString, class: 'app-files-drag-and-drop'});
        this._element.append(this._innerInput);

        this._inputFiles = [];
        this._multiple = multiple;
        this._errorMessage = '';

        this._renderDropContainer();
        this._handleEvents();
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('InputFileChosen', false, 'Выбран файл/файлы');
    }

    _handleEvents() {
        this._innerInput.addEventListener('change', (event) => {
            this._dropContainer.Dispatch('Drop', {domEvent: event, inputFiles: this._innerInput.files});
            this._innerInput.value = '';
        });

        this._dropContainer.AddHandler('Clicked', (event, args) => { this._innerInput.click(); });
        this._dropContainer.AddHandler('DragOver', (event, args) => {
            args.domEvent.preventDefault();
            this.AddClass('-active');
        });
        this._dropContainer.AddHandler('DragLeave', (event, args) => { this.RemoveClass('-active'); });

        /* выбрать файлы в зависимости от источника, очистить выбор после вызова события  */
        this._dropContainer.AddHandler('Drop', (event, args) => {
            args.domEvent.preventDefault();
            this.RemoveClass('-active');

            let eventFiles;
            if (args.inputFiles) {
                eventFiles = args.inputFiles;
            }
            else if (args.domEvent.dataTransfer.files) {
                eventFiles = args.domEvent.dataTransfer.files;
            }
            else if (args.domEvent.dataTransfer.items) {
                eventFiles = args.domEvent.dataTransfer.items;
            }

            this._chooseFiles(eventFiles);
            this.Dispatch('InputFileChosen', {files: this._inputFiles});

            this._inputFiles = [];
        });
    }

    /**
     * Выбрать файлы
     * @param {FileList|DataTransferItemList} filesList
     * @private
     */
    _chooseFiles(filesList) {
        if (!this._multiple) { this._inputFiles = []; }

        for (let i = 0; i < filesList.length; i++) {
            let file = filesList[i];
            if (filesList[i].kind && filesList[i].kind === 'file') {
                file = filesList[i].getAsFile();
            }

            this._inputFiles.push(file);
        }
    }

    /**
     * Нарисовать drag-and-drop область
     * @private
     */
    _renderDropContainer() {
        this._dropContainer = new Colibri.UI.Pane(this._name + '-drop-container', this);
        this._titleContainer = new Colibri.UI.Pane(this._name + '-title-container', this._dropContainer);

        this._uploadIcon = new Colibri.UI.Icon(this._name + '-upload-icon', this._titleContainer);
        this._uploadIcon.value = Colibri.UI.FileLoadIcon;

        this._title = new Colibri.UI.TextSpan(this._name + '-title', this._titleContainer);
        this._setTitle();

        this._extensionsLabel = new Colibri.UI.TextSpan(this._name + '-extensions', this._titleContainer);

        this._dropContainer.shown = true;
        this._titleContainer.shown = true;
        this._uploadIcon.shown = true;
        this._title.shown = true;
        this._extensionsLabel.shown = true;
    }

    /**
     * drag-and-drop контейнер
     */
    get dropContainer() {
        return this._dropContainer;
    }

    /**
     * Лэйбл с допустимыми расширениями
     */
    get extensionsLabel() {
        return this._extensionsLabel;
    }

    /**
     * Отображаемый текст
     * @return {string}
     */
    get title() {
        return this._title.value;
    }

    /**
     * Отображаемый текст
     * @param {string} value
     */
    set title(value) {
        this._setTitle(value);
    }

    /**
     * Текст ошибки валидации
     * @param {string} value
     */
    set errorMessage(value) {
        this._errorMessage = value;
    }

    /**
     * Текст ошибки валидации
     * @return {string}
     */
    get errorMessage() {
        return this._errorMessage;
    }

    /**
     * Изменить отображаемый текст на новый, либо по умолчанию
     * @param {string} value
     * @private
     */
    _setTitle(value) {
        this._title.value = value ?? (this._multiple ? '#{ui-filesdragdrop-choosefiles}' : '#{ui-filesdragdrop-choosefile}');
    }

    /**
     * Возможность загрузить больше одного файла
     * @return {boolean}
     */
    get multiple() {
        return this._multiple;
    }

    /**
     * Возможность загрузить больше одного файла
     * @param {boolean} value
     */
    set multiple(value) {
        if (value === true || value === 'true') {
            this._innerInput.setAttribute('multiple', 'true');
            this._multiple = true;
        } else {
            this._innerInput.removeAttribute('multiple');
            this._multiple = false;
        }

        this._setTitle();
    }

    /**
     * Показать элемент (обновить отображаемый текст и отобразить все вложенные элементы)
     * @param {boolean|string} value
     */
    set shown(value) {
        super.shown = value === 'true' || value === true;

        if(super.shown) {
            if (this._errorMessage) {
                this._setTitle(this._errorMessage);
            }
            else {
                this._setTitle();
            }

            this._dropContainer.shown = true;
            this._titleContainer.shown = true;
            this._uploadIcon.shown = true;
            this._title.shown = true;
            this._extensionsLabel.shown = true;
        }
    }
}