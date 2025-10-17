/**
 * Move manager
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.UI
 */
Colibri.UI.MoveManager = class extends Colibri.Events.Dispatcher {

    /**
     * @constructor
     * @param {Colibri.UI.Component[]} sources array of source items
     * @param {Colibri.UI.Component[]} destinations destination items 
     */
    constructor(component) {
        super();
        
        this._component = component;
        this._startTimer = -1;

        this.RegisterEvent('MoveComplete', false, 'When move completed');
        this.RegisterEvent('Move', false, 'When move is in progress');
        this.RegisterEvent('MoveStart', false, 'When move is started');

        this._movingStartTimerInit = this._movingStartTimerInit || ((e) => {
            if(this._startTimer) {
                clearTimeout(this._startTimer);
                this._startTimer = -1;
            }
            this._startTimer = setTimeout(() => {
                this._movingStartHandler(e);
            }, 500);
        })

        /** @private */
        this._movingStartHandler = this._movingStartHandler || ((e) => {
            const isTouch = e.type.startsWith('touch');
            
            this.moving = true;
            this._movingDelta = {
                left: isTouch ? e.touches[0].clientX : e.pageX,
                top: isTouch ? e.touches[0].clientY : e.pageY
            };
            document.body?.addEventListener(isTouch ? 'touchmove' : 'mousemove', this._movingHandler, {passive: false});
            document.body?.addEventListener(isTouch ? 'touchend' : 'mouseup', this._movingStopHandler);

            this.Dispatch('MoveStart', {start: this._movingDelta});

        });

        /** @private */
        this._movingStopHandler = this._movingStopHandler || ((e) => {
            this.moving = false;
            if(!this._component.isConnected) {
                return;
            }

            document.body?.removeEventListener('mousemove', this._movingHandler);
            document.body?.removeEventListener('mouseup', this._movingStopHandler);
            document.body?.removeEventListener('touchmove', this._movingHandler);
            document.body?.removeEventListener('touchend', this._movingStopHandler);

            this.Dispatch('MoveComplete', {});
        });

         /** @private */
        this._movingHandler = this._movingHandler || ((e) => {

            if (!this._component.isConnected || !this.moving) {
                return;
            }
            
            const isTouch = e.type.startsWith('touch');
            const delta = {
                left: (isTouch ? e.touches[0].movementX : e.pageX) - this._movingDelta.left,
                top: (isTouch ? e.touches[0].movementY : e.pageY) - this._movingDelta.top
            };
            if (isTouch) {
                e.preventDefault();
            }

            this._movingDelta = {
                left: isTouch ? e.touches[0].clientX : e.pageX,
                top: isTouch ? e.touches[0].clientY : e.pageY
            };
            this.Dispatch('Move', {delta: delta});
        });

        this._movingTimerEnd = this._movingTimerEnd || ((e) => {
            if(this._startTimer) {
                clearTimeout(this._startTimer);
                this._startTimer = -1;
            }
        });

        this._component.container.addEventListener('mousedown', this._movingStartTimerInit);
        this._component.container.addEventListener('touchstart', this._movingStartTimerInit);

        this._component.container.addEventListener('mouseup', this._movingTimerEnd);
        this._component.container.addEventListener('touchend', this._movingTimerEnd);
            
    }


    
    /**
     * Dispose the component
     */
    Dispose() {

        super.Dispose();
    }

    /**
     * Is window currently moving
     * @type {boolean}
     */
    set moving(value) {
        document.body.style.userSelect = value ? 'none' : '';
        document.body.style.cursor = value ? 'grabbing' : '';
        this._moving = value;
    }

    /**
     * Is window currently moving
     * @type {boolean}
     */
    get moving() {
        return this._moving;
    }

    set movingPoint(value) {
        this._movingDelta = value;
    }

    get movingPoint() {
        return this._movingDelta;
    }

   
}