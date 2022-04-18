Colibri.UI.Forms.Bool = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-bool-field');

        const contentContainer = this.contentContainer;

        this._uniqueString = Number.unique();
        this._input = contentContainer.container.append(Element.create('input', {type: 'checkbox', id: this._name + '-id-' + this._uniqueString, name: this._name + '-input'}));
        this._label = contentContainer.container.append(Element.create('label', {for: this._name + '-id-' + this._uniqueString}));
        
        this._input.addEventListener('change', (e) => this.Dispatch('Changed', {domEvent: e}));
        this._input.addEventListener('keyup', (e) => this.Dispatch('KeyUp', {domEvent: e}));
        this._input.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));
        this._input.addEventListener('click', (e) => {
            this.Focus();
            this.Dispatch('Clicked', {domEvent: e})
            e.stopPropagation();
            return false;
        });

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

    }

    _registerEvents() {
        super._registerEvents();
        // если нужно добавить что то
    }

    Focus() {
        this._input.focus();
        this._input.select();
    }

    get title() {
        return this._label.html();
    }
    set title(value) {
        this._label.html(value);
    }

    get readonly() {
        return this._input.attr('readonly') === 'readonly';
    }

    set readonly(value) {
        if(value === true || value === 'true') {
            this._input.attr('readonly', 'readonly');
        }
        else {
            this._input.attr('readonly', null);
        }
    }

    get placeholder() {
        return '';
    }

    set placeholder(value) {
        // ничего не делаем
    }

    get value() {
        return this._input.is(':checked');
    }

    set value(value) {
        
        if(value === null) {
            value = {};
        }

        const _value = value[this._fieldData?.selector?.value ?? 'value'] ?? value;
        if(_value === '1' || _value === 'true' || _value === true) {
            this._input.attr('checked', 'checked');
        }
        else {
            this._input.attr('checked', null);
        }
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
Colibri.UI.Forms.Field.RegisterFieldComponent('Bool', 'Colibri.UI.Forms.Bool', 'Да/Нет');