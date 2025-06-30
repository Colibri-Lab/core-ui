/**
 * View images
 * @class
 * @extends Colibri.UI.Viewer
 * @memberof Colibri.UI
 */
Colibri.UI.ImagesViewer = class extends Colibri.UI.Viewer {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-imagesviewer');

        this._grid = new Colibri.UI.PaneGrid('grid', this);
        this._grid.columns = 'repeat(4, 1fr)';
        this._grid.rows = 'max-content';
        this._grid.shown = true;

    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('ImageClicked', false, 'When clicked on image');
    }
    
    /**
     * Value Array
     * @type {Array}
     */
    get value() {
        return this._value;
    }
    /**
     * Value Array
     * @type {Array}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        this._grid.Clear();
        for(const image of this._value) {
            const im = new Colibri.UI.Img(image.id, this._grid);
            im.shown = true;
            im.source = image.path;
            im.AddHandler('Clicked', this.__imageClicked, false, this);
        }

    }

    __imageClicked(event, args) {
        return this.Dispatch('ImageClicked', {image: event.sender});
    }

}

Colibri.UI.Viewer.Register('Colibri.UI.ImagesViewer', '#{ui-viewers-images-viewer}');