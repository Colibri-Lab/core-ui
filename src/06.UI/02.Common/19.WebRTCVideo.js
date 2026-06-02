/**
 * Audio component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.WebRTCVideo = class extends Colibri.UI.Component {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.WebRTCVideo']);
        this.AddClass('app-component-webrtcvideo');

        this._video = this._element.querySelector('video');

    }

    descructor() {
        if(this._reader) {
            this._reader.close();
        }
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
        this._value = value;
        this._showValue();
    }

    _showValue() {

        Colibri.Common.Wait(() => !!window.MediaMTXWebRTCReader && !!this._value).then(() => {
            if(this._reader) {
                this._reader.close();
            } 
            this._reader = new MediaMTXWebRTCReader({
                url: this._value,
                onError: (err) => {
                    setMessage(err);
                },
                onTrack: (evt) => {
                    this._video.srcObject = evt.streams[0];
                    this._video.controls = false;
                    this._video.muted = true;
                    this._video.autoplay = true;
                    this._video.playsInline = true;
                    this._video.disablepictureinpicture = false;
                },
                onDataChannel: (evt) => {
                    evt.channel.binaryType = 'arraybuffer';
                    evt.channel.onmessage = (evt) => {
                        console.log('data channel message', evt.data);
                    };
                },
            });
        });


    }


}