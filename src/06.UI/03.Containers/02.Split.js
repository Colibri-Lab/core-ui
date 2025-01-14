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

        
        const startResize = (e) => {
            this._resizing = true;
            Colibri.UI.Resizing = true;
            this._resizeData = this._left.bounds();
            this.AddClass('-resizing');

            // ставим на документ, чтобы точно перехватить        
            document.addEventListener("touchend", stopResize, {capture: true});
            document.addEventListener("mouseup", stopResize, {capture: true});

            document.addEventListener("touchmove", doResize, {capture: true});
            document.addEventListener("mousemove", doResize, {capture: true});

            this.Dispatch('SplitResizeStart');

            return false;

        };

        const stopResize = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.RemoveClass('-resizing');
        
            this._resizing = false;
            Colibri.UI.Resizing = false;

            document.removeEventListener("touchend", this.__resizeEnd, {capture: true});
            document.removeEventListener("mouseup", this.__resizeEnd, {capture: true});
    
            document.removeEventListener("touchmove", doResize, {capture: true});
            document.removeEventListener("mousemove", doResize, {capture: true});

            this.Dispatch('SplitResizeStop');

            return false;

        };

        const doResize = (e) => {
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

        this._handler.addEventListener("touchstart", startResize, false);
        this._handler.addEventListener("mousedown", startResize, false);

    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('SplitResizeStart', false, 'Когда начинаем изменять размер');
        this.RegisterEvent('SplitResizing', false, 'В процессе изменения размера');
        this.RegisterEvent('SplitResizeStop', false, 'Когда закончили изменять размер');
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

}