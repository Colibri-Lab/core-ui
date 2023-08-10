/**
 * 
 * Класс компонент вкладки
 * 
 * Использовать в шаблоне, например
 * @example
 * 
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
 * Использовать как класс
 * @example
 * 
 * const tabs = new Colibri.UI.Tabs('name', document.body);
 * tabs.AddTab(new Colibri.UI.Button('tab1-button', this.header), new Colibri.UI.Pane('tab1-content', this.container));
 * tabs.AddTab(new Colibri.UI.Button('tab2-button', this.header), new Colibri.UI.Pane('tab2-content', this.container));
 * 
 */
Colibri.UI.Tabs = class extends Colibri.UI.Component {

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

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('TabClicked', false, 'Когда кликнули на вкладку');
        this.RegisterEvent('SelectionChanged', false, 'Когда выбранная вкладка изменилась');
    }

    _processEvents() {
        const buttons = this.header.querySelectorAll(':scope > .app-ui-component');
        buttons.forEach((button) => button.tag('component').AddHandler('Clicked', (event, args) => this.Dispatch('TabClicked', {domEvent: args.domEvent, tab: event.sender})));
    }

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
            this.Dispatch('SelectionChanged', {newIndex: newIndex, oldIndex: currentSelection, tab: button, container: container});
        }

    }

    /**
     * @type {Element}
     */
    get headerContainer() {
        return this._element.querySelector(':scope > .tabs-header-container');
    }

    /**
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
     * @type {Element}
     * @readonly
     */
    get header() {
        return this._element.querySelector(':scope > .tabs-header-container > .tabs-header');
    }

    /**
     * @type {Element}
     * @readonly
     */
    get links() {
        return this._element.querySelector(':scope > .tabs-header-container > .tabs-links');
    }

    /**
     * @type {Element}
     * @readonly
     */
    get container() {
        return this._element.querySelector(':scope > .tabs-container');
    }

    /**
     * @type {Number}
     */
    get selectedIndex() {
        return this.header.querySelector('.tab-selected') ? this.header.querySelector('.tab-selected').index() : null;
    }

    /**
     * @type {Number}
     */
    set selectedIndex(value) {
        this._selectTab(value);
    }

    /**
     * @type {String}
     */
    get selectedTab() {
        return this.header.querySelector('.tab-selected') ? this.header.querySelector('.tab-selected').dataset.objectName : null;
    }

    /**
     * @type {String}
     */
    set selectedTab(value) {
        const selectedTabIndex = this.header.querySelector('[data-object-name="' + value + '"]') ? this.header.querySelector('[data-object-name="' + value + '"]').index() : null;
        this.selectedIndex = selectedTabIndex;
    }

    /**
     * @type {Colibri.UI.Component}
     * @readonly
     */
    get selectedContainer() {
        const components = this.components;
        return components[Object.keys(components)[this.selectedIndex]];
    }

    /**
     * @type {Number}
     * @readonly
     */
    get tabsCount() {
        return this._element.querySelectorAll(':scope > .tabs-header-container > .tabs-header > *').length;
    }

    AddTab(componentHeaderButton, componentContainer) {

        componentHeaderButton.contentContainer = componentContainer;

        this.Children(componentHeaderButton.name, componentHeaderButton);
        componentContainer && this.Children(componentContainer.name, componentContainer);

        componentHeaderButton.AddHandler('Clicked', (event, args) => this.Dispatch('TabClicked', {domEvent: args.domEvent, tab: event.sender}));
        return componentContainer;
    }


    /**
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

    Clear() {
        Object.forEach(this.buttons, (name, button) => {
            button.Dispose();
        });
        Object.forEach(this.components, (name, component) => {
            component.Dispose();
        });
    }

}