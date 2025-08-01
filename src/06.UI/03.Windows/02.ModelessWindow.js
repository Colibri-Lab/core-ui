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

        this._resizeDir = null;
        this._resizeStart = null;

        this.__startMove = (e) => {
            const bounds = this._element.getBoundingClientRect();
            const cornerSize = 20;
            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top;

            let corner = null;
            if (x <= cornerSize && y <= cornerSize) {
                corner = 'nw-resize';
            } else if (x >= bounds.width - cornerSize && y <= cornerSize) {
                corner = 'ne-resize';
            } else if (x <= cornerSize && y >= bounds.height - cornerSize) {
                corner = 'sw-resize';
            } else if (x >= bounds.width - cornerSize && y >= bounds.height - cornerSize) {
                corner = 'se-resize';
            } else if (x <= cornerSize) {
                corner = 'w-resize';
            } else if (x >= bounds.width - cornerSize) {
                corner = 'e-resize';
            } else if (y <= cornerSize) {
                corner = 'n-resize';
            } else if (y >= bounds.height - cornerSize) {
                corner = 's-resize';
            }

            if (this._resizable && corner) {
                this._element.css('cursor', corner);
            } else {
                this._element.css('cursor', 'default');
            }
        };

        this.__mouseDown = (e) => {
            const bounds = this._element.getBoundingClientRect();
            const cornerSize = 20;
            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top;

            let dir = null;
            if (x <= cornerSize && y <= cornerSize) {
                dir = 'nw';
            } else if (x >= bounds.width - cornerSize && y <= cornerSize) {
                dir = 'ne';
            } else if (x <= cornerSize && y >= bounds.height - cornerSize) {
                dir = 'sw';
            } else if (x >= bounds.width - cornerSize && y >= bounds.height - cornerSize) {
                dir = 'se';
            } else if (x <= cornerSize) {
                dir = 'w';
            } else if (x >= bounds.width - cornerSize) {
                dir = 'e';
            } else if (y <= cornerSize) {
                dir = 'n';
            } else if (y >= bounds.height - cornerSize) {
                dir = 's';
            }

            if (this._resizable && dir) {
                e.preventDefault();
                this._resizeDir = dir;
                this._resizeStart = {
                    x: e.clientX,
                    y: e.clientY,
                    width: this._element.offsetWidth,
                    height: this._element.offsetHeight,
                    left: this._element.offsetLeft,
                    top: this._element.offsetTop
                };
                document.addEventListener('mousemove', this.__resizeMove);
                document.addEventListener('mouseup', this.__resizeStop);
            }
        };


        this.__resizeMove = (e) => {
            if (!this._resizeDir || !this._resizeStart) return;
            let dx = e.clientX - this._resizeStart.x;
            let dy = e.clientY - this._resizeStart.y;
            let newWidth = this._resizeStart.width;
            let newHeight = this._resizeStart.height;
            let newLeft = this._resizeStart.left;
            let newTop = this._resizeStart.top;

            if (this._resizeDir.indexOf('e') !== -1) {
                newWidth = Math.max(100, this._resizeStart.width + dx);
            }
            if (this._resizeDir.indexOf('s') !== -1) {
                newHeight = Math.max(100, this._resizeStart.height + dy);
            }
            if (this._resizeDir.indexOf('w') !== -1) {
                newWidth = Math.max(100, this._resizeStart.width - dx);
                newLeft = this._resizeStart.left + dx;
            }
            if (this._resizeDir.indexOf('n') !== -1) {
                newHeight = Math.max(100, this._resizeStart.height - dy);
                newTop = this._resizeStart.top + dy;
            }

            this._element.style.width = newWidth + 'px';
            this._element.style.height = newHeight + 'px';
            this._element.style.left = newLeft + 'px';
            this._element.style.top = newTop + 'px';
            this._updateStyleVariables();
        };

        this.__resizeStop = () => {
            document.removeEventListener('mousemove', this.__resizeMove);
            document.removeEventListener('mouseup', this.__resizeStop);
            this._element.css('cursor', null);
            this._resizeDir = null;
            this._resizeStart = null;
        };

        this.__dragStartHandler = (e) => this.__dragStart(e);
        this.__dragMoveHandler = (e) => this.__move(e);
        this.__dragStopHandler = (e) => this.__dragStop(e);

        this._element.addEventListener('mousemove', this.__startMove, true);
        this._element.addEventListener('mousedown', this.__mouseDown, true);

        this.Dispatch('WindowContentRendered');
        this._handleEvents();
    }

    Dispose() {
        document.removeEventListener('mousemove', this.__resizeMove);
        document.removeEventListener('mouseup', this.__resizeStop);
        this._element.removeEventListener('mousemove', this.__startMove, true);
        this._element.removeEventListener('mousedown', this.__mouseDown, true);

        this._element.querySelector('.modeless-window-header-container').removeEventListener('mousedown', this.__dragStartHandler);
        this._container.removeEventListener('mousemove', this.__dragMoveHandler);
        document.removeEventListener('mouseup', this.__dragStopHandler);

        super.Dispose();
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('WindowClosed', false, 'Поднимается, когда окно закрылось');
        this.RegisterEvent('WindowContentRendered', false, 'Когда содержание окна отрисовалось');
    }

    /** @protected */
    _handleEvents() {
        this._getCloseButton().AddHandler('Clicked', this.__close, false, this);

        this._element.querySelector('.modeless-window-header-container').addEventListener('mousedown', this.__dragStartHandler);
        this._container.addEventListener('mousemove', this.__dragMoveHandler);
        document.addEventListener('mouseup', this.__dragStopHandler);

        this.AddHandler('Resize', this.__thisResize);
        this.AddHandler('Resized', this.__thisResized);
    }

    __thisResized(event, args) { 
        this._toggleBodyScroll(true);
    }

    __thisResize(event, args) {
        this._toggleBodyScroll(false);
        this._updateStyleVariables();
    }

    /**
     * @private
     */
    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
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
        if (!this._sticky && this._movable) {
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
        if (!this._sticky && this._movable && this._isDragged) {
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
         if (!this._sticky && this._movable && this._isDragged) {
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

        super.shown = value;
        if(value) {
            this.BringToFront();
            this._element.hideShowProcess(() => {
                this._updateStyleVariables();
            }, 100);
        }
        else {
            this.SendToBack();
        }
    }

    /**
     * Resizable window
     * @type {Boolean}
     */
    get resizable() {
        return this._resizable;
    }
    /**
     * Resizable window
     * @type {Boolean}
     */
    set resizable(value) {
        this._resizable = value;
    }

    /**
     * Move the window
     * @type {Boolean}
     */
    get movable() {
        return this._movable;
    }
    /**
     * Move the window
     * @type {Boolean}
     */
    set movable(value) {
        this._movable = value;
    }


}