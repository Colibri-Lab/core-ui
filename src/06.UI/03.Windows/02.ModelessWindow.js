/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.ModelessWindow = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     * @param {string|Element} element element to create in
     * @param {string} title title of window
     * @param {number|null} width width of window
     * @param {number|null} height height of window
     */
    constructor(name, container, element, title, width, height) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.ModelessWindow']);
        this.AddClass('app-component-modeless-window');
        this.styles = {position: 'absolute'};

        this.GenerateChildren(element);

        this._setTitle(title);

        if (width) { this._setWidth(width); }
        if (height) { this._setHeight(height); }

        this._closable = true;
        this._isDragged = false;
        this._disposeOnClose = false;

        this._sticky = false;
        this._stickyX = null;
        this._stickyY = null;

        this._startPointX = null;
        this._startPointY = null;

        this._getCloseButton().shown = this._closable;

        this.Dispatch('WindowContentRendered');
        this._handleEvents();
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('WindowClosed', false, 'Поднимается, когда окно закрылось');
        this.RegisterEvent('WindowContentRendered', false, 'Когда содержание окна отрисовалось');
    }

    /** @protected */
    _handleEvents() {
        this._getCloseButton().AddHandler('Clicked', (event, args) => this.__close(event, args));

        this._element.querySelector('.modeless-window-header-container').addEventListener('mousedown', this.__dragStart.bind(this));
        this._container.addEventListener('mousemove', this.__move.bind(this));
        document.addEventListener('mouseup', this.__dragStop.bind(this));

        this.AddHandler('Resize', (event, args) => {
            this._toggleBodyScroll(false);
            this._updateStyleVariables();
        });

        this.AddHandler('Resized', (event, args) => { this._toggleBodyScroll(true); });
    }

    /**
     * @private
     */
    __close(event, args) {
        if (this._closable) {
            this.shown = false;
            if (this._disposeOnClose) { this.Dispose(); }

            this.Dispatch('WindowClosed', {});
        }
    }

    /**
     * @private
     */
    __dragStart(event) {
        if (!this._sticky) {
            let previousClientX = event.clientX,
                previousClientY = event.clientY;

            let previousLeft = this.styles.left ? parseInt(this.styles.left) : 0,
                previousTop = this.styles.top ? parseInt(this.styles.top) : 0;

            this.tag._diffX = previousClientX - previousLeft;
            this.tag._diffY = previousClientY - previousTop;
            this._isDragged = true;
        }
    }

    /**
     * @private
     */
    __move(event) {
        if (!this._sticky && this._isDragged) {
            let newClientX = event.clientX,
                newClientY = event.clientY,
                newLeft = newClientX - this.tag._diffX,
                newTop = newClientY - this.tag._diffY;

            this._element.style.top = newTop + 'px';
            this._element.style.left = newLeft + 'px';
        }
    }

    /**
     * @private
     */
    __dragStop() {
         if (!this._sticky && this._isDragged) {
             this._container.removeEventListener('mousemove', this.__move);
             document.removeEventListener('mouseup', this.__dragStop);

             this._isDragged = false;
         }
    }

    /**
     * @private
     */
    _updateStyleVariables() {
        let bounds = this._element.bounds();
        this._element.style.setProperty('--windowWidth', bounds.width + 'px');
        this._element.style.setProperty('--windowHeight', bounds.height + 'px');
    }

    /**
     * @private
     */
    _toggleBodyScroll(value) {
        const scrolling = new Colibri.Common.Scrolling(document.body);
        if (value === false) {
            scrolling.Disable();
        } else {
            scrolling.Enable();
        }
    }

    /**
     * When window closed
     */
    close() {
        this._getCloseButton().Dispatch('Clicked');
    }

    /**
     * Is window sticky
     * @type {boolean}
     */
    get sticky() {
        return this._sticky;
    }
    /**
     * Is window sticky
     * @type {boolean}
     */
    set sticky(value) {
        return this._setSticky(value);
    }
    /** @private */
    _setSticky(value) {
        this._sticky = (value === true || value === 'true');

        if (this._sticky && !this._stickyX && !this._stickyY) {
            this._stickToX('center');
            this._stickToY('center');
        }
        if(value) {
            this._updateStyleVariables();
        }
    }

    /**
     * Sticky X position
     * @type {left,right,center}
     */
    get stickyX() {
        return this._stickyX;
    }
    /**
     * Sticky position
     * @type {left,right,center}
     */
    set stickyX(value) {
        this._stickToX(value);
    }
    /** @private */
    _stickToX(value) {
        this._stickyX = value;

        switch (value) {
            case 'left':
            case 'right':
            case 'center':
                this.RemoveClass('-stick-to-x-left');
                this.RemoveClass('-stick-to-x-right');
                this.RemoveClass('-stick-to-x-center');

                this.AddClass('-stick-to-x-' + value);
                break;
            default:
                this._stickyX = null;
                this.RemoveClass('-stick-to-x-left');
                this.RemoveClass('-stick-to-x-right');
                this.RemoveClass('-stick-to-x-center');
        }
    }

    /**
     * Sticky Y position
     * @type {top,bottom,center}
     */    
    get stickyY() {
        return this._stickyY;
    }
    /**
     * Sticky Y position
     * @type {top,bottom,center}
     */    
    set stickyY(value) {
        this._stickToY(value);
    }
    /** @private */
    _stickToY(value) {
        this._stickyY = value;

        switch (value) {
            case 'top':
            case 'bottom':
            case 'center':
                this.RemoveClass('-stick-to-y-top');
                this.RemoveClass('-stick-to-y-bottom');
                this.RemoveClass('-stick-to-y-center');

                this.AddClass('-stick-to-y-' + value);
                break;
            default:
                this._stickyY = null;
                this.RemoveClass('-stick-to-y-top');
                this.RemoveClass('-stick-to-y-bottom');
                this.RemoveClass('-stick-to-y-center');
        }
    }

    /**
     * The point from which the window will occupy the entire available width depending on stickyX 
     * if stickyX is the center, it will occupy such a width so that the window is centered
     * @type {string|number|null}
     */
    get startPointX() {
        return this._startPointX;
    }
    /**
     * The point from which the window will occupy the entire available width depending on stickyX 
     * if stickyX is the center, it will occupy such a width so that the window is centered
     * @type {string|number|null}
     */
    set startPointX(value) {
        this._setStartPointX(value);
    }
    /** @private */
    _setStartPointX(value) {
        if (![null, false, undefined].includes(value)) {

            this._startPointX = parseInt(value);
            let measure = '';
            if (typeof value === 'string' && value.indexOf('%') !== -1) {
                measure = '%';
            }
            else {
                measure = 'px';
            }

            switch (this._stickyX) {
                case 'right':
                case 'left':
                    this._setWidth('calc(100vw - ' + this._startPointX + measure + ')');
                    break;
                case 'center':
                    this._setWidth('calc(100vw - '+ (this._startPointX * 2) + measure +')');
                    break;
                default:
                    this._startPointX = null;
            }

            this._startPointX += (this._startPointX && measure === '%') ? '%' : '';
        }
        else {
            this._startPointX = null;
        }
    }

    /**
     * The point from which the window will occupy the entire available height depending on stickyY
     * if stickyY is the center, it will take such a height so that the window is centered
     * @type {string|number|null}
     */
    get startPointY() {
        return this._startPointY;
    }
    /**
     * The point from which the window will occupy the entire available height depending on stickyY
     * if stickyY is the center, it will take such a height so that the window is centered
     * @type {string|number|null}
     */
    set startPointY(value) {
        this._setStartPointY(value);
    }
    /** @private */
    _setStartPointY(value) {
        if (![null, false, undefined].includes(value)) {

            this._startPointY = parseInt(value);
            let measure = '';
            if (typeof value === 'string' && value.indexOf('%') !== -1) {
                measure = '%';
            }
            else {
                measure = 'px';
            }

            switch (this._stickyY) {
                case 'top':
                case 'bottom':
                    this._setHeight('calc(100vh - '+ this._startPointY + measure +')');
                    break;
                case 'center':
                    this._setHeight('calc(100vh - '+ (this._startPointY * 2) + measure +')');
                    break;
                default:
                    this._startPointY = null;
            }

            this._startPointY += (this._startPointY && measure === '%') ? '%' : '';
        }
        else {
            this._startPointY = null;
        }
    }

    /**
     * Is window can be closed
     * @type {boolean}
     */
    get closable() {
        return this._closable;
    }
    /**
     * Is window can be closed
     * @type {boolean}
     */
    set closable(value) {
        this._setClosable(value);
    }
    /** @private */
    _setClosable(value) {
        this._closable = (value === true || value === 'true');
        this._getCloseButton().shown = this._closable;
    }

    /**
     * Remove window from DOM when closed
     * @type {boolean}
     */
    get disposeOnClose() {
        return this._disposeOnClose;
    }
    /**
     * Remove window from DOM when closed
     * @type {boolean}
     */
    set disposeOnClose(value) {
        this._disposeOnClose = (value === true || value === 'true');
    }

    /**
     * Content width
     * @type {number}
     */
    get width() {
        return super.width;
    }
    /**
     * Content width
     * @type {number}
     */
    set width(value) {
        if (!this._startPointX) {
            this._setWidth(value);
        }
    }
    /** @private */
    _setWidth(value) {
        super.width = value;
        this._updateStyleVariables();
    }

    /**
     * Content height
     * @type {number}
     */
    get height() {
        return super.height;
    }
    /**
     * Content height
     * @type {number}
     */
    set height(value) {
        if (!this._startPointY) {
            this._setHeight(value);
        }
    }
    /** @private */
    _setHeight(value) {
        super.height = value;
        this._updateStyleVariables();
    }

    /**
     * Window title
     * @type {string|Element}
     */
    get title() {
        return this._getHeader().html();
    }
    /**
     * Window title
     * @type {string|Element}
     */
    set title(value) {
        this._setTitle(value);
    }
    /** @private */
    _setTitle(value) {
        if (value) {
            this._getHeader().html(value);
            this._getHeader().style.display = '';
        }

        if (value === null || value === false) {
            this._getHeader().style.display = 'none';
        }
    }

    /**
     * header DOM element 
     * @type {Element}
     */
    get header() {
        return this._getHeader();
    }
    /** @private */
    _getHeader() {
        return this._element.querySelector('.modeless-window-header-container > .modeless-window-header');
    }

    /**
     * Container DOM element
     * @type {Element}
     */
    get container() {
        return this._getContainer();
    }
    /** @private */
    _getContainer() {
        return this._element.querySelector('.modeless-window-container');
    }

    /**
     * Footer DOM element
     * @type {Element}
     */
    get footer() {
        return this._getFooter();
    }
    /** @private */
    _getFooter() {
        return this._element.querySelector('.modeless-window-footer');
    }

    /**
     * @private
     */
    _getCloseButton() {
        return this.Children('close-button');
    }

    /**
     * Show/Hide component
     * @type {boolean}
     */
    get shown() {
        return super.shown;
    }
    /**
     * Show/Hide component
     * @type {boolean}
     */
    set shown(value) {
        this._element.style.visibility = 'hidden';
        super.shown = value;
        if(value) {
            this.BringToFront();
            Colibri.Common.Delay(0).then(() => {
                this._updateStyleVariables();
                this._element.style.visibility = 'unset';
            });
        }
        else {
            this.SendToBack();
        }
    }
}