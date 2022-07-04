
Colibri.UI.FontFamilySelector = class extends Colibri.UI.Selector {

    constructor(name, container, startYear, endYear) {
        super(
            name, 
            container, 
            false, 
            true, 
            EnumerateFonts(), 
            '', 
            'title', 
            'value', 
            itemData => itemData.title);

    }

}

