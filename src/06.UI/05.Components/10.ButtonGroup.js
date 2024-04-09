/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.ButtonGroup = class extends Colibri.UI.Component {

    constructor(name, container, element) {
        super(name, container, element || Element.create('div'));
        this.AddClass('app-buttongroup-component');

        this._selectedButton = null;

        this.AddHandler('Clicked', (event, args) => this.__thisClicked(event, args));
        
        // this.AddHandler('ChildsProcessed', (event, args) => {
        //     this.ForEach((name, button) => {
        //         button.AddHandler('Clicked', (event, args) => this.SelectButton(button));
        //     });
        // });
    }

    __thisClicked(event, args) {
        const button = args.domEvent.target.tag('component').Closest(component => component.parent instanceof Colibri.UI.ButtonGroup);
        this.SelectButton(button);
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

        const isSelected = button.ContainsClass('-selected');
        this.ForEach((name, button) => {
            button.RemoveClass('-selected');
        });
        
        this._selectedButton = button;
        this._selectedButton.AddClass('-selected');

        if(!isSelected) {
            this.Dispatch('Changed', {button: this._selectedButton, index: this.selectedIndex});
        }

    }
    

    AddButton(name, title) {
        if(this.Children(name)) {
            return this.Children(name);
        }
        const button = new Colibri.UI.Button(name, this);
        button.value = (title[Lang.Current] ?? title);
        button.shown = true;
        // button.AddHandler('Clicked', (event, args) => {
        //     this.SelectButton(button);
        // });
        return button;
    }

    get selected() {
        return this._selectedButton;
    }

    set selected(value) {
        this.SelectButton(value);
    }

    set selectedIndex(index) {
        const button = this.Children(index);
        if(button) {
            this.selected = button;
        }
    }

    get selectedIndex() {
        return this._selectedButton ? this._selectedButton.childIndex : null;
    }

    DisableAllButtons() {
        const childs = this.Children();
        for(const child of childs) {
            child.enabled = false;
        }
        // this.ForEach((name, component) => component.enabled = false);
    }

    EnableButton(name) {
        this.Children(name).enabled = true;
    }

}