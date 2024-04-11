/**
 * Extended buttons base class
 * @class
 * @extends Colibri.UI.Button
 * @memberof Colibri.UI
 */
Colibri.UI.ExtendedButton = class extends Colibri.UI.Button {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-extended-button-component');
        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;
    }

    /**
     * Icon 
     * @type {string}
     */
    get icon() {
        return this._icon.iconSVG;
    }

    /**
     * Icon 
     * @type {string}
     */
    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    /**
     * Value 
     * @type {string}
     */
    get value() {
        return this._span.value;
    }

    /**
     * Value 
     * @type {string}
     */
    set value(value) {
        this._span.value = value;
    }

    /**
     * Icon position 
     * @type {right,true,false|boolean}
     */
    set iconPosition(value) {
        if(value === 'right' || value === 'true' || value === true) {
            this.AddClass('ui-icon-right');
        }
        else {
            this.RemoveClass('ui-icon-right');
        }
    }
    /**
     * Icon position 
     * @type {right,true,false|boolean}
     */
    get iconPosition() {

    }
    
    /**
     * Tool tip string
     * @type {String}
     */
    get toolTip() {
        return this._span.toolTip;
    }
    /**
     * Tool tip string
     * @type {String}
     */
    set toolTip(value) {
        this._span.toolTip = value;
    }

}