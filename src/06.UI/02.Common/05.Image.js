/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Image = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, Element.create('span'));
        this.AddClass('app-component-image');
    }

    /**
     * Source string
     * @type {string}
     */
    get source() {
        return this._element.css('background-image');
    }

    /**
     * Source string
     * @type {string}
     */
    set source(value) {
        
        this._element.css('background-image', value);
        value = value.replaceAll(/\w+\(/, '').replaceAll(')', '');
        if(value.indexOf('data:') === -1) {
            const img = new Image();
            // /**
            //  * @private
            //  * @param {Event} e 
            //  */
            // img.onload = (e) => {
            //     this.width = img.width;
            //     this.height = img.height;
            // }
            img.src = value;
        } 

    }

    /**
     * Repeat the background
     * @type {string}
     */
    get repeat() {
        return this._element.css('background-repeat');
    }

    /**
     * Repeat the background
     * @type {string}
     */
    set repeat(value) {
        this._element.css('background-repeat', value);
    }

    /**
     * Background size
     * @type {contain,cover,revert}
     */
    get size() {
        return this._element.css('background-size');
    }
    /**
     * Background size
     * @type {contain,cover,revert}
     */
    set size(value) {
        this._element.css('background-size', value);
    }

    /**
     * Background position
     * @type {String}
     */
    get position() {
        return this._element.css('background-position');
    }
    /**
     * Background position
     * @type {String}
     */
    set position(value) {
        this._element.css('background-position', value);
    }
    
    /**
     * Value of image
     * @type {string}
     */
    set image(value) {
        let reader = new FileReader();
        /**
         * @private
         * @param {Event} e 
         */
        reader.onload = (e) => {
            this.source = 'url("' + reader.result + '")';
        }
        reader.readAsDataURL(value);
        this._name = value.name;
    }

    /**
     * Value of image
     * @type {string}
     */
    get image() {
        const imageSrc = this.source.replaceAll('url("', '').replaceAll('")', '');
        const data = imageSrc.split(';');
        const mime = data[0].split(':')[1];
        const base64 = data[1].split(',')[1];
        return Base2File(base64, this._name, mime);
    }

}