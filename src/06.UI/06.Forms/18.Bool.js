/**
 * Bool field component
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 * @example
 * ```
 * const form = new Colibri.UI.Forms.Form('form', this);
 * form.fields = {
 *      'bool': {
 *          'component': 'Bool',
 *          'desc': 'Check me',
 *          'default': ''
 *      }
 * };
 * form.value = {
 *      'bool': true
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
 *          'bool': {
 *              'component': 'Bool',
 *              'desc': 'Check me',
 *              'default': ''
 *          }
 *      }
 *     </fields>
 * </Forms.Form>
 * 
 * ```
 */
Colibri.UI.Forms.Bool = class extends Colibri.UI.Forms.Checkbox {

    /**
     * Render field component
     * @protected
     * @ignore
     */
    RenderFieldContainer() {
        if(!this._fieldData.placeholder && this._fieldData.desc) {
            this._fieldData.placeholder = this._fieldData.desc;
            delete this._fieldData.desc;
        }
        super.RenderFieldContainer();
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Bool', 'Colibri.UI.Forms.Bool', '#{ui-fields-bool}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','transformer','noteClass','validate','valuegenerator','onchangehandler']);