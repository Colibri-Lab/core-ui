Colibri.UI.MassActionsMenu = class extends Colibri.UI.Component {
    constructor(name, container) {
        super(name, container, Element.create('div'));
        this.AddClass('app-mass-actions-menu-component');

        this._actions = [];
        this._selectedItems = [];

        this._renderMenuPanel();
    }

    /**
     * Регистрация событий
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ActionClicked', false, 'Когда кликнули по кнопке в меню');
    }

    /**
     * Нарисовать меню с контейнером для кнопок
     * @private
     */
    _renderMenuPanel() {
        this._actionsContainer = new Colibri.UI.Pane(this.name + '-actions-container', this);
        this._selectedItemsCounter = new Colibri.UI.Pane(this.name + '-selected-counter', this);
        this._selectedItemsCounter.value = 'Выбрано ' + this._selectedItems.length;

        this._actionsContainer.shown = true;
        this._selectedItemsCounter.shown = true;
    }

    /**
     * Нарисовать кнопки
     * @private
     */
    _renderActions() {
        this._actionsContainer.Clear();
        this._actions.forEach((action) => {
            let actionButton = new Colibri.UI.GrayButton(action.name, this._actionsContainer);
            actionButton.AddClass('app-mass-actions-menu-action-component');
            actionButton.value = action.title;
            actionButton.tag = action;
            actionButton.AddHandler('Clicked', (event, args) => this.Dispatch('ActionClicked', Object.assign({menu: event.sender, menuData: event.sender.tag}, args)));
            actionButton.shown = true
        });
    }

    /**
     * Список экшенов (кнопок) в меню
     * @type {array}
     */
    get actions() {
        return this._actions;
    }
    set actions(value) {
        this._actions = value;
        this._renderActions();
    }

    /**
     * Список выбранных объектов
     * @type {array}
     */
    get selectedItems() {
        return this._selectedItems;
    }
    set selectedItems(value) {
        this._selectedItems = value;
        this._selectedItemsCounter.value = '#{ui-massactions-choosed}'.replaceAll('%s', this._selectedItems.length);
    }

    Dispose() {
        this.shown = false;
        Colibri.Common.Delay(300).then(() => super.Dispose());
    }

}