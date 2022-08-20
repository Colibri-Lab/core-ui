
Colibri.UI.FontFamilySelector = class extends Colibri.UI.Selector {

    constructor(name, container) {
        super(
            name, 
            container, 
            false, 
            true, 
            Colibri.Common.Font.Create().lookup, 
            '', 
            'title', 
            'value', 
            null,
            itemData => itemData.title);

    }

}

