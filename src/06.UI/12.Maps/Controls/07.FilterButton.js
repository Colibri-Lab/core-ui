/**
 * Button component
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof Colibri.UI.Maps.Controls
 */
Colibri.UI.Maps.Controls.FilterButton = class extends Colibri.UI.FlexBox {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Maps.Controls.FilterButton']);
        this.AddClass('colibri-ui-maps-controls-filterbutton');

        this._icon = this.Children('icon');
        this._label = this.Children('label');
        this._remove = this.Children('remove');
        
        this._remove.AddHandler('Clicked', this.__removeClicked, false, this);
        
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('RemoveClicked', false, 'When remove button is clicked');
    }

    __removeClicked(event, args) {
        this.Dispatch('RemoveClicked', args);
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
    }

    /**
     * Icon in SVG format
     * @type {String}
     */
    get icon() {
        return this._icon.iconSVG;
    }
    /**
     * Icon in SVG format
     * @type {String}
     */
    set icon(value) {
        this._icon.shown = !!value;
        this._icon.iconSVG = value;
    }

    /**
     * Label string
     * @type {String}
     */
    get label() {
        return this._label.value;
    }
    /**
     * Label string
     * @type {String}
     */
    set label(value) {
        this._label.shown = !!value;
        this._label.value = value;
    }
    

}