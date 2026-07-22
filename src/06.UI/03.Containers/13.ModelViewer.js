/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.ModelViewer = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container, element) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('model-viewer'));
        this.AddClass('colibri-ui-modelviewer');

        Colibri.Common.LoadScript('https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js', null, {type: 'module'}).then(() => {
            this._element.attr('camera-controls', true);
            this._element.attr('auto-rotate', true);
            this._element.attr('ar', true);
        });

    }

    /**
     * Enable camera control
     * @type {Boolean}
     */
    get cameraControl() {
        return !!this._element.attr('camera-controls');
    }
    /**
     * Enable camera control
     * @type {Boolean}
     */
    set cameraControl(value) {
        value = this._convertProperty('Boolean', value);
        this._element.cameraControl = value;
        this._element.attr('camera-controls', value);
    }

    /**
     * Enable auto rotate
     * @type {Boolean}
     */
    get autoRotate() {
        return !!this._element.attr('auto-rotate');
    }
    /**
     * Enable auto rotate
     * @type {Boolean}
     */
    set autoRotate(value) {
        value = this._convertProperty('Boolean', value);
        this._element.attr('auto-rotate', value);
    }
    /**
     * Enable auto play
     * @type {Boolean}
     */
    get autoPlay() {
        return !!this._element.attr('autoplay');
    }
    /**
     * Enable auto play
     * @type {Boolean}
     */
    set autoPlay(value) {
        value = this._convertProperty('Boolean', value);
        this._element.attr('autoplay', value);
    }

    /**
     * Source of the 3D model
     * @type {String}
     */
    get src() {
        return this._element.attr('src');
    }
    /**
     * Source of the 3D model
     * @type {String}
     */
    set src(value) {
        this._element.attr('src', value);
    }

    /**
     * Alt text for the 3D model
     * @type {String}
     */
    get alt() {
        return this._element.attr('alt');
    }
    /**
     * Alt text for the 3D model
     * @type {String}
     */
    set alt(value) {
        this._element.attr('alt', value);
    }

    /**
     * Poster image for the 3D model
     * @type {String}
     */
    get poster() {
        return this._element.attr('poster');
    }
    /**
     * Poster image for the 3D model
     * @type {String}
     */
    set poster(value) {
        this._element.attr('poster', value);
    }

    /**
     * Poster image for the 3D model
     * @type {auto,lazy,eager}
     */
    get loading() {
        return this._element.attr('loading');
    }
    /**
     * Loading behavior for the 3D model
     * @type {auto,lazy,eager}
     */
    set loading(value) {
        this._element.attr('loading', value);
    }
    /**
     * Reveal behavior for the 3D model
     * @type {auto,interaction,manual}
     */
    get reveal() {
        return this._element.attr('reveal');
    }
    /**
     * Reveal behavior for the 3D model
     * @type {auto,interaction,manual}
     */
    set reveal(value) {
        this._element.attr('reveal', value);
    }
    /**
     * Reveal behavior for the 3D model
     * @type {String}
     */
    get environmentImage() {
        return this._element.attr('environment-image');
    }
    /**
     * Environment image for the 3D model
     * @type {String}
     */
    set environmentImage(value) {
        this._element.attr('environment-image', value);
    }
    /**
     * Exposure for the 3D model
     * @type {Number}
     */
    get exposure() {
        return this._element.exposure;
    }
    /**
     * Exposure for the 3D model
     * @type {Number}
     */
    set exposure(value) {
        value = this._convertProperty('Number', value);
        this._element.attr('exposure', value);
        this._element.exposure = value;
    }
    /**
     * Shadow intensity for the 3D model
     * @type {Number}
     */
    get shadowIntensity() {
        return this._element.shadowIntensity;
    }
    /**
     * Shadow intensity for the 3D model
     * @type {Number}
     */
    set shadowIntensity(value) {
        value = this._convertProperty('Number', value);
        this._element.attr('shadow-intensity', value);
        this._element.shadowIntensity = value;
    }
    /**
     * Shadow softness for the 3D model
     * @type {Number}
     */
    get shadowSoftness() {
        return this._element.shadowSoftness;
    }
    /**
     * Shadow softness for the 3D model
     * @type {Number}
     */
    set shadowSoftness(value) {
        value = this._convertProperty('Number', value);
        this._element.attr('shadow-softness', value);
        this._element.shadowSoftness = value;
    }
    /**
     * Animation name for the 3D model
     * @type {String}
     */
    get animationName() {
        return this._element.attr('animation-name');
    }
    /**
     * Animation name for the 3D model
     * @type {String}
     */
    set animationName(value) {
        this._element.attr('animation-name', value);
    }
    /**
     * Camera orbit for the 3D model
     * initial: 45deg 75deg 2.5m
     * @type {String}
     */
    get cameraOrbit() {
        return this._element.cameraOrbit;
    }
    /**
     * Camera orbit for the 3D model
     * @type {String}
     */
    set cameraOrbit(value) {
        this._element.attr('camera-orbit', value);
        this._element.cameraOrbit = value;
    }
    /**
     * Interaction prompt for the 3D model
     * @type {Boolean}
     */
    get interactionPrompt() {
        return this._element.attr('interaction-prompt');
    }
    /**
     * Interaction prompt for the 3D model
     * @type {Boolean}
     */
    set interactionPrompt(value) {
        value = this._convertProperty('Boolean', value);
        this._element.attr('interaction-prompt', value);
    }

    /**
     * Whether the 3D model has finished loading
     * @type {Boolean}
     */
    get loaded() {
        return this._element[0].loaded;
    }

    /**
     * Whether the 3D model is currently visible in the viewport
     * @type {Boolean}
     */
    get modelIsVisible() {
        return this._element[0].modelIsVisible;
    }

    /**
     * Current time of the 3D model's animation
     * @type {Number}
     */
    get currentTime() {
        return this._element[0].currentTime;
    }

    DismissPoster() {
        this._element[0].dismissPoster();
    }

    ShowPoster() {
        this._element[0].showPoster();
    }

    Play() {
        this._element[0].play();
    }

    Pause() {
        this._element[0].pause();
    }

    Dimensions() {
        return this._element[0].getDimensions();
    }

    BoundingBoxCenter() {
        return this._element[0].getBoundingBoxCenter();
    }

    Blob() {
        return this._element[0].toBlob();
    }

}