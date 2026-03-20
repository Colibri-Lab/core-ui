/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Bool = class extends Colibri.UI.Forms.Checkbox {

    RenderFieldContainer() {
        if(!this._fieldData.placeholder && this._fieldData.desc) {
            this._fieldData.placeholder = this._fieldData.desc;
            delete this._fieldData.desc;
        }
        super.RenderFieldContainer();
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('Bool', 'Colibri.UI.Forms.Bool', '#{ui-fields-bool}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler']);