/**
 * @class
 * @extends Colibri.UI.Heading
 * @memberof Colibri.UI
 */
Colibri.UI.H1 = class extends Colibri.UI.Heading {
    constructor(name, container) {
        super(name, container, 1);
        this.AddClass('app-component-heading-h1');
    }
}
