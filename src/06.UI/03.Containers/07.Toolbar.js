Colibri.UI.Toolbar = class extends Colibri.UI.Component {

    static Vertical = 'vertical';
    static Horizontal = 'horizontal';

    constructor(name, container, element) {
        super(name, container, element || Element.create('div'));
        this.AddClass('app-toolbar-container-component');

        this.AddHandler('Clicked', (event, args) => this.__clicked(event, args));

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ToolbarButtonClicked', false, 'Кликнули на кнопку внутри Toolbar-а');
    }

    set orientation(value) {
        if(value == Colibri.UI.Toolbar.Vertical) {
            this.AddClass('-vertical');
        }
        else {
            this.RemoveClass('-vertical');            
        } 
    }

    get orientation() {
        if(this.HasClass('-vertical')) {
            return Colibri.UI.Toolbar.Vertical;
        }
        else {
            return Colibri.UI.Toolbar.Horizontal;   
        }
    }

    __clicked(event, args) {
        const component = args.domEvent.target.closest('.app-toolbar-container-component > *')?.tag('component');
        this.Dispatch('ToolbarButtonClicked', {button: component});
    }


}