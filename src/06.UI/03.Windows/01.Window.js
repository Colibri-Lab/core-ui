Colibri.UI.Window = class extends Colibri.UI.Component {

    constructor(name, container, element, title, width, height) {
        super(name, container, Element.fromHtml('<div><div class="app-component-window-container"><div class="app-component-window-title"><span></span><div class="minimize-button"></div><div class="close-button"></div></div><div class="app-component-window-content"></div><div class="app-component-window-minimized-content"></div><div class="app-component-window-footer"></div></div></div>')[0]);

        this.AddClass('app-component-window');

        this._closable = true;
        this._closableOnShadow = true;
        this._minimizable = false;
        this._state = 'normal';
        this._minimizedPosition = [20, 20];
        this._minimizedSize = [200, 50];
        this._minimizedGetContentMethod = () => { return null; };

        /* меняем размеры отрисованого окна если передали параметры */
        !!width && (this.width = width);
        !!height && (this.height = height);

        /* запоминаем компонент заголовок */
        this._title = this._element.querySelector('.app-component-window-title > span');
        /* запихиваем в html */
        !!title && (this._title.innerHTML = title);

        this._titleContainer = this._element.querySelector('.app-component-window-title');
        if (title === undefined) {
            this._titleContainer.hideElement();
        }

        this._content = this._element.querySelector('.app-component-window-content');
        this._minimizedContent = this._element.querySelector('.app-component-window-minimized-content');

        this._footer = this._element.querySelector('.app-component-window-footer');
        // this._footer.style.display = 'none';

        this.GenerateChildren(element, this._content);


        let closeButtonContainer = this._element.querySelector('.close-button');
        let minimizeButtonContainer = this._element.querySelector('.minimize-button');

        this.Children('closebutton', new Colibri.UI.Button('closebutton', closeButtonContainer));
        this.Children('closebutton').AddClass('s-close');
        this.Children('closebutton').shown = this._closable;
        this.Children('closebutton').AddHandler('Clicked', (event, args) => this.__CloseClicked(event, args));

        this.Children('minimizebutton', new Colibri.UI.Button('minimizebutton', minimizeButtonContainer));
        this.Children('minimizebutton').AddClass('s-minimize');
        this.Children('minimizebutton').shown = this._minimizable;
        this.Children('minimizebutton').AddHandler('Clicked', (event, args) => this.__MinimizeClicked(event, args));

        this.AddHandler('MouseUp', (event, args) => this.__MouseUp(event, args));
        this.AddHandler('MouseDown', (event, args) => this.__MouseDown(event, args));
        this.AddHandler('KeyDown', (event, args) => this.__KeyDown(event, args));

        this.Dispatch('WindowContentRendered');

    }


    _movingHandler(e) {
        const windowElement = e.currentTarget.closest('.app-component-window');
        const windowContainer = windowElement.querySelector('.app-component-window-container');

        const point = windowElement.tag('movingPoint');

        windowContainer.css('left', (e.pageX - point.left - parseInt(windowContainer.css('margin-left'))) + 'px');
        windowContainer.css('top', (e.pageY - point.top - parseInt(windowContainer.css('margin-top'))) + 'px');
    }

    _movingStartHandler(e) {
        
        if(e.target.is('button')) {
            return false;
        }

        const windowElement = e.currentTarget.closest('.app-component-window');
        const windowComponent = windowElement.tag('component');
        windowComponent.moving = true;
        windowElement.addEventListener('mousemove', windowComponent._movingHandler, true);
        windowElement.addEventListener('mouseup', windowComponent._movingStopHandler, true);
        windowElement.tag('movingPoint', {left: e.layerX, top: e.layerY});
    }

    _movingStopHandler(e) {
        const windowElement = e.currentTarget.closest('.app-component-window');
        const windowComponent = windowElement.tag('component');
        windowComponent.moving = false;
        windowElement.removeEventListener('mousemove', windowComponent._movingHandler, true);
        windowElement.removeEventListener('mouseup', windowComponent._movingStopHandler);
    }

    _setMovableEvents(value) {
        if(value) {
            this._titleContainer.addEventListener('mousedown', this._movingStartHandler);
        }
        else {
            this._titleContainer.removeEventListener('mousedown', this._movingStartHandler);
        }
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('WindowMinimizing', false, 'Поднимается когда окно минимизируется');
        this.RegisterEvent('WindowClosed', false, 'Поднимается когда окно закрылось');
        this.RegisterEvent('WindowContentRendered', false, 'Когда содержание окна отрисовалось');
    }

    __CloseClicked(event, args) {
        
        if(this._minimizable === true && this._state === 'minimized') {
            this.RemoveClass('-minimized');   
            super.width = null;
            super.height = null;
            super.right = null;
            super.bottom = null;
            this._state = 'normal';
        }

        if (this._closable === true) {
            this.shown = false;
            this.Dispatch('WindowClosed', {});
        }
        
    }

    __getMinimizedContent() {
        return Promise.resolve(null);
    }
    
    __MinimizeClicked(event, args) {
        
        this.MinimizeToggle();

    }

    MinimizeToggle() {
        const content = this._minimizedGetContentMethod(this);
        if(content) {
            this._minimizedContent.html(content);
        }

        if(this._minimizable && this._state === 'normal') {

            this.AddClass('-minimized');
            super.width = this._minimizedSize[0];
            super.height = this._minimizedSize[1];
            super.right = this._minimizedPosition[0];
            super.bottom = this._minimizedPosition[1];
            this._state = 'minimized';


        } else if(this._minimizable && this._state === 'minimized') {
            this.RemoveClass('-minimized');   
            super.width = null;
            super.height = null;
            super.right = null;
            super.bottom = null;
            this._state = 'normal';

        }
    }

    __MouseUp(event, args) {
        const domEvent = args.domEvent;
        domEvent.stopPropagation();
        domEvent.preventDefault();
        return false;
    }

    __MouseDown(event, args) {
        const domEvent = args.domEvent;
        if (domEvent.target == this._element && !Colibri.UI.Resizing && this._closableOnShadow) {
            this.__CloseClicked();
        }
    }

    __KeyDown(event, args) {
        const domEvent = args.domEvent;
        if(domEvent.code === 'Escape') {
            this.Children('closebutton').Dispatch('Clicked', {domEvent: domEvent});
            return false;
        }
        return true;
    }


    StartTabIndexRoutine() {
        const firstInput = this._element.querySelector('input,textarea,select');
        if(firstInput) {
            firstInput.focus();
        }
    }

    get container() {
        return this._content;
    }

    get footer() {
        return this._footer;
    }

    get header() {
        return this._titleContainer.querySelector('span');
    }

    get content() {
        return this._content.innerHTML;
    }

    set content(value) {
        return this._content.innerHTML = value;
    }

    get movable() {
        return this._movable;
    }

    set movable(value) {
        this._movable = value;
        this._setMovableEvents(value);
    }

    set moving(value) {
        this._moving = value;
    }

    get moving() {
        return this._moving;
    }

    /**
     * Ширина компонента
     * @type {number}
     */
    get width() {
        const bounds = this._element.querySelector('.app-component-window-content').bounds();
        return bounds.outerWidth;
    }

    set width(value) {
        if(value === null) {
            this._element.querySelector('.app-component-window-content').css('width', null);    
        }
        else {
            const style = this._element.querySelector('.app-component-window-content').css();
            this._element.querySelector('.app-component-window-content').css('width', (value - (parseInt(style.paddingLeft) || 0) - (parseInt(style.paddingRight) || 0)) + 'px');
        }
    }

    /**
     * Высота компонента
     * @type {number}
     */
    get height() {
        const bounds = this._element.querySelector('.app-component-window-content').bounds();
        return bounds.outerHeight;
    }

    set height(value) {
        if(value === null) {
            this._element.querySelector('.app-component-window-content').css('height', null);    
        }
        else {
            const style = this._element.querySelector('.app-component-window-content').css();
            this._element.querySelector('.app-component-window-content').css('height', (value - (parseInt(style.paddingTop) || 0) - (parseInt(style.paddingBottom) || 0)) + 'px');
        }
    }

    /**
     * Заголовок окна
     * @type {number}
     */
    get title() {
        return this._element.querySelector('.app-component-window-title > span').innerHTML;
    }

    set title(value) {
        this._element.querySelector('.app-component-window-title > span').innerHTML = value;
        if(!value) {
            this._element.querySelector('.app-component-window-title').hideElement();
        }
        else {
            this._element.querySelector('.app-component-window-title').showElement();
        }
    }

    get closable() {
        return this._closable;
    }

    set closable(value) {
        this._closable = value;
        this.Children('closebutton').shown = this._closable;
    }

    get closableOnShadow() {
        return this._closableOnShadow;
    }

    set closableOnShadow(value) {
        this._closableOnShadow = value;
    }

    set shown(value) {
        super.shown = value;
        if(value) {
            this.BringToFront();
        }
        else {
            this.SendToBack();
        }
        this.StartTabIndexRoutine();
    }

    get shown() {
        return super.shown;
    }

    /**
     * Is window has title
     * @type {Boolean}
     */
    get hasTitle() {
        return this._titleContainer.css('display') === 'block';
    }
    /**
     * Is window has title
     * @type {Boolean}
     */
    set hasTitle(value) {
        this._titleContainer.css('display', value ? 'block' : 'none');
    }

    AddButton(title, name) {
        this._footer.hideElement();
        this._footer.showElement();
        let newButton =new Colibri.UI.Button(name, this._footer, title);
        newButton.AddClass('app-component-window-button');
        newButton.parent = this;
        newButton.shown = true;
        newButton.AddHandler('ComponentDisposed', () => {
            if (this._footer.children.length === 0) {
                this._footer.hideElement();
            }
        });
        return newButton;
    }

    /**
     * Can minimize
     * @type {boolean}
     */
    get minimizable() {
        return this._minimizable;
    }
    /**
     * Can minimize
     * @type {boolean}
     */
    set minimizable(value) {
        this._minimizable = value;
        this._showMinimizable();
    }
    _showMinimizable() {
        this.Children('minimizebutton').shown = this._minimizable;
        if(!this._minimizable) {
            this.RemoveClass('-minimized');   
            super.width = null;
            super.height = null;
            super.right = null;
            super.bottom = null;
            this._state = 'normal';
        }
    }

    /**
     * Позиция (правый нижний угол) при минимизации
     * @type {object<integer, integer>} 
     */
    get minimizedPosition() {
        return this._minimizedPosition;
    }
    /**
     * Позиция (правый нижний угол) при минимизации
     * @type {object<integer, integer>} 
     */
    set minimizedPosition(value) {
        this._minimizedPosition = value;
    }

    /**
     * Размер при минимизации
     * @type {object(integer, integer)}
     */
    get minimizedSize() {
        return this._minimizedSize;
    }
    /**
     * Размер при минимизации
     * @type {object(integer, integer)}
     */
    set minimizedSize(value) {
        this._minimizedSize = value;
    }

    /**
     * Получение содержания минимизурованного окна
     * @type {Function}
     */
    get minimizedGetContentMethod() {
        return this._minimizedGetContentMethod;
    }
    /**
     * Получение содержания минимизурованного окна
     * @type {Function}
     */
    set minimizedGetContentMethod(value) {
        this._minimizedGetContentMethod = value;
    }

}
