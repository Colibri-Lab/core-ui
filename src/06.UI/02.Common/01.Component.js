/**
 * Класс компонента по умолчанию
 * @class
 * @extends Colibri.Events.Dispatcher
 * @memberof Colibri.UI
 */
Colibri.UI.Component = class extends Colibri.Events.Dispatcher 
{

    /**
     * Null handler, prevents handling event
     * @static
     * @param {string|Colibri.UI.Event} event event to handle
     * @param {*} args arguments for event 
     */
    static __nullHandler = (event, args) => {};
    static __disableHandler = (event, args) => { args.domEvent?.stopPropagation(); args.domEvent?.preventDefault(); return false; };
    __containerScrollHandler = (e) => {
        this.Dispatch('ScrolledIn', {domEvent: e}); 
    }

    /**
     * Dom events map to Colibri events
     * @static
     */
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
        MouseEnter: {
            domEvent: 'mouseenter',
        },
        MouseLeave: {
            domEvent: 'mouseleave',
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
            domEvent: 'mousemove',
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

    /**
     * Maped handlers
     * @private
     */
    __domHandlersAttached = {};

    /**
     * @constructor
     * @param {string} name - name of component
     * @param {string} element element to create component on
     * @param {Colibri.UI.Component|Element} container container object
     */
    constructor(name, container, element, createEvents = {}) {
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
        /** @type {string} */
        this._toolTipPosition = 'left bottom';

        /** @type {boolean} */
        this._routeIsRegExp = true;

        /** @type {Colibri.UI.Store} */
        this._storage = null;

        /** @type {string} */
        this._binding = '';

        this._renderedIndex = 0;
        
        this._clickToCopyHandler = (e) => (this._copyStyle === 'text' ? this.container.text() : this.value + '').copyToClipboard() && App.Notices.Add(new Colibri.UI.Notice('#{ui-copy-info}', Colibri.UI.Notice.Success));

        Object.forEach(createEvents, (event, handler) => {
            this.AddHandler(event, handler);
        });

        if (!element) {
            element = Element.create('div');
        }
        
        if(typeof element === 'string') {
            element = Colibri.UI.Templates[element];
            console.log(element);
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
            container.Dispatch('ChildAdded', {component: this});
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

        this._mouseEnterHandler = (event, args) => {
            if(this._toolTip) {
                this._createTipObject();
                this._setToolTipPositionAndGap();
                this._tipObject.html(this._toolTip);
                this._tipObject.showElement();
            }
        }
        this._mouseLeaveHandler = (event, args) => {
            if(this._tipObject) {
                this._tipObject.html('');
                this._tipObject.hideElement();
            }
        };

        this.AddHandler('MouseEnter', this._mouseEnterHandler);
        this.AddHandler('MouseLeave', this._mouseLeaveHandler);

        element = null;
        this._renderedIndex = this.index;

    }


    /**
     * Converts property to its correct type, if the value is function then runs a function
     * @private
     * @param {string} type type of property to convert 
     * @param {*} value value of property 
     * @returns 
     */
    _convertProperty(type, value) {
        if(typeof value === 'function' && type != 'Function') {
            return value(value, this);
        } else if((value === 'true' || value === 'false') && type === 'Boolean') {
            return value === 'true';
        } else if(typeof value === 'string' && type === 'Number') {
            return parseFloat(value);
        } else if(typeof value === 'object' && type !== 'String') {
            if(Lang !== undefined) {
                return Lang.Translate(value);
            } else {
                return value['ru'] ?? value;
            }
        } else if(typeof value === 'string' && ['Object', 'Function', 'Array'].indexOf(type) !== -1) {
            eval('value = ' + value + ';');
        }
        return value;
    }

    /**
     * @private
     * @returns {string}
     */
    _newName() {
        return 'component-' + Date.Mc()
    }

    /**
     * Registers an observer for detect visibility
     * @private
     */
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

    /**
     * Unregisters an observer
     * @private
     */
    _unregisterObserver() {
        if(this._observer) {
            this._observer.unobserve(this._element);
            this._observer = null;
        }
    }

    /**
     * Creates a new component class
     * @param {Element|string} element Element to create component for
     * @param {Element|Colibri.UI.Component} parent Parent element or component
     * @returns {string}
     */
    CreateComponentClass(element, parent) {
        let comp = null;
        try {
            comp = element.getAttribute ? (element?.getAttribute('Component') ?? element?.getAttribute('component') ?? element.tagName ?? null) : null; 
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
        
        if(namespace) {
            namespace = namespace.split('.');
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

    /**
     * Creates a new component
     * @param {Element|string} element Element to create component for
     * @param {Element|Colibri.UI.Component} parent Parent element or component
     * @returns {Colibri.UI.Component}
     */
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

    /**
     * Processes children elements and creates a components
     * @param {Array<Element>} children children to generate
     * @param {Element|null} parent parent component
     * @param {boolean} dontDispatch do not dispatch ChildsProcessed event
     * @param {Colibri.UI.Component} root Root component
     */
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
                    try { 
                        eval('data = ' + data + ';'); 
                    } catch(e) { 
                        console.log(data); console.log(e); 
                    }
                    if(Object.isObject(data)) {
                        this.tag.params = data;
                    }
                }
                else if(element.tagName == 'fields') {
                    let data = element.childNodes[0].textContent;
                    try { 
                        eval('data = ' + data + ';'); 
                    } catch(e) {
                        console.log(data, this); console.log(e); 
                    }
                    if(Object.isObject(data)) {
                        this.fields = data;
                    }
                }
                else if(element.tagName.indexOf('json-') !== -1) {
                    const propertyName = element.tagName.substr('json-'.length);
                    let data = element.childNodes[0].textContent;
                    try { 
                        eval('data = ' + data + ';'); 
                    } catch(e) { 
                        console.log(data); console.log(e); 
                    }
                    if(data) {
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

    /**
     * Generates children
     * @param {Element|string} element Element to process children for
     * @param {Element|Colibri.UI.Component} parent parent component or parent element
     */
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

    /** @protected */
    _registerEvents() {
        this.RegisterEvent('ComponentRendered', false, 'When component is ready and attached to DOM');
        this.RegisterEvent('ComponentDisposed', false, 'When component is detached and disposed');
        this.RegisterEvent('ComponentMoved', false, 'When component is moved in childs tree');
        this.RegisterEvent('ReadonlyStateChanged', false, 'When Readonly property is changed');
        this.RegisterEvent('EnabledStateChanged', false, 'When Enabled property is changed');
        this.RegisterEvent('Resized', false, 'When resize is comlete');
        this.RegisterEvent('Resize', false, 'When resize in progress');
        this.RegisterEvent('ReceiveFocus', true, 'When focus raised');
        this.RegisterEvent('LoosedFocus', true, 'When focus lost');
        this.RegisterEvent('Clicked', false, 'When clicked a mouse button');
        this.RegisterEvent('DoubleClicked', false, 'When double clicked');
        this.RegisterEvent('MouseEnter', false, 'When mouse pointer is in component bounds');
        this.RegisterEvent('MouseLeave', false, 'When mouse pointer is leaved a component bounds');
        this.RegisterEvent('MouseDown', false, 'When mouse button is down');
        this.RegisterEvent('MouseUp', false, 'When mouse button is up');
        this.RegisterEvent('MouseMove', false, 'When mouse button is moving');
        this.RegisterEvent('KeyDown', false, 'When keyboard key is down');
        this.RegisterEvent('KeyUp', false, 'When keyboard key is up');
        this.RegisterEvent('KeyPressed', false, 'Whe keyboard key is pressed');
        this.RegisterEvent('Shown', false, 'When component is shown');
        this.RegisterEvent('ClickedOut', false, 'When clicked out of component bounds');
        this.RegisterEvent('ChildAdded', false, 'When added a child component');
        this.RegisterEvent('ChildsProcessed', false, 'When childs is rendered');
        this.RegisterEvent('ContextMenuIconClicked', false, 'When clicked on contextmenu handler');
        this.RegisterEvent('ContextMenuItemClicked', false, 'When clicked on contextmenu item');
        this.RegisterEvent('ShadowClicked', false, 'When clicked on shadow');
        this.RegisterEvent('ConnectedTo', false, 'When component is connected to Dom successfuly, not when rendered!');
        this.RegisterEvent('Hidden', false, 'When component is hidden');   
        this.RegisterEvent('Disconnected', false, 'When component disconnected from DOM, not when Disposed');   
        this.RegisterEvent('Pasted', false, 'When pasted into component');
        this.RegisterEvent('Pasting', false, 'When pasting data');
        this.RegisterEvent('DragStart', false, 'When starts drag a component');
        this.RegisterEvent('DragEnd', false, 'When an element is no longer being dragged');
        this.RegisterEvent('DragEnter', false, 'When the dragged element enters the target element\'s area');
        this.RegisterEvent('DragOver', false, 'When the dragged element is over the target object');
        this.RegisterEvent('DragLeave', false, 'When the dragged element leaves the target object');
        this.RegisterEvent('Drop', false, 'When the dragged element "drops" onto the target object');
        this.RegisterEvent('Drag', false, 'When the drag and drop process occurs');
        this.RegisterEvent('ContextMenu', false, 'Context menu');
        this.RegisterEvent('Scrolled', false, 'When scrolled');
        this.RegisterEvent('ScrolledIn', false, 'When component moved in scroll container');
        this.RegisterEvent('VisibilityChanged', false, 'When the display state changed');
        this.RegisterEvent('SwipedToLeft', false, 'When the user swiped left with their finger/mouse');
        this.RegisterEvent('SwipedToRight', false, 'When the user swiped/mouse to the right');
        this.RegisterEvent('SwipedToUp', false, 'When the user swipes/mouses up');
        this.RegisterEvent('SwipedToDown', false, 'When the user swipes/mouses down');
        this.RegisterEvent('TouchStarted', false, 'When a finger was pressed on the screen');
        this.RegisterEvent('TouchEnded', false, 'When the finger is removed from the screen');
        this.RegisterEvent('TouchMoved', false, 'When they swipe their finger on the screen');
    }

    /**
     * Gets context menu icon component
     * @readonly
     * @returns {Colibri.UI.Component}
     */
    get contextMenuIcon() {
        return this.Children(this._name + '-contextmenu-icon-parent');
    }

    /**
     * @private
     * @returns {Colibri.UI.Component}
     */
    _getContextMenuIcon() {
        if(this.Children(this._name + '-contextmenu-icon-parent')) {
            return this.Children(this._name + '-contextmenu-icon-parent/' + this._name + '-contextmenu-icon');
        }
        return null;
    }

    /**
     * @private
     * @returns {Colibri.UI.Component}
     */
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
        contextMenuIcon.AddHandler('Clicked', (event, args) => {
            this.Dispatch('ContextMenuIconClicked', args);
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });
    }

    /**
     * @private
     */s
    _removeContextMenuButton() {
        if(this._hasContextMenu && this.Children(this._name + '-contextmenu-icon-parent')) {
            this.Children(this._name + '-contextmenu-icon-parent').Dispose();
            this.RemoveClass('app-component-hascontextmenu');
        }
    }

    /**
     * Shows context menu in given orientation and point
     * @param {Array<string>} orientation Orientation
     * @param {string} className class name for context menu
     * @param {{top, left}} point point to show contextmenu on
     */
    ShowContextMenu(orientation = [Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT], className = '', point = null) {


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

    /**
     * Adds a event handler
     * @param {string} eventName name of event to attach
     * @param {Function} handler handler to attach
     * @param {boolean} prepend prepend to array of handlers
     * @param {Colibri.UI.Dispatcher} respondent respondet object
     * @returns {Colibri.Events.Dispatcher}
     */
    AddHandler(eventName, handler, prepend = false, respondent = this) {
        const __domHandlers = Colibri.UI.Component.__domHandlers;
        if(__domHandlers[eventName]) {
            this.__bindHtmlEvent(eventName, __domHandlers[eventName]);
        }

        return super.AddHandler(eventName, handler || Colibri.UI.Component.__nullHandler, prepend, respondent);
    }

    /**
     * Triggers an event to current component
     * @param {string} eventName event name
     */
    TriggerEvent(eventName) {
        const __domHandlers = Colibri.UI.Component.__domHandlers;
        if(__domHandlers[eventName]) {
            const domEventName = __domHandlers[eventName].domEvent;
            this._element.emitHtmlEvents(domEventName);
        }
    }

    /**
     * Binds html event to attached component event
     * @private
     * @param {string} eventName event name
     * @param {*} args event arguments
     */
    __bindHtmlEvent(eventName, args) {

        if(this.__domHandlersAttached[eventName]) {
            return;
        }

        let {domEvent, respondent, delay, handler, capture} = args;
        respondent = respondent ? respondent : this._element;

        if(delay) {
            handler = e => Colibri.Common.Delay(delay).then(() => handler(e))
        } else {
            handler = handler ? handler : (e => this.Dispatch(eventName, {domEvent: e}));
        }

        this.__domHandlersAttached[eventName] = {
            domEvent,
            respondent,
            handler
        };
        if(domEvent === 'touchmove') {
            console.log(domEvent, handler, capture || false);
        }
        respondent.addEventListener(domEvent, handler, capture || false);
    }

    /**
     * @protected
     */
    _bindHtmlEvents() {
        
    }

    /**
     * Removes all attachments for html events
     * @private
     */
    __removeHtmlEvents() {
        for(let {domEvent, respondent, handler} of Object.values(this.__domHandlersAttached)) {
            (respondent !== this._element)  && respondent.removeEventListener(domEvent, handler);
        }

        this.__domHandlersAttached = {};
    }

    /**
     * Registers event handlers
     * @protected
     */
    _registerEventHandlers() {
        // do nothing
    }

    /**
     * Namespace of component
     * Used in HTML templates to indicates module and component
     * @type {string}
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
     * @type {boolean} value
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

    /**
     * Context menu items
     * @type {Array} items
     */
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
     * Container element
     * @type {Element}
     */
    get container() {
        return this._element;
    }

    /**
     * Main element of component
     * @type {Element}
     */
    get mainElement() {
        return this._element;
    }

    /**
     * Parent container of component
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
        if(value === null) {
            this._element.css('left', null);
        } else if(typeof value == 'string' && (value.indexOf('%') !== -1 || value.indexOf('px') !== -1 || value.includes('calc'))) {
            this._element.css('left', value);
        } else {
            this._element.css('left', value + 'px');
        }
    }

    /**
     * Right position of component element
     * @type {Number}
     */
    get right() {
        const bounds = this._element.bounds();
        return bounds.left + bounds.outerWidth;
    }
    /**
     * Right position of component element
     * @type {Number}
     */
    set right(value) {
        if(value === null) {
            this._element.css('right', null);
        } else if(typeof value == 'string' && (value.indexOf('%') !== -1 || value.indexOf('px') !== -1 || value.includes('calc'))) {
            this._element.css('right', value);
        } else {
            this._element.css('right', value + 'px');
        }
    }

    /**
     * Top position of component element
     * @type {Number}
     */
    get top() {
        const bounds = this._element.bounds();
        return bounds.top;
    }
    /**
     * Top position of component element
     * @type {Number}
     */
    set top(value) {
        if(value === null) {
            this._element.css('top', null);
        } else if(typeof value == 'string' && (value.indexOf('%') !== -1 || value.indexOf('px') !== -1 || value.includes('calc'))) {
            this._element.css('top', value);
        } else {
            this._element.css('top', value + 'px');
        }
    }

    /**
     * Bottom position of component element
     * @type {Number}
     */
    get bottom() {
        const bounds = this._element.bounds();
        return bounds.top + bounds.outerHeight;
    }
    /**
     * Bottom position of component element
     * @type {Number}
     */
    set bottom(value) {
        if(value === null) {
            this._element.css('bottom', null);
        } else if(typeof value == 'string' && (value.indexOf('%') !== -1 || value.indexOf('px') !== -1 || value.includes('calc'))) {
            this._element.css('bottom', value);
        } else {
            this._element.css('bottom', value + 'px');
        }

    }

    /**
     * Style of component element
     * @type {Object}
     */
    get styles() {
        return this._element.css();
    }
    /**
     * Style of component element
     * @type {Object}
     */
    set styles(value) {
        value = this._convertProperty('Object', value)
        this._element.css(value);
    }

    /**
     * Name of object
     * @type {string}
     */
    get name() {
        return this._name;
    }
    /**
     * Name of object
     * @type {string}
     */
    set name(value) {
        this._name = value;
        this._element.data('objectName', this._name);
    }

    /**
     * Class name of component element
     * @type {string}
     */
    get className() {
        return this._className ?? this._element.attr('class');
    }
    /**
     * Class name of component element
     * @type {string}
     */
    set className(value) {
        this._className = value;
        value.split(' ').forEach((v) => {
            if(v) {
                this._element.classList.add(v);
            }
        });
    }

    /**
     * Element ID
     * @type {string}
     */
    get elementID() {
        return this._element.attr('id');
    }
    /**
     * Element ID
     * @type {string}
     */
    set elementID(value) {
        this._element.attr('id', value);
    }

    /**
     * HTML content of component element
     * @type {string}
     */
    get html() {
        return this._element.html();
    }
    /**
     * HTML content of component element
     * @type {string}
     */
    set html(value) {
        this._element.html(value);
    }

    /**
     * Tag of component
     * @type {Object}
     */
    get tag() {
        return this._tag;
    }
    /**
     * Tag of component
     * @type {Object}
     */
    set tag(value) {
        this._tag = value;
    }

    /**
     * Data of component (data- attributes in element)
     * @type {Object}
     */
    get data() {
        return this._element.data();
    }
    /**
     * Data of component (data- attributes in element)
     * @type {Object}
     */
    set data(value) {
        this._element.data(value);
    }

    /**
     * Is component readonly
     * @type {boolean}
     */
    get readonly() {
        return this._element.is(':scope[readonly]');
    }
    /**
     * Is component readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = value === true || value === 'true';
        this._element.attr('readonly', value ? 'readonly' : null);
        this.Dispatch('ReadonlyStateChanged');
    }

    /**
     * Index of component in its parent 
     * @type {Number}
     * @readonly
     */
    get index() {
        return this._element.index();
    }
    /**
     * Index of component element in its parent element
     * @type {Number}
     * @readonly
     */
    get childIndex() {
        return this._parent ? this._parent.indexOf(this.name) : null;
    }

    /**
     * Is component enabled
     * @type {boolean}
     */
    get enabled() {
        return !this._element.is(':disabled') && !this._element.is('.ui-disabled');
    }
    /**
     * Is component enabled
     * @type {boolean}
     */
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
     * Is component shown
     * @type {boolean}
     */
    get shown() {
        return this._element.classList.contains('app-component-shown');
    }
    /**
     * Is component shown
     * @type {boolean}
     */
    set shown(value) {
        const isChanged = value != this.shown;
        value = this._convertProperty('Boolean', value);
        if(isChanged) {
            if (value === true || value === 'true') {
                this.AddClass('app-component-shown');
                this.Dispatch('Shown', {});
            } else {
                this.RemoveClass('app-component-shown');
                this.Dispatch('Hidden', {});
            }
        }
    }

    /**
     * Brings coponent to top of z-index
     */
    BringToFront() {
        const position = this._element.css('position');
        if(['relative', 'fixed', 'absolute'].indexOf(position) > -1) {
            const maxZIndex = Colibri.UI.maxZIndex;
            if(this.styles.zIndex != maxZIndex) {
                this._element.css('z-index', maxZIndex + 1);
            }
        }
    }

    /**
     * Sends componpent to bottom of z-index
     */
    SendToBack() {
        this._element.css('z-index', null);
    }

    /**
     * Component value
     * @type {String}
     */
    get value() {
        return this._element.html();
    }
    /**
     * Component value
     * @type {String}
     */
    set value(value) {
        this._element.html(value);
    }

    /**
     * @private
     */
    _createTipObject() {
        const tip = document.body.querySelector('.tip');
        if(!tip) {
            this._tipObject = Element.create('span', {class: 'tip', namespace: this.namespace});
            document.body.append(this._tipObject);
        } else {
            this._tipObject = tip;
        }
    }

    /**
     * Component toolTip
     * @type {String}
     */
    get toolTip() {
        return this._toolTip;
    }
    /**
     * Component toolTip
     * @type {String}
     */
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
        }
        else {
            if(this._tipObject) {
                this._tipObject.remove();
                this._tipObject = null;
            }
        }

    }

    /**
     * @private
     * @param {Element} elementObject element object to position tooltip
     */
    _setToolTipPositionAndGap(elementObject = null) {

        elementObject = elementObject || this._element;
        const bounds = elementObject.bounds();
        const tipBounds = this._tipObject.bounds();
        const windowBounds = document.body.bounds();
        windowBounds.height = window.clientHeight;

        this._tipObject.attr('class', 'tip');
        this._tipObject.data('for', this.path);
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

        let css = {zIndex: Colibri.UI.maxZIndex + 1};
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

    /**
     * Position of tooltip
     * @type {left bottom,right bottom,left top,right top}
     */
    get toolTipPosition() {
        return this._toolTipPosition;
    }
    /**
     * Position of tooltip
     * @type {left bottom,right bottom,left top,right top}
     */
    set toolTipPosition(value) {
        this._toolTipPosition = value;
        
    }

    /**
     * Component path in Component dom
     * @type {string}
     * @readonly
     */
    get path() {
        return (this.parent instanceof Colibri.UI.Component ? this.parent.path : '') + '/' + this.name;
    }

    /**
     * Can component get focus
     * @readonly
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
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._element.attr('tabIndex');
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        this._element.attr('tabIndex', value === 'true' || value === true ? Colibri.UI.tabIndex++ : value);
    }

    /**
     * Returns next component in Component DOM
     * @readonly
     * @type {Colibri.UI.Component}
     */
    get next() {
        const myIndex = this.parent ? this.parent?.indexOf(this.name) : -1;
        if(myIndex === -1 || myIndex === this.parent.children - 1) {
            return null;
        }

        return this.parent.Children(myIndex + 1);
    }

    /**
     * Returns previous component in Component DOM
     * @readonly
     * @type {Colibri.UI.Component}
     */
    get prev() {
        const myIndex = this.parent ? this.parent.indexOf(this.name) : -1;
        if(myIndex === -1 || myIndex === 0) {
            return  null;
        }

        return this.parent.Children(myIndex - 1);
    }

    /**
     * 
     * @param {Colibri.UI.Component} child child to move 
     * @param {number} fromIndex current index of child 
     * @param {number} toIndex new index of child 
     * @param {boolean} raiseEvent rais ComponentMoved event
     */
    MoveChild(child, fromIndex, toIndex, raiseEvent = false) {
        
        // если то же место то ничего не делаем
        if(fromIndex == toIndex) {
            return;
        }

        this._children.splice(fromIndex, 1);
        // стало на один меньше
        if(fromIndex < toIndex) {
            // all is ok, can move
            toIndex--;
        } 

        this._children.splice(toIndex, 0, child);
        this._moveInDom(child.container, this.container, toIndex);        
        if(raiseEvent) {
            this.Dispatch('ComponentMoved', {fromIndex: fromIndex, toIndex: toIndex});
        }
    }

    /**
     * Move current component up in its parent childs
     */
    MoveUp() {
        if(!this.prev) {
            return;
        }    
        this.parent.MoveChild(this, this.childIndex, this.childIndex - 1);
        this.Dispatch('ComponentMoved', {direction: 'up'});
    }

    /**
     * Move current component down in its parent childs
     */
    MoveDown() {
        if(!this.next) {
            return;
        }    
        this.parent.MoveChild(this, this.childIndex, this.childIndex + 1);
        this.Dispatch('ComponentMoved', {direction: 'down'});
    }

    /**
     * Returns component by its name
     * @param {string} name name of component
     * @returns {Colibri.UI.Component}
     * @private
     */
    _childByName(name) {
        const filtered = this._children.filter(c => c.name == name);
        if(filtered.length > 0) {
            return filtered.pop();
        }
        return null;
    }

    /**
     * Move element in DOM
     * @private
     * @param {Element} insertedElement element to move
     * @param {Element} parentElement parent element
     * @param {number} index move to this index
     */
    _moveInDom(insertedElement, parentElement, index) {
        insertedElement.remove();
        parentElement.insertBefore(insertedElement, parentElement.children[index]);
        this._renderedIndex = this.index;
    }

    /**
     * Adds or returns the component from child list    
     * @param {string} name name of component
     * @param {Colibri.UI.Component} val component to add 
     * @param {number} [index] index in childs to add component to
     * @returns {Colibri.UI.Component[]|Colibri.UI.Component}
     */
    Children(name, val = undefined, index = undefined, container = null, childContainer = null) {
        
        if (name === undefined || name === null)
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

    /**
     * Sort child components
     * @param {Function} callback callback for sorting
     */
    Sort(callback) {
        this._children.sort(callback);
        this._children.forEach((child, index) => {
            this._moveInDom(child.container, this.container, index);
        });
    }

    /** 
     * @type {number} 
     */
    get children() {
        return this.Children().length;
    }

    /**
     * Returns index of child component in Component DOM
     * @param {string} name name of child component
     * @returns {Colibri.UI.Component}
     */
    indexOf(name) {
        if(!this._children) {
            this._children = [];
        }
        if(name instanceof Function) {
            return Array.findIndex(this._children, name);
        } else {
            return Array.findIndex(this._children, (v) => v.name == name);
        }
    }

    /**
     * Is conponent has shadow
     * @type {Boolean}
     */
    get hasShadow() {
        return this._shadow != null;
    }
    /**
     * Is conponent has shadow
     * @type {Boolean}
     */
    set hasShadow(value) {
        if(value === true || value === 'true') {

            if(typeof this._element.css('z-index') === 'string') {
                this._element.css('z-index', Colibri.UI.maxZIndex + 1);
            }

            const zIndex = this._element.css('z-index') - 1;
            if(!this._shadow) {
                this._shadow = Element.create('div', {class: 'app-component-shadow-div'});
            }
            this._shadow.css('z-index', zIndex);
            this._shadow.addEventListener('click', (e) => { this.Dispatch('ShadowClicked', {domEvent: e}); e.stopPropagation(); e.preventDefault(); return false; });
            this._shadow.addEventListener('contextmenu', (e) => { this.Dispatch('ShadowClicked', {domEvent: e}); e.stopPropagation(); e.preventDefault(); return false; });
            this._element.after(this._shadow);
            
        }
        else {
            if(this._shadow) {
                this._shadow.remove();
                this._shadow = null;
            }
        }
    }

    /**
     * Renders bounded data
     * @protected
     * @param {*} data data in store to bind
     */
    __renderBoundedValues(data, path) {
        try {
            if(typeof data == 'string') {
                this.value = data;
            }
        }
        catch(e) {
            console.log(e);
        }
    }

    /**
     * Store to bind to component
     * @type {Colibri.UI.Store}
     */
    set store(value) {
        this._storage = value;
    }
    /**
     * Store to bind to component
     * @type {Colibri.UI.Store}
     */
    get store() {
        return this._storage;
    }

    /**
     * Path in store to bind to component
     * @type {String}
     */
    get binding() {
        return this._binding;
    }

    _handler(data, path) {
        try {
            if(this.isConnected) {
                this.__renderBoundedValues(data, path);
            }
            //  else {
            //     Colibri.Common.Wait(() => {
            //         console.log('wating', this.name);
            //         return this.isConnected;
            //     }, 0, 100).then(() => {
            //         console.log('found', this.name);
            //         return this.__renderBoundedValues(data, path)
            //     });
            // }
        } catch(e) {
            console.error(e);
            App.Notices.Add(new Colibri.UI.Notice(e, Colibri.UI.Notice.Error));
        }
    }

    /**
     * Path in store to bind to component
     * @type {String}
     */
    set binding(value) {

        if (value === this._binding) {
            return;
        }


        if(this._binding && typeof this._binding === 'string') {
            let binding = this._binding.split(';');
            for(const pathsToLoad of binding) {
                this._storage.RemovePathHandler(pathsToLoad, this, this._handler);
            }
        }

        this._binding = value;
        if (value instanceof Colibri.UI.Component) {
            this.__renderBoundedValues(value.value);
            value.AddHandler(['Changed', 'KeyUp'], (event, args) => this.__renderBoundedValues(value.value));
            return;

        } else if(typeof value !== 'string') {
            this.__renderBoundedValues(value);
            return;
        }

        if(!this._storage) {
            this._storage = App.Store;
        } 

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
                this._storage.AddPathHandler(pathsToLoad, [this, this._handler]);
            }).catch(response => {
                this.__renderBoundedValues(null, pathsToLoad);
                this._storage.AddPathHandler(pathsToLoad, [this, this._handler]);
            });
            
        }
        else {
            this._storage.AsyncQuery(value).then(data => {
                this.__renderBoundedValues(data, value);
                this._storage.AddPathHandler(value, [this, this._handler]);
            }).catch((response) => {
                console.log(response);
                // App.Notices.Add(new Colibri.UI.Notice(response, Colibri.UI.Notice.Error));
                this.__renderBoundedValues(null, value);
                this._storage.AddPathHandler(value, [this, this._handler]);
            });    
        }
        
    }

    /**
     * Reloads binding
     */
    ReloadBinding() {
        if (this._binding && this._binding instanceof Colibri.UI.Component) {
            this.__renderBoundedValues(this._binding.value);
            return;
        }  
        if(this._storage && this._binding) {
            
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

        this.ForEach((name, component) => component.ReloadBinding());

    }


    /**
     * Is component connected to DOM
     * @readonly
     * @type {Boolean}
     */
    get isConnected() {
        return this._element.isConnected;
    }

    /**
     * Top of the scroll
     * @type {Number}
     */
    get scrollTop() {
        return this._element.scrollTop;
    }
    /**
     * Top of the scroll
     * @type {Number}
     */
    set scrollTop(value) {
        if(this._animateScroll) {
            this._element.animateScrollTop(value, 300);
        }
        else {
            this._element.scrollTop = value;
        }
    }

    /**
     * Left of the scroll
     * @type {Number}
     */
    get scrollLeft() {
        return this._element.scrollLeft;
    }
    /**
     * Left of the scroll
     * @type {Number}
     */
    set scrollLeft(value) {
        if(this._animateScroll) {
            this._element.animateScrollLeft(value, 300);
        }
        else {
            this._element.scrollLeft = value;
        }
    }

    /**
     * Is scrolling must be animated
     * @type {boolean}
     */
    get animateScroll() {
        return this._animateScroll;
    }
    /**
     * Is scrolling must be animated
     * @type {boolean}
     */
    set animateScroll(value) {
        this._animateScroll = value;
    }

    /**
     * Is component must handle clicked out event
     * @type {boolean}
     */
    get handleClickedOut() {
        return this._handleClickedOut;
    }
    /**
     * Is component must handle clicked out event
     * @type {boolean}
     */
    set handleClickedOut(value) {
        this._handleClickedOut = value;
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

    /**
     * Is component must handle resize event
     * @type {boolean}
     */
    get handleResize() {
        return this._handleResize;
    }
    /**
     * Is component must handle resize event
     * @type {boolean}
     */
    set handleResize(value) {
        this._handleResize = value;
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

    /**
     * Is component must handle swipe
     * @type {boolean}
     */
    get handleSwipe() {
        return this._handleSwipe;
    }
    /**
     * Is component must handle swipe
     * @type {boolean}
     */
    set handleSwipe(value) {
        this._handleSwipe = value;
        if(value) {
            this.__touchStartedPos = null;
            this._swipeTouchEnd = (e) => {
                if ( !this.__touchStartedPos && e.currentTarget != this._element  ) {
                    return;
                }
                this.styles = null;
                this.__touchStartedPos = null;
                document.body.removeEventListener('touchend', this._swipeTouchEnd, true);
                document.body.removeEventListener('touchmove', this._swipeTouchMove, true);
            };
            this._swipeTouchMove = (e) => {
                if ( !this.__touchStartedPos && e.currentTarget != this._element ) {
                    return;
                }
            
                const xUp = e.touches[0].clientX;                                    
                const yUp = e.touches[0].clientY;
            
                const sensitivity = this._swipesensitivity || 10;
                const orientation = this._swipeOrientation || 'hr';

                const diff = orientation === 'hr' ? this.__touchStartedPos.x - xUp : this.__touchStartedPos.y - yUp;
                if(Math.abs(diff) > 10) {
                    this.styles = orientation === 'hr' ? {marginLeft: (-1*diff) + 'px'} : {marginTop: (-1*diff) + 'px'};
                    if ( diff > sensitivity ) {
                        this.Dispatch(orientation === 'hr' ? 'SwipedToRight' : 'SwipedToBottom', {domEvent: e});
                    } else if ( diff < -sensitivity ) {
                        this.Dispatch(orientation === 'hr' ? 'SwipedToLeft' : 'SwipedToTop', {domEvent: e});
                    }                       
                }
            };
            this.AddHandler('TouchStarted', (event, args) => {
                const firstTouch = args.domEvent.touches[0];      
                this.__touchStartedPos = {x: firstTouch.clientX, y: firstTouch.clientY};                                
                document.body.addEventListener('touchend', this._swipeTouchEnd);
                document.body.addEventListener('touchmove', this._swipeTouchMove);
            });
        }
    }

    /**
     * How sensitive is a swipe
     * @type {Number}
     */
    get swipeSensitivity() {
        return this._swipesensitivity;
    }
    /**
     * How sensitive is a swipe
     * @type {Number}
     */
    set swipeSensitivity(value) {
        this._swipesensitivity = value;
    }

    /**
     * Swipe orientation
     * @type {hr,vr}
     */
    get swipeOrientation() {
        return this._swipeOrientation;
    }
    /**
     * Swipe orientation
     * @type {hr,vr}
     */
    set swipeOrientation(value) {
        this._swipeOrientation = value;
    }

    /**
     * Connect component to DOM
     * @param {Element} container container to connect
     * @param {number} index index to connect child in
     * @param {boolean} performBinding perform reload binding after connection
     */
    ConnectTo(container, index = null, performBinding = false) {
        this._container = container instanceof Colibri.UI.Component ? container.container : container;
        if(this._shadow) {
            this._shadow.remove();
            this._container.append(this._shadow);
        }
        if(index === null) {
            this._container.append(this._element);        
        } else { 
            this._element.insertAtIndex(this._container, index);
        }
        if(performBinding) {
            this.ReloadBinding();
        }
        this.Dispatch('ConnectedTo');
    }

    /**
     * Disconnects component from DOM
     */
    Disconnect() {
        const parentContainer = this._container;
        this._element.remove();
        this._container = null;
        this.Dispatch('Disconnected');
        return parentContainer;
    }

    /**
     * Keeps component in memory but removes from DOM
     */
    KeepInMind() {
        if(this._container) {
            this._hideData = {index: this.renderedIndex, parent: this._element.parentElement};
            this._element.tag('containedAt', this._element.parentElement);
            this.Disconnect();
            this.Dispatch('Hidden', {});
            this._sendEventToChilds('Hidden', {});
        }
    }

    /**
     * Retreives component from memory to DOM in its older position
     */
    Retreive(performBinding = false) {
        if(this._hideData && this._hideData.parent) {
            this.ConnectTo(this._hideData.parent, this._hideData.index, performBinding);
            this._element.tag('containedAt', null);
            this._hideData = null;
            this.Dispatch('Shown', {});
            this._sendEventToChilds('Shown', {});
        }
    }

    _sendEventToChilds(event, args = {}) {
        this.ForEach((name, component) => {
            component.Dispatch(event, args);
            component._sendEventToChilds(event, args);
        });
    }

    /**
     * Clears a children of component
     */
    Clear() {
        this.ForReverseEach((name, control) => {
            control.Dispose();
        });
    }

    /**
     * Hides a tooltip object forcely
     */
    HideToolTip() {
        const tip = document.body.querySelector('.tip');
        if(tip) {
            tip.hideElement();
        }
    }

    /**
     * Disposes a component object and removes it from DOM
     */
    Dispose() {
        this.hasShadow = false;
        this.Clear();

        if(this._tipObject) {
            this._tipObject.remove();
        }

        if (this.parent) {
            this.parent.Children(this.name, null);
            this.parent = null;
        }
        this.__removeHtmlEvents();
        try {
            this._element.remove();
            // this._element = null;
        }
        catch(e) { console.log('error removing element from DOM', e); }
        this.Dispatch('ComponentDisposed');

        // this._parent = null;
        // this._children = null;
        // this._tag = null;
        // this._container = null;

        super.Dispose();

        // delete this;

    }

    /**
     * Finds component by path
     * @param {string} path path to component in Component DOM
     * @returns {Colibri.UI.Component}
     */
    Find(path) {
        return Colibri.UI.Find(path, this);
    }

    /**
     * Finds all components by path
     * @param {string} path path to components
     * @returns {Colibri.UI.Component}
     */
    FindAll(path) {
        return Colibri.UI.FindAll(path, this);
    }

    /**
     * Finds a first occurance of component by name
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
     * Adds class name to classList of element
     * @param {string} val class name
     * @returns {this}
     */
    AddClass(val) {
        if(!val) {
            return this;
        }
        if(!Array.isArray(val)) {
            val = val.split(' ');
        }
        for(const v of val) {
            if(!this._element.classList.contains(v)) {
                this._element.classList.add(v);
            }
        }
        return this;
    }

    /**
     * Removes class names from classList of element
     * @param {string|Array<string>} val class name or array of class names
     * @returns {this}
     */
    RemoveClass(val) {
        if(Array.isArray(val)) {
            for(const v of val) {
                if(this._element.classList.contains(v)) {
                    this._element.classList.remove(v);
                }
            }
        } else if(this._element.classList.contains(val)) {
            this._element.classList.remove(val);
        }    
        return this;
    }

    /**
     * Checkes when component element contains a class name
     * @param {string} val name of class
     * @returns {this}
     */
    ContainsClass(val) {
        return this._element.classList.contains(val);
    }

    /**
     * Toggles a class name in classList of element
     * @param {string} val name of class
     */
    ToggleClass(val) {
        if(this.ContainsClass(val)) {
            this.RemoveClass(val);
        } else {
            this.AddClass(val);
        }
    }

    /**
     * Puts a focus to the component
     * @returns {Colibri.UI.Component}
     */
    Focus() {
        if (this.canFocus)
            this._element.focus();
        else {
            this._element.focus();
            this.AddClass('-focused');
        }
        return this;
    }

    /**
     * Blurs a focus from component
     * @returns {Colibri.UI.Component}
     */
    Blur() {
        if (this.canFocus)
            this._element.blur();
        else {
            this._element.blur();
            this.RemoveClass('-focused');
        }
        return this;
    }

    /**
     * Cycles a component childs and runs a handler
     * @param {Function} handler handler
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
     * Maps a component childs and runs a handler, returns an array of component childs
     * @param {Function} handler handler
     * @returns {Array<Colibri.UI.Component>}
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
     * Cycles a component childs in reverse order and runs a handler
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
     * Ensures that the component is visible in parent porsion
     * @param {(Colibri.UI.Component|HTMLElement)} [parent] parent component
     * @returns {void}
     */
    EnsureVisible(parent, top = null, hr = false) {
        let parentEl = parent;
        if (parent && parent.container) {
            parentEl = parent.container;
        }
        if (parentEl) {
            if(!hr) {
                this._element.ensureInViewport(parentEl, top);
            } else {
                this._element.ensureInViewportHr(parentEl, top);
            }
        } else {
            this._element.scrollIntoView(false);
        }
    }

    /**
     * Scrolls a parent component
     * @param {number} to position to scroll
     * @param {number} duration animation duration
     */
    ScrollTo(to = 0, duration = 200) {
        this._element.animateScrollTop(to, duration);
    }

    /**
     * Is component visible
     * @type {Boolean}
     * @readonly
     */
    get visible() {
        return this._visible;
    }

    /**
     * Is component element visible
     * @readonly
     */
    get elementVisible() {
        return this._element.computedCss('display') !== 'none' && this._element.computedCss('visibility') !== 'hidden';
    }

    /**
     * Is component element has offset parent
     * @readonly
     */
    get elementIsInOffset() {
        return this._element.offsetParent !== null;
    }


    /**
     * Is component must handle visibility change
     * @type {Boolean}
     */
    get handleVisibilityChange() {
        return !!this._observer;
    }
    /**
     * Is component must handle visibility change
     * @type {Boolean}
     */
    set handleVisibilityChange(value) {
        if(value) {
            this._registerObserver();
        }
        else {
            this._unregisterObserver();
        }
    }

    /**
     * Checks the component contains and element
     * @param {HTMLElement} element элемент
     */
    ContainsElement(element) {
        return this._element.contains(element);
    }

    /**
     * Show component
     */
    Show() {
        this.shown = true;
    }

    /**
     * Hide component
     */
    Hide() {
        this.shown = false;
    }

    /**
     * Is component draggable
     * @type {boolean}
     */
    get draggable() {
        return this._element.attr('draggable');
    }

    /**
     * Is component draggable
     * @type {boolean}
     */
    set draggable(value) {
        this._element.attr('draggable', value ? 'true' : null);
    }

    /**
     * Is component handles drop event
     * @type {boolean}
     */
    get dropable() {
        return this._element.attr('dropable');
    }

    /**
     * Is component handles drop event
     * @type {boolean}
     */
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

    /**
     * Is Regexp pattern
     * @type {Boolean}
     */
    get routeIsRegExp() {
        return this._routeIsRegExp;
    }
    /**
     * Is Regexp pattern
     * @type {Boolean}
     */
    set routeIsRegExp(value) {
        value = this._convertProperty('Boolean', value);
        this._routeIsRegExp = value;
    }

    /**
     * Processes a match of router
     * @param {RegExpMatchArray} patternMatches array of matches
     */
    __processChangeOnRouteSwitch(patternMatches) {
        this.ReloadBinding();
    }

    /**
     * Copy style
     * @type {html,text}
     */
    get copyStyle() {
        return this._copyStyle;
    }
    /**
     * Copy style
     * @type {html,text}
     */
    set copyStyle(value) {
        this._copyStyle = value;
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
    /**
     * @protected
     */
    _showCopy() {
        if(this._copy) {
            this.AddClass('-cancopy');
            this._element.addEventListener('mousedown', this._clickToCopyHandler);
        } else {
            this.RemoveClass('-cancopy');
            this._element.removeEventListener('mousedown', this._clickToCopyHandler);
        } 
    }

    /**
     * Searches in parent Component DOM or html DOM 
     * @param {Function} callback callback for search
     * @param {boolean} useContainers use containers in search method
     * @returns {Colibri.UI.Component|Element|null}
     */
    Closest(callback, useContainers = false) {
        let parent = useContainers ? this.container : this;
        while(parent) {
            const res = callback(parent, useContainers ? this.container : this);
            if(res === true) {
                return parent;
            }    
            parent = useContainers ? parent.parent() : parent.parent;
        }
        return null;
    }

    
    /**
     * Column spanning for widget
     * @type {number}
     */
    get colspan() {
        return this._colspan;
    }
    /**
     * Column spanning for widget
     * @type {number}
     */
    set colspan(value) {
        this._colspan = value;
        this._setSpanning();
    }

    /**
     * Row spanning for widget
     * @type {number}
     */
    get rowspan() {
        return this._rowspan;
    }
    /**
     * Row spanning for widget
     * @type {number}
     */
    set rowspan(value) {
        this._rowspan = value;
        this._setSpanning();
    }
    
    /**
     * @private
     */
    _setSpanning() {
        this._element.css('grid-row-start', this._rowspan ? 'span ' + this._rowspan : 'auto');
        this._element.css('grid-column-start', this._colspan ? 'span ' + this._colspan : 'auto');
    }

    /**
     * Is component went out of right corner of window
     * @readonly
     */
    get isComponentWentOutOfRight() {
        const bounds = this.container.bounds();
        return bounds.left + bounds.outerWidth > window.innerWidth;
    }

    /**
     * Is component went out of left corner of window
     * @readonly
     */
    get isComponentWentOutOfLeft() {
        const bounds = this.container.bounds();
        return bounds.left < 0;
    }

    /**
     * Is component went out of bottom corner of window
     * @readonly
     */
    get isComponentWentOutOfBottom() {
        const bounds = this.container.bounds();
        return bounds.top + bounds.outerHeight > window.innerHeight;
    }

    /**
     * Is component went out of top corner of window
     * @readonly
     */
    get isComponentWentOutOfTop() {
        const bounds = this.container.bounds();
        return bounds.top < 0;
    }

    /**
     * Align content horizontaly
     * @type {left,right,center,justify}
     */
    get halign() {
        return this._halign;
    }
    /**
     * Align content horizontaly
     * @type {left,right,center,justify}
     */
    set halign(value) {
        this._halign = value;
        this._showHalign();
    }
    /**
     * @protected
     */
    _showHalign() {
        this._element.css('text-align', this._halign);
    }

    /**
     * Key for sending metrix
     * @type {String}
     */
    get metrixKey() {
        return this._metrixKey;
    }
    /**
     * Key for sending metrix
     * @type {String}
     */
    set metrixKey(value) {
        this._metrixKey = value;
    }

    /**
     * Is value of input exceeded input width
     * @type {Boolean}
     */
    get isValueExceeded() {
        return this._element.isValueExceeded();
    }

    /**
     * Handle container scroll
     * @type {Boolean}
     */
    get handleContainerScroll() {
        return this._handleContainerScroll;
    }
    /**
     * Handle container scroll
     * @type {Boolean}
     */
    set handleContainerScroll(value) {
        this._handleContainerScroll = value;
        this._showHandleContainerScroll();
    }
    _showHandleContainerScroll() {
        if(this._handleContainerScroll) {
            document.addEventListener('scroll', this.__containerScrollHandler, true);
        } else {
            document.removeEventListener('scroll', this.__containerScrollHandler, true);
        }
    }

    StartBlink(name, styles, timeout) {
        Colibri.Common.StartTimer(name, timeout, () => {
            if(this._blinkSet) {
                Object.forEach(styles, (style, value) => {
                    this._element.css(style, null);;
                });
                this._blinkSet = false;                    
            } else {
                Object.forEach(styles, (style, value) => {
                    this._element.css(style, value);
                });
                this._blinkSet = true;

            }
        });
    }

    StopBlink(name) {
        Colibri.Common.StopTimer(name);
    }

    get renderedIndex() {
        return this._renderedIndex;
    }

}
