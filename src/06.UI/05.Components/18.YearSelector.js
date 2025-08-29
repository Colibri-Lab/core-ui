/**
 * @class
 * @extends Colibri.UI.Selector
 * @memberof Colibri.UI
 */
Colibri.UI.YearSelector = class extends Colibri.UI.Selector {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {number} startYear year to start enumeration
     * @param {number} endYear year to end enumeration
     */    
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
            itemData => itemData?.title ?? '');

        this.width = 125;
    }

}

