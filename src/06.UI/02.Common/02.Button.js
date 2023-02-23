Colibri.UI.Button = class extends Colibri.UI.Component {

    /** 
     * @constructor
     * @param {string} name название компоненты
     * @param {(Aktiondigital.UI.Component|HTMLElement)} container контейнер 
     */
    constructor(name, container) {
        super(name, container, Element.create('button', {type: 'button'}));
        this.AddClass('app-component-button');
    }


}