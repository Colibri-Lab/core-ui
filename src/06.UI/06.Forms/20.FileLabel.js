Colibri.UI.Forms.FileLabel = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-filelabel-field');

        const contentContainer = this.contentContainer;
        this._input = contentContainer.container.append(Element.create('div', {}));
        this._placeholder = this._input.append(Element.create('span', {}));
        this._link = this._input.append(Element.create('a', {'href': '#'}));

        this._value = null;
        this.placeholder = this._fieldData.placeholder;
        this._link.html(this._fieldData?.button || '#{app-filelabel-download;Скачать}');

        
        this._link.addEventListener('click', (e) => {
            if(this._fieldData?.params?.download) {
                window.open((window.rpchandler ?? '') + this._fieldData?.params?.download + '?guid=' + this.value);
            }
            e.preventDefault();
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


    Focus() {
        this._input.focus();
        this._input.select();
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
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

    get placeholder() {
        return this._placeholder.html();
    }

    set placeholder(value) {
        this._placeholder.html(value);
    }
    

}
Colibri.UI.Forms.Field.RegisterFieldComponent('FileLabel', 'Colibri.UI.Forms.FileLabel', '#{app-fields-filelabel;Ссылка на файл}')
