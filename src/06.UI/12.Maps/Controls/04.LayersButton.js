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

        this.AddHandler('Clicked', this.__thisClicked);
        
    }

    __thisClicked(event, args) {
        const component = this.Children('firstChild')
        component.MoveEnd();
        this._reposition();
    }

    AddLayer(name) {
        const icon = new Colibri.UI.Icon(name, this);
        icon.shown = true;
        icon.iconSVG = 'Colibri.UI.Maps.Controls.LayersButton.Icon';
        this._reposition();
    }

    _reposition(orders) {
        const height = this.height - 30;
        let pos = 10;
        let nextPos = height / this.children;
        let zindex = this.children;
        this.ForEach((name, component) => {
            component.styles = {top: pos + 'px', zIndex: zindex};
            pos += nextPos;
            zindex--;            
        });

    }
    

}

Colibri.UI.Maps.Controls.LayersButton.Icon = '<svg width="52" height="23" viewBox="0 0 52 23" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#filter0_d_12_76)"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.2 9.65C2.2 10.8037 4.5632 11.7321 9.28962 13.5889L15.9738 16.2149C20.7002 18.0715 23.0633 19 26 19C28.9367 19 31.2998 18.0715 36.0262 16.2149L42.7105 13.5889C47.4369 11.7321 49.8 10.8037 49.8 9.65C49.8 8.49633 47.4369 7.56792 42.7105 5.71112L36.0262 3.0852C31.2998 1.22841 28.9367 0.299999 26 0.299999C23.0633 0.299999 20.7002 1.22841 15.9738 3.0852L9.28962 5.71112C4.5632 7.56792 2.2 8.49633 2.2 9.65Z" fill="#1C274C"/></g><defs><filter id="filter0_d_12_76" x="0.200001" y="0.299999" width="51.6" height="22.7" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="2"/><feGaussianBlur stdDeviation="1"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_12_76"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_12_76" result="shape"/></filter></defs></svg>';