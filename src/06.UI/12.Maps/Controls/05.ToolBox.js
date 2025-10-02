/**
 * Toolbox
 * @class
 * @extends Colibri.UI.ButtonGroup
 * @memberof Colibri.UI.Maps.Controls
 */
Colibri.UI.Maps.Controls.ToolBox = class extends Colibri.UI.ButtonGroup {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Maps.Controls.ToolBox']);
        this.AddClass('colibri-ui-maps-controls-toolbox');

        this._orientation = 'horizontal';
        this.AddClass('-horizontal');
    }

    /**
     * @type {vertical,horizontal}
     */
    get orientation() {
        return this._orientation;
    }
    /**
     * @type {vertical,horizontal}
     */
    set orientation(value) {
        this._orientation = value;
        this.AddClass('-' + this._orientation);
    }

}