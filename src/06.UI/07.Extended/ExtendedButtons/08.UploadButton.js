

/**
 * Button with upload support
 */
Colibri.UI.UploadButton = class extends Colibri.UI.ExtendedButton {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-success-button-component');
        this.AddClass('app-upload-button-component'); 

        this._allowSize = 900000000;
        this._allowTypes = '*';
        
        this._uniqueString = Number.unique();
        this._input = Element.create('input', {type:'file', id: 'component-' + name + '-' + this._uniqueString});
        this._element.append(this._input);

        this.AddHandler('Clicked', (event, args) => this.__clicked(event, args));
        this._input.addEventListener('change', (event) => {
            this._checkChoosedFiles(this._input.files);
            this._input.value = '';
            event.preventDefault();
            event.stopPropagation();
            return false;
        });

    }

    _registerEvents() {
        super._registerEvents();

        this.RegisterEvent('Changed', false, 'Когда выбраны файлы');

    }

    set multiple(value) {
        if(value) {
            this._input.attr('multiple', 'multiple');
        }
        else {
            this._input.attr('multiple', null);
        }
    }

    get multiple() {
        return this._input.attr('multiple') === 'multiple';
    }

    set allowTypes(value) {
        if(typeof value === 'string') {
            value = value.split(',');
        }
        this._allowTypes = value;
        this._setAccept();
    }

    get allowTypes() {
        return this._allowTypes;
    }

    set allowSize(value) {
        this._allowSize = parseInt(value);
    }

    get allowSize() {
        return this._allowSize;
    }

    __clicked(event, args) {
        this.ClickOnButton();
    }
    
    ClickOnButton() {
        this._input.click();
    }

    _checkChoosedFiles(files) {
        let errors = [];
        let success = [];
        for(const file of files) {
            const ext = file.name.extractExt();
            if(file.size > this._allowSize || (this._allowTypes !== '*' && this._allowTypes.indexOf(ext) === -1)) {
                errors.push({file: file, error: '#{ui-uploadbutton-error1} ' + (this._allowTypes !== '*' ? '#{ui-uploadbutton-allow}'.replaceAll('%s', this._allowTypes.join(',')) + ', ' : '') + '#{ui-uploadbutton-max}'.replaceAll('%s', this._allowSize.toSizeString(['bytes', 'Kb', 'Mb', 'Gb'], 1024, true))});
            }
            else {
                success.push(file);
            }
        }
        this.Dispatch('Changed', {errors: errors, success: success});
    }
    
    _setAccept() {
        let ret = [];
        for(const ext of this._allowTypes) {
            ret.push(Colibri.Common.MimeType.ext2type(ext));
        }    
        this._input.attr('accept', ret.join(', '));
    }

}

