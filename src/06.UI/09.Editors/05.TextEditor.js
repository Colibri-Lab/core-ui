Colibri.UI.TextEditor = class extends Colibri.UI.Editor {
    constructor(name, container) {
        super(name, container, '<input />');
        this.AddClass('app-text-editor-component');
        
        this._element.addEventListener('focus', (e) => this.Focus());
        this._element.addEventListener('blur', (e) => this.Blur());

    }

    Validate() {
        
    }

    Focus() {
        this._element.focus();
        this._element.select();
        this.parent.parent.AddClass('-focused');
    } 

    Blur() {
        this.parent.parent.RemoveClass('-focused');
    }

    get readonly() {
        return this._fieldData.readonly;
    }  
 
    set readonly(value) {
        this._fieldData.readonly = value === true || value === 'true';
        if(value === true || value === 'true') {
            this._element.attr('readonly', 'readonly');
        }
        else {
            this._element.attr('readonly', null);
        }
    }

    get placeholder() {
        return this._element.attr('placeholder');
    }

    set placeholder(value) {
        this._element.attr('placeholder', value ? value[Lang.Current] ?? value : '');
    }

    get value() {
        return this._element.value;
    }

    set value(value) {
        this._element.value = value;
        this.Validate();
    }

    get enabled() {
        return this._element.attr('disabled') != 'disabled';
    }

    set enabled(value) {
        if(value) {
            this.RemoveClass('ui-disabled');
            this._element.attr('disabled', null);
        }
        else {
            this.AddClass('ui-disabled');
            this._element.attr('disabled', 'disabled');
        }
    }

}