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

        this.__EndHandle = (e) => this.__end(e);
        this.__MoveHandle = (e) => this.__move(e);
        this.__StartHandle = (e) => this.__start(e);

        this._element.addEventListener('mousedown', this.__StartHandle);

    }

    Dispose() {
        this.__end();
        this._element.removeEventListener('mousedown', this.__StartHandle);
        super.Dispose();
    }

    /**
     * @private
     */
    __start(e) {
        const bounds = this._container.bounds();
        const elementBounds = this._element.bounds();
        this._element.tag = { state: true, delta: [e.clientX - elementBounds.left, e.clientY - elementBounds.top] };
        document.addEventListener('mouseup', this.__EndHandle, true);
        document.addEventListener('mousemove', this.__MoveHandle, true);
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * @private
     */
    __end(e) {
        this._element.tag = { state: false };
        document.removeEventListener('mouseup', this.__EndHandle, true);
        document.removeEventListener('mousemove', this.__MoveHandle, true);
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * @private
     */
    __move(e) {
        if (this._element.tag.state) {
            // двигаем
            const containerBounds = this._container.bounds();
            const elementBounds = this._element.bounds();
            const delta = this._element.tag.delta;

            let newLeft = (e.clientX - delta[0] - containerBounds.left);
            console.log(e.clientX, delta[0], containerBounds.left)
            let newTop = (e.clientY - delta[1] - containerBounds.top);

            // if (newLeft < -1 * elementBounds.outerWidth / 2) { newLeft = -1 * elementBounds.outerWidth / 2; }
            // if (newLeft > containerBounds.outerWidth - elementBounds.outerWidth / 2) { newLeft = containerBounds.outerWidth - elementBounds.outerWidth / 2; }

            // if (newTop < -1 * elementBounds.outerHeight / 2) { newTop = -1 * elementBounds.outerHeight / 2; }
            // if (newTop > containerBounds.outerHeight - elementBounds.outerHeight / 2) { newTop = containerBounds.outerHeight - elementBounds.outerHeight / 2; }

            this._moveHandler(newLeft, newTop);
        }

        e.preventDefault();
        e.stopPropagation();

    }

}