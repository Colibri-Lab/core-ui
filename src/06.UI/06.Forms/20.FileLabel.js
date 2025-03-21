/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.FileLabel = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-filelabel-field');

        const contentContainer = this.contentContainer;
        this._input = contentContainer.container.append(Element.create('div', {}));
        this._placeholder = this._input.append(Element.create('span', {}));
        this._link = this._input.append(Element.create('a', {'href': '#'}));

        this._value = null;
        this.placeholder = this._fieldData.placeholder;
        this._link.html(this._fieldData?.button || '#{ui-filelabel-download}');

        
        this._link.addEventListener('click', (e) => {
            if(this._fieldData?.params?.download) {
                window.open((window.rpchandler ?? '') + this._fieldData?.params?.download + '?guid=' + this.value);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        });


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

    }

    /**
     * Focus on component
     */
    Focus() {
        this._input.focus();
        this._input.select();
    }

    /**
     * Value
     * @type {File|object|string}
     */
    get value() {
        return this._value;
    }

    /**
     * Value
     * @type {File|object|string}
     */
    set value(value) {
        this._value = value;
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return null;
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        // do nothing
    }

    /**
     * Placeholder text
     * @type {string}
     */
    get placeholder() {
        return this._placeholder.html();
    }

    /**
     * Placeholder text
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._placeholder.html(value);
    }
    

}
Colibri.UI.Forms.Field.RegisterFieldComponent('FileLabel', 'Colibri.UI.Forms.FileLabel', '#{ui-fields-filelabel}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler'])
