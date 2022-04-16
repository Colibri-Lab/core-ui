Colibri.UI.UnorderedList = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<ul />');
    }

}

Colibri.UI.OrderedList = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<ol />');
    }

}


Colibri.UI.MenuList = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<menu />');
    }

}

Colibri.UI.ListItem = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<li />');
    }

}