/**
 * Audio component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Audio = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('audio'));
        this.AddClass('app-component-audio');


    }

    /**
     * Controls
     * @type {Boolean}
     */
    get controls() {
        return this._element.attr('controls') === 'controls';
    }
    /**
     * Controls
     * @type {Boolean}
     */
    set controls(value) {
        value = this._convertProperty('Boolean', value);
        this._element.attr('controls', value ? 'controls' : null);
    }


    /**
     * 
     * @type {auto,metadata,none}
     */
    get preload() {
        return this._element.attr('preload');
    }
    /**
     * 
     * @type {auto,metadata,none}
     */
    set preload(value) {
        this._element.attr('preload', value);
    }

    /**
     * Is audio muted
     * @type {Boolean}
     */
    get muted() {
        return this._element.attr('muted') === 'muted';
    }
    /**
     * Is audio muted
     * @type {Boolean}
     */
    set muted(value) {
        value = this._convertProperty('Boolean', value);
        this._element.attr('muted', value ? 'muted' : null);
    }
    
    /**
     * Loop the audio
     * @type {Boolean}
     */
    get loop() {
        return this._element.attr('loop') === 'loop';
    }
    /**
     * Loop the audio
     * @type {Boolean}
     */
    set loop(value) {
        value = this._convertProperty('Boolean', value);
        this._element.attr('loop', value ? 'loop' : null);
    }

    /**
     * Autoplay
     * @type {Boolean}
     */
    get autoplay() {
        return this._element.attr('autoplay') === 'autoplay';
    }
    /**
     * Autoplay
     * @type {Boolean}
     */
    set autoplay(value) {
        value = this._convertProperty('Boolean', value);
        this._element.attr('autoplay', value ? 'autoplay' : null);
    }

    /**
     * Source of the audio
     * @type {String}
     */
    get src() {
        return this._element.attr('src');
    }
    /**
     * Source of the audio
     * @type {String}
     */
    set src(value) {
        this._element.attr('src', value);
    }


}