Colibri.UI.FlexBox = class extends Colibri.UI.Component {

    static Horizontally = 'row';
    static Vertically = 'column'

    constructor(name, container, element) {
        super(name, container, element || '<div />');
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
        let flexWrap = this._element.css('flex-direction');
        switch (flexWrap) {
            case 'row':
                return 'Horizontally';
            case 'column':
                return 'Vertically';
        }
    }

    set direction(value) {
        if ([Colibri.UI.FlexBox.Horizontally, Colibri.UI.FlexBox.Vertically].indexOf(value) !== -1) {
            this._element.css('flex-direction', value);
        }
    }
}