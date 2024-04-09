/**
 * Error action related button
 * @class
 * @extends Colibri.UI.ExtendedButton
 * @memberof Colibri.UI
 */
Colibri.UI.ErrorButton = class extends Colibri.UI.ExtendedButton {
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-error-button-component');
    }
}