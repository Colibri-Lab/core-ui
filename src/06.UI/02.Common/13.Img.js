/**
 * Img tag component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const img = new Colibri.UI.Img('img', this);
 * img.source = 'https://example.com/image.jpg';
 * img.alt = 'Example image';
 * 
 * in html template
 * 
 * <Colibri.UI.Img name="img" source="https://example.com/image.jpg" alt="Example image" />
 * or 
 * <Img name="img" source="https://example.com/image.jpg" alt="Example image" />
 * 
 * then in js
 * 
 * const img = this.Children('img');
 * ```
 */
Colibri.UI.Img = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, Element.create('img'));
        this.AddClass('app-component-img');
        this._element.onload = () => {
            this.Dispatch('ImageLoaded', {element: this._element});
        }
    }

    /**
     * Register events
     * @protected
     * @ignore
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ImageLoaded', true, 'When image is loaded');
    }

    /**
     * Source string
     * @type {string}
     */
    get source() {
        return this._element.attr('src');
    }

    /**
     * Source string
     * @type {string}
     */
    set source(value) {
        this._element.attr('src', value);

    }

    /**
     * Alternate text
     * @type {String}
     */
    get alt() {
        return this._element.attr('alt');
    }
    /**
     * Alternate text
     * @type {String}
     */
    set alt(value) {
        this._element.attr('alt', value);
   }

}