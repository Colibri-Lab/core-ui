Colibri.UI.Forms.Link = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {

        this.AddClass('app-component-link-field');

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
        return this._input && this._input.attr('tabIndex');
    }
    set tabIndex(value) {
        this._input && this._input.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }
}