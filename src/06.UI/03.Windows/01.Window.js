Colibri.UI.Window = class extends Colibri.UI.Component {

    constructor(name, container, element, title, width, height) {
        super(name, container, '<div><div class="app-component-window-container"><div class="app-component-window-title"><span></span><div class="close-button"></div></div><div class="app-component-window-content"></div><div class="app-component-window-footer"></div></div></div>');

        this.AddClass('app-component-window');

        this._closable = true;
        this._closableOnShadow = true;

        /* меняем размеры отрисованого окна если передали параметры */
        !!width && (this.width = width);
        !!height && (this.height = height);

        /* запоминаем компонент заголовок */
        this._title = this._element.querySelector('.app-component-window-title > span');
        /* запихиваем в html */
        this._title.innerHTML = title;

        this._titleContainer = this._element.querySelector('.app-component-window-title');
        if (title === undefined) {
            this._titleContainer.hideElement();
        }

        this._content = this._element.querySelector('.app-component-window-content');

        this._footer = this._element.querySelector('.app-component-window-footer');
        // this._footer.style.display = 'none';

        this.GenerateChildren(element, this._content);


        let closeButtonContainer = this._element.querySelector('.close-button');

        this.Children('closebutton', new Colibri.UI.Button('closebutton', closeButtonContainer));
        this.Children('closebutton').AddClass('s-close');
        this.Children('closebutton').shown = this._closable;

        this.Children('closebutton').AddHandler('Clicked', (event, args) => this.__CloseClicked(event, args));

        this.AddHandler('MouseUp', (event, args) => this.__MouseUp(event, args));
        this.AddHandler('MouseDown', (event, args) => this.__MouseDown(event, args));

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
        this.RegisterEvent('WindowClosed', false, 'Поднимается когда окно закрылось');
        this.RegisterEvent('WindowContentRendered', false, 'Когда содержание окна отрисовалось');
    }

    __CloseClicked(event, args) {
        if (this._closable === true) {
            this.shown = false;
            this.__changeBodyScroll();
            this.Dispatch('WindowClosed', {});
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

    __changeBodyScroll() {
        if (this.shown) {
            document.body.css('overflow', 'hidden')
        } else {
            document.body.css('overflow', 'unset')
        }
    }

    get container() {
        return this._content;
    }

    get footer() {
        return this._footer;
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
        const style = this._element.querySelector('.app-component-window-content').css();
        this._element.querySelector('.app-component-window-content').css('width', (value - (parseInt(style.paddingLeft) || 0) - (parseInt(style.paddingRight) || 0)) + 'px');
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
        const style = this._element.querySelector('.app-component-window-content').css();
        this._element.querySelector('.app-component-window-content').css('height', (value - (parseInt(style.paddingTop) || 0) - (parseInt(style.paddingBottom) || 0)) + 'px');
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
        this.__changeBodyScroll();
    }

    get shown() {
        return super.shown;
    }

    AddButton(title, name) {
        this._footer.style.display = '';
        let newButton =new Colibri.UI.Window.Button(name, this._footer, title);
        newButton._parent = this;
        newButton.AddHandler('ComponentDisposed', () => {
            if (this._footer.children.length === 0) {
                this._footer.style.display = 'none';
            }
        });
        return newButton
    }
}

Colibri.UI.Window.Button = class extends Colibri.UI.Button {

    constructor(name, container, title, ) {
        super(name, container);
        this.AddClass('app-component-window-button');
        this.value = title;
        this._handlerEvents();
    }

    _handlerEvents() {
        this.AddHandler('Clicked', () => {
            if (this._callback) {
                this._callback(this)
            } else {
                this.parent.Hide();
                this.parent.Dispatch('WindowClosed', {});
            }
        });
    }

    Show(callback) {
        super.Show();
        this._callback = callback;
    }

    Hide() {
        super.Hide();
        this._callback = null;
    }

}