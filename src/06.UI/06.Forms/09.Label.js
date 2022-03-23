Colibri.UI.Forms.Label = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-label-field');

        const contentContainer = this.contentContainer;
        this._input = contentContainer.container.append(Element.create('span', {}));

    }


    Focus() {
        this._input.focus();
        this._input.select();
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