/**
 * Error action related button
 */
Colibri.UI.ErrorButton = class extends Colibri.UI.ExtendedButton {
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-error-button-component');
    }
}