/**
 * Rotate button
 * @class
 * @extends Colibri.UI.Maps.Controls.Button
 * @memberof Colibri.UI.Maps.Controls
 */
Colibri.UI.Maps.Controls.RotateButton = class extends Colibri.UI.Maps.Controls.Button {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-maps-controls-rotatebutton');

        this._rotationAngle = 0;
        this._rotating = false;
        this.AddHandler(['MouseDown','TouchStart'], this.__thisMouseDown);
        this.AddHandler('DoubleClicked', this.__thisDoubleClicked);
    }

    __thisDoubleClicked(event, args) {
        this._rotationAngle = 0;
        this._icon.rotation = 0;
        this.Dispatch('Rotated', {angle: 0});
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Rotating', false, 'When the map must be rotated');
        this.RegisterEvent('Rotated', false, 'When the map must be rotated');
    }

    __thisMouseDown(event, args) {
        this._rotating = true;
        this.AddClass('-rotating');

        const clientX = args.domEvent.type.startsWith('touch') ? args.domEvent.touches[0].clientX : args.domEvent.pageX;
        const clientY = args.domEvent.type.startsWith('touch') ? args.domEvent.touches[0].clientY : args.domEvent.pageY;

        this._delta = {
            left: clientX - this._element.bounds().left,
            top: clientY - this._element.bounds().top
        };

        this._movingHandler = (e) => {
            if (!this.isConnected || !this._rotating) {
                return;
            }


            let direction = 1;
            if(e.movementY < 0) {
                direction = -1;
            }

            let speed = 1;
            if(e.movementY > 5) {
                speed = 2;
            } else if(e.movementY > 20) {
                speed = 5;
            } else {
                speed = 10;
            }

            this._rotationAngle = this._rotationAngle + direction * speed;
            if(Math.abs(this._rotationAngle) > 360) {
                this._rotationAngle = (this._rotationAngle < 0 ? -1 : 1) * 360;
            }

            this._icon.rotation = this._rotationAngle;
            this.Dispatch('Rotating', {angle: this._icon.rotation});

            if (e.type.startsWith('touch')) {
                e.preventDefault();
            }

        };

        this._movingEndHandler = (e) => {

            this.RemoveClass('-rotating');
            this._rotating = false;
            this._delta = null;

            document.body.removeEventListener('mousemove', this._movingHandler, true);
            document.body.removeEventListener('touchmove', this._movingHandler, true);
            
            document.body.removeEventListener('mousedown', this._movingEndHandler, true);
            document.body.removeEventListener('touchend', this._movingEndHandler, true);
            
            this.Dispatch('Rotated', {angle: this._icon.rotation});

        
        };
        
        document.body.addEventListener('mousemove', this._movingHandler, true);
        document.body.addEventListener('touchmove', this._movingHandler, true);

        document.body.addEventListener('mouseup', this._movingEndHandler, true);
        document.body.addEventListener('touchend', this._movingEndHandler, true);

        // need to detect when to mouse is out the document, and stop all

    }

    get rotating() {
        return this._rotating;
    }

}