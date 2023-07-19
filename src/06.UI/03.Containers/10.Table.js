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

    AddHeaderCell(name) {
        return new Colibri.UI.TableHeaderCell(name, this);
    }

}

Colibri.UI.TableHeaderCell = class extends Colibri.UI.Component {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('th'));
        this.AddClass('colibri-ui-tableheadercell');
        this.shown = true;
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

