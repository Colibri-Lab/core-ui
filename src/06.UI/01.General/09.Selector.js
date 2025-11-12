/**
 * @classdesc Drag process worker
 * @class
 * @memberof Colibri.UI
 */
Colibri.UI.Selector = class {

    /**
     * Element for dragging
     * @type {Element}
     */
    _element = null;
    
    /**
     * @constructor
     * @param {Element} element Element to drag
     * @param {Element} container Container for drag in
     * @param {Element} moveHandler Element for drag handle
     */
    constructor(element, container, moveHandler, startHandler, endHandler) {

        this._element = element;
        

    }

    Dispose() {
        
        super.Dispose();
    }

    /**
     * Selection type 
     * @type {round,box,vertical-box,horizontal-box,circle}
     */
    get selectionType() {
        return this._selectionType;
    }
    /**
     * Selection type
     * @type {round,box,vertical-box,horizontal-box,circle}
     */
    set selectionType(value) {
        this._selectionType = value;
    }

    /**
     * Selection lines color    
     * @type {String}
     */
    get selectionColor() {
        return this._selectionColor;
    }
    /**
     * Selection lines color
     * @type {String}
     */
    set selectionColor(value) {
        this._selectionColor = value;
    }

    /**
     * Line stroke
     * @type {Number}
     */
    get selectionLinesStroke() {
        return this._selectionLinesStroke;
    }
    /**
     * Line stroke
     * @type {Number}
     */
    set selectionLinesStroke(value) {
        this._selectionLinesStroke = parseInt(value);
    }

    
    _onMouseDown(e) {
        const rect = this._element.getBoundingClientRect();
        this._isDrawing = true;
        this._startX = e.clientX - rect.left;
        this._startY = e.clientY - rect.top;

        if (this._startHandler) this._startHandler({x: this._startX, y: this._startY});

        this._currentShape = document.createElement('div');
        this._currentShape.style.position = 'absolute';
        this._currentShape.style.border = `${this._selectionLinesStroke}px solid ${this._selectionColor}`;
        this._currentShape.style.pointerEvents = 'none';
        this._currentShape.style.borderRadius = this._selectionType === 'circle' || this._selectionType === 'round' ? '50%' : '0';
        this._container.appendChild(this._currentShape);
    }
    
    _onMouseMove(e) {
        if (!this._isDrawing || !this._currentShape) return;

        const rect = this._element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const width = Math.abs(x - this._startX);
        const height = Math.abs(y - this._startY);

        const left = Math.min(x, this._startX);
        const top = Math.min(y, this._startY);

        this._currentShape.style.left = left + 'px';
        this._currentShape.style.top = top + 'px';
        this._currentShape.style.width = width + 'px';
        this._currentShape.style.height = height + 'px';
    }
    
    _onMouseUp(e) {
        if (!this._isDrawing) return;
        this._isDrawing = false;

        const rect = this._currentShape.getBoundingClientRect();
        const shapeData = {
            type: this._selectionType,
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            color: this._selectionColor,
            stroke: this._selectionLinesStroke
        };

        if (this._endHandler) this._endHandler(shapeData);

        this._currentShape = null;
    }

    

}