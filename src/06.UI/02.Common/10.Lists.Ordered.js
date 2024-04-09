/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.OrderedList = class extends Colibri.UI.Component {

    constructor(name, container, element) {
        super(name, container, element || Element.create('ol'));
        this.AddClass('app-component-orderedlist');
    }

}