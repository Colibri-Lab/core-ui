/**
 * Toggle button
 * @class
 * @extends Colibri.UI.Maps.Controls.Button
 * @memberof Colibri.UI.Maps.Controls
 */
Colibri.UI.Maps.Controls.ToggleButton = class extends Colibri.UI.Maps.Controls.Button {
     
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Maps.Controls.ToggleButton']);
        this.AddClass('colibri-ui-maps-controls-togglebutton');

        this.AddHandler('Clicked', this.__thisClicked);

    }

    __thisClicked(event, args) {
        if(!this.enabled) {
            return;
        }
        this.checked = !this.checked;
        
    }

    /**
     * Checked or not
     * @type {Boolean}
     */
    get checked() {
        return this._checked;
    }
    /**
     * Checked or not
     * @type {Boolean}
     */
    set checked(value) {
        value = this._convertProperty('Boolean', value);
        this._checked = value;
        this._showChecked();
    }
    _showChecked() {
        if(this._checked) {
            this.AddClass('-checked');
            this.icon = 'Colibri.UI.SelectCheckIcon';
        } else {
            this.RemoveClass('-checked');
            this.icon = 'Colibri.UI.ClearIcon';
        }
    }

}