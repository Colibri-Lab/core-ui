/**
 * Grayed button
 */
Colibri.UI.GrayButton = class extends Colibri.UI.ExtendedButton {
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-gray-button-component');
    }
}