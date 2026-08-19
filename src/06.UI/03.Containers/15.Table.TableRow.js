/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.TableRow = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('tr'));
        this.AddClass('colibri-ui-tablerow');
        this.shown = true;
    }

    /**
     * Adds a cell to table row
     * @param {string} name name of cell
     * @param {string} className class name of cell
     * @param {string} value value of cell
     * @returns {Colibri.UI.TableCell}
     * @public
     */
    AddCell(name, className = null, value = null) {
        const ret = new Colibri.UI.TableCell(name, this);
        if(className) {
            ret.AddClass(className);
        }
        if(value) {
            ret.value = value;
        }
        return ret;
    }

    /**
     * Adds a header cell to table row
     * @param {string} name name of cell
     * @param {string} className class name of cell
     * @param {string} value value of cell
     * @returns {Colibri.UI.TableHeaderCell}
     * @public
     */
    AddHeaderCell(name, className = null, value = null) {
        const ret = new Colibri.UI.TableHeaderCell(name, this);
        if(className) {
            ret.AddClass(className);
        }
        if(value) {
            ret.value = value;
        }
        return ret;
    }

}
