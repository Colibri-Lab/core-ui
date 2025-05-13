/**
 * Image editor component
 * @class
 * @extends Colibri.UI.Editor
 * @memberof Colibri.UI
 */
Colibri.UI.ImageEditor = class extends Colibri.UI.Editor {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.ImageEditor']);
        this.AddClass('colibri-ui-imageeditor');

        this._canvas = this._element.querySelector('canvas');


    }


    /**
     * Value File
     * @type {String}
     */
    get value() {
        return this._value;
    }
    /**
     * Value File
     * @type {String}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        
        const image = new Image();
        image.onload = () => {
            this._canvas.width = image.width;
            this._canvas.height = image.height;

            

            const ctx = this._canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
        };
        image.src = this._value;


    }

}