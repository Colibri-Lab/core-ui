Colibri.UI.EmailEditor = class extends Colibri.UI.Editor {
    constructor(name, container) {
        super(name, container, Element.create('input'));
        this.AddClass('app-email-editor-component');

    }

    Validate() {
        if(this._element.value && !this._element.value.isEmail()) {
            this.AddClass('-invalid');
            this.toolTip = '#{ui-editors-email-message}';
        }
        else {
            this.RemoveClass('-invalid');
            this.toolTip = '';
        }
    }

    Focus() {
        this._element.focus();
        this._element.select();
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