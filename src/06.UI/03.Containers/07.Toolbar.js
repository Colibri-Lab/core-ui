/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Toolbar = class extends Colibri.UI.Component {

    static Vertical = 'vertical';
    static Horizontal = 'horizontal';

    static Right = 'right';
    static Left = 'left';
    static Center = 'center';

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     * @param {string|HTMLElement} element element to generate in
     */
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

    /**
     * Align the itens
     * @type {String}
     */
    get align() {
        if(this.HasClass('-right')) {
            return Colibri.UI.Toolbar.Right;
        } else if(this.HasClass('-left')) {
            return Colibri.UI.Toolbar.Left;
        } else {
            return Colibri.UI.Toolbar.Center;   
        }
    }
    /**
     * Align the itens
     * @type {String}
     */
    set align(value) {
        this.RemoveClass('-left');
        this.RemoveClass('-right');
        this.RemoveClass('-center');
        if(value == Colibri.UI.Toolbar.Left) {
            this.AddClass('-left');
        } else if(value == Colibri.UI.Toolbar.Right) {
            this.AddClass('-right');
            this.RemoveClass('-center');            
        } 
    }

    __clicked(event, args) {
        const component = args.domEvent.target.closest('.app-toolbar-container-component > *')?.tag('component');
        this.Dispatch('ToolbarButtonClicked', {button: component});
    }


}