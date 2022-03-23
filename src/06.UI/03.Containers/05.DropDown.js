Colibri.UI.DropDown = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-dropdown-component');

        this._search = new Colibri.UI.Input('search', this);
        this._list = new Colibri.UI.List('list', this);
        this._list.__renderItemContent = this.__renderItemContent;

        this._search.placeholder = "Поиск по списку компаний";
        this._search.loading = false;
        this._search.iconSVG = Colibri.UI.SearchIcon;

        this._list.shown = true;
        this._search.shown = true;

        this._list.AddHandler('ItemClicked', (event, args) => this.Dispatch('ItemClicked', {item: args.item, domEvent: args.domEvent}));

        this.AddHandler('Shown', (event, args) => {
            this._search.Focus();
        });

        this.AddHandler('ClickedOut', (event, args) => {
            this.Hide();
        });


    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ItemClicked', false, 'Выбран пунт меню');
    }

    set search(value) {
        this._search.shown = value;
    }
    get search() {
        return this._search.shown;
    }

    set shown(value) {
        super.shown = value;
        if(value) {
            this.BringToFront();
        }
        else {
            this.SendToBack();
        }
    }


}