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

        this.AddHandler('ChildsProcessed', (event, args) => {
            this._processEvents();
            this._selectTab(0);
        });

        this.AddHandler('TabClicked', (event, args) => {
            let newIndex = args.tab.container.index();
            this._selectTab(newIndex);
        });
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('TabClicked', false, 'Когда кликнули на вкладку');
        this.RegisterEvent('SelectionChanged', false, 'Deprecated event, must handle Changed');
        this.RegisterEvent('Changed', false, 'Когда выбранная вкладка изменилась');
    }

    /** @protected */
    _processEvents() {
        const buttons = this.header.querySelectorAll(':scope > .app-ui-component');
        buttons.forEach((button) => button.tag('component').AddHandler('Clicked', (event, args) => this.Dispatch('TabClicked', {domEvent: args.domEvent, tab: event.sender})));
    }

    /** @private */
    _unselectAllTabs() {
        const buttons = this.header.querySelectorAll(':scope > .app-ui-component');
        const containers = this.container.querySelectorAll(':scope > .app-ui-component');

        buttons.forEach((button) => {
            const bc = button.tag('component');
            bc.RemoveClass('tab-selected');
        });

        containers.forEach((container) => {
            const cc = container.tag('component');
            cc.RemoveClass('tab-selected');
            cc.shown = false;
        });

    }

    /** @private */
    _selectTab(index) {

        const currentSelection = this.selectedIndex;
        const newIndex = index;

        index ++;

        this._unselectAllTabs();

        const foundButton = this.header.querySelector(':scope > .app-ui-component:nth-child(' + index + ')');

        if(!foundButton) {
            return;
        }

        const button = foundButton.tag('component');
        let container = button.contentContainer;
        if(!container) {
            const foundContainer = this.container.querySelector(':scope > .app-ui-component:nth-child(' + index + ')');
            container = foundContainer?.tag('component');
        }

        button.AddClass('tab-selected');
        if(container) {        
            container.shown = true;
            container.AddClass('tab-selected');
        }

        if(currentSelection != newIndex) {
            
            this.Dispatch('Changed', {newIndex: newIndex, oldIndex: currentSelection, tab: button, container: container});
            // @deprecation warning !!
            this.Dispatch('SelectionChanged', {newIndex: newIndex, oldIndex: currentSelection, tab: button, container: container});
            
        }

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

        this.Children(componentHeaderButton.name, componentHeaderButton);
        componentContainer && this.Children(componentContainer.name, componentContainer);

        componentHeaderButton.AddHandler('Clicked', (event, args) => this.Dispatch('TabClicked', {domEvent: args.domEvent, tab: event.sender}));
        return componentContainer;
    }


    /**
     * Array of tab components
     * @type {Array}
     * @readonly
     */
    get components() {

        let ret = {};
        this.ForEach((name, component) => {
            if(this.container && this.container.contains(component.container)) {
                ret[name] = component;
            }
        });
        return ret;

    }

    /**
     * Array of tab buttons
     * @type {Array}
     * @readonly
     */
    get buttons() {

        let ret = {};
        this.ForEach((name, component) => {
            if(this.container && this.header.contains(component.container)) {
                ret[name] = component;
            }
        });
        return ret;

    }

    /**
     * Clear tab buttons and containers
     */
    Clear() {
        Object.forEach(this.buttons, (name, button) => {
            button.Dispose();
        });
        Object.forEach(this.components, (name, component) => {
            component.Dispose();
        });
    }

}