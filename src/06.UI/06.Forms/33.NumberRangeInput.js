Colibri.UI.Forms.NumberRangeInput = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {
        this.AddClass('app-component-numberrangeinput-field');
        const contentContainer = this.contentContainer;

        this._flex = new Colibri.UI.FlexBox(this.name + '_flex', contentContainer);
        this._flex.AddClass('app-component-numberrangeinput-flex');

        this._input1 = new Colibri.UI.Input(this.name + '_input1', this._flex);
        this._split = new Colibri.UI.TextSpan(this.name + '_split', this._flex);
        this._input2 = new Colibri.UI.Input(this.name + '_input2', this._flex);
        
        this._input1.hasIcon = this._input2.hasIcon = false;
        this._input1.hasClearIcon = this._input2.hasClearIcon = false;

        this._flex.shown = this._input1.shown = this._input2.shown = this._split.shown = true;

        this._split.value = this._fieldData.params.split;
        this._input1.placeholder = this._fieldData.params.from;
        this._input2.placeholder = this._fieldData.params.to;

        this._input1.AddHandler('Changed', this.__inputChanged, false, this);
        this._input2.AddHandler('Changed', this.__inputChanged, false, this);


    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __inputChanged(event, args) {
        this._value = [this._input1.value, this._input2.value];
    }

    /**
     * 
     * @type {number}
     */
    get value() {
        return this._value;
    }
    /**
     * 
     * @type {number}
     */
    set value(value) {
        if(!Array.isArray(value)) {
            value = [value];
        }
        this._value = value;
        this._showValue();
    }
    _showValue() {
        this._input1.value = value[0];
        this._input2.value = value[1];
    }

    /**
     * Табуляция
     * @type {number}
     */
    get tabIndex() {
        return this._input1.tabIndex;
    }
    /**
     * Табуляция
     * @type {number}
     */
    set tabIndex(value) {
        this._input1.tabIndex = value;
        this._input2.tabIndex = value + 1;
    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('NumberRangeInput', 'Colibri.UI.Forms.NumberRangeInput', '#{ui-fields-numberpickerinput}', Colibri.UI.FieldIcons['Colibri.UI.Forms.Number']);
