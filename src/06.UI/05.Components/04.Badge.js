/**
 * Badge component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const badge = new Colibri.UI.Badge('badge', this);
 * badge.backgroundColor = '#ff0000';
 * badge.textColor = '#ffffff';
 * badge.html = 'Badge text';
 * badge.shown = true;
 * badge.AddHandler('Clicked', (event, args) => {
 *      console.log('Badge clicked');
 * });
 * 
 * in html template
 * 
 * <Badge name="badge" background-color="#ff0000" text-color="#ffffff" html="Badge text" shown="true"></Badge>
 * 
 * then in js
 * 
 * const badge = this.Children('badge');
 * 
 * ```
 */
Colibri.UI.Badge = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container element and component
     */
    constructor(name, container) {
        super(name, container, Element.create('span'));
        this.AddClass('app-component-badge');

    }

    /**
     * Background color of badge
     * @type {string}
     */
    get backgroundColor() {
        return this._element.style.backgroundColor;
    }

    /**
     * Background color of badge
     * @type {string}
     */
    set backgroundColor(value) {
        this._element.style.backgroundColor = value;
    }

    /**
     * Text color of badge
     * @type {string}
     */
    get textColor() {
        return this._element.style.color;
    }

    /**
     * Text color of badge
     * @type {string}
     */
    set textColor(value) {
        this._element.style.color = value;
    }

}