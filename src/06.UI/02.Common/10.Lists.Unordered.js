Colibri.UI.UnorderedList = class extends Colibri.UI.Component {

    constructor(name, container, element) {
        super(name, container, element || Element.create('ul'));
        this.AddClass('app-component-unorderedlist');
    }

}