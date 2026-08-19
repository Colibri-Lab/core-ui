/**
 * Grid class, represents a grid container for child components.
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const grid = new Colibri.UI.PaneGrid('grid', this);
 * grid.rows = '1fr 2fr';
 * grid.columns = '1fr 1fr';
 * grid.gap = '10px';
 * 
 * in html template
 * 
 * 
 * <!-- you need to use component full name as child of PaneGrid always -->
 * <Colibri.UI.PaneGrid name="grid" rows="1fr 2fr" columns="1fr 1fr" gap="10px">
 *      <Colibri.UI.Pane name="pane1" />
 *      <Colibri.UI.Pane name="pane2" />
 * </Colibri.UI.PaneGrid>
 * 
 * then in js
 * 
 * const grid = this.Children('grid');
 * const pane1 = grid.Children('pane1');
 * const pane2 = grid.Children('pane2');
 * ```
 */
Colibri.UI.PaneGrid = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container, element) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.PaneGrid']);
        this.AddClass('colibri-ui-panegrid');

        this.GenerateChildren(element, this);

    }

    /**
     * Grid template rows
     * @type {String|Number}
     */
    get rows() {
        return this._element.css('grid-template-rows');
    }
    /**
     * Grid template rows
     * @type {String|Number}
     */
    set rows(value) {
        this._element.css('grid-template-rows', value);
    }

    /**
     * Grid template columns
     * @type {String|Number}
     */
    get columns() {
        return this._element.css('grid-template-columns');
    }
    /**
     * Grid template columns
     * @type {String|Number}
     */
    set columns(value) {
        this._element.css('grid-template-columns', value);
    }

    /**
     * Gap of grid
     * @type {String}
     */
    get gap() {
        return this._element.css('gap');
    }
    /**
     * Gap of grid
     * @type {String}
     */
    set gap(value) {
        this._element.css('gap', value);
    }

}