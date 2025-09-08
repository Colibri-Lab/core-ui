/**
 * Button with upload support
 * @class
 * @extends Colibri.UI.ExtendedButton
 * @memberof Colibri.UI
 */
Colibri.UI.UploadButton = class extends Colibri.UI.ExtendedButton {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-success-button-component');
        this.AddClass('app-upload-button-component'); 

        this._allowSize = 900000000;
        this._allowTypes = '*';
        
        this._uniqueString = Number.unique();
        
        this._input = Element.create('input', {type:'file', id: 'component-' + name + '-' + this._uniqueString});
        this._element.append(this._input);

        this.AddHandler('Clicked', this.__clicked);
        this._input.addEventListener('change', (event) => {
            this._checkChoosedFiles(this._input.files);
            this._input.value = '';
            event.preventDefault();
            event.stopPropagation();
            return false;
        });

    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();

        this.RegisterEvent('Changed', false, 'Когда выбраны файлы');

    }

    /**
     * Multiple
     * @type {boolean}
     */
    set multiple(value) {
        if(value) {
            this._input.attr('multiple', 'multiple');
        }
        else {
            this._input.attr('multiple', null);
        }
    }

    /**
     * Multiple
     * @type {boolean}
     */
    get multiple() {
        return this._input.attr('multiple') === 'multiple';
    }

    /**
     * Allowed types
     * @type {Array|string}
     */
    set allowTypes(value) {
        if(typeof value === 'string') {
            value = value.split(',');
        }
        this._allowTypes = value.map(v => v.toLowerCase());
        this._setAccept();
    }

    /**
     * Allowed types
     * @type {Array|string}
     */
    get allowTypes() {
        return this._allowTypes;
    }

    /**
     * Allowed size
     * @type {number}
     */
    set allowSize(value) {
        this._allowSize = parseInt(value);
    }

    /**
     * Allowed size
     * @type {number}
     */
    get allowSize() {
        return this._allowSize;
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __clicked(event, args) {
        this.ClickOnButton();
    }

    _loadOnDevice() {
        return new Promise((resolve, reject) => {
            const errorHandler = (error) => {
                reject();
            };
            window.fileChooser.open((uri) => {
                window.resolveLocalFileSystemURL(uri, (fileEntry) => {
                    fileEntry.file((file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const blob = new Blob([new Uint8Array(reader.result)], { type: file.type });
                            resolve({errors: [], success: [blob]});
                        };
                        reader.readAsArrayBuffer(file);
                    }, errorHandler);
                }, errorHandler);    
            }, errorHandler);
        });
    }
    
    /**
     * Perform click on button
     */
    ClickOnButton() {
        if(App.Device.isWeb || App.Device.isElectron) {
            this._input.click();
        } else if (App.Device.isAndroid || App.Device.isAndroid) {
            this._loadOnDevice().then((result) => {
                this.Dispatch('Changed', result);
            });
        }
    }

    /** @private */
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
    
    /** @private */
    _setAccept() {
        let ret = [];
        for(const ext of this._allowTypes) {
            ret.push(Colibri.Common.MimeType.ext2type(ext));
        }    
        this._input.attr('accept', ret.join(', '));
    }

}

