Colibri.UI.Widget = class extends Colibri.UI.FlexBox {

    constructor(name, container, element) {
        super(name, container);
        this.AddClass('app-component-widget');
        // default
        
        this._closeButton = new Colibri.UI.Button('widget-close-button', this);
        this._header = Element.fromHtml('<div class="widget-header"></div>');
        this._container = Element.fromHtml('<div class="widget-container"></div>');
        this._footer = Element.fromHtml('<div class="widget-footer"></div>');


        this._element.append(this._header);
        this._element.append(this._container);
        this._element.append(this._footer);

        this._handlerEvents();
    }

    _handlerEvents() {
        this.Children('widget-close-button').AddHandler('Clicked', (sender, args) => {
            this.Hide();
        });
    }

    get header() {
        return this._header;
    }

    get container() {
        return this._container;
    }

    get footer() {
        return this._footer;
    }

    get closable() {
        return this.Children('widget-close-button').shown;
    }

    set closable(value) {
        this.Children('widget-close-button').shown = value;
    }
}

