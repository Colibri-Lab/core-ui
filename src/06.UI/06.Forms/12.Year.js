/**
 * Year field component
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 * @example
 * ```
 * const form = new Colibri.UI.Forms.Form('form', this);
 * form.fields = {
 *      'year': {
 *          'component': 'Year',
 *          'desc': 'Check me',
 *          'default': 2000
 *      }
 * };
 * form.value = {
 *      'year': 2000
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
 *          'year': {
 *              'component': 'Year',
 *              'desc': 'Enter the year',
 *              'default': 2000
 *          }
 *      }
 *     </fields>
 * </Forms.Form>
 * 
 * ```
 */
Colibri.UI.Forms.Year = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     * @protected
     * @ignore
     */
    RenderFieldContainer() {

        this.AddClass('app-component-year-field');

        const contentContainer = this.contentContainer;
        this._input = new Colibri.UI.YearSelector('selector', contentContainer, 2000, Date.Now().getFullYear());
        this._input.shown = true;

        this._input.AddHandler('Changed', this.__thisBubbleWithComponent, false, this);
        this._input.AddHandler('KeyUp', this.__thisBubble, false, this);
        this._input.AddHandler('KeyDown', this.__thisBubble, false, this);

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
     * @public
     */
    Focus() {
        this._input.Focus();
    }

    /**
     * Value
     * @type {number}
     */
    get value() {
        return this._input.value.value;
    }

    /**
     * Value
     * @type {number}
     */
    set value(value) {
        this._input.value = value;
    }

    /**
     * Get value title
     * @returns {string}
     */
    getValueTitle() {
        return this._input.value.title;
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        if (this._input) {
            this._input.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }
}

Colibri.UI.Forms.Field.RegisterFieldComponent('Year', 'Colibri.UI.Forms.Year', '#{ui-fields-year}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','transformer','noteClass','validate','valuegenerator','onchangehandler'])
