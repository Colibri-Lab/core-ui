/**
 * Class representing font utility functions.
 * @class
 * @memberof Colibri.Common
 */
Colibri.Common.Font = class {

    /**
     * Array containing the loaded fonts.
     * @type {Array}
     * @private
     */
    _list = [];

    /**
     * Creates an instance of Colibri.Common.Font.
     */
    constructor() {
        this._load();
    }

    /**
     * Loads the fonts from the document.
     * @private
     */
    _load() {
        let { fonts } = document;
        const it = fonts.entries();
        
        let arr = [];
        let done = false;
        
        while (!done) {
            const font = it.next();
            if (!font.done) {
                arr.push(font.value[0]);
            } else {
                done = font.done;
            }
        }
            
        this._list = arr;
    }

    /**
     * Creates an instance of Colibri.Common.Font.
     * @returns {Colibri.Common.Font} A new instance of Colibri.Common.Font.
     * @static
     */
    static Create() {
        return new Colibri.Common.Font();
    }

    /**
     * Get an array of unique font families.
     * @returns {Array} Array of unique font families.
     */
    get families() {
        let ret = [];
        for(const font of this._list) {
            ret.push(font.family);
        }
        return Array.unique(ret);
    }

    /**
     * Get an array of font lookup objects containing value and title properties.
     * @returns {Array} Array of font lookup objects.
     */
    get lookup() {
        return this.families.map(v => { return {value: v, title: v}; });
    }

    /**
     * Get the list of loaded fonts.
     * @returns {Array} List of loaded fonts.
     */
    get list() {
        return this._list;
    }

}