Colibri.UI.UnorderedList = class extends Colibri.UI.Component {

    constructor(name, container, element) {
        super(name, container, element || '<ul />');
    }

}

Colibri.UI.OrderedList = class extends Colibri.UI.Component {

    constructor(name, container, element) {
        super(name, container, element || '<ol />');
    }

}


Colibri.UI.MenuList = class extends Colibri.UI.Component {

    constructor(name, container, element) {
        super(name, container, element || '<menu />');
    }

}

Colibri.UI.ListItem = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<li />');
    }

}