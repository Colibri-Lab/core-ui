/**
 * Grid header coluumns component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI.Grid
 */
Colibri.UI.Grid.Columns = class extends Colibri.UI.Component {

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

    __thisCheckboxChanged(event, args) {
        this.grid?.Dispatch('HeaderCheckboxChanged', {value: this._checkbox.checked});
    }

    get checkbox() {
        return this._checkbox ?? null;
    }

    _registerEventHandlers() {
        super._registerEventHandlers();
        this.AddHandler('ChildAdded', this.__thisColumnAdded);
    }

    /**
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

    Add(name, title, attrs = {}) {
        const ret = new Colibri.UI.Grid.Column(name, this, null, Object.assign(attrs, {value: title}));
        ret.shown = true;
        return ret;
    }

    Remove(name) {
        const col = this.Children(name);
        if(col) {
            col.Dispose();
        }
    }

    Column(name) {
        if(name === 'firstChild') {
            return this.Children(1);
        } 
        return this.Children(name);
    }

    get grid() {
        return this.parent.grid;
    }

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

    get contextmenuContainer() {
        return this._contextmenuContainer;
    }

    get checkboxContainer() {
        return this._checkboxContainer;
    }

    
    /**
     * SHow hide checkboxes
     * @type {Boolean}
     */
    get showCheckboxes() {
        return this._showCheckboxes;
    }
    /**
     * SHow hide checkboxes
     * @type {Boolean}
     */
    set showCheckboxes(value) {
        this._showCheckboxes = value;
        this._showShowCheckboxes();
    }
    _showShowCheckboxes() {
        this._checkboxContainer.shown = this._showCheckboxes;
    }


}