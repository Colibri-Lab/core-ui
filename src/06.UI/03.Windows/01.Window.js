/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Window = class extends Colibri.UI.Component {

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

    /** @private */
    _movingHandler(e) {
        const windowElement = e.currentTarget.closest('.app-component-window');
        const windowContainer = windowElement.querySelector('.app-component-window-container');

        const point = windowElement.tag('movingPoint');

        windowContainer.css('left', (e.pageX - point.left - parseInt(windowContainer.css('margin-left'))) + 'px');
        windowContainer.css('top', (e.pageY - point.top - parseInt(windowContainer.css('margin-top'))) + 'px');
    }

    /** @private */
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

    /** @private */
    _movingStopHandler(e) {
        const windowElement = e.currentTarget.closest('.app-component-window');
        const windowComponent = windowElement.tag('component');
        windowComponent.moving = false;
        windowElement.removeEventListener('mousemove', windowComponent._movingHandler, true);
        windowElement.removeEventListener('mouseup', windowComponent._movingStopHandler);
    }

    /** @private */
    _setMovableEvents(value) {
        if(value) {
            this._titleContainer.addEventListener('mousedown', this._movingStartHandler);
        }
        else {
            this._titleContainer.removeEventListener('mousedown', this._movingStartHandler);
        }
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('WindowMinimizing', false, 'When window minimized');
        this.RegisterEvent('WindowClosed', false, 'When window closed');
        this.RegisterEvent('WindowBeforeClosed', false, 'When close button clicked');
        this.RegisterEvent('WindowContentRendered', false, 'When window content is rendered');
        this.RegisterEvent('WindowOpened', false, 'When window is opened');
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __CloseClicked(event, args) {

        const aargs = {cancel: false};
        this.Dispatch('WindowBeforeClosed', aargs);
        if(aargs.cancel) {
            return;
        }
        
        this.Close();
        
    }

    Close() {
        if (this._closable === true) {
            if(this._minimizable === true && this._state === 'minimized') {
                this.RemoveClass('-minimized');   
                super.width = null;
                super.height = null;
                super.right = null;
                super.bottom = null;
                this._state = 'normal';
            }
            this.shown = false;
            this.Dispatch('WindowClosed', {});
        }
    }

    /** @private */
    __getMinimizedContent() {
        return Promise.resolve(null);
    }
    
    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __MinimizeClicked(event, args) {
        
        this.MinimizeToggle();

    }

    /**
     * Toggle minimize state
     */
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

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __MouseUp(event, args) {
        const domEvent = args.domEvent;
        domEvent.stopPropagation();
        domEvent.preventDefault();
        return false;
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __MouseDown(event, args) {
        const domEvent = args.domEvent;
        if (domEvent.target == this._element && !Colibri.UI.Resizing && this._closableOnShadow) {
            this.__CloseClicked();
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __KeyDown(event, args) {
        const domEvent = args.domEvent;
        if(domEvent.code === 'Escape') {
            this.Children('closebutton').Dispatch('Clicked', {domEvent: domEvent});
            return false;
        }
        return true;
    }


    /**
     * Start tab index routine
     */
    StartTabIndexRoutine() {
        const firstInput = this._element.querySelector('input,textarea,select');
        if(firstInput) {
            firstInput.focus();
        }
    }

    /**
     * Element object
     * @type {Element}
     * @readonly
     */
    get element() {
        return this._element;
    }

    /**
     * Container object
     * @type {Element}
     * @readonly
     */
    get container() {
        return this._content;
    }

    /**
     * Footer element
     * @type {Element}
     * @readonly
     */
    get footer() {
        return this._footer;
    }

    /**
     * Header container element
     * @type {Element}
     * @readonly
     */
    get header() {
        return this._titleContainer.querySelector('span');
    }

    /**
     * Window content string
     * @type {string}
     */
    get content() {
        return this._content.innerHTML;
    }

    /**
     * Window content string
     * @type {string}
     */
    set content(value) {
        return this._content.innerHTML = value;
    }

    /**
     * Is window movable
     * @type {boolean}
     */
    get movable() {
        return this._movable;
    }

    /**
     * Is window movable
     * @type {boolean}
     */
    set movable(value) {
        this._movable = value;
        this._setMovableEvents(value);
    }

    /**
     * Is window currently moving
     * @type {boolean}
     */
    set moving(value) {
        this._moving = value;
    }

    /**
     * Is window currently moving
     * @type {boolean}
     */
    get moving() {
        return this._moving;
    }

    /**
     * Window width
     * @type {number}
     */
    get width() {
        const bounds = this._element.querySelector('.app-component-window-content').bounds();
        return bounds.outerWidth;
    }

    /**
     * Window width
     * @type {number}
     */
    set width(value) {
        if(value === null) {
            this._element.querySelector('.app-component-window-content').css('width', null);    
        }
        else {
            const style = this._element.querySelector('.app-component-window-content').css();
            if((value + '').isNumeric()) {
                this._element.querySelector('.app-component-window-content').css('width', (value - (parseInt(style.paddingLeft) || 0) - (parseInt(style.paddingRight) || 0)) + 'px');
            } else {
                this._element.querySelector('.app-component-window-content').css('width', value);
            }
        }
    }

    /**
     * Window container height
     * @type {number}
     */
    get containerWidth() {
        const bounds = this._element.querySelector('.app-component-window-container').bounds();
        return bounds.outerWidth;
    }

    /**
     * Window container height
     * @type {number}
     */
    set containerWidth(value) {
        if(value === null) {
            this._element.querySelector('.app-component-window-container').css('width', null);    
        }
        else {
            const style = this._element.querySelector('.app-component-window-container').css();
            this._element.querySelector('.app-component-window-container').css('width', (value - (parseInt(style.paddingLeft) || 0) - (parseInt(style.paddingRight) || 0)) + 'px');
        }
    }

    /**
     * Window height
     * @type {number}
     */
    get height() {
        const bounds = this._element.querySelector('.app-component-window-content').bounds();
        return bounds.outerHeight;
    }

    /**
     * Window height
     * @type {number}
     */
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
     * Window title
     * @type {string}
     */
    get title() {
        return this._element.querySelector('.app-component-window-title > span').innerHTML;
    }

    /**
     * Window title
     * @type {string}
     */
    set title(value) {
        this._element.querySelector('.app-component-window-title > span').innerHTML = value;
        if(!value) {
            this._element.querySelector('.app-component-window-title').hideElement();
        }
        else {
            this._element.querySelector('.app-component-window-title').showElement();
        }
    }

    /**
     * Is window closable
     * @type {boolean}
     */
    get closable() {
        return this._closable;
    }

    /**
     * Is window closable
     * @type {boolean}
     */
    set closable(value) {
        this._closable = value;
        this.Children('closebutton').shown = this._closable;
    }

    /**
     * Is window closed when clicked on shadow
     * @type {boolean}
     */
    get closableOnShadow() {
        return this._closableOnShadow;
    }

    /**
     * Is window closed when clicked on shadow
     * @type {boolean}
     */
    set closableOnShadow(value) {
        this._closableOnShadow = value;
    }

    /**
     * Show/Hide window
     * @type {boolean}
     */
    set shown(value) {
        super.shown = value;
        if(value) {
            this.BringToFront();
        }
        else {
            this.SendToBack();
        }
        this.StartTabIndexRoutine();
        if(value === true) {
            this.Dispatch('WindowOpened');
        }
    }

    /**
     * Show/Hide window
     * @type {boolean}
     */
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

    /**
     * Adds button to footer
     * @param {string} title button title
     * @param {string} name button name
     * @returns {Colibri.UI.Button}
     */
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
    /** @private */
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
     * Right bottom corner of window when minimized
     * @type {object<integer, integer>} 
     */
    get minimizedPosition() {
        return this._minimizedPosition;
    }
    /**
     * Right bottom corner of window when minimized
     * @type {object<integer, integer>} 
     */
    set minimizedPosition(value) {
        this._minimizedPosition = value;
    }

    /**
     * Minimized size
     * @type {object(integer, integer)}
     */
    get minimizedSize() {
        return this._minimizedSize;
    }
    /**
     * Minimized size
     * @type {object(integer, integer)}
     */
    set minimizedSize(value) {
        this._minimizedSize = value;
    }

    /**
     * Method to get content of minimized window
     * @type {Function}
     */
    get minimizedGetContentMethod() {
        return this._minimizedGetContentMethod;
    }
    /**
     * Method to get content of minimized window
     * @type {Function}
     */
    set minimizedGetContentMethod(value) {
        this._minimizedGetContentMethod = value;
    }

}
