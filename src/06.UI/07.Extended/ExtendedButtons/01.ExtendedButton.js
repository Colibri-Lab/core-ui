/**
 * Extended buttons base class
 */
Colibri.UI.ExtendedButton = class extends Colibri.UI.Button {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-extended-button-component');
        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;
    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
    }

    set iconPosition(value) {
        if(value) {
            this.AddClass('ui-icon-right');
        }
        else {
            this.RemoveClass('ui-icon-right');
        }
    }

}