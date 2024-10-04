/**
 * Button group
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.ButtonGroup = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs 
     */
    constructor(name, container, element) {
        super(name, container, element || Element.create('div'));
        this.AddClass('app-buttongroup-component');

        this._selectedButton = null;

        this.AddHandler('Clicked', (event, args) => this.__thisClicked(event, args));
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __thisClicked(event, args) {
        const button = args.domEvent.target.closest('[data-object-name]').tag('component').Closest(component => component.parent instanceof Colibri.UI.ButtonGroup);
        this.SelectButton(button);
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Поднимается, когда изменилась выбранная кнопка');
    }

    /**
     * Select the button by index or name
     * @param {string|number} button button index or name
     */
    SelectButton(button) {
        if(typeof button == 'string' || typeof button == 'number') {
            button = this.Children(button);
        }
        if(!button) {
            return;
        }

        const isSelected = button.ContainsClass('-selected');
        this.ForEach((name, button) => {
            button.RemoveClass('-selected');
        });
        
        this._selectedButton = button;
        this._selectedButton.AddClass('-selected');

        if(!isSelected) {
            Colibri.Common.Delay(10).then(() => {
                this.Dispatch('Changed', {button: this._selectedButton, index: this.selectedIndex});
            });
        }

    }
    
    /**
     * Adds a button to group
     * @param {string} name name of button
     * @param {string} title title of button
     * @returns {Colibri.UI.Button}
     */
    AddButton(name, title, tag = {}) {
        if(this.Children(name)) {
            return this.Children(name);
        }
        const button = new Colibri.UI.Button(name, this);
        button.value = (Lang ? Lang.Translate(title) : title);
        button.shown = true;
        button.tag = tag;
        return button;
    }

    /**
     * Selected button
     * @type {Colibri.UI.Button}
     */
    get selected() {
        return this._selectedButton;
    }

    /**
     * Selected button
     * @type {Colibri.UI.Button}
     */
    set selected(value) {
        this.SelectButton(value);
    }

    /**
     * Selected button index
     * @type {number}
     */
    set selectedIndex(index) {
        const button = this.Children(index);
        if(button) {
            this.selected = button;
        }
    }

    /**
     * Selected button index
     * @type {number}
     */
    get selectedIndex() {
        return this._selectedButton ? this._selectedButton.childIndex : null;
    }

    /**
     * Disables all buttons
     */
    DisableAllButtons() {
        const childs = this.Children();
        for(const child of childs) {
            child.enabled = false;
        }
    }

    /**
     * Enables button by index or name
     * @param {string|number} name button index or number
     */
    EnableButton(name) {
        if(this.Children(name)) {
            this.Children(name).enabled = true;
        }
    }

}