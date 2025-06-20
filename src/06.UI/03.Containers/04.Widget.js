/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Widget = class extends Colibri.UI.FlexBox {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     * @param {string|HTMLElement} element element to generate in
     */
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

    /** @protected */
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
        this._headerTitle.AddHandler('Clicked', (event, args) => {
            if(this._toggleOnTitle) {
                this._headerCloseToggle.Dispatch('Clicked');
            }
        });
    }

    /**
     * Header container
     * @type {Element}
     * @readonly
     */
    get header() {
        return this._header.querySelector('span');
    }

    /**
     * Content container
     * @type {Element}
     * @readonly
     */
    get container() {
        return this._element.querySelector('.widget-container');
    }

    /**
     * Footer container
     * @type {Element}
     * @readonly
     */
    get footer() {
        return this._footer;
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
    /** @private */
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
    /** @private */
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
    /** @private */
    _showTogglable() {
        this._headerCloseToggle.shown = this._togglable;
    }

    /**
     * Toggle when click the title
     * @type {Boolean}
     */
    get toggleOnTitle() {
        return this._toggleOnTitle;
    }
    /**
     * Toggle when click the title
     * @type {Boolean}
     */
    set toggleOnTitle(value) {
        this._toggleOnTitle = value;
    }

    /**
     * Icon for toggle
     * @type {String}
     */
    get toggleIcon() {
        return this._toggleIcon.iconSVG;
    }
    /**
     * Icon for toggle
     * @type {String}
     */
    set toggleIcon(value) {
        if(value) {
            this._headerCloseToggle.AddClass('-custom');
        } else {
            this._headerCloseToggle.RemoveClass('-custom');
        }
        this._toggleIcon = this._headerCloseToggle.Children('icon');
        if(!this._toggleIcon) {
            this._toggleIcon = new Colibri.UI.Icon('icon', this._headerCloseToggle);
            this._toggleIcon.shown = true;
        }
        this._toggleIcon.iconSVG = value;
    }

    /**
     * Toggle string
     * @type {Array}
     */
    get toggleText() {
        return this._toggleText;
    }
    /**
     * Toggle string
     * @type {Array}
     */
    set toggleText(value) {
        value = this._convertProperty('Array', value);
        if(value) {
            this._headerCloseToggle.AddClass('-custom');
        } else {
            this._headerCloseToggle.RemoveClass('-custom');
        }
        this._toggleText1 = this._headerCloseToggle.Children('text1');
        this._toggleText2 = this._headerCloseToggle.Children('text2');
        if(!this._toggleText1) {
            this._toggleText1 = new Colibri.UI.TextSpan('text1', this._headerCloseToggle);
            this._toggleText1.shown = true;
        }
        if(!this._toggleText2) {
            this._toggleText2 = new Colibri.UI.TextSpan('text2', this._headerCloseToggle);
            this._toggleText2.shown = true;
        }
        this._toggleText1.value = value[0];
        this._toggleText2.value = value[1];
    }

    CheckCloseAbility() {
        return Promise.resolve(true);
    }

    
}

