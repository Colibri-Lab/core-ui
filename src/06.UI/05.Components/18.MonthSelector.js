/**
 * @class
 * @extends Colibri.UI.Selector
 * @memberof Colibri.UI
 */
Colibri.UI.MonthSelector = class extends Colibri.UI.Selector {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */    
    constructor(name, container) {
        super(name, container, false, false, false, [
            {title: '#{ui-monthselector-yanuary}', value: '01'},
            {title: '#{ui-monthselector-february}', value: '02'},
            {title: '#{ui-monthselector-march}', value: '03'},
            {title: '#{ui-monthselector-april}', value: '04'},
            {title: '#{ui-monthselector-may}', value: '05'},
            {title: '#{ui-monthselector-jun}', value: '06'},
            {title: '#{ui-monthselector-july}', value: '07'},
            {title: '#{ui-monthselector-august}', value: '08'},
            {title: '#{ui-monthselector-september}', value: '09'},
            {title: '#{ui-monthselector-october}', value: '10'},
            {title: '#{ui-monthselector-november}', value: '11'},
            {title: '#{ui-monthselector-december}', value: '12'},
        ], '01', 'title', 'value', null, itemData => itemData.title);

        this.width = 125;

    }


}

