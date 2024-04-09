/**
 * @class
 * @extends Colibri.UI.Selector
 * @memberof Colibri.UI
 */
Colibri.UI.YearSelector = class extends Colibri.UI.Selector {

    constructor(name, container, startYear, endYear) {
        super(
            name, 
            container, 
            false, 
            false,
            false, 
            Array.enumerateRev(startYear, endYear, c => {return {title: c, value: c}}), 
            endYear, 
            'title', 'value', null,
            itemData => itemData.title);

        this.width = 125;
    }

}

