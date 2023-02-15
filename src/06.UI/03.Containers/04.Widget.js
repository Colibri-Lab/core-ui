Colibri.UI.Widget = class extends Colibri.UI.FlexBox {

    constructor(name, container, element) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.Widget']);
        this.AddClass('app-component-widget');
        // default

        this.GenerateChildren(element, this.container);
        
        this._header = this._element.querySelector('.widget-header');
        this._container = this._element.querySelector('.widget-container');
        this._footer = this._element.querySelector('.widget-footer');
        this._closeButton = this._header.querySelector(':scope > button');


        this._handlerEvents();
    }

    _handlerEvents() {
        this._closeButton.addEventListener('click', (e) => {
            this.Hide();
        });
    }

    get header() {
        return this._header.querySelector('span');
    }

    get container() {
        return this._element.querySelector('.widget-container');
    }

    get footer() {
        return this._footer;
    }

    get closable() {
        return this._closeButton.classList.contains('-shown');
    }

    set closable(value) {
        if(value === true || value === 'true') {
            this._closeButton.classList.add('-shown');
        } else {
            this._closeButton.classList.remove('-shown');
        }
    }


    /**
     * Column spanning for widget
     * @type {number}
     */
    get colspan() {
        return this._element.css('gri-area');
    }
    /**
     * Column spanning for widget
     * @type {number}
     */
    set colspan(value) {
        this._element.css('grid-column-start', 'span ' + value);
        this._element.css('grid-row-start', 'auto');
    }
    
    /**
     * Title of widget
     * @type {string}
     */
    get title() {
        return this._title;
    }
    /**
     * Title of widget
     * @type {string}
     */
    set title(value) {
        this._title = value;
        this._showTitle();
    }
    _showTitle() {
        this.header.html(this._title);
    }

}

