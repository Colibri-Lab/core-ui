/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const table = new Colibri.UI.Table('table', this);
 * table.cellpadding = 5;
 * table.cellspacing = 5;
 * 
 * const row1 = table.AddRow('row1');
 * row1.AddCell('cell1', null, 'Cell 1');
 * row1.AddCell('cell2', null, 'Cell 2');
 * 
 * const row2 = table.AddRow('row2');
 * row2.AddCell('cell3', null, 'Cell 3');
 * row2.AddCell('cell4', null, 'Cell 4');
 * 
 * in html template
 * 
 * <Colibri.UI.Table name="table" cellpadding="5" cellspacing="5">
 *      <Colibri.UI.TableRow name="row1">
 *          <Colibri.UI.TableCell name="cell1" value="Cell 1" />
 *          <Colibri.UI.TableCell name="cell2" value="Cell 2" />
 *      </Colibri.UI.TableRow>  
 *     <Colibri.UI.TableRow name="row2">
 *         <Colibri.UI.TableCell name="cell3" value="Cell 3" />
 *         <Colibri.UI.TableCell name="cell4" value="Cell 4" />
 *     </Colibri.UI.TableRow>
 * </Colibri.UI.Table>
 * 
 * then in js
 * 
 * const table = this.Children('table');
 * const row1 = table.Children('row1');
 * const cell1 = row1.Children('cell1');
 * ```
 */
Colibri.UI.Table = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('table'));
        this.AddClass('colibri-ui-table');
    }

    /**
     * Adds a row to table
     * @param {string} name name of cell
     * @returns {Colibri.UI.TableRow}
     * @public
     */
    AddRow(name, className = null) {
        const row = new Colibri.UI.TableRow(name, this);
        if(className) {
            row.AddClass(className);
        }
        return row;
    }


    /**
     * Cell padding
     * @type {Number}
     */
    get cellpadding() {
        return this._element.attr('cellpadding');
    }
    /**
     * Cell padding
     * @type {Number}
     */
    set cellpadding(value) {
        this._element.attr('cellpadding', value);
    }

    /**
     * Cell spacing
     * @type {Number}
     */
    get cellspacing() {
        return this._element.attr('cellspacing');
    }
    /**
     * Cell spacing
     * @type {Number}
     */
    set cellspacing(value) {
        this._element.attr('cellspacing', value);
    }

}
