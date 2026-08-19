/**
 * Grid header coluumns component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Grid
 */
Colibri.UI.Grid.Columns = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {boolean} createCheckBox whether to create a checkbox column or not
     */
    constructor(name, container, createCheckBox = false) {
        super(name, container, Element.create('tr'));
        this.AddClass('app-ui-header-columns');

        if(createCheckBox) {
            
            this._checkboxContainer = new Colibri.UI.Grid.Column('checkbox-column', this, null, {value: '', shown: false});
            this._checkboxContainer.shown = false;
    
            this._checkbox = new Colibri.UI.Checkbox('checkbox', this._checkboxContainer);
            this._checkbox.hasThirdState = true;
            this._checkbox.shown = true;
    
            this._checkbox.AddHandler('Changed', this.__thisCheckboxChanged, false, this);

            this._contextmenuContainer = new Colibri.UI.Grid.Column('contextmenu-column', this, null, {value: '', shown: true, width: 20});
            this._contextmenuContainer.shown = false;
        }


    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __thisCheckboxChanged(event, args) {
        this.grid?.Dispatch('HeaderCheckboxChanged', {value: this._checkbox.checked});
    }

    /**
     * Get checkbox column
     * @type {Colibri.UI.Checkbox}
     */
    get checkbox() {
        return this._checkbox ?? null;
    }

    /**
     * @protected
     * @ignore
     */
    _registerEventHandlers() {
        super._registerEventHandlers();
        this.AddHandler('ChildAdded', this.__thisColumnAdded);
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __thisColumnAdded(event, args) {
        if(args.column.name != 'checkbox-column' && args.column.name != 'contextmenu-column') {
            if(this._contextmenuContainer) {
                this.MoveChild(this._contextmenuContainer, this._contextmenuContainer.childIndex, this.children, false);
            }
        }
        this.grid?.Dispatch('ColumnAdded', {column: args.column});
    }

    /**
     * Add the column
     * @param {Colibri.UI.Grid.Column} column The column to be added.
     * @public
     */
    Add(name, title, attrs = {}) {
        const ret = new Colibri.UI.Grid.Column(name, this, null, Object.assign(attrs, {value: title}));
        ret.shown = true;
        return ret;
    }

    /**
     * Remove column by name
     * @param {string} name The name of the column to be removed.
     * @public
     */
    Remove(name) {
        const col = this.Children(name);
        if(col) {
            col.Dispose();
        }
    }

    /**
     * Column by name
     * @param {string} name The name of the column to be retrieved.
     * @returns {Colibri.UI.Grid.Column} The column with the specified name, or null if not found.
     * @public
     */
    Column(name) {
        if(name === 'firstChild') {
            return this.Children(1);
        } 
        return this.Children(name);
    }

    /**
     * Gets the grid
     * @type {Colibri.UI.Grid}
     */
    get grid() {
        return this.parent.grid;
    }

    /**
     * Columns count
     * @type {Number}
     */
    get count() {
        return this.children - 1;
    }

    /**
     * Has context menu
     * @type {Boolean}
     */
    get hasContextMenu() {
        return this._contextmenuContainer.shown;
    }
    
    /**
     * Has context menu
     * @type {Boolean}
     */
    set hasContextMenu(value) {
        this._contextmenuContainer.shown = value;
    }

    /**
     * Get context menu container
     * @type {Colibri.UI.Grid.Column}
     */
    get contextmenuContainer() {
        return this._contextmenuContainer;
    }

    /**
     * Get checkbox container
     * @type {Colibri.UI.Grid.Column}
     */
    get checkboxContainer() {
        return this._checkboxContainer;
    }

    
    /**
     * Show hide checkboxes
     * @type {Boolean}
     */
    get showCheckboxes() {
        return this._showCheckboxes;
    }
    /**
     * Show hide checkboxes
     * @type {Boolean}
     */
    set showCheckboxes(value) {
        this._showCheckboxes = value;
        this._showShowCheckboxes();
    }
    /**
     * @ignore
     * @private
     */
    _showShowCheckboxes() {
        this._checkboxContainer.shown = this._showCheckboxes;
    }


}