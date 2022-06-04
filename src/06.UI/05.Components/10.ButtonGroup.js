Colibri.UI.ButtonGroup = class extends Colibri.UI.Component {

    constructor(name, container, element) {
        super(name, container, element || '<div />');
        this.AddClass('app-buttongroup-component');

        this._selectedButton = null;
        
        this.AddHandler('ChildsProcessed', (event, args) => {
            this.ForEach((name, button) => {
                button.AddHandler('Clicked', (event, args) => this.SelectButton(event.sender));
            });
        });
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Поднимается, когда изменилась выбранная кнопка');
    }

    SelectButton(button) {
        if(typeof button == 'string' || typeof button == 'number') {
            button = this.Children(button);
        }
        if(!button) {
            return;
        }

        this.ForEach((name, button) => {
            button.RemoveClass('-selected');
        });
        this._selectedButton = button;
        this._selectedButton.AddClass('-selected');
        this.Dispatch('Changed', {button: this._selectedButton});
    }
    

    AddButton(name, title) {
        if(this.Children(name)) {
            return this.Children(name);
        }
        const button = new Colibri.UI.Button(name, this);
        button.value = title;
        button.shown = true;
        button.AddHandler('Clicked', (event, args) => {
            this.SelectButton(button);
        });
        return button;
    }

    get selected() {
        return this._selectedButton;
    }

    set selected(value) {
        this.SelectButton(value);
    }

    set selectedIndex(index) {
        const keys = Object.keys(this.Children());
        if(!keys[index]) {
            return;
        }
        const button = this.Children(keys[index]);
        if(button) {
            this.selected = button;
        }
    }

    get selectedIndex() {
        return this._selectedButton.childIndex();
    }

}