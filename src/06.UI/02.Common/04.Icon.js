/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Icon = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, Element.create('span'));
        this.AddClass('app-component-icon');
        
    }

    /**
     * Icon value
     * @type {string}
     */
    get icon() {
        return this._element.css('background-image');
    }

    /**
     * Icon value
     * @type {string}
     */
    set icon(value) {
        this._element.css('background-image', value);
    }

    /**
     * Icon as SVG value
     * @type {string}
     */
    set iconSVG(value) {
        if(!value) {
            return;
        }

        this._iconSVG = value;
        
        if(this._element.querySelector('svg')) {
            this._element.querySelector('svg').remove();
        }
        try {
            const iconc = eval(this._iconSVG);
            this._element.append(Element.fromHtml(iconc));
        } catch(e) {
            console.log('Unknown icon: ' + value); console.trace();
        }
    }

    /**
     * Icon as SVG value
     * @type {string}
     */
    get iconSVG() {
        return this._iconSVG;
    }

    /**
     * Fill color
     * @type {string}
     */
    set fill(value) {
        for(const el of this._element.querySelectorAll('path,circle,rect,polygon')) {
            el.attr('fill', value);
        }
    }

    /**
     * Fill color
     * @type {string}
     */
    get fill() {
        const el = this._element.querySelector('path,circle,rect,polygon');
        if(!el) {
            return null;
        }
        return el.attr('fill');
    }

    /**
     * Stroke color
     * @type {string}
     */
    set stroke(value) {
        for(const el of this._element.querySelectorAll('path,circle,rect,polygon')) {
            el.attr('stroke', value);
        }
    }

    /**
     * Stroke color
     * @type {string}
     */
    get stroke() {
        const el = this._element.querySelector('path,circle,rect,polygon');
        if(!el) {
            return null;
        }
        return el.attr('stroke');
    }

    /**
     * Is dot icon
     * @type {boolean}
     */
    get dot() {
        return this._dot;
    }

    /**
     * Is dot icon
     * @type {boolean}
     */
    set dot(value) {
        this._dot = value === 'true' || value === true;
        this._setDot();
    }
    /**
     * @private
     */
    _setDot() {
        if(this._dot) {
            this._dotElement = Element.create('em', {class: 'app-component-icon-dot'});
            this._element.append(this._dotElement);
        }
        else {
            this._dotElement.remove();
        }
    }
    
}