/**
 * Toggle button
 * @class
 * @extends Colibri.UI.ExtendedButton
 * @memberof Colibri.UI
 */
Colibri.UI.ToggleButton = class extends Colibri.UI.ExtendedButton {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-toggle-button-component');

        this.iconPosition = 'right';
        this.icon = this.icon || 'Colibri.UI.SelectArrowIcon';
        
        this.state = 'expanded';

    }

    /**
     * Stat of button
     * @type {expanded|collapsed}
     */
    get state() {
        return this._state;
    }
    /**
     * Stat of button
     * @type {expanded|collapsed}
     */
    set state(value) {
        this._state = value;
        this._showState();
    }
    /** @private */
    _showState() {
        if(this._state === 'expanded') {
            this.AddClass('-expanded').RemoveClass('-collapsed');
            this.value = '#{ui-toggle-button-collapse}';
        } else {
            this.RemoveClass('-expanded').AddClass('-collapsed');
            this.value = '#{ui-toggle-button-expand}';
        }
        
    }

}