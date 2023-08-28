Colibri.UI.Widget = class extends Colibri.UI.FlexBox {

    constructor(name, container, element) {
        super(name, container, Element.fromHtml('<div><div class="widget-header"><span></span><button class="-shown"></button></div><div class="widget-container"></div><div class="widget-footer"></div></div>')[0]);
        this.AddClass('app-component-widget');
        // default

        this.namespace = typeof element === 'string' ? element : 'Colibri.UI.Widget';
        if(typeof element === 'string') {
            element = Colibri.UI.Templates[element];
        }
        
        this.GenerateChildren(element, this.container);
        
        this._header = this._element.querySelector('.widget-header');
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
        return this._colspan;
    }
    /**
     * Column spanning for widget
     * @type {number}
     */
    set colspan(value) {
        this._colspan = value;
        this._setSpanning();
    }

    /**
     * Row spanning for widget
     * @type {number}
     */
    get rowspan() {
        return this._rowspan;
    }
    /**
     * Row spanning for widget
     * @type {number}
     */
    set rowspan(value) {
        this._rowspan = value;
        this._setSpanning();
    }
    
    _setSpanning() {
        this._element.css('grid-row-start', this._rowspan ? 'span ' + this._rowspan : 'auto');
        this._element.css('grid-column-start', this._colspan ? 'span ' + this._colspan : 'auto');
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

