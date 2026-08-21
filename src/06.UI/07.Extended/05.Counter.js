/**
 * Counter component
 * @class
 * @extends Colibri.UI.TextSpan
 * @memberof Colibri.UI
 * @example
 * ```
 * const counter = new Colibri.UI.Counter('counter', this);
 * counter.value = 10;
 * 
 * in html template
 * 
 * <Counter name="counter" value="value" />
 * 
 * then in js
 * 
 * const counter = this.Children('counter');
 * ```
 */
Colibri.UI.Counter = class extends Colibri.UI.TextSpan {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-indicator-component');
    }

}