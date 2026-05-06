/**
 * Simple button, not submit or reset
 * @class
 * @extends Colibri.UI.ExtendedButton
 * @memberof Colibri.UI
 */
Colibri.UI.PlayPauseButton = class extends Colibri.UI.ExtendedButton {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-simple-button-component');

        this.AddHandler('Clicked', this.__thisClicked);
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'When state is changed');
    }

    __thisClicked(event, args) {
        if(this.state === 'play') {
            this.state = 'pause';
        } else {
            this.state = 'play';
        }
        this.Dispatch('Changed', {state: this.state, component: this});
    }

    /**
     * Play Pause button
     * @type {play,pause}
     */
    get state() {
        return this._state;
    }
    /**
     * Play Pause button
     * @type {play,pause}
     */
    set state(value) {
        this._state = value;
        this._showState();
    }
    _showState() {
        if(this._state === 'play') {
            this.icon = 'Colibri.UI.PauseIcon';
        } else {
            this.icon = 'Colibri.UI.PlayIcon';
        }
    }

}