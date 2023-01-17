Colibri.UI.Widget = class extends Colibri.UI.FlexBox {

    constructor(name, container, element) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.Widget']);
        this.AddClass('app-component-widget');
        // default
        this.direction = Colibri.UI.FlexBox.Vertically;

        this.GenerateChildren(element);

        this._handlerEvents();
    }

    _handlerEvents() {
        this.Children('widget-close-button').AddHandler('Clicked', (sender, args) => {
            this.Hide();
        });
    }

    get header() {
        return this._element.querySelector('.widget-header');
    }

    get container() {
        return this._element.querySelector('.widget-container');
    }

    get footer() {
        return this._element.querySelector('.widget-footer');
    }

    get closable() {
        return this.Children('widget-close-button').shown;
    }

    set closable(value) {
        this.Children('widget-close-button').shown = value;
    }
}

