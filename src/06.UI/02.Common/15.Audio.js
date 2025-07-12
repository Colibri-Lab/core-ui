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
        super(name, container, Element.create('div'));
        this.AddClass('app-component-audio');

        this._audio = Element.create('audio');
        this._element.append(this._audio);
        this._audio.addEventListener('ended', () => {
            if(this._play) {
                this._play.shown = true;
                this._pause.shown = false;                
            }
        });

    }

    /**
     * Controls
     * @type {playpause,full,none}
     */
    get controls() {
        return this._audio.attr('controls') === 'controls';
    }

    __playClicked(event, args) {
        if(this._src) {
            if(this._src.indexOf('file:') !== -1) {
                // is Local
                if(App.Device.isAndroid || App.Device.isIOs) {
                    App.Device.FileSystem.LocalAsBlob(this._src).then((blob) => {
                        this._localBlobUrl = URL.createObjectURL(blob);
                        this._audio.src = this._localBlobUrl;
                        this._audio.onended = () => URL.revokeObjectURL(this._localBlobUrl);
                    });
                } else {
                    this._audio.attr('src', this._src);
                }
            } else {
                this._audio.attr('src', this._src);
            }
        }
        this._audio.play();
        this._play.shown = false;
        this._pause.shown = true;
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
    }

    __pauseClicked(event, args) {
        this._audio.pause();
        this._play.shown = true;
        this._pause.shown = false;
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
    }

    /**
     * Controls
     * @type {playpause,full,none}
     */
    set controls(value) {
        if(value === 'playpause') {
            this._audio.attr('controls', null);
            this._play = new Colibri.UI.Icon('play', this);
            this._pause = new Colibri.UI.Icon('pause', this);
            this._play.shown = true;
            this._pause.shown = false;
            this._play.iconSVG = 'Colibri.UI.PlayIcon';
            this._pause.iconSVG = 'Colibri.UI.PauseIcon';
            this._play.AddHandler('Clicked', this.__playClicked, false, this);
            this._pause.AddHandler('Clicked', this.__pauseClicked, false, this);
        } else if(value === 'full') {
            this._audio.attr('controls', true);
            this._play?.Dispose();
            this._pause?.Dispose();
        } else {
            this._audio.attr('controls', false);
            this._play?.Dispose();
            this._pause?.Dispose();
        }
    }

    /**
     * 
     * @type {auto,metadata,none}
     */
    get preload() {
        return this._audio.attr('preload');
    }
    /**
     * 
     * @type {auto,metadata,none}
     */
    set preload(value) {
        this._audio.attr('preload', value);
    }

    /**
     * Is audio muted
     * @type {Boolean}
     */
    get muted() {
        return this._audio.attr('muted') === 'muted';
    }
    /**
     * Is audio muted
     * @type {Boolean}
     */
    set muted(value) {
        value = this._convertProperty('Boolean', value);
        this._audio.attr('muted', value ? 'muted' : null);
    }
    
    /**
     * Loop the audio
     * @type {Boolean}
     */
    get loop() {
        return this._audio.attr('loop') === 'loop';
    }
    /**
     * Loop the audio
     * @type {Boolean}
     */
    set loop(value) {
        value = this._convertProperty('Boolean', value);
        this._audio.attr('loop', value ? 'loop' : null);
    }

    /**
     * Autoplay
     * @type {Boolean}
     */
    get autoplay() {
        return this._audio.attr('autoplay') === 'autoplay';
    }
    /**
     * Autoplay
     * @type {Boolean}
     */
    set autoplay(value) {
        value = this._convertProperty('Boolean', value);
        this._audio.attr('autoplay', value ? 'autoplay' : null);
    }

    /**
     * Source of the audio
     * @type {String}
     */
    get src() {
        return this._src;
        // return this._audio.attr('src');
    }
    /**
     * Source of the audio
     * @type {String}
     */
    set src(value) {
        this._src = value;
        // this._audio.attr('src', value);
    }

    /**
     * 
     * @type {Object}
     */
    get srcObject() {
        return this._audio.srcObject;
    }
    /**
     * 
     * @type {Object}
     */
    set srcObject(value) {
        this._audio.srcObject = value;
    }
    

}