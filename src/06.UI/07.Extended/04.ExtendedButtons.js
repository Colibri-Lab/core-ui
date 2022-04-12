Colibri.UI.SuccessButton = class extends Colibri.UI.Button {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-success-button-component');
        
        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;
    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
    }

}

Colibri.UI.ErrorButton = class extends Colibri.UI.Button {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-error-button-component');
        
        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;
    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
    }

}

Colibri.UI.GrayButton = class extends Colibri.UI.Button {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-gray-button-component');
        
        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;

    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
    }

}

Colibri.UI.SimpleButton = class extends Colibri.UI.Button {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-simple-button-component');

        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;
    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
    }

}

Colibri.UI.OutlineBlueButton = class extends Colibri.UI.Button {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-outline-blue-button-component');

        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;
    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
    }

}

Colibri.UI.UploadButton = class extends Colibri.UI.Button {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-success-button-component');
        this.AddClass('app-upload-button-component');

        this._allowSize = 900000000;
        this._allowTypes = '*';
        
        this._uniqueString = Number.unique();
        this._input = Element.create('input', {type:'file', id: 'component-' + name + '-' + this._uniqueString});
        this._element.append(this._input);
        
        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;

        this.AddHandler('Clicked', (event, args) => this.__clicked(event, args));
        this._input.addEventListener('change', (event) => {
            this._checkChoosedFiles(this._input.files);
            this._input.value = '';
        });

    }

    _registerEvents() {
        super._registerEvents();

        this.RegisterEvent('FileChoosen', false, 'Когда выбраны файлы');

    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
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
        this._input.click();
    }

    _checkChoosedFiles(files) {
        let errors = [];
        let success = [];
        for(const file of files) {
            const ext = file.name.extractExt();
            if(file.size > this._allowSize || (this._allowTypes !== '*' && this._allowTypes.indexOf(ext) === -1)) {
                errors.push({file: file, error: 'Файл слишком большой или не подходящего типа. ' + (this._allowTypes !== '*' ? 'Разрешено: ' + this._allowTypes.join(',') + ', ' : '') + 'максимум: ' + this._allowSize.toSizeString(['bytes', 'Kb', 'Mb', 'Gb'], 1024, true)});
            }
            else {
                success.push(file);
            }
        }
        this.Dispatch('FileChoosen', {errors: errors, success: success});
    }
    
    _setAccept() {
        let ret = [];
        for(const ext of this._allowTypes) {
            ret.push(Colibri.Common.MimeType.ext2type(ext));
        }    
        this._input.attr('accept', ret.join(', '));
    }

}
