/**
 * Class representing scrolling utility functions.
 * @class
 * @memberof Colibri.Common
 */
Colibri.Common.Scrolling = class {

    /**
     * Creates an instance of Colibri.Common.Scrolling.
     * @param {HTMLElement} element - The HTML element to apply scrolling behavior.
     * @constructor
     */
    constructor(element) {
        
        this._element = element;

        this.supportsPassive = false;
        this.wheelOpt = this.supportsPassive ? { passive: false } : false;
        this.wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
    
    }

    /**
     * Disposes of the scrolling utility and removes event listeners from the element.
     * @returns {void}
     * @public
     */
    Dispose() {
        this.Disable();
        super.Dispose();
    }

    /**
     * Creates an instance of Colibri.Common.Scrolling.
     * @param {HTMLElement} element - The HTML element to apply scrolling behavior.
     * @returns {Colibri.Common.Scrolling} A new instance of Colibri.Common.Scrolling.
     * @static
     * @public
     * @example
     * ```
     * const scrollingInstance = Colibri.Common.Scrolling.Create(document.getElementById('myElement'));
     * console.log(scrollingInstance); // Outputs: Colibri.Common.Scrolling instance
     * /// Create a scrolling instance for an element with the ID 'myElement'
     * const myElement = document.getElementById('myElement');
     * const scrollingInstance = Colibri.Common.Scrolling.Create(myElement);
     * console.log('Scrolling instance created for:', myElement);
     * /// Create a scrolling instance and enable it
     * const scrollingInstance = Colibri.Common.Scrolling.Create(document.getElementById('myElement'));
     * scrollingInstance.Enable();
     * console.log('Scrolling enabled for myElement');
     * /// Create a scrolling instance and disable it
     * const scrollingInstance = Colibri.Common.Scrolling.Create(document.getElementById('myElement'));
     * scrollingInstance.Disable();
     * console.log('Scrolling disabled for myElement');
     * /// Dispose of a scrolling instance
     * const scrollingInstance = Colibri.Common.Scrolling.Create(document.getElementById('myElement'));
     * scrollingInstance.Dispose();
     * console.log('Scrolling instance disposed');
     * ```
     */
    static Create(element) {
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
     * @public
     * @example
     * ```
     * const scrollingInstance = Colibri.Common.Scrolling.Create(document.getElementById('myElement'));
     * scrollingInstance.Disable();
     * console.log('Scrolling disabled for myElement');
     * ```
     */
    Disable() {
        this._element.addEventListener('DOMMouseScroll', this.__preventDefault, false); // older FF
        this._element.addEventListener(this.wheelEvent, this.__preventDefault, this.wheelOpt); // modern desktop
        this._element.addEventListener('touchmove', this.__preventDefault, this.wheelOpt); // mobile
        this._element.addEventListener('keydown', this.__preventDefaultForScrollKeys, false);
    }

    /**
     * Enables scrolling behavior on the element.
     * @public
     * @example
     * ```
     * const scrollingInstance = Colibri.Common.Scrolling.Create(document.getElementById('myElement'));
     * scrollingInstance.Enable();
     * console.log('Scrolling enabled for myElement');
     * ```
     */
    Enable() {
        this._element.removeEventListener('DOMMouseScroll', this.__preventDefault, false);
        this._element.removeEventListener(this.wheelEvent, this.__preventDefault, this.wheelOpt); 
        this._element.removeEventListener('touchmove', this.__preventDefault, this.wheelOpt);
        this._element.removeEventListener('keydown', this.__preventDefaultForScrollKeys, false);
    }

}