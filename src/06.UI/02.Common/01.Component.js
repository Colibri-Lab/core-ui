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
        this._name = name;
        /** @type {Object} */
        this._children = {};
        /** @type {Object} */
        this._tag = {};
        /** @type {HTMLElement} */
        this._container = container instanceof Colibri.UI.Component ? container.container : container;

        /** @type {string} */
        this._toolTip = '';
        this._toolTipPosition = 'left bottom';

        this._storage = null;
        this._binding = '';

        if (!element) {
            element = '<div />';
        }
        if (typeof element === 'string') {
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
            container.Children(name, this);
        }

        this._registerEvents();

        this.ProcessChildren(element.childNodes);

        // вводим в DOM
        this._container && this._container.append(this._element);

        this._bindHtmlEvents();
        this._registerEventHandlers();

        this._contextmenu = [];
        this._hasContextMenu = false;

        this.Dispatch('ComponentRendered');
    }

    ProcessChildren(children, parent, dontDispatch = false) {
        if (parent === undefined) {
            parent = this._element;
        }

        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            if (element.tagName == 'component') {
                const objectClass = eval(element.getAttribute('Component'));
                if(!objectClass) {
                    continue;
                }
                const name = element.getAttribute('name') || 'component-' + (new Date()).getTime();

                // element component
                // нужно создать новый htmlelement и внутренности запиннуть в него
                let component = new objectClass(name, parent);
                component.parent = this;
                this.Children(name, component);
                for (let j = 0; j < element.attributes.length; j++) {
                    const attr = element.attributes[j];

                    if (['Component', 'name'].indexOf(attr.name) !== -1) {
                        continue;
                    }

                    if (attr.name.indexOf('On') === 0) {
                        component.AddHandler(attr.name.substr(2), eval(attr.value));
                    } else {
                        component[attr.name] = attr.value;
                    }
                }

                component.ProcessChildren(element.childNodes, component.container);

            } else if(element.tagName == 'params') {
                let data = element.childNodes[0].textContent;
                try { eval('data = ' + data + ';'); } catch(e) { console.log(data); console.log(e); }
                if(data instanceof Object) {
                    this.tag.params = data;
                }
            } else if(element.nodeName !== '#text' && element.tagName && element.tagName.indexOf('component-') !== -1) {
                const tagName = element.tagName.substr('component-'.length);
                if(parent instanceof Colibri.UI.Component) {
                    this.ProcessChildren(element.childNodes, parent[tagName], true);
                }
                else {
                    this.ProcessChildren(element.childNodes, this[tagName], true);
                }
            } else if (element.nodeName !== '#text') {
                if(element.tagName) {
                    const e = element.clone(element.attr('xmlns') ? element.attr('xmlns') : parent.attr('xmlns'));
                    parent.append(e);
                    this.ProcessChildren(element.childNodes, e, true);
                }
            } else {
                if(parent instanceof Colibri.UI.Component) {
                    parent.container.append(document.createTextNode(element.textContent));
                }
                else {
                    parent.append(document.createTextNode(element.textContent));
                }
            }

        }

        if(!dontDispatch) {
            this.Dispatch('ChildsProcessed');
        }

    }

    GenerateChildren(element, parent) {
        if (!element) {
            element = '<div />';
        }

        if (typeof element === 'string') {
            // передана строка html, нужно спарсить и превратить в Element
            element = new DOMParser().parseFromString(element, "application/xhtml+xml").children[0];
        }

        this.ProcessChildren(element.childNodes, parent);
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
        this.RegisterEvent('DragOver', false, 'Когда перетаскиваемый элемент находится над целевым объектом');
        this.RegisterEvent('DragLeave', false, 'Когда перетаскиваемый элемент покидает целевой объект');
        this.RegisterEvent('Drop', false, 'Когда перетаскиваемый элемент "упал" на целевой объект');
        this.RegisterEvent('ContextMenu', false, 'Контекстное меню');
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

    ShowContextMenu(orientation = 'right bottom', className = '', point = null) {


        this.Children(this._name + '-contextmenu-icon-parent').AddClass('-selected');

        if(this._contextMenuObject) {
            this._contextMenuObject.Dispose();
        }
        
        const contextMenuObject = new Colibri.UI.ContextMenu(this._name + '-contextmenu', document.body, orientation, point);
        contextMenuObject.parent = this;
        contextMenuObject.value = this.contextmenu;
        contextMenuObject.shown = true;
        if(className) {
            contextMenuObject.AddClass(className);
        }
        contextMenuObject.AddHandler('Clicked', (event, args) => {
            contextMenuObject.Hide();
            this.Dispatch('ContextMenuItemClicked', args);
            contextMenuObject.Dispose();            
            this.Children(this._name + '-contextmenu-icon-parent').RemoveClass('-selected');
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
        DragOver: {
            domEvent: 'dragover',
        },
        DragLeave: {
            domEvent: 'dragleave',
        },
        Drop: {
            domEvent: 'drop',
        },
        MouseDown: {
            domEvent: 'mousedown',
        },
        ContextMenu: {
            domEvent: 'contextmenu',
        },
        MouseMove: {
            domEvent: 'mousemove',
        },
    };

    __domHandlersAttached = {};

    AddHandler(eventName, handler, prepend = false, respondent = this) {
        const __domHandlers = Colibri.UI.Component.__domHandlers;
        __domHandlers[eventName] && this.__bindHtmlEvent(eventName, __domHandlers[eventName]);

        return super.AddHandler(eventName, handler, prepend, respondent);
    }

    __bindHtmlEvent(eventName, args) {
        let {domEvent, respondent, delay, handler} = args;
        handler ??= (e => this.Dispatch(eventName, {domEvent: e}));
        respondent ??= this._element;

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
        /*for(let [name, h] of Object.entries(this.__domHandlers)) {
            let _handlers = Array.isArray(h) ? h : [h];

            _handlers.forEach((_handler) => {
                (_handler.respondent ?? this._element).addEventListener(name, (_handler.handler ?? _handler));
            });
        }*/
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

    get hasContextMenu() {
        return this._hasContextMenu;
    }

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

    /**
     * Конрейнер родителя
     * @type {Element}
     */
    get parentContainer() {
        return this._container;
    }

    /**
     * Компонент родитель
     * @type {Colibri.UI.Component}
     */
    get parent() {
        return this._parent;
    }
    set parent(value) {
        this._parent = value;
    }

    /**
     * Ширина компонента
     * @type {number}
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
    set width(value) {
        if(typeof value == 'string' && (value.indexOf('%') !== -1 || value.includes('calc'))) {
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
     * Высота компонента
     * @type {number}
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
    set height(value) {
        if(typeof value == 'string' && (value.indexOf('%') !== -1 || value.includes('calc'))) {
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
     * Позиция элемента относительно левого края документа
     * @type {number}
     */
    get left() {
        const bounds = this._element.bounds();
        return bounds.left;
    }
    set left(value) {
        this._element.css('left', value + 'px');
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
        this._element.css('top', value + 'px');
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
        return this._element.is(':readonly');
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

        Object.forEach(this.Children(), (name, control) => {
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
            const maxZIndex = Colibri.UI.zIndex();
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

    /**
     * Подсказка
     * @type {number}
     */
    get toolTip() {
        return this._toolTip;
    }
    set toolTip(value) {
        this._toolTip = value;

        let tip = this._element.querySelector(':scope > .tip');
        if(this._toolTip) {
            if(!tip) {
                this.AddHandler('MouseMove', (event, args) => {
                    if(this._toolTip) {
                        const bounds = this._element.bounds();
                        const tip = this._element.querySelector(':scope > .tip');
                        tip.css({left: bounds.left + 'px', top: (bounds.top + bounds.height + 10).toFixed(2) + 'px', zIndex: Colibri.UI.zIndex()});
                    }
                });

                tip = Element.create('span', {class: 'tip'});
                this._element.append(tip);
            }
            const bounds = this._element.bounds();
            tip.css({left: bounds.left + 'px', top: (bounds.top + bounds.height + 10) + 'px', zIndex: Colibri.UI.zIndex()});
            tip.html(this._toolTip);
        }
        else {
            if(tip) {
                tip.remove();
            }
        }

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
        this._element.attr('tabIndex', value === true ? Colibri.UI.tabIndex++ : value);
    }

    get next() {
        const keys = Object.keys(this.parent._children);
        const myIndex = keys.indexOf(this.name);
        if(myIndex === -1 || myIndex === keys.length - 1) {
            return  null;
        }

        return this.parent.Children(keys[myIndex + 1]);
    }

    get prev() {
        const keys = Object.keys(this.parent._children);
        const myIndex = keys.indexOf(this.name);
        if(myIndex === -1 || myIndex === 0) {
            return  null;
        }

        return this.parent.Children(keys[myIndex - 1]);
    }

    /**
     * Добавляет или возвращает компоненту по названию
     * @param {string} name наименование обьекта
     * @param {Colibri.UI.Component} val дочерний обьект
     * @param {number} [index] индекс в массиве, куда вставить элемент
     * @returns {Colibri.UI.Component}
     */
    Children(name, val = undefined, index = undefined, container = null) {
        if (name === undefined)
            return this._children;
        if (name === 'firstChild') {
            for (let f in this._children)
                return this._children[f];
        } else if (name === 'lastChild') {
            let l;
            for (l in this._children);
            return this._children[l];
        }
        if (val === undefined) {

            if(typeof val == 'number') {
                val = Object.keys(this._children)[val];
            }

            if(name.indexOf('/') !== -1) {
                // Это путь, ищем через Find
                return this.Find(name);
            }
            else {
                return this._children[name];
            }

        }
        if (val === null)
            delete this._children[name];
        else {
            if (index != undefined) {
                if(index < this.children && index >= 0) {
                    
                    let t = {};
                    let keys = Object.keys(this._children);
                    let ar = Object.values(this._children);

                    keys.splice(index, 0, name);
                    ar.splice(index, 0, val);

                    keys.forEach((v, i) => t[v] = ar[i]);
                    this._children = t;

                    const insertedElement = val.container;
                    const parentElement = container || this.container;

                    parentElement.insertBefore(insertedElement, parentElement.children[index]);

                }

            } else {
                this._children[name] = val;
            }
        }
        return val;
    }

    /** @type {number} */
    get children() {
        return Object.countKeys(this.Children());
    }

    indexOf(name) {
        return Object.keys(this._children).indexOf(name);
    }

    get hasShadow() {
        return this._shadow != null;
    }

    set hasShadow(value) {
        if(value) {

            if(!this._element.css('z-index')) {
                this._element.css('z-index', Colibri.UI.zIndex() + 1);
            }

            let shadow = document.querySelector('.app-component-shadow-div');
            shadow && shadow.remove();

            const zIndex = this._element.css('z-index') - 1;
            shadow = Element.create('div', {class: 'app-component-shadow-div'});
            shadow.css({zIndex: zIndex});
            shadow.addEventListener('click', (e) => { this.Dispatch('ShadowClicked', {domEvent: e}) });
            shadow.addEventListener('contextmenu', (e) => { this.Dispatch('ShadowClicked', {domEvent: e}); e.stopPropagation(); e.preventDefault(); return false; });
            shadow.after(this._element);
        }
        else {
            const shadow = document.querySelector('.app-component-shadow-div');
            shadow && shadow.remove();
        }
    }

    __renderBoundedValues(data) {
        try {
            if(typeof data == 'string') {
                this.value = data;
            }
        }
        catch(e) {

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

        if(!this._storage) {
            this._storage = App.Store;
        } 

        const handler = data => this.isConnected && this.__renderBoundedValues(data)

        this._binding = value;
        this._storage.AsyncQuery(value).then(data => {
            this.__renderBoundedValues(data);
            this._storage.AddPathHandler(value, [this, handler]);
        }).catch((response) => {
            this.__renderBoundedValues(null, response);
            this._storage.AddPathHandler(value, [this, handler]);
        });
        
    }

    ReloadBinding() {
        this._storage.AsyncQuery(this._binding).then((data) => {
            if(this.__renderBoundedValues) {
                this.__renderBoundedValues(data);
            }
        });
    }


    get isConnected() {
        return this._element.isConnected;
    }

    get scrollTop() {
        return this._element.scrollTop;
    }

    set scrollTop(value) {
        this._element.scrollTop = value;
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

    ConnectTo(container) {
        this._container = container instanceof Colibri.UI.Component ? container.container : container;
        this._container.append(this._element);        
    }

    Disconnect() {
        this._element.remove();
        this._container = null;
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
        this.Clear();

        if (this.parent) {
            this.parent.Children(this.name, null);
        }
        this.__removeHtmlEvents();
        this._element.remove();
        this.Dispatch('ComponentDisposed');

        super.Dispose();

    }

    /**
     * Находит компоненту по пути
     * @param {string} path путь к компоненту в дереве
     * @returns {Colibri.UI.Component}
     */
    Find(path) {
        let p = this;
        let splitedPath = path.split('/');
        splitedPath.forEach(function(v) {
            p = p.Children(v);
            if (!p)
                return false;
        });
        return p;
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
        Object.forEach(this.Children(), (name, o) => {
            return handler.apply(this, [name, o]);
        });
        return this;
    }

    /**
     * Крутит дочерние компоненты в обратном порядке
     * @param {Function} handler обработчик
     */
    ForReverseEach(handler) {
        Object.forReverseEach(this.Children(), (name, o) => {
            return handler.apply(this, [name, o]);
        });
        return this;
    }

    /**
     * Передвигает компоненту в видимую область родительского котейнера
     * @param {(Colibri.UI.Component|HTMLElement)} [parent] родительский контейнер
     * @returns {void}
     */
    EnsureVisible(parent) {
        let parentEl = parent;
        if (parent && parent.container) {
            parentEl = parent.container;
        }
        if (parentEl) {
            this._element.ensureInViewport(parentEl);
        } else {
            this._element.scrollIntoView(false);
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


}
