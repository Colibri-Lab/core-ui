/**
 * Audio component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Video = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('div'));
        this.AddClass('app-component-video');

        this._icon = new Colibri.UI.Icon(this.name + '_icon', this);
        this._icon.shown = true;
        
        this._video = Element.create('video');
        
        this._icon.iconSVG = 'Colibri.UI.PauseIcon';
        this._video.autoplay = true;
        this._plaing = true;
        
        this._element.append(this._video);
        this._video.addEventListener('ended', () => {
            if(this._play) {
                this._icon.iconSVG = 'Colibri.UI.PlayIcon';
            }
        });
        this.AddHandler('Clicked', (event, args) => {
            this.toggle(false);
            args.domEvent.preventDefault(); 
            args.domEvent.stopPropagation();
            return false;
        });

    }

    /**
     * Controls
     * @type {Boolean}
     */
    get controls() {
        return this._video.controls;
    }
    /**
     * Controls
     * @type {playpause,full,none}
     */
    set controls(value) {
        value = this._convertProperty('Boolean', value);
        this._video.controls = value;
    }

    /**
     * 
     * @type {auto,metadata,none}
     */
    get preload() {
        return this._video.preload;
    }
    /**
     * 
     * @type {auto,metadata,none}
     */
    set preload(value) {
        this._video.preload = value;
    }

    /**
     * Is audio muted
     * @type {Boolean}
     */
    get muted() {
        return this._video.muted;
    }
    /**
     * Is audio muted
     * @type {Boolean}
     */
    set muted(value) {
        value = this._convertProperty('Boolean', value);
        this._video.muted = value;
    }
    
    /**
     * Loop the audio
     * @type {Boolean}
     */
    get loop() {
        return this._video.loop;
    }
    /**
     * Loop the audio
     * @type {Boolean}
     */
    set loop(value) {
        value = this._convertProperty('Boolean', value);
        this._video.loop = value;
    }

    /**
     * Autoplay
     * @type {Boolean}
     */
    get autoplay() {
        return this._video.autoplay;
    }
    /**
     * Autoplay
     * @type {Boolean}
     */
    set autoplay(value) {
        value = this._convertProperty('Boolean', value);
        this._video.autoplay = value;
    }

    /**
     * Source of the video
     * @type {Object}
     */
    get srcObject() {
        return this._video.srcObject;
    }
    /**
     * Source of the video
     * @type {Object}
     */
    set srcObject(value) {
        this._video.srcObject = value;
    }
    
    /**
     * Video source
     * @type {String}
     */
    get src() {
        return this._video.src;
    }
    /**
     * Video source
     * @type {String}
     */
    set src(value) {
        this._video.src = value;
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