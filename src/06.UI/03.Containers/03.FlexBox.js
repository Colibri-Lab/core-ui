/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.FlexBox = class extends Colibri.UI.Component {

    static Horizontal = 'row';
    static Vertical = 'column'

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     * @param {string|HTMLElement} element element to generate in
     */
    constructor(name, container, element) {
        super(name, container, element || Element.create('div'));
        this.AddClass('app-component-flexbox');

        // this.wrap = false;
    }

    /**
     * Wrap type
     * @type {string}
     */
    get wrap() {
        let flexWrap = this._element.css('flex-wrap');
        switch (flexWrap) {
            case 'wrap':
                return true;
            case 'nowrap':
                return false;
        }
    }

    /**
     * Wrap type
     * @type {string}
     */
    set wrap(value) {
        if (value) {
            this._element.css('flex-wrap', 'wrap');
        } else {
            this._element.css('flex-wrap', 'nowrap');
        }
    }

    /**
     * Flex direction
     * @type {string}
     */
    get direction() {
        return this._element.css('flex-direction');
    }

    /**
     * Flex direction
     * @type {string}
     */
    set direction(value) {
        if ([Colibri.UI.FlexBox.Horizontal, Colibri.UI.FlexBox.Vertical].indexOf(value) !== -1) {
            this._element.css('flex-direction', value);
        }
    }
    
}