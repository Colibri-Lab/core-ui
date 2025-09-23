/**
 * Button component
 * @class
 * @extends Colibri.UI.FlexBox
 * @memberof Colibri.UI.Maps.Controls
 */
Colibri.UI.Maps.Controls.LayersButton = class extends Colibri.UI.FlexBox {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Maps.Controls.LayersButton']);
        this.AddClass('colibri-ui-maps-controls-layersbutton');

        this._colors = ['#1C274C','#321c4cff','#1c424cff','#1c4c26ff','#4c491cff', '#4c1c1cff'];
        this.AddHandler('Clicked', this.__thisClicked);
        
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'When current layer is changed');
    }

    /**
     * Layer colors
     * @type {Array}
     */
    get colors() {
        return this._colors;
    }
    /**
     * Layer colors
     * @type {Array}
     */
    set colors(value) {
        value = this._convertProperty('Array', value);
        this._colors = value;
        this._reposition();
    }

    __thisClicked(event, args) {
        const component = this.Children('firstChild')
        component.MoveEnd();
        this._reposition();
        this.Dispatch('Changed', {current: this.Children('firstChild').name})
    }

    AddLayer(name) {
        const icon = new Colibri.UI.Icon(name, this);
        icon.shown = true;
        icon.iconSVG = 'Colibri.UI.Maps.Controls.LayersButton.Icon';
        icon.styles = {fill: this._colors[icon.index]};
        this._reposition();
    }

    _reposition(orders) {
        const height = this.height - 30;
        let pos = 10;
        let nextPos = height / this.children;
        let zindex = this.children;
        this.ForEach((name, component, index) => {
            component.styles = {top: pos + 'px', zIndex: zindex};
            pos += nextPos;
            zindex--;            
        });

    }
    

}

Colibri.UI.Maps.Controls.LayersButton.Icon = '<svg width="51" height="21" viewBox="0 0 51 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.199997 10.3C0.199997 11.5339 2.68235 12.5268 7.64707 14.5127L14.6682 17.3212C19.6329 19.307 22.1152 20.3 25.2 20.3C28.2847 20.3 30.767 19.307 35.7317 17.3212L42.753 14.5127C47.7177 12.5268 50.2 11.5339 50.2 10.3C50.2 9.06612 47.7177 8.07317 42.753 6.0873L35.7317 3.27882C30.767 1.29295 28.2847 0.299999 25.2 0.299999C22.1152 0.299999 19.6329 1.29295 14.6682 3.27882L7.64707 6.0873C2.68235 8.07317 0.199997 9.06612 0.199997 10.3Z" fill="black"/></svg>';