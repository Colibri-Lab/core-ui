/**
 * 
 * Tab component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example Using in component html
 * <component Component="Colibri.UI.Tabs">
 * 
 *      <component-header>
 *          <component Component="Colibri.UI.Button" name="tab1-button" value="Запросы" />
 *          <component Component="Colibri.UI.Button" name="tab2-button" value="Личные кабинеты" />
 *      </component-header>     
 * 
 *      <component-container>
 *          <component Component="Colibri.UI.Pane" name="tab1-content">
 *              ...
 *          </component>
 *          <component Component="Colibri.UI.Pane" name="tab2-content">
 *              ...
 *          </component>
 *      </component-container>
 * 
 * </component>
 * 
 * @example Using as Class in js
 * const tabs = new Colibri.UI.Tabs('name', document.body);
 * tabs.AddTab(new Colibri.UI.Button('tab1-button', this.header), new Colibri.UI.Pane('tab1-content', this.container));
 * tabs.AddTab(new Colibri.UI.Button('tab2-button', this.header), new Colibri.UI.Pane('tab2-content', this.container));
 * 
 */
Colibri.UI.Tabs = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     * @param {string|HTMLElement} element element to generate in
     */
    constructor(name, container, element) {
        super(name, container, element || Element.create('div'));
        this.AddClass('app-tabs-container-component');

        this._element.append(Element.fromHtml('<div class="tabs-header-container"><div class="tabs-header"></div><div class="tabs-links"></div></div>'));
        this._element.append(Element.fromHtml('<div class="tabs-container"></div>'));

        this.AddHandler('TabClicked', this.__thisTabClicked);
        this.AddHandler('ChildsProcessed', this.__thisChildsProcessed);
        this.AddHandler('Clicked', this.__thisClicked);
    }

    __thisClicked(event, args) {
        const senderComponent = args.domEvent.target.closest('.app-component-button');
        if(
            senderComponent && 
            senderComponent?.getUIComponent()?.parentContainer === this.header && 
            senderComponent?.getUIComponent() instanceof Colibri.UI.Button
        ) {
            // this.Dispatch('TabClicked', {domEvent: args.domEvent, tab: senderComponent.getUIComponent()});
            this.Dispatch('TabClicked', {domEvent: args.domEvent, tab: senderComponent.getUIComponent()});
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        }
    }

    __thisChildsProcessed(event, args) {
        const buttons = this.buttonsByIndex;
        const containers = this.componentsByIndex;

        for(let i=0; i<buttons.length; i++) {
            buttons[i].contentContainer = containers[i] ?? null;
        }
        
        this._selectTab(0);
    }

    __thisTabClicked(event, args) {
        let newIndex = args.tab.container.index();
        this._selectTab(newIndex);
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('TabClicked', false, 'Когда кликнули на вкладку');
        this.RegisterEvent('SelectionChanged', false, 'Deprecated event, must handle Changed');
        this.RegisterEvent('Changed', false, 'Когда выбранная вкладка изменилась');
    }

    /** @private */
    _unselectAllTabs() {
        const buttons = this.header.querySelectorAll(':scope > .app-ui-component');
        const containers = this.container.querySelectorAll(':scope > .app-ui-component');

        buttons.forEach((button) => {
            // const bc = button.getUIComponent();
            const bc = button.getUIComponent();
            bc.RemoveClass('tab-selected');
        });

        containers.forEach((container) => {
            // const cc = container.getUIComponent();
            const cc = container.getUIComponent();
            cc.RemoveClass('tab-selected');
            cc.shown = false;
            !this._allTabsInDoc && cc.KeepInMind();
        });

    }

    /** @private */
    _selectTab(index) {

        const currentSelection = this.selectedIndex;

        this._unselectAllTabs();
        if(index >= this.buttonsByIndex.length) {
            index = this.buttonsByIndex.length - 1;
        }

        const button = this.buttonsByIndex[index];
        if(!button) {
            return;
        }

        let container = this.componentsByIndex[index];
        // if(!container) {
        //     return;
        // }

        button.AddClass('tab-selected');
        if(container) {
            !this._allTabsInDoc && container.Retreive(true);
            container.shown = true;
            container.AddClass('tab-selected');
        }


        if(currentSelection != index) {
            
            this.Dispatch('Changed', {manual: false, newIndex: index, oldIndex: currentSelection, tab: button, container: container});
            // @deprecation warning !!
            this.Dispatch('SelectionChanged', {newIndex: index, oldIndex: currentSelection, tab: button, container: container});
            
        }

        button.EnsureVisible(this.header, null, true);

    }

    DispatchChanged(){
        this.Dispatch('Changed', {manual: true, newIndex: this.selectedIndex, oldIndex: this.selectedIndex, tab: this.buttonsByIndex[this.selectedIndex], container: this.componentsByIndex[this.selectedIndex]});
    }

    /**
     * Header container
     * @type {Element}
     */
    get headerContainer() {
        return this._element.querySelector(':scope > .tabs-header-container');
    }

    /**
     * Header container
     * @type {Element}
     */
    set headerContainer(value) {
        if(value) {
            this.RemoveClass('-header-hidden');
        }
        else {
            this.AddClass('-header-hidden');
        }
    }

    /**
     * Header container element
     * @type {Element}
     * @readonly
     */
    get header() {
        return this._element.querySelector(':scope > .tabs-header-container > .tabs-header');
    }

    /**
     * Links container element
     * @type {Element}
     * @readonly
     */
    get links() {
        return this._element.querySelector(':scope > .tabs-header-container > .tabs-links');
    }

    /**
     * Content container element
     * @type {Element}
     * @readonly
     */
    get container() {
        return this._element.querySelector(':scope > .tabs-container');
    }

    /**
     * Selected tab index
     * @type {Number}
     */
    get selectedIndex() {
        return this.header.querySelector('.tab-selected') ? this.header.querySelector('.tab-selected').index() : null;
    }

    /**
     * Selected tab index
     * @type {Number}
     */
    set selectedIndex(value) {
        this._selectTab(value);
    }

    /**
     * Selected tab button name
     * @type {String}
     */
    get selectedTab() {
        return this.header.querySelector('.tab-selected') ? this.header.querySelector('.tab-selected').dataset.objectName : null;
    }

    /**
     * Selected tab button name
     * @type {String}
     */
    set selectedTab(value) {
        const selectedTabIndex = this.header.querySelector('[data-object-name="' + value + '"]') ? this.header.querySelector('[data-object-name="' + value + '"]').index() : null;
        this.selectedIndex = selectedTabIndex;
    }

    /**
     * Selected container component
     * @type {Colibri.UI.Component}
     * @readonly
     */
    get selectedContainer() {
        const components = this.components;
        return components[Object.keys(components)[this.selectedIndex]];
    }

    /**
     * Selected container component
     * @type {Colibri.UI.Component}
     * @readonly
     */
    get selectedButton() {
        // return this.header.querySelector('.tab-selected') ? this.header.querySelector('.tab-selected').getUIComponent() : null;
        return this.header.querySelector('.tab-selected') ? this.header.querySelector('.tab-selected').getUIComponent() : null;
    }

    /**
     * Count of tabs
     * @type {Number}
     * @readonly
     */
    get tabsCount() {
        return this._element.querySelectorAll(':scope > .tabs-header-container > .tabs-header > *').length;
    }

    /**
     * Adds tab button and container
     * @param {Colibri.UI.button} componentHeaderButton tab button
     * @param {Colibri.UI.Pane} componentContainer tab content component
     * @returns Colibri.UI.Pane
     */
    AddTab(componentHeaderButton, componentContainer) {
        componentHeaderButton.contentContainer = componentContainer;
        componentHeaderButton.parent = this;

        this.Children(componentHeaderButton.name, componentHeaderButton);
        if(componentContainer) {
            this.Children(componentContainer.name, componentContainer);
            componentContainer.parent = this;
        }
        

        return componentContainer;
    }


    /**
     * Array of tab components
     * @type {Object}
     * @readonly
     */
    get components() {

        let ret = {};
        this.ForEach((name, component) => {
            if(component && this.container && (component.container?.tag('containedAt') === this.container || this.container.contains(component.container))) {
                ret[name] = component;
            }
        });
        return ret;

    }

    /**
     * Array of tab components by index
     * @type {Array}
     * @readonly
     */
    get componentsByIndex() {

        let ret = [];
        this.ForEach((name, component) => {
            if(component && this.container && (component.container?.tag('containedAt') === this.container || this.container.contains(component.container))) {
                ret.push(component);
            }
        });
        return ret;

    }

    /**
     * Array of tab buttons
     * @type {Object}
     * @readonly
     */
    get buttons() {

        let ret = {};
        this.ForEach((name, component) => {
            if(component && this.container && this.header.contains(component.container)) {
                ret[name] = component;
            }
        });
        return ret;

    }

    /**
     * Array of tab buttons by index
     * @type {Array}
     * @readonly
     */
    get buttonsByIndex() {

        let ret = [];
        this.ForEach((name, component) => {
            if(this.container && this.header.contains(component.container)) {
                ret.push(component);
            }
        });
        return ret;

    }

    Dispose() {
        this.Clear();
        super.Dispose();
    }

    /**
     * Clear tab buttons and containers
     */
    Clear() {

        this._children.reverse();
        while(this._children.length > 0) {
            const o = this._children[0];
            o.Dispose();
            this.Children(o.name, null);
        }
        this._children = [];

    }

    /**
     * Show all tabs in document DOM
     * @type {Boolean}
     */
    get allTabsInDoc() {
        return this._allTabsInDoc;
    }
    /**
     * Show all tabs in document DOM
     * @type {Boolean}
     */
    set allTabsInDoc(value) {
        this._allTabsInDoc = value;
    }

}