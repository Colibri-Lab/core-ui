Colibri.UI.ListItem = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Element.create('li'));
        this.AddClass('app-component-listitem');
    }

}