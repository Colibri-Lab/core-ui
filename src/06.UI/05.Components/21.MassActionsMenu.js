/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.MassActionsMenu = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */    
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-mass-actions-menu-component');

        this._actions = [];
        this._selectedItems = [];

        this._renderMenuPanel();
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ActionClicked', false, 'When you click on the button in the menu');
    }

    /** @private */
    _renderMenuPanel() {
        this._actionsContainer = new Colibri.UI.Pane(this.name + '-actions-container', this);
        this._selectedItemsCounter = new Colibri.UI.Pane(this.name + '-selected-counter', this);
        this._selectedItemsCounter.value = 'Выбрано ' + this._selectedItems.length;

        this._actionsContainer.shown = true;
        this._selectedItemsCounter.shown = true;
    }

    /** @private */
    _renderActions() {
        this._actionsContainer.Clear();
        this._actions.forEach((action) => {
            let actionButton = new Colibri.UI.GrayButton(action.name, this._actionsContainer);
            actionButton.AddClass('app-mass-actions-menu-action-component');
            actionButton.value = action.title;
            if(action.icon) {
                actionButton.icon = action.icon;
            }
            if(action.contextmenu && action.contextmenu.length > 0) {
                actionButton.contextmenu = action.contextmenu;
            }
            actionButton.tag = action;
            actionButton.AddHandler('ContextMenuItemClicked', (event, args) => {
                this.Dispatch('ActionClicked', args);
            });
            actionButton.AddHandler('Clicked', (event, args) => {
                if(event.sender.contextmenu.length > 0) {
                    event.sender.ShowContextMenu([Colibri.UI.ContextMenu.LT, Colibri.UI.ContextMenu.RT], '', null);
                } else {
                    this.Dispatch('ActionClicked', Object.assign({menu: event.sender, menuData: event.sender.tag}, args));
                }
            });
            actionButton.shown = true
        });
    }

    /**
     * Action menu items
     * @type {Array}
     */
    get actions() {
        return this._actions;
    }
    /**
     * Action menu items
     * @type {Array}
     */
    set actions(value) {
        this._actions = value;
        this._renderActions();
    }

    /**
     * Selected items
     * @type {Array}
     */
    get selectedItems() {
        return this._selectedItems;
    }
    /**
     * Selected items
     * @type {Array}
     */
    set selectedItems(value) {
        this._selectedItems = value;
        this._selectedItemsCounter.value = '#{ui-massactions-choosed}'.replaceAll('%s', this._selectedItems.length);
        if(this._selectedItems.length == 0) {
            this.Hide();            
        } else {
            this.Show();
        }
    }

    /**
     * Disposes the object
     */
    Dispose() {
        this.shown = false;
        Colibri.Common.Delay(300).then(() => super.Dispose());
    }

}