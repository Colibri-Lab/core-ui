/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Pane = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     * @param {string|HTMLElement} element element to generate in
     * @param {number} resizable is component resizable 
     */
    constructor(name, container, element) {
        super(name, container, element || Element.create('div'));

        this.AddClass('app-component-pane');


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
                this.styles = { cursor: corner };
            } else {
                this.styles = { cursor: 'grab' };
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

            } else if (this._movable) {
                let previousClientX = e.clientX,
                    previousClientY = e.clientY;

                let previousLeft = this.styles.left ? parseInt(this.styles.left) : 0,
                    previousTop = this.styles.top ? parseInt(this.styles.top) : 0;

                this.tag._diffX = previousClientX - previousLeft;
                this.tag._diffY = previousClientY - previousTop;
                this._isDragged = true;

                document.addEventListener('mousemove', this.__dragMoveHandler);
                document.addEventListener('mouseup', this.__dragStopHandler);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;

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
                newWidth = this._resizeStart.width + dx;
            }
            if (this._resizeDir.indexOf('s') !== -1) {
                newHeight = this._resizeStart.height + dy;
            }
            if (this._resizeDir.indexOf('w') !== -1) {
                newWidth = this._resizeStart.width - dx;
                newLeft = this._resizeStart.left + dx;
            }
            if (this._resizeDir.indexOf('n') !== -1) {
                newHeight = this._resizeStart.height - dy;
                newTop = this._resizeStart.top + dy;
            }

            const args = {width: newWidth, height: newHeight, top: newTop, left: newLeft, delta: {left: dx, top: dy}, direction: this._resizeDir};
            this.Dispatch('SizeChanging', args);

            this._element.style.width = args.width + 'px';
            this._element.style.height = args.height + 'px';
            this._element.style.left = args.left + 'px';
            this._element.style.top = args.top + 'px';

            e.preventDefault();
            e.stopPropagation();
            return false;

        };

        this.__resizeStop = () => {
            document.removeEventListener('mousemove', this.__resizeMove);
            document.removeEventListener('mouseup', this.__resizeStop);
            this._element.css('cursor', null);
            this._resizeDir = null;
            this._resizeStart = null;
            this.Dispatch('SizeChanged', {});
        };

        this.__dragMoveHandler = (e) => {
            if (this._movable && this._isDragged) {
                let newClientX = e.clientX,
                    newClientY = e.clientY,
                    newLeft = newClientX - this.tag._diffX,
                    newTop = newClientY - this.tag._diffY;

                if(newTop < 0) {
                    newTop = 0;
                }
                if(newLeft < 0) {
                    newLeft = 0;
                }

                if(newTop + this.height > this.parent.height) {
                    newTop = this.parent.height - this.height;
                }
                if(newLeft + this.width > this.parent.width) {
                    newLeft = this.parent.width - this.width;
                }

                const args = {top: newTop, left: newLeft};
                this.Dispatch('PositionChanging', args);

                this._element.style.top = args.top + 'px';
                this._element.style.left = args.left + 'px';
            }
        };
        this.__dragStopHandler = (e) => {
            if (this._movable && this._isDragged) {
                document.removeEventListener('mousemove', this.__dragMoveHandler);
                document.removeEventListener('mouseup', this.__dragStopHandler);
                this._isDragged = false;
                this.Dispatch('PositionChanged', {}); 
            }
        }
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('SizeChanging', false, 'When resize in progress');
        this.RegisterEvent('SizeChanged', false, 'When resize completed');
        this.RegisterEvent('PositionChanging', false, 'When move in progress');
        this.RegisterEvent('PositionChanged', false, 'When move completed');
    }

    /**
     * Is pane movable
     * @type {Boolean}
     */
    get movable() {
        return this._movable;
    }
    /**
     * Is pane movable
     * @type {Boolean}
     */
    set movable(value) {
        this._movable = value;
        this._showMovable();
    }
    _showMovable() {
        if (this._movable) {
            this._element.addEventListener('mousedown', this.__dragStartHandler);
        } else {
            this._element.removeEventListener('mousedown', this.__dragStartHandler);
        }
    }

    /**
     * Resizable
     * @type {Boolean}
     */
    get resizable() {
        return this._resizable;
    }
    /**
     * Resizable
     * @type {Boolean}
     */
    set resizable(value) {
        this._resizable = value;
        this._showResizable();
    }
    _showResizable() {
        this._element.addEventListener('mousemove', this.__startMove, true);
        this._element.addEventListener('mousedown', this.__mouseDown, true);
    }


}