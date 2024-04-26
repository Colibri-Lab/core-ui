/**
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.Loading = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {*} element element to generate in
     * @param {boolean} sendToFront send the component to front
     */
    constructor(name, container, element, sendToFront = true) {
        super(name, container, element || Element.create('div'));
        this.AddClass('app-loading-component');
        
        this._element.html(Colibri.UI.LoadingIcon);
        this._sendToFront = sendToFront;
    }

    /**
     * Use event to show and hide custom loading
     * @type {boolean}
     */
    get useEvent() {
        return this._useEvent;
    }
    /**
     * Use event to show and hide custom loading
     * @type {boolean}
     */
    set useEvent(value) {
        this._useEvent = value;
    }

    /**
     * Show/Hide component
     * @type {boolean}
     */
    set shown(value) {

        if(this._useEvent === true) {
            if(value) {
                this.Dispatch('Shown');
            } else {
                this.Dispatch('Hidden');
            }
            return;
        }

        super.shown = value;
        if(this._sendToFront) {
            if (super.shown) {
                this.BringToFront();
            } else {
                this.SendToBack();
            }
        }
    }
    /**
     * Show/Hide component
     * @type {boolean}
     */
    get shown () {
        return super.shown;
    }

    /**
     * Loading icon
     * @type {String}
     */
    get icon() {
        return this._icon;
    }
    /**
     * Loading icon
     * @type {String}
     */
    set icon(value) {
        this._icon = value;
        this._showicon();
    }
    /** @private */
    _showicon() {
        this._element.html(eval(this._icon));
    }

}
