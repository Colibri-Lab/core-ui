/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.FilesDragAndDrop = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {boolean} multiple can drop multiple files
     */    
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

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('InputFileChosen', false, 'Выбран файл/файлы');
    }

    /** @protected */
    _handleEvents() {
        this._innerInput.addEventListener('change', (event) => {
            this._dropContainer.Dispatch('Drop', {domEvent: event, inputFiles: this._innerInput.files});
            this._innerInput.value = '';
        });

        this._dropContainer.AddHandler('Clicked', this.__dropContainerClicked, false, this);
        this._dropContainer.AddHandler('DragOver', this.__dropContainerDragOver, false, this);
        this._dropContainer.AddHandler('DragLeave', this.__dropContainerDragLeave, false, this);

        /* выбрать файлы в зависимости от источника, очистить выбор после вызова события  */
        this._dropContainer.AddHandler('Drop', this.__dropContainerDrop, false, this);
    }


    __dropContainerClicked(event, args) { 
        this._innerInput.click(); 
    }
    __dropContainerDragOver(event, args){
        args.domEvent.preventDefault();
        this.AddClass('-active');
    }
    __dropContainerDragLeave(event, args) { 
        this.RemoveClass('-active'); 
    }

    /* выбрать файлы в зависимости от источника, очистить выбор после вызова события  */
    __dropContainerDrop(event, args) {
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
    }

    /**
     * Choose file
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
     * Render drop container
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
     * Drop container
     * @type {Element}
     */
    get dropContainer() {
        return this._dropContainer;
    }

    /**
     * Label
     * @type {string}
     */
    get extensionsLabel() {
        return this._extensionsLabel;
    }

    /**
     * Title text
     * @type {string}
     */
    get title() {
        return this._title.value;
    }

    /**
     * Title text
     * @type {string}
     */
    set title(value) {
        this._setTitle(value);
    }

    /**
     * Error text
     * @type {string}
     */
    set errorMessage(value) {
        this._errorMessage = value;
    }

    /**
     * Error text
     * @type {string}
     */
    get errorMessage() {
        return this._errorMessage;
    }

    /** @private */
    _setTitle(value) {
        this._title.value = value ?? (this._multiple ? '#{ui-filesdragdrop-choosefiles}' : '#{ui-filesdragdrop-choosefile}');
    }

    /**
     * Multiple file selection mode
     * @type {boolean}
     */
    get multiple() {
        return this._multiple;
    }

    /**
     * Multiple file selection mode
     * @type {boolean}
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
     * Show/Hide component
     * @type {boolean}
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
    /**
     * Show/Hide component
     * @type {boolean}
     */
    get shown() {
        return super.shown;
    }
}