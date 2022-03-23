Colibri.UI.Heading = class extends Colibri.UI.Component {
    constructor(name, container, level = 1) {
        super(name, container, '<h' + level + ' />');
        this.AddClass('app-component-heading');
    }

    get value() {
        return this._element.html();
    }
    set value(value) {
        this._element.html(value);
    }

}

Colibri.UI.H1 = class extends Colibri.UI.Heading {
    constructor(name, container) {
        super(name, container, 1);
    }
}

Colibri.UI.H2 = class extends Colibri.UI.Heading {
    constructor(name, container) {
        super(name, container, 2);
    }
}

Colibri.UI.H3 = class extends Colibri.UI.Heading {
    constructor(name, container) {
        super(name, container, 3);
    }
}

Colibri.UI.H4 = class extends Colibri.UI.Heading {
    constructor(name, container) {
        super(name, container, 4);
    }
}