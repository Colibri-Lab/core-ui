/**
 * @classdesc Drag process worker
 * @class
 * @memberof Colibri.UI
 */
Colibri.UI.PointerControl = class {

    /**
     * Element for dragging
     * @type {Element}
     */
    _component = null;
    
    /**
     * @constructor
     * @param {Colibri.UI.Component} component Component to add selector to
     * @param {string} selectionType Selection type (round,box,vertical-box,horizontal-box,circle)
     * @param {string} selectionColor Selection lines color
     * @param {number} selectionLinesStroke Line stroke
     * @param {function} selectionStartHandler Handler for selection start
     * @param {function} selectionEndHandler Handler for selection end
     * @param {function} selectingHandler Handler for selecting process
     */
    constructor(component, selectionStartHandler, selectionEndHandler, selectingHandler, args) {

        this._component = component;
        this._selectionStartHandler = selectionStartHandler;
        this._selectionEndHandler = selectionEndHandler;
        this._selectingHandler = selectingHandler;
        this._args = args;
        
        this._component.AddHandler('MouseDown', this.__componentMouseDown, false, this);

    }

    __componentMouseDown(event, args) {
        const bounds = this._component.container.bounds();
        this._startPoint = {left: args.domEvent.clientX - bounds.left, top: args.domEvent.clientY - bounds.top};
        this._selectionStartHandler(this._startPoint, this._args);
        this._createSelectionEventHandlers();
        args.domEvent.preventDefault();
        args.domEvent.stopPropagation();
        return false;
    }

    Dispose() {
        this._component.RemoveHandler('MouseDown', this.__componentMouseDown, this);
        this._removeSelectionEventHandlers();
    }

    _createSelectionEventHandlers(point) {
        
        this.__documentMouseMove = this.__documentMouseMove || ((e) => {
            const bounds = this._component.container.bounds();
            this._currentPoint = {left: e.clientX - bounds.left, top: e.clientY - bounds.top};
            this._selectingHandler({left: Math.min(this._startPoint.left, this._currentPoint.left), top: Math.min(this._startPoint.top, this._currentPoint.top), width: Math.abs(this._currentPoint.left - this._startPoint.left), height: Math.abs(this._currentPoint.top - this._startPoint.top)}, this._args);
        });

        this.__documentMouseUp = this.__documentMouseUp || ((e) => {
            const bounds = this._component.container.bounds();
            this._endPoint = {left: e.clientX - bounds.left, top: e.clientY - bounds.top};
            this._selectionEndHandler({left: Math.min(this._startPoint.left, this._endPoint.left), top: Math.min(this._startPoint.top, this._endPoint.top), width: Math.abs(this._endPoint.left - this._startPoint.left), height: Math.abs(this._endPoint.top - this._startPoint.top)}, this._args);
            this._removeSelectionEventHandlers();
        });

        document.addEventListener('mousemove', this.__documentMouseMove);
        document.addEventListener('mouseup', this.__documentMouseUp);

    }
    
    _removeSelectionEventHandlers() {
        document.removeEventListener('mousemove', this.__documentMouseMove);
        document.removeEventListener('mouseup', this.__documentMouseUp);
    }

}