/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.TextArea = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('div', {class: 'app-ui-component'}));

        this.AddClass('app-textarea-component');

        this._input = Element.create('textarea', { placeholder: this.placeholder || '' });
        this._element.append(this._input);

        new Colibri.UI.Pane('clear', this);

        this.Children('clear').html = Colibri.UI.ClearIcon;

        this._input.addEventListener('keyup', (e) => {
            this.Children('clear').shown = this._input.value.length > 0;
            this.Dispatch('KeyUp', { value: this.value, domEvent: e });
            if (this._input.value.length == 0) {
                this.Dispatch('Cleared');
            }
        });

        this._input.addEventListener('change', (e) => {
            this.Dispatch('Changed', { value: this.value, domEvent: e });
        });

        this._input.addEventListener('keydown', (e) => {
            this.Dispatch('KeyDown', { value: this.value, domEvent: e });
        });

        this._input.addEventListener('mousedown', (e) => {
            e.target.focus();
            //e.target.select();
            return false;
        });

        this.Children('clear').AddHandler('Clicked', (event, args) => {
            this._input.value = '';
            this._input.focus();
            this._input.select();
            this.Children('clear').shown = false;
            this.Dispatch('Cleared');
        });

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('KeyUp', false, 'Поднимается, когда клавиша поднята');
        this.RegisterEvent('KeyDown', false, 'Поднимается, когда клавиша нажата');
        this.RegisterEvent('Changed', false, 'Поднимается, когда содержимое поля обновлено');
        this.RegisterEvent('Cleared', false, 'Поднимается, когда содержимое поля очищено с помощью крестика');
    }

    /**
     * Ставит фокус на компоменту
     * @returns {Colibri.UI.Component}
     */
     Focus() {
        this._input.focus();
        //this._input.select();
        return this;
    }

    /** @type {integer} */
    get maxlength() {
        return this._input.attr('maxlength');
    }
    set maxlength(value) {
        this._input.attr('maxlength', value);
    }

    /** @type {string} */
    get placeholder() {
        try {
            return this._input.attr('placeholder');
        }
        catch(e) {
            return '';
        }
    }
    set placeholder(value) {
        this._input.attr('placeholder', value ? value[Lang.Current] ?? value : '');
    }

    /** @type {string} */
    get value() {
        return this._input.value;
    }
    set value(value) {
        this._input.value = value;
        this.Children('clear').shown = this._input.value.length > 0;
    }

    /**
     * Элемент только для чтения
     * @type {boolean}
     */
    get readonly() {
        return this._input.is(':scope[readonly]');
    }
    set readonly(value) {
        this._input.attr('readonly', value);
        this.Dispatch('ReadonlyStateChanged');
    }

}