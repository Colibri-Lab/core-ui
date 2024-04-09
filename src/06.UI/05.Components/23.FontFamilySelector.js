/**
 * @class
 * @extends Colibri.UI.Selector
 * @memberof Colibri.UI
 */
Colibri.UI.FontFamilySelector = class extends Colibri.UI.Selector {

    constructor(name, container) {
        super(
            name, 
            container, 
            false, 
            false, 
            false,
            Colibri.Common.Font.Create().lookup, 
            '', 
            'title', 
            'value', 
            null,
            itemData => itemData.title);

    }

}

