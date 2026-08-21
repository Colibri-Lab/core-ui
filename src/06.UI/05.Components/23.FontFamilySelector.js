/**
 * Font family selector component
 * @class
 * @extends Colibri.UI.Selector
 * @memberof Colibri.UI
 * @example
 * ```
 * const fontFamilySelector = new Colibri.UI.FontFamilySelector('fontFamilySelector', this);
 * fontFamilySelector.AddHandler('Changed', (event, args) => {
 *     console.log('Selected font family:', args.value);
 * });
 * ```
 */
Colibri.UI.FontFamilySelector = class extends Colibri.UI.Selector {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */    
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

