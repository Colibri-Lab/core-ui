Colibri.UI.CheckboxViewer = class extends Colibri.UI.Viewer {

    constructor(name, container, element = '<span />', root = null) {
        super(name, container, element, root);
        this.AddClass('app-checkbox-viewer-component');

        this._value = false;
    }

    get value() {
        return this.value === false ? '' : this._field.placeholder;
    }

    set value(value) {
    
        this._value = value;
        if(value) {
            super.value = this._field.placeholder;
        }
        else {
            super.value = '';
        }

    }


}