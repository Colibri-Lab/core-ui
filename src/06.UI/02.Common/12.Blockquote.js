Colibri.UI.Blockquote = class extends Colibri.UI.Component {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('blockquote'));
        this.AddClass('app-component-blockquote');


    }

}