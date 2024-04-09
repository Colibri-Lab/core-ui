/**
 * @classdesc Drag process worker
 * @class
 * @memberof Colibri.UI
 */
Colibri.UI.Drag = class {

    /**
     * Element for dragging
     * @type {Element}
     */
    _element = null; 

    /**
     * Container in wich drag must be realized
     * @type {Element}
     */
    _container = null;

    /**
     * Element for handle drag start
     * @type {Element}
     */
    _moveHandler = null;

    /**
     * @constructor
     * @param {Element} element Element to drag
     * @param {Element} container Container for drag in
     * @param {Element} moveHandler Element for drag handle
     */
    constructor(element, container, moveHandler) {

        this._element = element;
        this._container = container;
        this._moveHandler = moveHandler;

        this.ЕndHandle = (e) => this.__end(e);
        this.MoveHandle = (e) => this.__move(e);

        this._element.addEventListener('mousedown', (e) => this.__start(e));

    }

    /**
     * @private
     */
    __start(e) {
        const bounds = this._container.bounds();
        this._element.tag = {state: true, point: [e.clientX - bounds.left, e.clientY - bounds.top]};
        document.addEventListener('mouseup', this.ЕndHandle, true);
        document.addEventListener('mousemove', this.MoveHandle, true);
    }

    /**
     * @private
     */
    __end(e) {
        this._element.tag = {state: false};
        document.removeEventListener('mouseup', this.EndHandle, true);
        document.removeEventListener('mousemove', this.MoveHandle, true);
    }

    /**
     * @private
     */
    __move(e) {
        if(this._element.tag.state) {
            // двигаем
            const containerBounds = this._container.bounds();
            const elementBounds = this._element.bounds();
            let newLeft = (e.clientX - containerBounds.left - elementBounds.outerWidth / 2);
            let newTop = (e.clientY - containerBounds.top - elementBounds.outerHeight / 2);
            
            if(newLeft < -1 * elementBounds.outerWidth / 2) { newLeft = -1 * elementBounds.outerWidth / 2; }
            if(newLeft > containerBounds.outerWidth - elementBounds.outerWidth / 2) { newLeft = containerBounds.outerWidth - elementBounds.outerWidth / 2; }

            if(newTop < -1 * elementBounds.outerHeight / 2) { newTop = -1 * elementBounds.outerHeight / 2; }
            if(newTop > containerBounds.outerHeight - elementBounds.outerHeight / 2) { newTop = containerBounds.outerHeight - elementBounds.outerHeight / 2;}

            this._moveHandler(newLeft, newTop);
       }

    }

}