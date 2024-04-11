/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Input
 */
Colibri.UI.Input.File = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.fromHtml('<button type="button"><input type="file"></input><span class="app-component-input-type-file-text"></span></button>')[0]);
        this.AddClass('app-component-input-type-file');
        this._input = this._element.querySelector('input');
        this._inputFiles = [];
        this._handleEvents();

        this._title = '';

        this._element.querySelector('.app-component-input-type-file-text').html(this.__title());
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('InputFileChanged', false, 'Изменён выбранный файл/файлы');
    }

    /** @protected */
    _handleEvents() {
        this.AddHandler('Clicked', (sender, args) => {
            this._input.click();
        });

        this._input.addEventListener('change', (event) => {
            this._inputFiles = [];
            for (let i = 0; i < this._input.files.length; ++i) {
                this._inputFiles.push(this._input.files[i]);
            }
            this._input.value = '';
            this.Dispatch('InputFileChanged', {files: this._inputFiles});
        });
    }

    /** @private */
    __title() {
        return this.multiple ? '#{ui-files-choosefiles}' : '#{ui-files-choosefile}';
    }

    /**
     * Container element
     * @type {Element}
     * @readonly
     */
    get container() {
        return this._element.querySelector('.app-component-input-type-file-text');
    }

    /**
     * Title string
     * @type {string}
     */
    get title() {
        return this._element.querySelector('.app-component-input-type-file-text').html();
    }

    /**
     * Title string
     * @type {string}
     */
    set title(value) {
        this._title = value;
        this._element.querySelector('.app-component-input-type-file-text').html(value || this.__title());
    }

    /**
     * Is multiple file can be selected
     * @type {boolean}
     */
    get multiple() {
        return this._input.getAttribute('multiple');
    }

    /**
     * Is multiple file can be selected
     * @type {boolean}
     */
    set multiple(value) {
        if (value) {
            this._input.setAttribute('multiple', 'true');
        } else {
            this._input.removeAttribute('multiple');
        }
        if(!this._title) {
            this._element.querySelector('.app-component-input-type-file-text').html(this.__title());
        }
    }

    /**
     * Get the selected files
     * @returns {Array}
     */
    Files() {
        if (this._input.hasAttribute('multiple')) {
            return this._inputFiles;
        }
        return this._inputFiles[0];

    }

    /**
     * Clears data in component, files and selection of input
     */
    ClearData() {
        this._input.value = null;
        this._inputFiles = [];
    }

}