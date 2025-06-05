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

        this._loading = new Colibri.UI.Loading(this.name + '_loading', this);
        this._loading.shown = false;

        this._icon = new Colibri.UI.Icon(this.name + '_icon', this);
        this._icon.shown = true;        
        this._icon.iconSVG = 'Colibri.UI.PlayIcon';

        this._video = Element.create('video');
        
        this._element.append(this._video);
        this._video.addEventListener('ended', () => {
            this._icon.iconSVG = 'Colibri.UI.PlayIcon';
            this._plaing = false;
        });
        this._video.addEventListener('loadstart', () => {
            this._loading.shown = true;
            this._icon.shown = false;
        });
        this._video.addEventListener('loadeddata', () => {
            this._loading.shown = false;
            this._icon.shown = true;
        });

        this.AddHandler('Clicked', (event, args) => {
            this.toggle(false);
            args.domEvent.preventDefault(); 
            args.domEvent.stopPropagation();
            return false;
        });

    }

    get videoElement() {
        return this._video;
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
     * 
     * @type {Boolean}
     */
    get playsinline() {
        return this._video.playsinline;
    }
    /**
     * 
     * @type {Boolean}
     */
    set playsinline(value) {
        value = this._convertProperty('Boolean', value);
        this._video.playsinline = value;
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