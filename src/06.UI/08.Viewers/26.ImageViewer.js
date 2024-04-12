/**
 * @class
 * @memberof Colibri.UI
 * @extends Colibri.UI.Viewer
 */
Colibri.UI.ImageViewer = class extends Colibri.UI.Viewer {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     * @param {Element|string} element element to generate childs
     * @param {Colibri.UI.Component|null} root root component 
     */ 
    constructor(name, container, element = null, root = null) {
        super(name, container, element || Element.create('span'), root);
        this.AddClass('app-image-viewer-component');

        this._colorBox = new Colibri.UI.TextSpan(this.name + '_colorbox', this);
        this._colorBox.shown = true;

        this._view = new Colibri.UI.TextSpan(this.name + '_view', this);
        this._view.shown = true;

    }

    /**
     * Get the image size
     * @param {string} value url of image
     * @returns {Promise}
     */
    GetImageSize(value) {
        return new Promise((resolve, reject) => {
            value = value.indexOf('url') !== -1 ? value.replace(/url\((['"])?(.*?)\1\)/gi, '$2') : value;
            var image = new Image();
            image.src = value;
            image.onload = function () {
                var width = image.width,
                height = image.height;
                resolve({width: width, height: height});
            };    
        });
    }
 
    /**
     * Value
     * @type {string}
     */
    set value(value) {
        value = this._convertValue(value);
        this._colorBox.styles = {backgroundImage: value.indexOf('url') !== -1 ? value : 'url(' + value + ')'};
        this._view.value = value;
    }

    /**
     * Value
     * @type {string}
     */
    get value() {
        return this._view.value;
    }

    /**
     * Field object
     * @type {object}
     */
    get field() {
        return this._field;
    }

    /**
     * Field object
     * @type {object}
     */
    set field(field) {
        this._field = field;
    }


}
Colibri.UI.Viewer.Register('Colibri.UI.ImageViewer', '#{ui-viewers-image}');