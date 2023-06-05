Colibri.UI.CheckboxEditor = class extends Colibri.UI.Editor {
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-checkbox-editor-component');
        
        this._input = new Colibri.UI.Checkbox(this.name + '-input', this);
        this._input.shown = true;

        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', args));
        this._input.AddHandler('LoosedFocus', (event, args) => this.Dispatch('LoosedFocus', args));
        this._input.AddHandler('ReceiveFocus', (event, args) => this.Dispatch('ReceiveFocus', args));

    }

    Validate() {
        
    }

    get readonly() {
        return this._fieldData.readonly;
    }  
 
    set readonly(value) {
        this._fieldData.readonly = value === true || value === 'true';
        this._input.readonly = value === true || value === 'true';
    }

    get placeholder() {
        return this._input.placeholder;
    }

    set placeholder(value) {
        this._input.placeholder = value ? value[Lang.Current] ?? value : '';
    }

    get value() {
        return this._input.checked;
    }

    set value(value) {
        this._input.checked = value === true || value === 1;
        this.Validate();
        if(value) {
            this._setFilled();
        } else {
            this._unsetFilled();
        }
    }

    get enabled() {
        return this._input.enabled;
    }

    set enabled(value) {
        if(value) {
            this.RemoveClass('ui-disabled');
            this._input.enabled = true;
        }
        else {
            this.AddClass('ui-disabled');
            this._input.enabled = false;
        }
    }

    Focus() {
        this._input.Focus();
    }

}