/**
 * Grayed button
 * @class
 * @extends Colibri.UI.ExtendedButton
 * @memberof Colibri.UI
 */
Colibri.UI.GrayButton = class extends Colibri.UI.ExtendedButton {
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-gray-button-component');
    }
}