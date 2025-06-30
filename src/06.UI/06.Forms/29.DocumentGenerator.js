/**
 * Document generator field
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.DocumentGenerator = class extends Colibri.UI.Forms.Field {
    
    /**
     * Render field component
     */
    RenderFieldContainer() {
        this.AddClass('app-component-documentgenerator-field');

        
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

        this._generatorOptions = Object.assign({changeOnDownload: false, changeOnGenerate: true}, this._fieldData?.params?.documentGenerator ?? {});
        
        this._loadingFlexBox = new Colibri.UI.FlexBox('loading-flex', this.contentContainer);
        this._loading = new Colibri.UI.Loading('loading', this._loadingFlexBox);
        this._loadingText = new Colibri.UI.TextSpan('loading-textspan', this._loadingFlexBox);

        this._generatedFlexBox = new Colibri.UI.FlexBox('generated-flex', this.contentContainer);
        this._generatedFileIcon = new Colibri.UI.Icon('generated-icon', this._generatedFlexBox);
        this._generatedFileLink = new Colibri.UI.Link('generated', this._generatedFlexBox);
        this._generatedFileLink.value = this._generatorOptions.fileLinkText;

        this._loadingFlexBox.shown = true;
        this._loading.shown = this._loadingText.shown = true;
        this._generatedFlexBox.shown = false;
        this._generatedFileIcon.shown = this._generatedFileLink.shown = true;

        this._note = new Colibri.UI.Pane('note', this.contentContainer);
        this._note.shown = false;
        this._note.value = this._generatorOptions.note;

        this._generatedFileLink.AddHandler('Clicked', this.__generatedFileLinkClicked, false, this);

    }

    /**
     * @private
     * 
     */
    __generatedFileLinkClicked(event, args) {
        const module = typeof this._generatorOptions.fileLink.module === 'string' ? eval(this._generatorOptions.fileLink.module) : this._generatorOptions.fileLink.module;
        module.Call(
            this._generatorOptions.fileLink.controller, 
            this._generatorOptions.fileLink.method, 
            Object.assign({}, this._generatorOptions.fileLink.params, {guid: this._value.guid, _requestType: 'stream'})
        ).then((response) => {
            DownloadFile(response.result.content, response.result.name, response.result.mimetype, true);    
            if(this._generatorOptions.changeOnDownload) {
                this.Dispatch('Changed', {component: this});
            }
        });
    }

    _startGeneratedProcess() {
        
        const gen = this._generatorOptions.method;
        gen(this).then((fileStat) => {
            this.value = fileStat;
            if(this._generatorOptions.changeOnGenerate) {
                this.Dispatch('Changed', {component: this});
            }
        });
    }

    /**
     * Value Object
     * @type {Object}
     */
    get value() {
        return this._value;
    }
    /**
     * Value Object
     * @type {Object}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        if(this._value === null || !this._value?.guid) {
            this._loadingFlexBox.shown = true;
            this._generatedFlexBox.shown = false;
            this._note.shown = false;
            this._startGeneratedProcess();
        } else {
            this._loadingFlexBox.shown = false;
            this._generatedFlexBox.shown = true;
            this._generatedFileIcon.iconSVG = this._generatorOptions.fileIcon;
            this._note.shown = true;
            
        }
    }

}

Colibri.UI.Forms.Field.RegisterFieldComponent('DocumentGenerator', 'Colibri.UI.Forms.DocumentGenerator', '#{ui-fields-documentgenerator}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler'])
