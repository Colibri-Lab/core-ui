
Colibri.UI.Forms.Text = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-text-field');

        const contentContainer = this.contentContainer;
        this._input = contentContainer.container.append(Element.create('input', {type: 'text', name: this._name + '-input'}));

        this.readonly = this._fieldData.readonly;
        this.maxlength = this._fieldData.params && this._fieldData.params.maxlength ? this._fieldData.params.maxlength : null;

        const mask = this._fieldData?.params?.mask;
        if(mask) {
            this._masker = new Colibri.UI.Utilities.Mask([this._input]);
            this._masker.maskPattern(mask);
        } 

        this._input.addEventListener('change', (e) => this.Dispatch('Changed', {domEvent: e}));
        this._input.addEventListener('keyup', (e) => this.Dispatch('KeyUp', {domEvent: e}));
        this._input.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));
        this._input.addEventListener('click', (e) => {
            this.Focus();
            this.Dispatch('Clicked', {domEvent: e});
            e.stopPropagation();
            return false;
        });

    }

    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    Focus() {
        this._input.focus();
        //this._input.select();
    }

    set maxlength(value) {
        this._input.attr('maxlength', value);
    }

    get maxlength() {
        return this._input.attr('maxlength');
    }

    get readonly() {
        return this._fieldData.readonly;
    }

    set readonly(value) {
        this._fieldData.readonly = value === true || value === 'true';
        if(value === true || value === 'true') {
            this._input.attr('readonly', 'readonly');
        }
        else {
            this._input.attr('readonly', null);
        }
    }

    get placeholder() {
        return this._input.attr('placeholder');
    }

    set placeholder(value) {
        this._input.attr('placeholder', value);
    }

    get value() {
        let value = this._input.value;
        if(this._fieldData?.params?.emptyAsNull && !value) {
            value = null;
        }
        if(this._fieldData?.params?.eval) {
            value = eval(this._fieldData?.params?.eval);
        }
        return value;
    }

    set value(value) {
        this._input.value = value ?? '';
    }

    
    get enabled() {
        return this._input.attr('disabled') != 'disabled';
    }

    set enabled(value) {
        if(value) {
            this.RemoveClass('app-component-disabled');
            this._input.attr('disabled', null);
        }
        else {
            this.AddClass('app-component-disabled');
            this._input.attr('disabled', 'disabled');
        }
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.attr('tabIndex');
    }
    set tabIndex(value) {
        this._input && this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }


}
Colibri.UI.Forms.Field.RegisterFieldComponent('Text', 'Colibri.UI.Forms.Text', 'Текст');
