/**
 * Token with generator button
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Token = class extends Colibri.UI.Forms.Field {
    
    /**
     * Render field component
     */
    RenderFieldContainer() {
        this.AddClass('colibri-ui-forms-token');
        this._enabled = true;

        const contentContainer = this.contentContainer;

        this._input = new Colibri.UI.Input('input', contentContainer);
        this._input.shown = true;
        this._input.hasIcon = false;
        this._input.hasClearIcon = false;

        this._button = new Colibri.UI.Button('button', contentContainer);
        this._button.shown = true;
        this._button.value = 'Сгенерировать';

        this._button.AddHandler('Clicked', (event, args) => this.__buttonClicked(event, args)); 
        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', {domEvent: e, component: this}));

    }

    __buttonClicked(event, args) {
        this._input.value = String.Password(40);
        this._input.Select();
        this._input.Focus();
        this.Dispatch('Changed', {domEvent: args.domEvent, component: this});
    }

    /**
     * Value String
     * @type {String}
     */
    get value() {
        return this._input.value;
    }
    /**
     * Value String
     * @type {String}
     */
    set value(value) {
        this._input.value = value;
    }

}

Colibri.UI.Forms.Field.RegisterFieldComponent('Token', 'Colibri.UI.Forms.Token', '#{ui-fields-token}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler'])
