/**
 * Button viewed as link
 */
Colibri.UI.ToggleButton = class extends Colibri.UI.ExtendedButton {
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-toggle-button-component');

        this.iconPosition = 'right';
        this.icon = this.icon || 'Colibri.UI.SelectArrowIcon';
        
        this.state = 'expanded';

    }

    /**
     * 
     * @type {expanded|collapsed}
     */
    get state() {
        return this._state;
    }
    /**
     * 
     * @type {expanded|collapsed}
     */
    set state(value) {
        this._state = value;
        this._showState();
    }
    _showState() {
        if(this._state === 'expanded') {
            this.AddClass('-expanded').RemoveClass('-collapsed');
            this.value = '#{ui-toggle-button-expand}';
        } else {
            this.RemoveClass('-expanded').AddClass('-collapsed');
            this.value = '#{ui-toggle-button-collapse}';
        }
        
    }

}