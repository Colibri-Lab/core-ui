/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.ModelessWindow = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     * @param {string|Element} element element to create in
     * @param {string} title title of window
     * @param {number|null} width width of window
     * @param {number|null} height height of window
     */
    constructor(name, container, element, title, width, height) {
        super(name, container, Colibri.UI.Templates['Colibri.UI.ModelessWindow']);
        this.AddClass('app-component-modeless-window');
        this.styles = {position: 'absolute'};

        this.GenerateChildren(element);

        this._setTitle(title);

        if (width) { this._setWidth(width); }
        if (height) { this._setHeight(height); }

        this._closable = true;
        this._isDragged = false;
        this._disposeOnClose = false;

        this._sticky = false;
        this._stickyX = null;
        this._stickyY = null;

        this._startPointX = null;
        this._startPointY = null;

        this._getCloseButton().shown = this._closable;

        this.Dispatch('WindowContentRendered');
        this._handleEvents();
    }


    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('WindowClosed', false, 'Поднимается, когда окно закрылось');
        this.RegisterEvent('WindowContentRendered', false, 'Когда содержание окна отрисовалось');
    }

    _handleEvents() {
        this._getCloseButton().AddHandler('Clicked', (event, args) => this.__close(event, args));

        this._element.querySelector('.modeless-window-header-container').addEventListener('mousedown', this.__dragStart.bind(this));
        this._container.addEventListener('mousemove', this.__move.bind(this));
        document.addEventListener('mouseup', this.__dragStop.bind(this));

        this.AddHandler('Resize', (event, args) => {
            this._toggleBodyScroll(false);
            this._updateStyleVariables();
        });

        this.AddHandler('Resized', (event, args) => { this._toggleBodyScroll(true); });
    }

    /**
     * Закрыть окно
     * @private
     */
    __close(event, args) {
        if (this._closable) {
            this.shown = false;
            if (this._disposeOnClose) { this.Dispose(); }

            this.Dispatch('WindowClosed', {});
        }
    }

    /**
     * Запомнить позицию мыши и окна, когда начали перетаскивать
     * @param {MouseEvent} event
     * @private
     */
    __dragStart(event) {
        if (!this._sticky) {
            let previousClientX = event.clientX,
                previousClientY = event.clientY;

            let previousLeft = this.styles.left ? parseInt(this.styles.left) : 0,
                previousTop = this.styles.top ? parseInt(this.styles.top) : 0;

            this.tag._diffX = previousClientX - previousLeft;
            this.tag._diffY = previousClientY - previousTop;
            this._isDragged = true;
        }
    }

    /**
     * Обновить позицию окна после каждого перемещения мыши
     * @param {MouseEvent} event
     * @private
     */
    __move(event) {
        if (!this._sticky && this._isDragged) {
            let newClientX = event.clientX,
                newClientY = event.clientY,
                newLeft = newClientX - this.tag._diffX,
                newTop = newClientY - this.tag._diffY;

            this._element.style.top = newTop + 'px';
            this._element.style.left = newLeft + 'px';
        }
    }

    /**
     * Удалить обработчики по окончании перетаскивания
     * @private
     */
    __dragStop() {
         if (!this._sticky && this._isDragged) {
             this._container.removeEventListener('mousemove', this.__move);
             document.removeEventListener('mouseup', this.__dragStop);

             this._isDragged = false;
         }
    }

    /**
     * Обновить переменные css
     * @private
     */
    _updateStyleVariables() {
        let bounds = this._element.bounds();
        this._element.style.setProperty('--windowWidth', bounds.width + 'px');
        this._element.style.setProperty('--windowHeight', bounds.height + 'px');
    }

    /**
     * Показать/скрыть скролл на странице
     * @param {boolean} value
     * @private
     */
    _toggleBodyScroll(value) {
        const scrolling = new Colibri.Common.Scrolling(document.body);
        if (value === false) {
            scrolling.Disable();
        } else {
            scrolling.Enable();
        }
    }

    /**
     * Закрыть окно
     */
    close() {
        this._getCloseButton().Dispatch('Clicked');
    }

    /**
     * "Приклеено" ли окно (по умолчанию становится в центр контейнера)
     * @type {boolean}
     */
    get sticky() {
        return this._sticky;
    }
    set sticky(value) {
        return this._setSticky(value);
    }
    _setSticky(value) {
        this._sticky = (value === true || value === 'true');

        if (this._sticky && !this._stickyX && !this._stickyY) {
            this._stickToX('center');
            this._stickToY('center');
        }
        if(value) {
            this._updateStyleVariables();
        }
    }

    /**
     * Положение окна относительно контейнера по оси X
     * 3 возможных положения: слева, справа, по центру
     * @type {string|null}
     */
    get stickyX() {
        return this._stickyX;
    }
    set stickyX(value) {
        this._stickToX(value);
    }
    _stickToX(value) {
        this._stickyX = value;

        switch (value) {
            case 'left':
            case 'right':
            case 'center':
                this.RemoveClass('-stick-to-x-left');
                this.RemoveClass('-stick-to-x-right');
                this.RemoveClass('-stick-to-x-center');

                this.AddClass('-stick-to-x-' + value);
                break;
            default:
                this._stickyX = null;
                this.RemoveClass('-stick-to-x-left');
                this.RemoveClass('-stick-to-x-right');
                this.RemoveClass('-stick-to-x-center');
        }
    }

    /**
     * Положение окна относительно контейнера по оси Y
     * 3 возможных положения: сверху, снизу, по центру
     * @type {string|null}
     */
    get stickyY() {
        return this._stickyY;
    }
    set stickyY(value) {
        this._stickToY(value);
    }
    _stickToY(value) {
        this._stickyY = value;

        switch (value) {
            case 'top':
            case 'bottom':
            case 'center':
                this.RemoveClass('-stick-to-y-top');
                this.RemoveClass('-stick-to-y-bottom');
                this.RemoveClass('-stick-to-y-center');

                this.AddClass('-stick-to-y-' + value);
                break;
            default:
                this._stickyY = null;
                this.RemoveClass('-stick-to-y-top');
                this.RemoveClass('-stick-to-y-bottom');
                this.RemoveClass('-stick-to-y-center');
        }
    }

    /**
     * Точка, начиная от которой окно займёт всю доступную ширину в зависимости от stickyX
     * если stickyX - центр, займёт такую ширину, чтобы окно оказалось по центру
     * @type {string|number|null}
     */
    get startPointX() {
        return this._startPointX;
    }
    set startPointX(value) {
        this._setStartPointX(value);
    }
    _setStartPointX(value) {
        if (![null, false, undefined].includes(value)) {

            this._startPointX = parseInt(value);
            let measure = '';
            if (typeof value === 'string' && value.indexOf('%') !== -1) {
                measure = '%';
            }
            else {
                measure = 'px';
            }

            switch (this._stickyX) {
                case 'right':
                case 'left':
                    this._setWidth('calc(100vw - ' + this._startPointX + measure + ')');
                    break;
                case 'center':
                    this._setWidth('calc(100vw - '+ (this._startPointX * 2) + measure +')');
                    break;
                default:
                    this._startPointX = null;
            }

            this._startPointX += (this._startPointX && measure === '%') ? '%' : '';
        }
        else {
            this._startPointX = null;
        }
    }

    /**
     * Точка, начиная от которой окно займёт всю доступную высоту в зависимости от stickyY
     * если stickyY - центр, займёт такую высоту, чтобы окно оказалось по центру
     * @type {string|number|null}
     */
    get startPointY() {
        return this._startPointY;
    }
    set startPointY(value) {
        this._setStartPointY(value);
    }
    _setStartPointY(value) {
        if (![null, false, undefined].includes(value)) {

            this._startPointY = parseInt(value);
            let measure = '';
            if (typeof value === 'string' && value.indexOf('%') !== -1) {
                measure = '%';
            }
            else {
                measure = 'px';
            }

            switch (this._stickyY) {
                case 'top':
                case 'bottom':
                    this._setHeight('calc(100vh - '+ this._startPointY + measure +')');
                    break;
                case 'center':
                    this._setHeight('calc(100vh - '+ (this._startPointY * 2) + measure +')');
                    break;
                default:
                    this._startPointY = null;
            }

            this._startPointY += (this._startPointY && measure === '%') ? '%' : '';
        }
        else {
            this._startPointY = null;
        }
    }

    /**
     * Можно ли закрыть окно
     * @type {boolean}
     */
    get closable() {
        return this._closable;
    }
    set closable(value) {
        this._setClosable(value);
    }
    _setClosable(value) {
        this._closable = (value === true || value === 'true');
        this._getCloseButton().shown = this._closable;
    }

    /**
     * Удалять ли окно из DOM при закрытии
     * @type {boolean}
     */
    get disposeOnClose() {
        return this._disposeOnClose;
    }
    set disposeOnClose(value) {
        this._disposeOnClose = (value === true || value === 'true');
    }

    /**
     * Ширина компонента
     * @type {number}
     */
    set width(value) {
        if (!this._startPointX) {
            this._setWidth(value);
        }
    }
    _setWidth(value) {
        super.width = value;
        this._updateStyleVariables();
    }

    /**
     * Высота компонента
     * @type {number}
     */
    set height(value) {
        if (!this._startPointY) {
            this._setHeight(value);
        }
    }
    _setHeight(value) {
        super.height = value;
        this._updateStyleVariables();
    }

    /**
     * Содержимое заголовка окна
     * @type {string|Element}
     */
    get title() {
        return this._getHeader().html();
    }
    set title(value) {
        this._setTitle(value);
    }
    _setTitle(value) {
        if (value) {
            this._getHeader().html(value);
            this._getHeader().style.display = '';
        }

        if (value === null || value === false) {
            this._getHeader().style.display = 'none';
        }
    }

    /**
     * DOM элемент header
     * @return {Element}
     */
    get header() {
        return this._getHeader();
    }
    _getHeader() {
        return this._element.querySelector('.modeless-window-header-container > .modeless-window-header');
    }

    /**
     * DOM элемент container
     * @return {Element}
     */
    get container() {
        return this._getContainer();
    }
    _getContainer() {
        return this._element.querySelector('.modeless-window-container');
    }

    /**
     * DOM элемент footer
     * @return {Element}
     */
    get footer() {
        return this._getFooter();
    }
    _getFooter() {
        return this._element.querySelector('.modeless-window-footer');
    }

    /**
     * Кнопка закрытия окна (компонент)
     * @return {Colibri.UI.Component}
     * @private
     */
    _getCloseButton() {
        return this.Children('close-button');
    }

    /**
     * При отображении поместить над всеми остальными элементами и обновить переменные css
     * @param {boolean} value
     */
    set shown(value) {
        this._element.style.visibility = 'hidden';
        super.shown = value;
        if(value) {
            this.BringToFront();
            Colibri.Common.Delay(0).then(() => {
                this._updateStyleVariables();
                this._element.style.visibility = 'unset';
            });
        }
        else {
            this.SendToBack();
        }
    }
}