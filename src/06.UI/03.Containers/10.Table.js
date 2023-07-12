Colibri.UI.Table = class extends Colibri.UI.Component {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('table'));
        this.AddClass('colibri-ui-table');
    }

    AddRow(name) {
        return new Colibri.UI.TableRow(name, this);
    }

}

Colibri.UI.TableRow = class extends Colibri.UI.Component {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('tr'));
        this.AddClass('colibri-ui-tablerow');
        this.shown = true;
    }

    AddCell(name) {
        return new Colibri.UI.TableCell(name, this);
    }

}

Colibri.UI.TableCell = class extends Colibri.UI.Component {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('td'));
        this.AddClass('colibri-ui-tablecell');
        this.shown = true;
    }

}

