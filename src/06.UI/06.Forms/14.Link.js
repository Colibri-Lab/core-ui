/**
 * Link field component
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 * @example
 * ```
 * const form = new Colibri.UI.Forms.Form('form', this);
 * form.fields = {
 *      'link': {
 *          'component': 'Link',
 *          'desc': 'Check me'
 *      }
 * };
 * form.value = {
 *      'link': 'https://example.com'
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
 *          'link': {
 *              'component': 'Link',
 *              'desc': 'Click on me'
 *          }
 *      }
 *     </fields>
 * </Forms.Form>
 * 
 * ```
 */
Colibri.UI.Forms.Link = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     * @protected
     * @ignore
     */
    RenderFieldContainer() {

        this.AddClass('app-component-link-field');

        const contentContainer = this.contentContainer;
        this._input = contentContainer.container.append(Element.create('span', {}));

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
        this._input.focus();
        this._input.select();
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        return this._input.html();
    }

    /**
     * Value
     * @type {string}
     */
    set value(value) {
        this._input.html(value);
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.attr('tabIndex');
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        this._input && this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Link', 'Colibri.UI.Forms.Link', '#{ui-fields-link}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','transformer','noteClass','validate','valuegenerator','onchangehandler'])
