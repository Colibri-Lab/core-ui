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

        this._icons = ['Colibri.UI.SelectCheckIcon', 'Colibri.UI.ClearIcon'];
        this._labels = [];
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
            this.icon = this._icons[1];
            if(this._labels.length > 1) {
                this.label = this._labels[1];
            }
        } else {
            this.RemoveClass('-checked');
            this.icon = this._icons[0];
            if(this._labels.length > 1) {
                this.label = this._labels[0];
            }
        }
    }

    /**
     * Icons for selection
     * @type {Array<string>}
     */
    get icons() {
        return this._icons;
    }
    /**
     * Icons for selection
     * @type {Array<string>}
     */
    set icons(value) {
        value = this._convertProperty('Array', value);
        this._icons = value;
    }


    /**
     * Array of texts
     * @type {Array<string>}
     */
    get labels() {
        return this._labels;
    }
    /**
     * Array of texts
     * @type {Array<string>}
     */
    set labels(value) {
        value = this._convertProperty('Array', value);
        this._labels = value;
        console.log(this._labels);
    }

}