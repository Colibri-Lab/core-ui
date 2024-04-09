/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.MenuList = class extends Colibri.UI.Component {

    constructor(name, container, element) {
        super(name, container, element || Element.create('menu'));
        this.AddClass('app-component-menulist');
    }

}