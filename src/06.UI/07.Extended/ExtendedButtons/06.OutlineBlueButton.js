/**
 * Outlined button
 * @class
 * @extends Colibri.UI.ExtendedButton
 * @memberof Colibri.UI
 */
Colibri.UI.OutlineBlueButton = class extends Colibri.UI.ExtendedButton {
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-outline-blue-button-component');
    }
}