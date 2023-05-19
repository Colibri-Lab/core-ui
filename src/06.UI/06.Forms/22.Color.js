Colibri.UI.Forms.Color = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-color-field');

        const contentContainer = this.contentContainer;

        this._flex = new Colibri.UI.FlexBox(this.name + '_flex', contentContainer);
        this._color = new Colibri.UI.Pane(this._name + '_color', this._flex);
        this._input = new Colibri.UI.Input(this.name + '_input', this._flex);
        this._button = new Colibri.UI.Button(this.name + '_button', this._flex);
        this._flex.shown = this._color.shown = this._input.shown = this._button.shown = true;
        this._input.loading = this._input.hasIcon = this._input.hasClearIcon = false;
        
        const icon = new Colibri.UI.Icon(this.name + '_buttonicon', this._button);
        icon.shown = true;
        icon.value = Colibri.UI.SelectArrowIcon;

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

        this.placeholder = this._fieldData?.placeholder;

        this.value = this._fieldData?.default ?? '';

        this._button.AddHandler('Clicked', (event, args) => this.__buttonClicked(event, args));

        this._input.AddHandler('Changed', (event, args) => {
            this._color.styles = {backgroundColor: this._input.value};
            this.Dispatch('Changed', Object.assign(args, {component: this}));
        });
        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown', args));
        this._input.AddHandler('Clicked', (event, args) => this.Dispatch('Clicked', args));

    }

    _showPopup() {
        
        this._colorPopup = new Colibri.UI.Color(this.name + '_color', document.body);
        this._colorPopup.parent = this.contentContainer;
        this._colorPopup.hasShadow = true;
        this._colorPopup.shown = true;
        this._colorPopup.BringToFront();
        this._colorPopup.AddHandler('Changed', (event, args) => {
            this._input.value = this._colorPopup.value.hex;
            this._color.styles = {backgroundColor: this._input.value};
            this.Dispatch('Changed', args);
        });
        this._colorPopup.AddHandler('ShadowClicked', (event, args) => {
            console.log('disposing');
            this._colorPopup.Dispose();
        });
        this._colorPopup.value = this._input.value;
        this._colorPopup.top = this._input.top + this._input.height;
        this._colorPopup.left = this._input.left;
        this._colorPopup.width = Math.max(this._input.width, 379);
        
    }

    __buttonClicked(event, args) {
        this._showPopup();
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
        this._input.readonly = value;
        this._button.enabled = !value;
    }

    get placeholder() {
        return this._input.placeholder;
    }

    set placeholder(value) {
        this._input.placeholder = value ? (value[Lang.Current] ?? value) : '';
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
        this._color.styles = {backgroundColor: this._input.value};
    }

    
    get enabled() {
        return this._input.enabled;
    }

    set enabled(value) {
        this._input.enabled = value;
        this._button.enabled = value;
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
Colibri.UI.Forms.Field.RegisterFieldComponent('Color', 'Colibri.UI.Forms.Color', '#{ui-fields-color}');
