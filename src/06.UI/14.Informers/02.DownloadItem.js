/**
 * Download informer item
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI.Informers
 */
Colibri.UI.Informers.DownloadItem = class extends Colibri.UI.FlexBox {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Informers.DownloadItem']);
        this.AddClass('colibri-ui-informers-downloaditem');

        this._icon = this.Children('icon');
        this._message = this.Children('message');
        this._link = this.Children('link');
        this._percent = this.Children('percent');
        this._close = this.Children('close');
        
        this._link.AddHandler('Clicked', this.__linkClicked, false, this);
        
    }

    __linkClicked(event, args) {
        DownloadUrl(this._value.download);
    }

    /**
     * Value Object
     * @type {Object}
     */
    get value() {
        return this._value;
    }
    /**
     * Value Object
     * @type {Object}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        
        if(this._value.icon != this._icon.iconSVG) {
            this._icon.iconSVG = this._value.icon;
        }
        if(this._message.value != this._value.message) {
            this._message.value = this._value.message;
        }
     
        this._link.value = this._value.link;
        this._link.shown = !!this._value.link;
        this._percent.progress = this._value.percent;
        this._percent.shown = !this._value.link;

        if(this._value.percent === 100) {
            this.AddClass('-complete');
        }
        
    }

}