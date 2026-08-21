/**
 * TextArea field component
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 * @example
 * @example
 * ```
 * const form = new Colibri.UI.Forms.Form('form', this);
 * form.fields = {
 *      'name': {
 *          'component': 'TextArea',
 *          'desc': 'Name',
 *          'default': 'John Doe'
 *      }
 * };
 * form.value = {
 *      'name': 'Jane Doe'
 * };
 * form.AddHandler('Changed', (event, args) => {
 *      console.log('Form changed', form.value);
 * });
 * 
 * in html template
 * 
 * <Forms.Form name="form" fields="fields" value="value">
 *     <fields>
 *      {
 *          'name': {
 *              'component': 'TextArea',
 *              'desc': 'Name',
 *              'default': 'John Doe'
 *          }
 *      }
 *     </fields>
 * </Forms.Form>
 * 
 * ```
 */
Colibri.UI.Forms.TextArea = class extends Colibri.UI.Forms.Field {
    
    /**
     * Render field component 
     * @protected
     * @ignore
     */
    RenderFieldContainer() {

        this.AddClass('app-component-textarea-field');
        this._original = null;

        const contentContainer = this.contentContainer;

        const params = {name: (this.form && this.form.shuffleFieldNames ? 'field-' + Date.Mc() : this._name + '-input')};
        if(this.form && this.form.shuffleFieldNames) {
            params.autocomplete = 'off';
        }
        this._input = contentContainer.container.append(Element.create('textarea', params));

        this.maxlength = this._fieldData?.params?.maxlength ?? null;
        this.value = this._fieldData?.default ?? '';
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
        if(this._fieldData?.params?.resize === undefined) {
            this.resize = 'vertical';
        } else {
            this.resize = this._fieldData?.params?.resize;
        }

        this._input.addEventListener('focus', (e) => this.Dispatch('ReceiveFocus', {domEvent: e}));
        this._input.addEventListener('blur', (e) => this.Dispatch('LoosedFocus', {domEvent: e}));
        this._input.addEventListener('change', (e) => {
            if(this._original != this._input.value) {
                this.Dispatch('Changed', {domEvent: e, component: this, original: this._original});
            }
            this._original = this._input.value;
        });
        this._input.addEventListener('keyup', (e) => {
            this.Dispatch('KeyUp', {domEvent: e});
            if( (this._fieldData?.params?.changeOnKeyPress ?? false) ) {
                if(this._keyUpChangeTimer !== -1) {
                    clearTimeout(this._keyUpChangeTimer);
                }
                this._keyUpChangeTimer = setTimeout(() => {
                    this._input.emitHtmlEvents('change');
                }, 500);
            }
        });
        this._input.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));
        this._input.addEventListener('click', (e) => {
            this.Focus();
            this.Dispatch('Clicked', {domEvent: e});
            e.stopPropagation();
            return false;
        });
        this._input.addEventListener('paste', (e) => {
            Colibri.Common.Delay(100).then(() => {
                this._input.emitHtmlEvents('change');
                this._original = this._input.value;
                this.Dispatch('Pasted', { domEvent: e });
            });
            e.stopPropagation();
            return false;
        });
        
    }

    /**
     * @ignore 
     * @protected 
     */
    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    /**
     * Focus on field
     * @public
     */
    Focus() {
        this._input.focus();
        //this._input.select();
    }

    /**
     * Is field readonly
     * @type {boolean}
     */
    get readonly() {
        return this._input.attr('readonly') === 'readonly';
    }

    /**
     * Is field readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this._input.attr('readonly', 'readonly');
        }
        else {
            this._input.attr('readonly', null);
        }
    }

    /**
     * Input placeholder
     * @type {string}
     */
    get placeholder() {
        return this._input.attr('placeholder');
    }

    /**
     * Input placeholder
     * @type {string}
     */
    set placeholder(value) {
        value = this._convertProperty('String', value);
        this._input.attr('placeholder', value);
    }

    /**
     * Value of field
     * @type {string}
     */
    get value() {
        let value = this._input.value;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if(this._fieldData?.params?.eval) {
            value = eval(this._fieldData?.params?.eval);
        }        
        return value;
    }

    /**
     * Value of field
     * @type {string}
     */
    set value(value) {
        this._original = value;
        this._input.value = value ?? '';
    }

    /**
     * Maximum length of field
     * @type {Number}
     */
    set maxlength(value) {
        value = this._convertProperty('Number', value);
        this._input.attr('maxlength', value);
    }

    /**
     * Maximum length of field
     * @type {Number}
     */
    get maxlength() {
        return this._input.attr('maxlength');
    }

    /**
     * Is field enabled
     * @type {boolean}
     */
    get enabled() {
        return this._input.attr('disabled') != 'disabled';
    }

    /**
     * Is field enabled
     * @type {boolean}
     */
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        if(value) {
            this.RemoveClass('app-component-disabled');
            this._input.attr('disabled', null);
        }
        else {
            this.AddClass('app-component-disabled');
            this._input.attr('disabled', 'disabled');
        }
    }

    /**
     * Tab index of the field
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.attr('tabIndex');
    }
    /**
     * Tab index of the field
     * @type {number}
     */
    set tabIndex(value) {
        this._input && this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }

    /**
     * Can resize textarea
     * @type {none,vertical,horizontal,both}
     */
    get resize() {
        return this._input.css('resize');
    }
    /**
     * Can resize textarea
     * @type {none,vertical,horizontal,both}
     */
    set resize(value) {
        this._input.css('resize', value);
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('TextArea', 'Colibri.UI.Forms.TextArea', '#{ui-fields-textarea}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','transformer','noteClass','validate','valuegenerator','onchangehandler']);
