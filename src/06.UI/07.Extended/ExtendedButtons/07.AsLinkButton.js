/**
 * Button viewed as link
 */
Colibri.UI.AsLinkButton = class extends Colibri.UI.ExtendedButton {
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-aslink-button-component');
    }
}