Colibri.UI.NumberEditor = class extends Colibri.UI.Editor {
    constructor(name, container) {
        super(name, container, Element.create('input', {type: 'number'}));
        this.AddClass('app-number-editor-component');

        this._element.addEventListener('focus', (e) => this.Focus());
        this._element.addEventListener('blur', (e) => this.Blur());
        this._element.addEventListener('change', (e) => this.__elementChanged(e));
        this._element.addEventListener('keydown', (e) => this.__elementChanged(e));


    }

    __elementChanged(e) {
        if(this.value) {
            this._setFilled();
        } else {
            this._unsetFilled();
        }

    }

    Validate() {
        
    }


    Focus() {
        this._element.focus();
        // this._element.select();
        this.parent.parent.AddClass('-focused');
    } 

    Blur() {
        this.parent.parent.RemoveClass('-focused');
    }

    _updateFieldData() {
        if(this._fieldData?.placeholder) {
            this._element.attr('placeholder', this._fieldData?.placeholder);
        }
        if(this._fieldData?.params?.readonly) {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.align) {
            this._element.css('text-align', this._fieldData?.params?.align);
        }
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
        this._element.value = value ?? '';
        this.Validate();
        if(value) {
            this._setFilled();
        } else {
            this._unsetFilled();
        }
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