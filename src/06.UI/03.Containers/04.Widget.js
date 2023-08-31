Colibri.UI.Widget = class extends Colibri.UI.FlexBox {

    constructor(name, container, element) {
        super(name, container, Element.fromHtml('<div><div class="widget-header"></div><div class="widget-container"></div><div class="widget-footer"></div></div>')[0]);
        this.AddClass('app-component-widget');
        // default

        this.namespace = typeof element === 'string' ? element : 'Colibri.UI.Widget';
        if(typeof element === 'string') {
            element = Colibri.UI.Templates[element];
        }
        
        this.GenerateChildren(element, this.container);
        
        this._header = this._element.querySelector('.widget-header');
        this._footer = this._element.querySelector('.widget-footer');

        this._headerTitle = new Colibri.UI.TextSpan('title', this._header);
        this._headerCloseToggle = new Colibri.UI.Button('toggle-button', this._header);
        this._headerCloseButton = new Colibri.UI.Button('close-button', this._header);

        if(App.Browser.Get(this.name + '-minimized') == 1) {
            this.AddClass('-minimized');
        }

        this._handlerEvents();
    }

    _handlerEvents() {
        this._headerCloseToggle.AddHandler('Clicked', (event, args) => {
            if(this.ContainsClass('-minimized')) {
                this.RemoveClass('-minimized');
                App.Browser.Delete(this.name + '-minimized');
            } else {
                this.AddClass('-minimized');
                App.Browser.Set(this.name + '-minimized', 1);
            }
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
        this._headerTitle.value = this._title;
        if(this._title) {
            this._headerTitle.shown = true;
        } else {
            this._headerTitle.shown = false;
        }
    }

    /**
     * Is widget closable
     * @type {Boolean}
     */
    get closable() {
        return this._closable;
    }
    /**
     * Is widget closable
     * @type {Boolean}
     */
    set closable(value) {
        this._closable = value === true || value === 'true';
        this._showClosable();
    }
    _showClosable() {        
        this._headerCloseButton.shown = this._closable;
    }

    /**
     * Is widget can toggle
     * @type {Boolean}
     */
    get togglable() {
        return this._togglable;
    }
    /**
     * Is widget can toggle
     * @type {Boolean}
     */
    set togglable(value) {
        this._togglable = value === true || value === 'true';
        this._showTogglable();
    }
    _showTogglable() {
        this._headerCloseToggle.shown = this._togglable;
    }

}

