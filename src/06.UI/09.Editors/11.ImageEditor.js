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
     * @type {File}
     */
    get value() {
        return this._value;
    }
    /**
     * Value File
     * @type {File}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        
        const fileReader = new FileReader();
        fileReader.readAsDataURL(blob);
        fileReader.onloadend = () => {
            // reader result 
            fileReader.result;
        };


    }

}