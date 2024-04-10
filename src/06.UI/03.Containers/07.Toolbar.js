/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Toolbar = class extends Colibri.UI.Component {

    /** Vertical orientation */
    static Vertical = 'vertical';
    /** Horizontal orientation */
    static Horizontal = 'horizontal';

    /** Right aligned buttons  */
    static Right = 'right';
    /** Left aligned buttons  */
    static Left = 'left';
    /** Center aligned buttons  */
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

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ToolbarButtonClicked', false, 'Кликнули на кнопку внутри Toolbar-а');
    }

    /**
     * Orientation
     * @type {vertical,horizontal}
     */
    set orientation(value) {
        if(value == Colibri.UI.Toolbar.Vertical) {
            this.AddClass('-vertical');
        }
        else {
            this.RemoveClass('-vertical');            
        } 
    }

    /**
     * Orientation
     * @type {vertical,horizontal}
     */
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
     * @type {right,left,center}
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
     * @type {right,left,center}
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

    /**
     * @private
     * @param {Colibri.Events.Event} event event object 
     * @param {*} args event arguments
     */
    __clicked(event, args) {
        const component = args.domEvent.target.closest('.app-toolbar-container-component > *')?.tag('component');
        this.Dispatch('ToolbarButtonClicked', {button: component});
    }


}