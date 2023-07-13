/**
 * Класс компонента по умолчанию
 * @class
 * @extends Colibri.Dispatcher
 */
Colibri.UI.Component = class extends Colibri.Events.Dispatcher 
{

    /**
     * @constructor
     * @param {string} name - наименование обьекта
     * @param {string} element наименование тэга
     * @param {(Colibri.UI.Component|Element)} container - обьект в контейнере которого будет создан текущий компонент
     */
    constructor(name, container, element) {
        super();

        /** @type {Colibri.UI.Component} */
        this._parent = null;
        /** @type {string} */
        this._name = name || this._newName();
        /** @type {Array} */
        this._children = [];
        /** @type {Object} */
        this._tag = {};
        /** @type {HTMLElement} */
        this._container = container instanceof Colibri.UI.Component ? container.container : container;

        /** @type {string} */
        this._toolTip = '';
        this._toolTipPosition = 'left bottom';

        this._storage = null;
        this._binding = '';
        this._clickToCopyHandler = (e) => this.value.copyToClipboard() && App.Notices.Add(new Colibri.UI.Notice('#{ui-copy-info}', Colibri.UI.Notice.Success));

        if (!element) {
            element = Element.create('div');
        }
        if (typeof element === 'string') {
            console.log(element); console.trace();
            // передана строка html, нужно спарсить и превратить в Element
            element = new DOMParser().parseFromString(element, "application/xhtml+xml").children[0];
        }


        /** @type {HTMLElement} */
        this._element = element.clone();
        this._element.data('objectName', this._name);
        this._element.tag('component', this);
        this.AddClass('app-ui-component');

        if (container instanceof Colibri.UI.Component) {
            this._parent = container;
            container.Children(this._name, this);
        }

        this._registerEvents();

        this.ProcessChildren(element.childNodes, null, false);

        // вводим в DOM
        this._container && this._container.append(this._element);

        this._bindHtmlEvents();
        this._registerEventHandlers();

        this._contextmenu = [];
        this._hasContextMenu = false;
        
        this.Dispatch('ComponentRendered');
    }

    _newName() {
        return 'component-' + Date.Mc()
    }

    _registerObserver() {
        this._observer = new window.IntersectionObserver(([entry]) => {
            if(this._visible != entry.isIntersecting) {
                this.Dispatch('VisibilityChanged', {state: entry.isIntersecting});
            }
            this._visible = entry.isIntersecting;
        }, {
            root: null,
            threshold: 1,
        })
        this._observer.observe(this._element);
    }

    _unregisterObserver() {
        if(this._observer) {
            this._observer.unobserve(this._element);
        }
    }

    CreateComponentClass(element, parent) {
        let comp = null;
        try {
            comp = element.getAttribute('Component') || element.getAttribute('component') || element.tagName; 
        }
        catch(e) {
            return null;
        }

        // пытаемся создать компонент
        let objectClass = null;
        try {
            objectClass = eval(comp);
            if(objectClass && Colibri.UI.Component.isPrototypeOf(objectClass)) {
                return objectClass;
            }
        }
        catch(e) {

        }

        // надо найти способ получить название класса которым создан обьект rootNameSpaceObject 
        // и найти в нем парент значение
        // найти так же и у парента и в нем тоже поискать, а то некрасиво
        
        let namespace = '';
        if(parent instanceof Colibri.UI.Component) {
            namespace = parent.namespace;
        }
        else {
            namespace = parent?.closest('[namespace]')?.attr('namespace') ?? '';
        }
        namespace = namespace.split('.');
        
        if(namespace) {
            while(namespace.length > 0) {
                try {
                    objectClass = eval(namespace.join('.') + '.' + comp);
                    if(objectClass && Colibri.UI.Component.isPrototypeOf(objectClass)) {
                        return objectClass;
                    }
                }
                catch(e) {
        
                }
                namespace.pop();
            }
        }

        try {
            objectClass = eval('Colibri.UI.' + comp);
            if(objectClass && Colibri.UI.Component.isPrototypeOf(objectClass)) {
                return objectClass;
            }
        }
        catch(e) {

        }

        try {
            objectClass = eval('App.Modules.' + comp);
            if(objectClass && Colibri.UI.Component.isPrototypeOf(objectClass)) {
                return objectClass;
            }
        }
        catch(e) {

        }

        return null;
    }

    CreateComponent(objectClass, element, parent, root) {
        try {

            const name = element.getAttribute('name') || this._newName(); 

            let component = new objectClass(name, parent);
            if( !(parent instanceof Colibri.UI.Component) ) {
                component.parent = this;
            }
            this.Children(name, component);
            for (let j = 0; j < element.attributes.length; j++) {
                const attr = element.attributes[j];

                if (['Component', 'name', 'component'].indexOf(attr.name) !== -1) {
                    continue;
                }

                if (attr.name.indexOf('On') === 0) {
                    let context = null;
                    eval('context = function(event, args) { (' + attr.value + ')(event, args) }');
                    if(context) {
                        component.AddHandler(attr.name.substr(2), context.bind(root ?? component));
                    }
                } else {
                    component[attr.name] = attr.value;
                }
            }
            return component;
        }
        catch(e) {
            console.log(e);
        }
        return null;
    }

    ProcessChildren(children, parent, dontDispatch = false, root = null) {
        if (!parent) {
            parent = this._element;
        }
        if(!root) {
            root = this;
        }

        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            const componentClass = this.CreateComponentClass(element, parent);
            if(componentClass) {
                let component = this.CreateComponent(componentClass, element, parent, root);
                component && component.ProcessChildren(element.childNodes, component.container, false, root);
            }
            else if(element.tagName) {
                if(element.tagName == 'params') {
                    let data = element.childNodes[0].textContent;
                    try { eval('data = ' + data + ';'); } catch(e) { console.log(data); console.log(e); }
                    if(data instanceof Object) {
                        this.tag.params = data;
                    }
                }
                else if(element.tagName == 'fields') {
                    let data = element.childNodes[0].textContent;
                    try { eval('data = ' + data + ';'); } catch(e) { console.log(data); console.log(e); }
                    if(data instanceof Object) {
                        this.fields = data;
                    }
                }
                else if(element.tagName.indexOf('json-') !== -1) {
                    const propertyName = element.tagName.substr('json-'.length);
                    let data = element.childNodes[0].textContent;
                    try { eval('data = ' + data + ';'); } catch(e) { console.log(data); console.log(e); }
                    if(data instanceof Object) {
                        this[propertyName] = data;
                    }
                }
                else if(element.tagName.indexOf('component-') !== -1) {
                    const tagName = element.tagName.substr('component-'.length);
                    if(parent instanceof Colibri.UI.Component) {
                        this.ProcessChildren(element.childNodes, parent[tagName], true, root);
                    }
                    else {
                        this.ProcessChildren(element.childNodes, this[tagName], true, root);
                    }
                }
                else {
                    const e = element.clone(element.attr('xmlns') ? element.attr('xmlns') : parent.attr('xmlns'));
                    parent.append(e);
                    this.ProcessChildren(element.childNodes, e, true, root);
                }
            } 
            else {
                let node = null;
                if(element.nodeType === Node.COMMENT_NODE) {
                    node = document.createComment(element.textContent);
                }
                else {
                    node = document.createTextNode(element.textContent);
                }
                
                // какая то текстовая хрень
                if(parent instanceof Colibri.UI.Component) {
                    parent.container.append(node);
                }
                else {
                    parent.append(node);
                }
            }
            

        }

        if(!dontDispatch) {
            this.Dispatch('ChildsProcessed');
        }

    }

    GenerateChildren(element, parent) {
        if (!element) {
            element = Element.create('div');
        }

        if (typeof element === 'string') {
            // передана строка html, нужно спарсить и превратить в Element
            element = new DOMParser().parseFromString(element, "application/xhtml+xml").children[0];
        }

        this.ProcessChildren(element.childNodes, parent, false, this);
    }

    _registerEvents() {
        this.RegisterEvent('ComponentRendered', false, 'Поднимается, когда компонента готова и привязана к DOM-у');
        this.RegisterEvent('ComponentDisposed', false, 'Поднимается, когда компонента отвязана от DOM-а');
        this.RegisterEvent('ReadonlyStateChanged', false, 'Поднимается, когда изменяется свойство Readonly');
        this.RegisterEvent('EnabledStateChanged', false, 'Поднимается, когда изменяется свойство Enabled');
        this.RegisterEvent('Resized', false, 'Поднимается, когда изменение размера завершено');
        this.RegisterEvent('Resize', false, 'Поднимается, когда изменяется размер');
        this.RegisterEvent('ReceiveFocus', true, 'Получен фокус в компоненте');
        this.RegisterEvent('LoosedFocus', true, 'Утерян фокус');
        this.RegisterEvent('Clicked', false, 'Клик мышкой');
        this.RegisterEvent('DoubleClicked', false, 'Двойной клик');
        this.RegisterEvent('MouseDown', false, 'Кнопка мыши нажата (но не отпущена)');
        this.RegisterEvent('MouseUp', false, 'Кнопка мыши отпущена');
        this.RegisterEvent('MouseMove', false, 'Движение мышью');
        this.RegisterEvent('KeyDown', false, 'Клавиша нажата');
        this.RegisterEvent('KeyUp', false, 'Клавиша отпущена');
        this.RegisterEvent('KeyPressed', false, 'Клавиша нажата и отпущена');
        this.RegisterEvent('Shown', false, 'Компонент отображен');
        this.RegisterEvent('ClickedOut', false, 'Клик вне элемента компонента');
        this.RegisterEvent('ChildsProcessed', false, 'Когда дочерние элементы отрисованы');
        this.RegisterEvent('ContextMenuIconClicked', false, 'Когда кликнули на иконку контекстного меню');
        this.RegisterEvent('ContextMenuItemClicked', false, 'Когда кликнули на иконку контекстного меню');
        this.RegisterEvent('ShadowClicked', false, 'Когда кликнули на тень');
        this.RegisterEvent('Shown', false, 'Когда элемент компонента получил класс app-component-shown');
        this.RegisterEvent('Hidden', false, 'Когда с элемента компонта снят класс app-component-shown');   
        this.RegisterEvent('Pasted', false, 'Когда вставили в элемент');
        this.RegisterEvent('DragStart', false, 'Когда элемент начинают перетаскивать');
        this.RegisterEvent('DragEnd', false, 'Когда элемент перестают перетаскивать');
        this.RegisterEvent('DragEnter', false, 'Когда перетаскиваемый элемент заходит в область целевого элемента');
        this.RegisterEvent('DragOver', false, 'Когда перетаскиваемый элемент находится над целевым объектом');
        this.RegisterEvent('DragLeave', false, 'Когда перетаскиваемый элемент покидает целевой объект');
        this.RegisterEvent('Drop', false, 'Когда перетаскиваемый элемент "упал" на целевой объект');
        this.RegisterEvent('Drag', false, 'Когда происходит процесс перетаскивания');
        this.RegisterEvent('ContextMenu', false, 'Контекстное меню');
        this.RegisterEvent('Scrolled', false, 'Когда проскроллировали');
        this.RegisterEvent('VisibilityChanged', false, 'Когда изменилось состояние отображения');
        this.RegisterEvent('SwipedToLeft', false, 'Когда пользователь провел пальцем/мышью влево');
        this.RegisterEvent('SwipedToRight', false, 'Когда пользователь провел пальцем/мышью вправо');
        this.RegisterEvent('SwipedToUp', false, 'Когда пользователь провел пальцем/мышью вверх');
        this.RegisterEvent('SwipedToDown', false, 'Когда пользователь провел пальцем/мышью вниз');
        this.RegisterEvent('TouchStarted', false, 'Когда пальцем нажали на экран');
        this.RegisterEvent('TouchEnded', false, 'Когда палец убрали с экрана');
        this.RegisterEvent('TouchMoved', false, 'Когда вазюкают пальцем по экрану');
    }

    
    get contextMenuIcon() {
        return this.Children(this._name + '-contextmenu-icon-parent');
    }

    _getContextMenuIcon() {
        if(this.Children(this._name + '-contextmenu-icon-parent')) {
            return this.Children(this._name + '-contextmenu-icon-parent/' + this._name + '-contextmenu-icon');
        }
        return null;
    }

    _createContextMenuButton() {
        if(!this._hasContextMenu || this.Children(this._name + '-contextmenu-icon-parent')) {
            return;
        }

        this.AddClass('app-component-hascontextmenu');

        const contextMenuParent = new Colibri.UI.Pane(this._name + '-contextmenu-icon-parent', this);
        contextMenuParent.AddClass('app-contextmenu-icon-component');
        contextMenuParent.shown = true;
        
        const contextMenuIcon = new Colibri.UI.Icon(this._name + '-contextmenu-icon', contextMenuParent);
        contextMenuIcon.shown = true;
        contextMenuIcon.value = Colibri.UI.ContextMenuIcon;
        contextMenuIcon.AddHandler('Clicked', (event, args) => this.Dispatch('ContextMenuIconClicked', args));
    }

    _removeContextMenuButton() {
        if(this._hasContextMenu && this.Children(this._name + '-contextmenu-icon-parent')) {
            this.Children(this._name + '-contextmenu-icon-parent').Dispose();
            this.RemoveClass('app-component-hascontextmenu');
        }
    }

    ShowContextMenu(orientation = [Colibri.UI.ContextMenu.RT, Colibri.UI.ContextMenu.RB], className = '', point = null) {


        this.Children(this._name + '-contextmenu-icon-parent') && this.Children(this._name + '-contextmenu-icon-parent').AddClass('-selected');

        if(this._contextMenuObject) {
            this._contextMenuObject.Dispose();
        }
        
        const contextMenuObject = new Colibri.UI.ContextMenu(this._name + '-contextmenu', document.body, orientation, point);
        contextMenuObject.parent = this;
        contextMenuObject.namespace = this.namespace;
        contextMenuObject.Show(this.contextmenu, this);
        if(className) {
            contextMenuObject.AddClass(className);
        }
        contextMenuObject.AddHandler('Clicked', (event, args) => {
            contextMenuObject.Hide();
            this.Dispatch('ContextMenuItemClicked', Object.assign(args, {item: this}));
            contextMenuObject.Dispose();   
            this._contextMenuObject = null;         
            this.Children(this._name + '-contextmenu-icon-parent') && this.Children(this._name + '-contextmenu-icon-parent').RemoveClass('-selected');
        });
        
        this._contextMenuObject = contextMenuObject;
        

    }

    static __domHandlers = {
        Clicked: {
            domEvent: 'click',
        },
        DoubleClicked: {
            domEvent: 'dblclick',
        },
        MouseUp: {
            domEvent: 'mouseup',
        },
        KeyDown: {
            domEvent: 'keydown',
        },
        KeyUp: {
            domEvent: 'keyup',
        },
        KeyPressed: {
            domEvent: 'keypress',
        },
        ReceiveFocus: {
            domEvent: 'focus',
        },
        LoosedFocus: {
            domEvent: 'blur',
        },
        Pasted: {
            domEvent: 'paste',
            delay: 100,
        },
        DragStart: {
            domEvent: 'dragstart'
        },
        DragEnd: {
            domEvent: 'dragend'
        },
        DragEnter: {
            domEvent: 'dragenter',
        },
        DragOver: {
            domEvent: 'dragover',
        },
        DragLeave: {
            domEvent: 'dragleave',
        },
        Drop: {
            domEvent: 'drop',
        },
        Drag: {
            domEvent: 'drag',
        },
        MouseDown: {
            domEvent: 'mousedown',
        },
        ContextMenu: {
            domEvent: 'contextmenu'
        },
        MouseMove: {
            domEvent: 'mousemove'
        },
        Scrolled: {
            domEvent: 'scroll'
        },
        TouchStarted: {
            domEvent: 'touchstart'
        },
        TouchEnded: {
            domEvent: 'touchend'
        },
        TouchMoved: {
            domEvent: 'touchmove'
        }
    };

    __domHandlersAttached = {};

    AddHandler(eventName, handler, prepend = false, respondent = this) {
        const __domHandlers = Colibri.UI.Component.__domHandlers;
        __domHandlers[eventName] && this.__bindHtmlEvent(eventName, __domHandlers[eventName]);

        return super.AddHandler(eventName, handler, prepend, respondent);
    }

    __bindHtmlEvent(eventName, args) {
        let {domEvent, respondent, delay, handler} = args;
        handler = handler ? handler : (e => this.Dispatch(eventName, {domEvent: e}));
        respondent = respondent ? respondent : this._element;

        if(this.__domHandlersAttached[eventName]) {
            return;
        }

        if(delay) {
            handler = e => Colibri.Common.Delay(delay).then(() => handler(e))
        }

        this.__domHandlersAttached[eventName] = {
            domEvent,
            respondent,
            handler
        };

        respondent.addEventListener(domEvent, handler);
    }

    _bindHtmlEvents() {
        
    }

    __removeHtmlEvents() {
        for(let {domEvent, respondent, handler} of Object.values(this.__domHandlersAttached)) {
            (respondent !== this._element)  && respondent.removeEventListener(domEvent, handler);
        }

        this.__domHandlersAttached = {};
    }

    _registerEventHandlers() {
        // do nothing
    }

    /**
     * Namespace of component
     * Used in HTML templates to indicates module and component
     */
    get namespace() {
        return this._element.attr('namespace') ?? this._element.closest('[namespace]')?.attr('namespace') ?? null;
    }

    /**
     * Namespace of component
     * Used in HTML templates to indicates module and component
     * @type {string} value
     */
    set namespace(value) {
        this._element.attr('namespace', value);
    }

    /**
     * Indicates that the component has context menu icon and can use context menu generation events
     */
    get hasContextMenu() {
        return this._hasContextMenu;
    }

    /**
     * Indicates that the component has context menu icon and can use context menu generation events
     * @type {boolean} value
     */
    set hasContextMenu(value) {
        this._hasContextMenu = value === 'true' || value === true || value === 1;
        if(this._hasContextMenu) {
            if(!this.__domHandlersAttached['ContextMenu']) {
                this.AddHandler('ContextMenu', (event, args) => {
                    if(this.hasContextMenu && this._getContextMenuIcon()) {
                        this.Dispatch('Clicked', { domEvent: args.domEvent, isContextMenuEvent: true });
                        this._getContextMenuIcon().Dispatch('Clicked', { domEvent: args.domEvent, isContextMenuEvent: true });
                        args.domEvent.stopPropagation();
                        args.domEvent.preventDefault();
                        return false;
                    }
                    return true;
                });
            }
            this._createContextMenuButton();
        }
        else {
            this._removeContextMenuButton();
        }
    }

    get contextmenu() {
        return this._contextmenu;
    }

    /**
     * Context menu items
     * @type {Array} items
     */
    set contextmenu(items) {
        this._contextmenu = items;
    }

    /**
     * Контейнер
     * @type {Element}
     */
    get container() {
        return this._element;
    }

    get mainElement() {
        return this._element;
    }

    /**
     * Конрейнер родителя
     * @type {Element}
     */
    get parentContainer() {
        return this._container;
    }

    /**
     * Parent component
     * @type {Colibri.UI.Component}
     */
    get parent() {
        return this._parent;
    }
    /**
     * Parent component
     * @type {Colibri.UI.Component}
     */
    set parent(value) {
        this._parent = value;
    }

    /**
     * Component with
     * @type {Number}
     */
    get width() {
        const cssWidth = this._element.css('width');
        if(cssWidth && cssWidth.indexOf('px') !== -1) {
            return parseInt(cssWidth); 
        }
        else if(cssWidth && cssWidth.indexOf('%') !== -1) {
            return cssWidth;
        }
        else {
            const bounds = this._element.bounds();
            return bounds.outerWidth;
        }
    }
    /**
     * Component with
     * @type {Number}
     */
    set width(value) {
        if(value === null) {
            this._element.css('width', null);
        }
        else if(typeof value == 'string' && (value.indexOf('%') !== -1 || value.includes('calc'))) {
            this._element.css('width', value);
        }
        else {
            const style = this._element.css();
            if(style.boxSizing == 'content-box') {
                value -= (parseInt(style.paddingLeft) || 0) - (parseInt(style.paddingRight) || 0);
            }
            this._element.css('width', (value) + 'px');
        }
    }

    /**
     * Component height
     * @type {Number}
     */
    get height() {
        const cssHeight = this._element.css('height');
        if(cssHeight && cssHeight.indexOf('px') !== -1) {
            return parseInt(cssHeight);
        }
        else if(cssHeight && cssHeight.indexOf('%') !== -1) {
            return cssHeight;
        }
        else {
            const bounds = this._element.bounds();
            return bounds.outerHeight;
        }

    }
    /**
     * Component height
     * @type {Number}
     */
    set height(value) {
        if(value === null) {
            this._element.css('height', null);
        }
        else if(typeof value == 'string' && (value.indexOf('%') !== -1 || value.includes('calc'))) {
            this._element.css('height', value);
        }
        else {
            const style = this._element.css();
            if(style.boxSizing == 'content-box') {
                value -= (parseInt(style.paddingTop) || 0) - (parseInt(style.paddingBottom) || 0);
            }
            this._element.css('height', (value) + 'px');
        }
    }

    /**
     * Element left position
     * @type {Number}
     */
    get left() {
        const bounds = this._element.bounds();
        return bounds.left;
    }
    /**
     * Element left position
     * @type {Number}
     */
    set left(value) {
        this._element.css('left', value !== null ? value + 'px' : null);
    }

    /**
     * Позиция элемента относительно левого края документа
     * @type {number}
     */
    get right() {
        const bounds = this._element.bounds();
        return bounds.left + bounds.outerWidth;
    }
    set right(value) {
        this._element.css('right', value !== null ? value + 'px' : null);
    }

    /**
     * Позиция элемента относительно верхнего края документа
     * @type {number}
     */
    get top() {
        const bounds = this._element.bounds();
        return bounds.top;
    }
    set top(value) {
        this._element.css('top', value !== null ? value + 'px' : null);
    }

    /**
     * Позиция элемента относительно верхнего края документа
     * @type {number}
     */
    get bottom() {
        const bounds = this._element.bounds();
        return bounds.top + bounds.outerHeight;
    }
    set bottom(value) {
        this._element.css('bottom', value ? value + 'px' : null);
    }

    /**
     * Стили обьекта
     * @type {Object}
     */
    get styles() {
        return this._element.css();
    }
    set styles(value) {
        this._element.css(value);
    }

    /**
     * Наименование обьекта
     * @type {string}
     */
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
        this._element.data('objectName', this._name);
    }

    /**
     * Название класса
     * @type {string}
     */
    get className() {
        return this._element.attr('class');
    }
    set className(value) {
        value.split(' ').forEach((v) => {
            this._element.classList.add(v);
        });
    }

    /**
     * ID элемента
     * @type {string}
     */
    get elementID() {
        return this._element.attr('id');
    }
    set elementID(value) {
        this._element.attr('id', value);
    }

    /**
     * HTML контент элемента
     * @type {string}
     */
    get html() {
        return this._element.html();
    }
    set html(value) {
        this._element.html(value);
    }

    /**
     * Таг
     * @type {Object}
     */
    get tag() {
        return this._tag;
    }
    set tag(value) {
        this._tag = value;
    }

    /**
     * Данные
     * @type {Object}
     */
    get data() {
        return this._element.data();
    }
    set data(value) {
        this._element.data(value);
    }

    /**
     * Элемент только для чтения
     * @type {boolean}
     */
    get readonly() {
        return this._element.is(':scope[readonly]');
    }
    set readonly(value) {
        value = value === true || value === 'true';
        this._element.attr('readonly', value ? 'readonly' : null);
        this.Dispatch('ReadonlyStateChanged');
    }

    /**
     * Индекс основного элемента в парент-е
     * ! Внимание - это не индекс компонента, У КОМПОНЕНТА НЕТ ИНДЕКСА, ЕСТЬ ТОЛЬКО ИМЯ
     */
    get index() {
        return this._element.index();
    }

    get childIndex() {
        return this._parent ? this._parent.indexOf(this.name) : null;
    }

    /**
     * Элемент выключен
     * @type {boolean}
     */
    get enabled() {
        return !this._element.is(':disabled') && !this._element.is('.ui-disabled');
    }
    set enabled(val) {

        val = val === true || val === 'true';

        if (!val) {
            this.AddClass('ui-disabled')._element.attr('disabled', 'disabled');
        } else {
            this.RemoveClass('ui-disabled')._element.attr('disabled', null);
        }

        this.ForEach((name, control) => {
            control.enabled = val;
        });

        this.Dispatch('EnabledStateChanged');

    }

    /**
     * Видимый или нет
     * @type {boolean}
     */
    get shown() {
        return this._element.classList.contains('app-component-shown');
    }
    set shown(value) {
        if (value === true || value === 'true') {
            this.AddClass('app-component-shown');
            this.Dispatch('Shown', {});
        } else {
            this.RemoveClass('app-component-shown');
            this.Dispatch('Hidden', {});
        }
    }

    BringToFront() {
        const position = this._element.css('position');
        if(['relative', 'fixed', 'absolute'].indexOf(position) > -1) {
            const maxZIndex = Colibri.UI.maxZIndex;
            if(this.styles.zIndex != maxZIndex) {
                this._element.css('z-index', maxZIndex + 1);
            }
        }
    }

    SendToBack() {
        this._element.css('z-index', null);
    }

    get value() {
        return this._element.html();
    }
    set value(value) {
       this._element.html(value);
    }

    _createTipObject() {
        this._tipObject = Element.create('span', {class: 'tip'});
        this._element.append(this._tipObject);
    }

    /**
     * Подсказка
     * @type {number}
     */
    get toolTip() {
        return this._toolTip;
    }
    set toolTip(value) {
        this._toolTip = value;

        if(this._toolTip) {
            if(!this._tipObject) {
                this._createTipObject();
            }
            this.AddHandler('MouseMove', (event, args) => {
                if(this._toolTip) {
                    this._setToolTipPositionAndGap();
                }
            });
            this._tipObject.html(this._toolTip);
        }
        else {
            if(this._tipObject) {
                this._tipObject.remove();
                this._tipObject = null;
            }
        }

    }

    _setToolTipPositionAndGap(elementObject = null) {
        elementObject = elementObject || this._element;
        const bounds = elementObject.bounds();
        const tipBounds = this._tipObject.bounds();
        const windowBounds = document.body.bounds();
        windowBounds.height = window.clientHeight;

        this._tipObject.attr('class', 'tip');
        this._tipObject.attr('css', null);

        let left = 0;
        let right = 0;
        let top = 0;

        let likeX = this._toolTipPosition.split(' ')[0];
        let likeY = this._toolTipPosition.split(' ')[1];

        if(likeX === 'left') {
            // левый край
            left = bounds.left;
            if(left + tipBounds.width > windowBounds.width) {
                likeX = 'right';
                left = bounds.left + bounds.width - tipBounds.width;
            }
        } else  {
            // правый край
            left = bounds.left + bounds.width - tipBounds.width;
            if(left - tipBounds.width < 0) {
                likeX = 'left';
                left = bounds.left;
            }
        }

        if(likeY === 'bottom') {
            // нижний край
            top = (bounds.top + bounds.height);
            if(top + tipBounds.height > windowBounds.height) {
                likeY = 'top';
                top = (bounds.top - tipBounds.height);
            }
        } else  {
            // правый край
            top = (bounds.top - tipBounds.height);
            if(top - tipBounds.height < 0) {
                likeY = 'bottom';
                top = (bounds.top + bounds.height);
            }
        }

        let css = {zIndex: Colibri.UI.maxZIndex};
        if(left > 0) {
            css.left = left + 'px';
        } else if(right > 0) {
            css.right = right + 'px';
        }
        css.top = top + 'px';
        this._tipObject.classList.add('-' + likeX);
        this._tipObject.classList.add('-' + likeY);
        this._tipObject.css(css);

        

    }

    get toolTipPosition() {
        return this._toolTipPosition;
    }
    set toolTipPosition(value) {
        this._toolTipPosition = value;
        
    }

    /**
     * Путь к компоненту в дереве
     * @type {string}
     */
    get path() {
        return (this.parent instanceof Colibri.UI.Component ? this.parent.path : '') + '/' + this.name;
    }

    /**
     * Может ли компонента получить фокус
     * @todo Исправить
     * @type {boolean}
     */
    get canFocus() {
        if (this._element.is(":disabled")) {
            return false;
        }
        var tabIndex = this._element.attr("tabindex");
        tabIndex = isNaN(tabIndex) ? -1 : tabIndex;
        return this._element.is("input[type], a[href], area[href], iframe") || tabIndex > -1;
    }

    /**
     * Индекс табуляции
     * @todo проверить правильно ли получаю tabIndex и исправить
     * @type {number}
     */
    get tabIndex() {
        return this._element.attr('tabIndex');
    }
    set tabIndex(value) {
        this._element.attr('tabIndex', value === 'true' || value === true ? Colibri.UI.tabIndex++ : value);
    }

    get next() {
        const myIndex = this.parent.indexOf(this.name);
        if(myIndex === -1 || myIndex === this.parent.children - 1) {
            return null;
        }

        return this.parent.Children(myIndex + 1);
    }

    get prev() {
        const myIndex = this.parent.indexOf(this.name);
        if(myIndex === -1 || myIndex === 0) {
            return  null;
        }

        return this.parent.Children(myIndex - 1);
    }

    MoveChild(child, fromIndex, toIndex) {
        
        this._children.splice(fromIndex, 1);
        this._children.splice(toIndex, 0, child);
        this._moveInDom(child.container, this.container, toIndex);        

    }

    MoveUp() {
        if(!this.prev) {
            return;
        }    
        this.parent.MoveChild(this, this.childIndex, this.childIndex - 1);
    }

    MoveDown() {
        if(!this.next) {
            return;
        }    
        this.parent.MoveChild(this, this.childIndex, this.childIndex + 1);
    }

    _childByName(name) {
        const filtered = this._children.filter(c => c.name == name);
        if(filtered.length > 0) {
            return filtered.pop();
        }
        return null;
    }

    _moveInDom(insertedElement, parentElement, index) {
        insertedElement.remove();
        parentElement.insertBefore(insertedElement, parentElement.children[index]);
    }

    /**
     * Добавляет или возвращает компоненту по названию
     * @param {string} name наименование обьекта
     * @param {Colibri.UI.Component} val дочерний обьект
     * @param {number} [index] индекс в массиве, куда вставить элемент
     * @returns {Colibri.UI.Component[]}
     */
    Children(name, val = undefined, index = undefined, container = null, childContainer = null) {
        
        if (name === undefined)
            return this._children;
        if (name === 'firstChild') {
            return this._children[0] ?? null;
        } else if (name === 'lastChild') {
            return this._children[this._children.length - 1];
        }
        else if(typeof name === 'string' && name.indexOf('/') !== -1) {
            return this.Find(name);
        }

        const childIndex = typeof name == 'string' ? this.indexOf(name) : name;
        if(childIndex === -1 && [null, undefined].indexOf(val) !== -1) {
            return null;
        }

        if (val === undefined) {
            return this._children[childIndex];
        }
        else if(val === null) {
            this._children.splice(childIndex, 1);
        }
        else {
            childIndex !== -1 && this._children.splice(childIndex, 1);
            if (index != undefined && index < this.children && index >= 0) {
                this._children.splice(index, 0, val);
                this._moveInDom(childContainer || val.container, container || this.container, index);
            } else {
                this._children.push(val);
            }
        }
        return val;
    }

    Sort(callback) {
        this._children.sort(callback);
        this._children.forEach((child, index) => {
            this._moveInDom(child.container, this.container, index);
        });
    }

    /** @type {number} */
    get children() {
        return this.Children().length;
    }

    indexOf(name) {
        if(name instanceof Function) {
            return Array.findIndex(this._children, name);
        } else {
            return Array.findIndex(this._children, (v) => v.name == name);
        }
    }

    get hasShadow() {
        return this._shadow != null;
    }

    set hasShadow(value) {
        if(value === true || value === 'true') {

            if(typeof this._element.css('z-index') === 'string') {
                this._element.css('z-index', Colibri.UI.maxZIndex + 1);
            }

            let shadow = this._element.next();
            if(shadow && shadow.classList.contains('app-component-shadow-div')) {
                shadow.remove();
            }

            const zIndex = this._element.css('z-index') - 1;
            shadow = Element.create('div', {class: 'app-component-shadow-div'});
            shadow.css('z-index', zIndex);
            shadow.addEventListener('click', (e) => { this.Dispatch('ShadowClicked', {domEvent: e}); e.stopPropagation(); e.preventDefault(); return false; });
            shadow.addEventListener('contextmenu', (e) => { this.Dispatch('ShadowClicked', {domEvent: e}); e.stopPropagation(); e.preventDefault(); return false; });
            this._element.after(shadow);
        }
        else {
            const shadow = this._element.next();
            if(shadow && shadow.classList.contains('app-component-shadow-div')) {
                shadow.remove();
            }
        }
    }

    __renderBoundedValues(data) {
        try {
            if(typeof data == 'string') {
                this.value = data;
            }
        }
        catch(e) {
            console.log(e);
        }
    }

    set store(value) {
        this._storage = value;
    }

    get store() {
        return this._storage;
    }

    get binding() {
        return this._binding;
    }

    /** data binding */    
    set binding(value) {

        if (value === this._binding) {
            return;
        }

        if(typeof value !== 'string') {
            this.__renderBoundedValues(value);
            return;
        }

        if(!this._storage) {
            this._storage = App.Store;
        } 

        const handler = (data, path) => {
            try {
                if(this.isConnected) {
                    this.__renderBoundedValues(data, path);
                } else {
                    Colibri.Common.Wait(() => this.isConnected, 0, 10).then(() => this.__renderBoundedValues(data, path));
                }
            } catch(e) {
                console.error(e);
                App.Notices.Add(new Colibri.UI.Notice(e, Colibri.UI.Notice.Error));
            }
        };

        this._binding = value;
        let pathsToLoad = this._binding;
        if(this._binding.indexOf(';') !== -1) {
            pathsToLoad = this._binding.split(';');
         
            let promises = [];
            for(const path of pathsToLoad) {
                promises.push(this._storage.AsyncQuery(path));
            }
            Promise.all(promises).then(responses => {
                for(let i=0; i<responses.length; i++) {
                    this.__renderBoundedValues(responses[i], pathsToLoad[i]);
                }
                this._storage.AddPathHandler(pathsToLoad, [this, handler]);
            }).catch(response => {
                console.log(response);
                this.__renderBoundedValues(null, pathsToLoad);
                this._storage.AddPathHandler(pathsToLoad, [this, handler]);
            });
            
        }
        else {
            this._storage.AsyncQuery(value).then(data => {
                this.__renderBoundedValues(data, value);
                this._storage.AddPathHandler(value, [this, handler]);
            }).catch((response) => {
                console.log(response);
                // App.Notices.Add(new Colibri.UI.Notice(response, Colibri.UI.Notice.Error));
                this.__renderBoundedValues(null, value);
                this._storage.AddPathHandler(value, [this, handler]);
            });    
        }

        
    }

    ReloadBinding() {

        if(!this._storage) {
            return;
        }

        // this._binding = value;
        let pathsToLoad = this._binding;
        if(this._binding.indexOf(';') !== -1) {
            pathsToLoad = this._binding.split(';');
            let promises = [];
            for(const path of pathsToLoad) {
                promises.push(this._storage.AsyncQuery(path));
            }
            Promise.all(promises).then(responses => {
                for(let i=0; i<responses.length; i++) {
                    this.__renderBoundedValues(responses[i], pathsToLoad[i]);
                }
            });
        }
        else {
            this._storage.AsyncQuery(this._binding).then((data) => {
                if(this.__renderBoundedValues) {
                    this.__renderBoundedValues(data, this._binding);
                }
            });
        }

    }


    get isConnected() {
        return this._element.isConnected;
    }

    get scrollTop() {
        return this._element.scrollTop;
    }

    set scrollTop(value) {
        if(this._animateScroll) {
            this._element.animateScrollTop(value, 300);
        }
        else {
            this._element.scrollTop = value;
        }
    }

    /**
     * Анимировать скрол
     * @type {boolean}
     */
    get animateScroll() {
        return this._animateScroll;
    }
    /**
     * Анимировать скрол
     * @type {boolean}
     */
    set animateScroll(value) {
        this._animateScroll = value;
    }

    set handleClickedOut(value) {
        if(value) {
            this.__bindHtmlEvent('__ClickedOut', {
                domEvent: 'click',
                respondent: document.body,
                handler: (e) => {
                    if (!this.ContainsElement(e.target)) {
                        this.Dispatch('ClickedOut', {domEvent: e});
                    }
                }
            });
        }
    }

    set handleResize(value) {
        if(value) {
            this.__bindHtmlEvent('__Resized', {
                domEvent: 'resized',
                respondent: window,
                handler: (e) => this.Dispatch('Resized', {domEvent: e})
            });
            this.__bindHtmlEvent('__Resize', {
                domEvent: 'resize',
                respondent: window,
                handler: (e) => this.Dispatch('Resize', {domEvent: e})
            });
        }
    }

    set handleSwipe(value) {
        if(value) {
            this.__touchStartedPos = null;
            this.AddHandler('TouchStarted', (event, args) => {
                this.__touchStartedPos = null;
                const firstTouch = args.domEvent.touches[0];      
                this.__touchStartedPos = {x: firstTouch.clientX, y: firstTouch.clientY};                                
            });
            this.AddHandler('TouchMoved', (event, args) => {
                if ( !this.__touchStartedPos ) {
                    return;
                }
            
                const xUp = args.domEvent.touches[0].clientX;                                    
                const yUp = args.domEvent.touches[0].clientY;
            
                const xDiff = this.__touchStartedPos.x - xUp;
                const yDiff = this.__touchStartedPos.y - yUp;
                                                                                     
                if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
                    if ( xDiff > 10 ) {
                        this.Dispatch('SwipedToRight', args);
                    } else if ( xDiff < -10 ) {
                        this.Dispatch('SwipedToLeft', args);
                    }                       
                } else {
                    if ( yDiff > 10 ) {
                        this.Dispatch('SwipedToDown', args);
                    } else if ( yDiff < -10 ) { 
                        this.Dispatch('SwipedToUp', args);
                    }                                                                 
                }
                this.__touchStartedPos = null;
            });
        }
    }

    ConnectTo(container, index = null) {
        this._container = container instanceof Colibri.UI.Component ? container.container : container;
        if(index === null) {
            this._container.append(this._element);        
        } else { 
            this._element.insertAtIndex(this._container, index);
        }
    }

    Disconnect() {
        const parentContainer = this._container;
        this._element.remove();
        this._container = null;
        return parentContainer;
    }

    KeepInMind() {
        if(this._container) {
            this._hideData = {index: this.index, parent: this._container};
            this.Disconnect();
        }
    }

    Retreive() {
        if(this._hideData && this._hideData.parent) {
            this.ConnectTo(this._hideData.parent, this._hideData.index);
            this._hideData = null;
        }
    }

    /**
     * Очищает дочерние компоненты
     */
    Clear() {
        this.ForReverseEach((name, control) => {
            control.Dispose();
        });
    }

    /**
     * Удаляет компоненту
     */
    Dispose() {
        this.hasShadow = false;
        this.Clear();

        if (this.parent) {
            this.parent.Children(this.name, null);
            this.parent = null;
        }
        this.__removeHtmlEvents();
        try {
            this._element.remove();
        }
        catch(e) { console.log('error removing element from DOM', e); }
        this.Dispatch('ComponentDisposed');

        super.Dispose();

    }

    /**
     * Находит компоненту по пути
     * @param {string} path путь к компоненту в дереве
     * @returns {Colibri.UI.Component}
     */
    Find(path) {
        return Colibri.UI.Find(path, this);
    }

    /**
     * Находит компоненту по наименованию, поиск по дереву, наименование должно быть уникальным, иначе будет найдено первое
     * @param {string} path путь к компоненту в дереве
     * @returns {Colibri.UI.Component}
     */
    FindByName(name) {
        const query = '[data-object-name="' + name + '"]';
        const component = this._element.querySelector(query);
        if(!component) {
            return null;
        }
        return component.tag('component') || null;
    }

    /**
     * Добавляет класс в список classList
     * @param {string} val название класса
     * @returns {this}
     */
    AddClass(val) {
        val && val.split(' ').forEach((cl) => {
            this._element.classList.add(cl);
        })
        return this;
    }

    /**
     * Удаляет класс из списка classList
     * @param {string} val название класса
     * @returns {this}
     */
    RemoveClass(val) {
        this._element.classList.remove(val);
        return this;
    }

    /**
     * Проверяет есть ли класс у компонента
     * @param {string} val название класса
     * @returns {this}
     */
    ContainsClass(val) {
        return this._element.classList.contains(val);
    }

    /**
     * Ставит фокус на компоменту
     * @returns {Colibri.UI.Component}
     */
    Focus() {
        if (this.canFocus)
            this._element.focus();
        else {
            this._element.focus();
            this.AddClass('app-ui-focus');
        }
        return this;
    }

    /**
     * Убирает фокус с компоменты
     * @returns {Colibri.UI.Component}
     */
    Blur() {
        if (this.canFocus)
            this._element.blur();
        else {
            this._element.blur();
            this.RemoveClass('app-ui-focus');
        }
        return this;
    }

    /**
     * Крутит дочерние компоненты
     * @param {Function} handler обработчик
     */
    ForEach(handler) {
        const children = [...this._children];
        let index = 0;
        for(const o of children) {
            if(handler.apply(this, [o.name, o, index++]) === false) {
                return this;
            }
        }
        return this;
    }

    /**
     * Крутит дочерние компоненты
     * @param {Function} handler обработчик
     */
    Map(handler) {
        const children = [...this._children];
        let ret = [];
        let index = 0;
        for(const o of children) {
            ret.push(handler.apply(this, [o.name, o, index++]));
        }
        return ret;
    }

    /**
     * Крутит дочерние компоненты в обратном порядке
     * @param {Function} handler обработчик
     */
    ForReverseEach(handler) {
        const children = [...this._children];
        for (let i = children.length - 1; i >= 0; i--) {
            if(handler.apply(this, [children[i].name, children[i], i]) === false) {
                return this;
            }
        }
        return this;
    }

    /**
     * Передвигает компоненту в видимую область родительского котейнера
     * @param {(Colibri.UI.Component|HTMLElement)} [parent] родительский контейнер
     * @returns {void}
     */
    EnsureVisible(parent, top = null) {
        let parentEl = parent;
        if (parent && parent.container) {
            parentEl = parent.container;
        }
        if (parentEl) {
            this._element.ensureInViewport(parentEl, top);
        } else {
            this._element.scrollIntoView(false);
        }
    }

    get visible() {
        return this._visible;
    }

    set handleVisibilityChange(value) {
        if(value) {
            this._registerObserver();
        }
        else {
            this._unregisterObserver();
        }
    }

    /**
     * Проверяет содержит ли компонента нужный элемент
     * @param {HTMLElement} element элемент
     */
    ContainsElement(element) {
        return this._element.contains(element);
    }


    Show() {
        this.shown = true;
    }

    Hide() {
        this.shown = false;
    }

    get draggable() {
        return this._element.attr('draggable');
    }

    set draggable(value) {
        this._element.attr('draggable', value ? 'true' : null);
    }

    get dropable() {
        return this._element.attr('dropable');
    }

    set dropable(value) {
        this._element.attr('dropable', value ? 'true' : null);
    }

    /**
     * Router pattern
     * @type {string}
     */
    get routePattern() {
        return this._routePattern;
    }
    /**
     * Router pattern
     * @type {string}
     */
    set routePattern(value) {
        this._routePattern = value;
    }

    __processChangeOnRouteSwitch(patternMatches) {
        this.ReloadBinding();
    }

    /**
     * Can copy content
     * @type {Boolean}
     */
    get copy() {
        return this._copy;
    }
    /**
     * Can copy content
     * @type {Boolean}
     */
    set copy(value) {
        this._copy = value;
        this._showCopy();
    }
    _showCopy() {
        if(this._copy) {
            this.AddClass('-cancopy');
            this._element.addEventListener('mousedown', this._clickToCopyHandler);
        } else {
            this.RemoveClass('-cancopy');
            this._element.removeEventListener('mousedown', this._clickToCopyHandler);
        } 
    }

}
