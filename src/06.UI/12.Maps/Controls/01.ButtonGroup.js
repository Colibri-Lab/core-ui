/**
 * Controls button group
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof Colibri.UI.Maps.Controls
 */
Colibri.UI.Maps.Controls.ButtonGroup = class extends Colibri.UI.FlexBox {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Maps.Controls.ButtonGroup']);
        this.AddClass('colibri-ui-maps-controls-buttongroup');


    }

    /**
     * Position of button group
     * @type {lefttop,righttop,leftbottom,rightbottom}
     */
    get position() {
        return this._position;
    }
    /**
     * Position of button group
     * @type {lefttop,righttop,leftbottom,rightbottom}
     */
    set position(value) {
        this._position = value;
        this.RemoveClass(['-lefttop','-righttop','-leftbottom','-rightbottom'])
        this.AddClass('-' + value);
    }

    /**
     * Orientation of buttons
     * @type {horizontal,vertical}
     */
    get orientation() {
        return this._orientation;
    }
    /**
     * Orientation of buttons
     * @type {horizontal,vertical}
     */
    set orientation(value) {
        this._orientation = value;
        this.RemoveClass(['-horizontal','-vertical']);
        this.AddClass('-' + value);
    }

}