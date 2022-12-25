Colibri.UI.Forms.Label = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-label-field');

        const contentContainer = this.contentContainer;
        this._input = contentContainer.container.append(Element.create('span', {}));

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


    Focus() {
        // do nothing
    }
    get value() {
        return this._input.html();
    }

    set value(value) {
        this._input.html(value);
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return null;
    }
    set tabIndex(value) {
        // do nothing
    }
    
}
Colibri.UI.Forms.Field.RegisterFieldComponent('Label', 'Colibri.UI.Forms.Label', '#{ui-fields-label}')
