Colibri.UI.Input.File = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<button type="button"><input type="file"></input><span class="app-component-input-type-file-text"></span></button>');
        this.AddClass('app-component-input-type-file');
        this._input = this._element.querySelector('input');
        this._inputFiles = [];
        this._handleEvents();

        this._title = '';

        this._element.querySelector('.app-component-input-type-file-text').html(this.multiple ? '#{app-files-choosefiles;Выбрать файлы}' : '#{app-files-choosefile;Выбрать файл}');
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('InputFileChanged', false, 'Изменён выбранный файл/файлы');
    }

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

    get container() {
        return this._element.querySelector('.app-component-input-type-file-text');
    }

    get title() {
        return this._element.querySelector('.app-component-input-type-file-text').html();
    }

    set title(value) {
        this._title = value;
        this._element.querySelector('.app-component-input-type-file-text').html(value || (this.multiple ? '#{app-files-choosefiles;Выбрать файлы}' : '#{app-files-choosefile;Выбрать файл}'));
    }

    get multiple() {
        return this._input.getAttribute('multiple');
    }

    set multiple(value) {
        if (value) {
            this._input.setAttribute('multiple', 'true');
        } else {
            this._input.removeAttribute('multiple');
        }
        if(!this._title) {
            this._element.querySelector('.app-component-input-type-file-text').html(this.multiple ? '#{app-files-choosefiles;Выбрать файлы}' : '#{app-files-choosefile;Выбрать файл}');
        }
    }

    Files() {
        if (this._input.hasAttribute('multiple')) {
            return this._inputFiles;
        }
        return this._inputFiles[0];

    }

    ClearData() {
        this._input.value = null;
        this._inputFiles = [];
    }

}