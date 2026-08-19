/**
 * Default dropdown options component
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI.Select.DefaultDropdown
 */
Colibri.UI.Select.DefaultDropdown.Options = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this._handleEvents();
    }

    /** 
     * @ignore
     * @protected
     */
    _handleEvents() {
        this.AddHandler('Clicked', this.__thisClicked);
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisClicked(event, args) {
        if(args.domEvent.target.is('[data-option-name]')) {
            this.Dispatch('OptionClicked', {option: args.domEvent.target.dataset.optionName});
        }
    }

    /** 
     * @ignore
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('OptionClicked', false, 'Поднимается, когда кликаем по опции');
    }

    /**
     * Adds and option
     * @param {string} name name of option
     * @param {string} title title of option
     * @returns {Element}
     * @public
     */
    AddOption(name, title) {
        this.shown = true;
        const newOption = Element.create("a", {
            href: '#'
        }, {
            'optionName': name,
            'optionTitle': title
        });
        newOption.html(title);
        this._element.append(newOption);
        return newOption;
    }

    /**
     * Removes an option
     * @param {string} name name of option
     * @public
     */
    RemoveOption(name) {
        this._element.querySelector('[data-option-name="' + name + '"]').remove();
        if(this._element.querySelectorAll('[data-option-name]').length === 0) {
            this.shown = false;
        }
    }

}


