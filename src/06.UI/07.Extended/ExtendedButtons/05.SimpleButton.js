/**
 * Simple button, not submit or reset
 */
Colibri.UI.SimpleButton = class extends Colibri.UI.ExtendedButton {
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-simple-button-component');
    }
}