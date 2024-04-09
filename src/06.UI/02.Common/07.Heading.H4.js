/**
 * @class
 * @extends Colibri.UI.Heading
 * @memberof Colibri.UI
 */
Colibri.UI.H4 = class extends Colibri.UI.Heading {
    constructor(name, container) {
        super(name, container, 4);
        this.AddClass('app-component-heading-h4');
    }
}