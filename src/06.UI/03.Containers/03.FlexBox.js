/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.FlexBox = class extends Colibri.UI.Component {

    static Horizontal = 'row';
    static Vertical = 'column'

    constructor(name, container, element) {
        super(name, container, element || Element.create('div'));
        this.AddClass('app-component-flexbox');

        // this.wrap = false;
    }

    get wrap() {
        let flexWrap = this._element.css('flex-wrap');
        switch (flexWrap) {
            case 'wrap':
                return true;
            case 'nowrap':
                return false;
        }
    }

    set wrap(value) {
        if (value) {
            this._element.css('flex-wrap', 'wrap');
        } else {
            this._element.css('flex-wrap', 'nowrap');
        }
    }

    get direction() {
        return this._element.css('flex-direction');
    }

    set direction(value) {
        if ([Colibri.UI.FlexBox.Horizontal, Colibri.UI.FlexBox.Vertical].indexOf(value) !== -1) {
            this._element.css('flex-direction', value);
        }
    }
}