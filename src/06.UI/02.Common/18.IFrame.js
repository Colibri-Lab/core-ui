/**
 * Audio component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.IFrame = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('iframe'));
        this.AddClass('app-component-iframe');
    }

    /**
     * Video source
     * @type {String}
     */
    get src() {
        return this._element.attr('src');
    }
    /**
     * Video source
     * @type {String}
     */
    set src(value) {
        this._element.attr('src', value);
    }

    /**
     * Poster of video
     * @type {String} 
     */
    get poster() {
        return this._video.poster;
    }
    /**
     * Poster of video
     * @type {String}
     */
    set poster(value) {
        this._video.poster = value;
    }

    play() {
        this._icon.iconSVG = 'Colibri.UI.PauseIcon';        
        this._plaing = true;
        this._video.play();
    }
    
    pause() {
        this._icon.iconSVG = 'Colibri.UI.PlayIcon';
        this._plaing = false;
        this._video.pause();
    }

    toggle() {
        if(this._plaing) {
            this.pause();
        } else {
            this.play();
        }
    }

}