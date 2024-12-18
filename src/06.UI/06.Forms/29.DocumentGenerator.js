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
        this.AddClass('colibri-ui-forms-documentgenerator');

        
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

        this._generatorOptions = this._fieldData?.params?.documentGenerator ?? {};
        
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

        this._generatedFileLink.AddHandler('Clicked', (event, args) => this.__generatedFileLinkClicked(event, args));

    }

    /**
     * @private
     * 
     */
    __generatedFileLinkClicked(event, args) {
        Colibri.IO.Request.Post(this._generatorOptions.fileLink, {guid: this._value.guid}).then((result) => {
            console.log(result);
        });
    }

    _startGeneratedProcess() {
        console.log(this._generatorOptions);
        
        const gen = this._generatorOptions.method;
        gen(this).then((result) => {

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
            this._startGeneratedProcess();
        } else {
            this._loadingFlexBox.shown = false;
            this._generatedFlexBox.shown = true;
            this._generatedFileIcon.iconSVG = this._generatorOptions.fileIcon;
            
        }
    }

}

Colibri.UI.Forms.Field.RegisterFieldComponent('DocumentGenerator', 'Colibri.UI.Forms.DocumentGenerator', '#{ui-fields-documentgenerator}')
