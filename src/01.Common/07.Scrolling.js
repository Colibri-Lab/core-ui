/**
 * Class representing scrolling utility functions.
 * @class
 * @memberof Colibri.Common
 */
Colibri.Common.Scrolling = class {

    /**
     * Creates an instance of Colibri.Common.Scrolling.
     * @param {HTMLElement} element - The HTML element to apply scrolling behavior.
     */
    constructor(element) {
        
        this._element = element;

        this.supportsPassive = false;
        this.wheelOpt = this.supportsPassive ? { passive: false } : false;
        this.wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
    
    }

    /**
     * Creates an instance of Colibri.Common.Scrolling.
     * @param {HTMLElement} element - The HTML element to apply scrolling behavior.
     * @returns {Colibri.Common.Scrolling} A new instance of Colibri.Common.Scrolling.
     * @static
     */
    Create(element) {
        return new Colibri.Common.Scrolling(element);
    }

    /**
     * Prevents default behavior for the event.
     * @param {Event} e - The event object.
     * @private
     */
    __preventDefault(e) {
        try { e.preventDefault(); } catch(e) {}
    }

    /**
     * Prevents default behavior for scroll keys.
     * @param {KeyboardEvent} e - The keyboard event object.
     * @returns {boolean} True if default behavior is prevented, otherwise false.
     * @private
     */
    __preventDefaultForScrollKeys(e) {
        const keys = [37,38,39,40];
        if (keys.indexOf(e.keyCode) !== -1) {
            this.__preventDefault(e);
            return false;
        }
        return true;
    }
    
    /**
     * Disables scrolling behavior on the element.
     */
    Disable() {
        this._element.addEventListener('DOMMouseScroll', this.__preventDefault, false); // older FF
        this._element.addEventListener(this.wheelEvent, this.__preventDefault, this.wheelOpt); // modern desktop
        this._element.addEventListener('touchmove', this.__preventDefault, this.wheelOpt); // mobile
        this._element.addEventListener('keydown', this.__preventDefaultForScrollKeys, false);
    }

    /**
     * Enables scrolling behavior on the element.
     */
    Enable() {
        this._element.removeEventListener('DOMMouseScroll', this.__preventDefault, false);
        this._element.removeEventListener(this.wheelEvent, this.__preventDefault, this.wheelOpt); 
        this._element.removeEventListener('touchmove', this.__preventDefault, this.wheelOpt);
        this._element.removeEventListener('keydown', this.__preventDefaultForScrollKeys, false);
    }

}