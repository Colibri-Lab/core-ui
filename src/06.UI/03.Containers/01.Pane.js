Colibri.UI.Pane = class extends Colibri.UI.Component {

    static ResizeNone = 'none';
    static ResizeAll = 'all';
    static ResizeHorizontalOnly = 'horizontal';
    static ResizeVerticalOnly = 'vertical';

    _resizable = Colibri.UI.Pane.ResizeNone;
    _resizeHandler = null;
    _resizing = false;
    _resizeData = {
        horizontalSize: 0,
        verticalSize: 0,
    };

    /**
     * Конструктор
     * @param {string} name Наименование компонента
     * @param {(HTMLElement|Colibri.UI.Component))} container контейнер 
     * @param {(string|HTMLElement)} element название тэга, либо содержание компонента (шаблон) в виде строки или обьекта 
     * @param {int} resizable способ изменения размера 
     */
    constructor(name, container, element = '<div />', resizable= 'none') {
        super(name, container, element || '<div />');

        this.AddClass('app-component-pane');

        this._resizable = resizable || 'none';
        this.AddClass('app-component-resize-' + this._resizable);
    }

    _createResizeHandler() {
        this._resizeHandler = Element.create('div', {class: 'app-component-pane-resize'});
        this._element.prepend(this._resizeHandler);

        const stopClick = (e) => { e.preventDefault(); e.stopPropagation(); return false; };

        const startResize = (e) => {
            this._resizing = true;
            Colibri.UI.Resizing = true;
            this._resizeData = this._element.bounds();

            // ставим на документ, чтобы точно перехватить        
            document.addEventListener("touchend", stopResize, false);
            document.addEventListener("mouseup", stopResize, false);

            document.addEventListener("touchmove", doResize, false);
            document.addEventListener("mousemove", doResize, false);

            return false;

        };

        const stopResize = (e) => {
            e.preventDefault();
            e.stopPropagation();
        
            this._resizing = false;
            Colibri.UI.Resizing = false;

            document.removeEventListener("touchend", stopResize, false);
            document.removeEventListener("mouseup", stopResize, false);
    
            document.removeEventListener("touchmove", doResize, false);
            document.removeEventListener("mousemove", doResize, false);

            return false;

        };

        const doResize = (e) => {
            if (this._resizing) {
                e.preventDefault();
    
                const wdelta = (e.pageX - (this._resizeData.left + this._resizeData.outerWidth));
                const hdelta = (e.pageY - (this._resizeData.top + this._resizeData.outerHeight));

                if(this._resizable == Colibri.UI.Pane.ResizeHorizontalOnly || this._resizable == Colibri.UI.Pane.ResizeAll) {
                    this.width += wdelta + 10;
                }
    
                if(this._resizable == Colibri.UI.Pane.ResizeVerticalOnly || this._resizable == Colibri.UI.Pane.ResizeAll) {
                    this.height += hdelta + 10;
                }
    
                this._resizeData = this._element.bounds();

                return false;
            }
        };

        this._resizeHandler.addEventListener("touchstart", startResize, false);
        this._resizeHandler.addEventListener("mousedown", startResize, false);

    }

    _removeResizeHandler() {
        this._resizeHandler && this._resizeHandler.remove();
    }

    get resizable() {
        return this._resizable;
    }
    set resizable(value) {
        this.RemoveClass('app-component-resize-' + this._resizable);
        this._resizable = value;
        this.AddClass('app-component-resize-' + this._resizable);

        if(this._resizable === true) {
            this._createResizeHandler();
        }
        else {
            this._removeResizeHandler();
        }
    }

}