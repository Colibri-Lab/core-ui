/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Split = class extends Colibri.UI.Component {

    static OrientationHorizontal = 'horizontal';
    static OrientationVertical = 'vertical';

    /** @type {string} */
    _orientation = Colibri.UI.Split.OrientationHorizontal;

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     * @param {string|HTMLElement} element element to generate in
     * @param {orientation} orientation orientation of split (horizontal|vertical) 
     */
    constructor(name, container, element, orientation) {
        super(name, container, element || Element.create('div'));

        this.AddClass('app-component-split');

        this._left = Element.create('div', {class: 'app-component-split-left'});
        this._handler = Element.create('div', {class: 'app-component-split-handler'});
        this._right = Element.create('div', {class: 'app-component-split-right'});
        this._element.append(this._left);
        this._element.append(this._handler);
        this._element.append(this._right);

        this._hasHandle = true;

        this._orientation = orientation || Colibri.UI.Split.OrientationHorizontal;
        this.AddClass('app-component-split-' + this._orientation);

        this.handleResize = true;
        this.AddHandler('Resize', (event, args) => this.__thisResize(event, args));
        Colibri.Common.Delay(100).then(() => this.__thisResize(null, null));
        
        this.__startResize = (e) => {
            
            this._resizing = true;
            Colibri.UI.Resizing = true;
            this._resizeData = this._left.bounds();
            this.AddClass('-resizing');

            // ставим на документ, чтобы точно перехватить        
            document.addEventListener("touchend", this.__stopResize, {capture: true});
            document.addEventListener("mouseup", this.__stopResize, {capture: true});

            document.addEventListener("touchmove", this.__doResize, {capture: true});
            document.addEventListener("mousemove", this.__doResize, {capture: true});

            this.Dispatch('SplitResizeStart');

            return false;

        };

        this.__stopResize = (e) => {
            e?.preventDefault();
            e?.stopPropagation();
            this.RemoveClass('-resizing');
        
            this._resizing = false;
            Colibri.UI.Resizing = false;

            document.removeEventListener("touchend", this.__stopResize, {capture: true});
            document.removeEventListener("mouseup", this.__stopResize, {capture: true});
    
            document.removeEventListener("touchmove", this.__doResize, {capture: true});
            document.removeEventListener("mousemove", this.__doResize, {capture: true});

            this.Dispatch('SplitResizeStop');

            return false;

        };

        this.__doResize = (e) => {
            if (this._resizing) {
                e.preventDefault();
    
                if(this._orientation == Colibri.UI.Split.OrientationHorizontal) {
                    this._left.css('flex', '0 0 ' + (e.pageX - this._resizeData.left) + 'px');
                }
    
                if(this._orientation == Colibri.UI.Split.OrientationVertical) {
                    this._left.css('flex', '0 0 ' + (e.pageY - this._resizeData.top) + 'px');
                }
    
                this.Dispatch('SplitResizing');

                return false;
            }
        };

        this._handler.addEventListener("touchstart", this.__startResize, false);
        this._handler.addEventListener("mousedown", this.__startResize, false);

    }

    Dispose() {
        this.__stopResize(null);
        super.Dispose();
    }

    __thisResize(event, args) {
        const portrait = window.matchMedia("(orientation: portrait)").matches;
        if(!portrait) {
            this.isMobile = window.innerHeight < 500;
        } else {
            this.isMobile = window.innerWidth < 500;
        }
        this._showViewedSide();
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('SplitResizeStart', false, 'When resize started');
        this.RegisterEvent('SplitResizing', false, 'When resizing process');
        this.RegisterEvent('SplitResizeStop', false, 'When resize ended');
        this.RegisterEvent('ViewSideChanged', false, 'When changed view side on mobile device');
    }

    /**
     * Orienatation of split
     * @type {vertical,horizontal}
     */
    get orientation() {
        return this._orientation;
    }
    /**
     * Orienatation of split
     * @type {vertical,horizontal}
     */
    set orientation(value) {
        this._orientation = value;
        this.AddClass('app-component-split-' + this._orientation);
    }

    /**
     * Container element
     * @type {Element}
     */
    get container() {
        if(this.children == 0) {
            return this._element.querySelector(':scope > .app-component-split-left');
        }
        else {
            return this._element.querySelector(':scope > .app-component-split-right');
        }
    }

    /**
     * Left container
     * @type {Element}
     */
    get left() {
        return this._element.querySelector(':scope > .app-component-split-left');
    }

    /**
     * Right container
     * @type {Element}
     */
    get right() {
        return this._element.querySelector(':scope > .app-component-split-right');
    }

    /**
     * Resize handle
     * @type {Element}
     */
    get handle() {
        return this._element.querySelector(':scope > .app-component-split-handler');
    }
    
    /**
     * Is split has resize handle
     * @type {Boolean}
     */
    get hasHandle() {
        return this._hasHandle;
    }
    /**
     * Is split has resize handle
     * @type {Boolean}
     */
    set hasHandle(value) {
        this._hasHandle = value;
        if (value === true || value === 'true') {
            this._handler.style.display = '';
        } else {
            this._handler.style.display = 'none';
        }
    }
    
    /**
     * Processes the children object
     * @param {string|Element|Element[]} children children to generate
     * @param {Element|Colibri.UI.Component} parent parent component or element
     */
    ProcessChildren(children, parent) {

        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            const componentClass = this.CreateComponentClass(element);
            if(componentClass) {
                let component = this.CreateComponent(componentClass, element, this);
                component && component.ProcessChildren(element.childNodes, component.container);
            }
        }

    }

    /**
     * Right width
     * @type {Number}
     */
    get rightWidth() {
        return parseInt(this._right.css('width'));
    }
    /**
     * Left width
     * @type {Number}
     */
    get leftWidth() {
        return parseInt(this._left.css('width'));
    }

    /**
     * Left width
     * @type {Number}
     */
    set leftWidth(value) {
        this._left.css('flex', '0 0 ' + value);
    }

    CollapseLeft() {
        this.handle.attr('style', 'width: 0px; flex: 0 0 0px');
        this.left.hideElement();
    }

    ExpandLeft() {
        this.handle.attr('style', null);
        this.left.showElement();
    }

    /**
     * Is mobile
     * @type {Boolean}
     */
    get isMobile() {
        return this._isMobile;
    }
    /**
     * Is mobile
     * @type {Boolean}
     */
    set isMobile(value) {
        value = this._convertProperty('Boolean', value);
        this._isMobile = value;
    }

    /**
     * Viewed side in mobile mode
     * @type {left,right}
     */
    get viewedSide() {
        return this._viewedSide;
    }
    /**
     * Viewed side in mobile mode
     * @type {left,right}
     */
    set viewedSide(value) {
        this._viewedSide = value;
        this._showViewedSide();
    }
    _showViewedSide() {
        if(this._isMobile) {
            if(this._viewedSide == 'left') {
                this.RemoveClass('-mobile-right');
                this.AddClass('-mobile-left');
                this.Dispatch('ViewSideChanged', {side: 'left'});
                // this.left.showElement();
                // this.right.hideElement();
            } else {
                this.RemoveClass('-mobile-left');
                this.AddClass('-mobile-right');
                this.Dispatch('ViewSideChanged', {side: 'right'});
                // this.left.hideElement();
                // this.right.showElement();
            }
        } else {
            this.RemoveClass('-mobile-right');
            this.RemoveClass('-mobile-left');
            this.Dispatch('ViewSideChanged', {side: 'none'});
            // this.left.showElement();
            // this.right.showElement();
    }
    }

}