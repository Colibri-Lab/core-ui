Colibri.UI.Forms.FontFamily = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-color-field');

        const contentContainer = this.contentContainer;
        
        this._input = new Colibri.UI.FontFamilySelector(this.name + '_selector', contentContainer);
        this._input.shown = true;

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }
        this.value = this._fieldData?.default ?? '';

        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args, {component: this})));
        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown', args));
        this._input.AddHandler('Clicked', (event, args) => this.Dispatch('Clicked', args));

    }


    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    Focus() {
        this._input.Focus();
    }
    
    get readonly() {
        return this._input.readonly;
    }

    set readonly(value) {
        this._input.readonly = value
    }

    get placeholder() {
        return this._input.placeholder;
    }

    set placeholder(value) {
        this._input.placeholder = value;
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
        return this._input.enabled;
    }

    set enabled(value) {
        this._input.enabled = value
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    set tabIndex(value) {
        this._input && (this._input.tabIndex = value === true ? Colibri.UI.tabIndex++ : value);
    }


}
Colibri.UI.Forms.Field.RegisterFieldComponent('FontFamily', 'Colibri.UI.Forms.FontFamily', '#{ui-fields-fontfamily}');
