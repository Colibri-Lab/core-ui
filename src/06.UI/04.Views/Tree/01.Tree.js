/**
 * @class
 * @namespace
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const tree = new Colibri.UI.Tree('tree', this);
 * tree.hasSearchBox = true;
 * tree.hasTreeContextMenu = true;
 * tree.dropable = true;
 * tree.draggable = true;
 * tree.sorting = true;
 * tree.expandOnClick = true;
 * 
 * const node1 = tree.nodes.Add('node1');
 * node1.text = 'Node 1';
 * node1.icon = 'folder';
 * node1.multiple = true;   
 * const node2 = node1.nodes.Add('node2');
 * node2.text = 'Node 2';
 * node2.icon = 'folder';
 * node2.multiple = true;   
 * const node3 = node1.nodes.Add('node3');
 * node3.text = 'Node 3';
 * node3.icon = 'folder';
 * node3.multiple = true;   
 * 
 * in html template
 * 
 * <Tree name="tree" hasSearchBox="true" hasTreeContextMenu="true" dropable="true" draggable="true" sorting="true" expandOnClick="true">
 * 
 * then in js
 * 
 * const tree = this.Children('tree');
 * 
 * ```
 */
Colibri.UI.Tree = class extends Colibri.UI.Component {

    /** @type {Colibri.UI.TreeNode|null} */
    _selected = null;

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container) {
        super(name, container, Element.create('div'));

        this._allNodes = new Set();

        this._nodes = new Colibri.UI.TreeNodes('nodes', this, this);
        this.AddClass('app-ui-tree-component');

        // this.AddHandler('ScrollStarted', this.__thisScrollStarted);
        // this.AddHandler('ScrollEnded', this.__thisScrollEnded);

        this._handleEvents();
    }

    __thisScrollStarted(event, args) {
        if(this.hasSearchBox) {
            this._searchBox.shown = false;
        }
    }

    __thisScrollEnded(event, args) {
        if(this.hasSearchBox) {
            this._searchBox.top = this.scrollTop;
            this._searchBox.shown = true;
        }
    }

    /**
     * @ignore 
     * @protected 
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('NodeExpanding', false, 'When node is expanding');
        this.RegisterEvent('NodeExpanded', false, 'When node is expanded');
        this.RegisterEvent('NodeCollapsing', false, 'When node is collapsing');
        this.RegisterEvent('NodeCollapsed', false, 'When node is collapsed');
        this.RegisterEvent('SelectionChanged', false, 'When selection is changed');
        this.RegisterEvent('NodeEditCompleted', false, 'When node editing is complete');
        this.RegisterEvent('NodeClicked', false, 'When node is clicked');
        this.RegisterEvent('NodeDoubleClicked', false, 'When node is double clicked');
        this.RegisterEvent('CheckChanged', false, 'When node checkbox is changed');
        this.RegisterEvent('Searched', false, 'When is searched');
    }

    /**
     * @ignore 
     * @protected 
     */
    _handleEvents() {
        this.AddHandler('Clicked', (sender, args) => {
            this.ClearSelection();
            this.Dispatch('SelectionChanged', {node: null});
        });
    }

    /** 
     * Tree nodes object
     * @type {Colibri.UI.TreeNodes} 
     */
    get nodes() {
        return this._nodes;
    }

    /**
     * Searches for nodes
     * @param {string} term term to search in nodes
     * @param {boolean} asAjar return nodes ajar
     */
    Search(term, asAjar = false, filterCallback = null) {

        if(this.searchBoxUseEvent) {
            this.Dispatch('Searched', {term: term, asAjar: asAjar});
        } else {
            if(!term) {
                this.allNodes.forEach((node) => {
                    node.found = null;
                    node.Show();
                });    
            }
            else {
                this.allNodes.forEach((node) => {
                    node.found = null;
                });    
                if(!filterCallback) {
                    filterCallback = (node, term) => node.text.toLowerCase().indexOf(term.toLowerCase()) !== -1;
                }
                this.allNodes.forEach((node) => {
                    if(!filterCallback(node, term)) {
                        node.Hide();
                    } else {
                        let p = node.parentNode;
                        while(p) {
                            p.Show();
                            p = p.parentNode;
                        }
                        node.found = term;
                        node.Show();
                    }
                }); 
            }
            if(asAjar) {
                this.allNodes.forEach((node) => {
                    if(node.found) {
                        node.ShowAll();
                    }
                });    
                this.ExpandAll();
            }
        }

        
    }

    /**
     * Expand all nodes
     */
    ExpandAll() {
        this.nodes.ForEach((nodeName, node) => {
            node.ExpandAll();
        })
    }

    /**
     * Collapse all nodes
     */
    CollapseAll() {
        this.nodes.ForEach((nodeName, node) => {
            node.CollapseAll();
        })
    }

    /**
     * Select node
     */
    Select(node) {
        const isChanged = node !== this._selected;
        this.ClearSelection();
        this._selected = node;
        if(node !== null) {
            node.selected = true;
        }
        if(isChanged) {
            this.Dispatch('SelectionChanged', {node: node});
        }
    }

    /**
     * Clear selection on all nodes
     */
    ClearSelection() {
        this._element.querySelectorAll('.selected').forEach(selected => selected.classList.remove('selected'));
        this._selected = null;
    }

    /** 
     * Selected node
     * @type {Colibri.UI.TreeNode} 
     */
    get selected() {
        return this._selected;
    }

    /** 
     * Selected node
     * @type {Colibri.UI.TreeNode} 
     */
    set selected(node) {
        if(typeof node === 'string') {
            node = this.FindByPath(node);
        }
        this.Select(node);
    }

    /**
     * Array of checks
     * @type {Array}
     */
    get checked() {
        return Array.from(this.allNodes).filter(v => v.checked == true);
    }
    /**
     * Array of checks
     * @type {Array}
     */
    set checked(value) {
        for(let v of value) {
            if(typeof v === 'string') {
                v = this.FindByPath(v);
            }
            v.checked = true;
        }
        
    }

    /**
     * All nodes set
     * @type {Set}
     */
    get allNodes() {
        return this._allNodes;
    }

    /**
     * Returns node by name or null
     * @param {string} name name of node
     * @returns {Colibri.UI.TreeNode|null}
     */
    FindNode(name) {
        for(const node of this._allNodes) {
            if(node.name == name) {
                return node;
            }
        }
        return null;
    }

    /**
     * Returns node by path or null
     * @param {string} nodePath nodePath of node
     * @returns {Colibri.UI.TreeNode|null}
     */
    FindByPath(nodePath) {
        nodePath = nodePath.split('/');
        let parent = this;
        for(const n of nodePath) {
            parent = parent.nodes.Children(n);
            if(!parent) {
                break;
            }
        }
        return parent;
    }

    /**
     * Is tree has context menu
     * @type {boolean}
     */
    get hasTreeContextMenu() {
        return this._hasTreeContextMenu;
    }

    /**
     * Is tree has context menu
     * @type {boolean}
     */
    set hasTreeContextMenu(value) {
        this._hasTreeContextMenu = value === true || value === 'true';
        this._createContextMenuButton();
    }

    /** 
     * @ignore
     * @private 
     */
    _createContextMenuButton() {
        if(!this._hasTreeContextMenu || !this._hasContextMenu || this.Children(this._name + '-contextmenu-icon-parent')) {
            return;
        }

        this.AddClass('app-component-hascontextmenu');

        const contextMenuParent = new Colibri.UI.Pane(this._name + '-contextmenu-icon-parent', this);
        contextMenuParent.parent = this;
        contextMenuParent.AddClass('app-contextmenu-icon-component');
        contextMenuParent.shown = true;
        this.Children(this._name + '-contextmenu-icon-parent', contextMenuParent);

        const contextMenuIcon = new Colibri.UI.Icon(this._name + '-contextmenu-icon', contextMenuParent);
        contextMenuIcon.shown = true;
        contextMenuIcon.value = Colibri.UI.ContextMenuIcon;
        contextMenuIcon.AddHandler('Clicked', this.__thisContextMenuItemClicked, false, this);    

        this.AddHandler('Scrolled', this.__thisScrolled); 
        this.Dispatch('Scrolled');

    }

    __thisContextMenuItemClicked(event, args) {
        this.Dispatch('ContextMenuIconClicked', args);
    }

    __thisScrolled(event, args) {
        this.Children(this._name + '-contextmenu-icon-parent')?.container?.css('bottom', (-1 * this.scrollTop + 10) + 'px');
    }

    /** 
     * @ignore
     * @private 
     */
    _removeContextMenuButton() {
        if(this._hasTreeContextMenu && this._hasContextMenu && this.Children(this._name + '-contextmenu-icon-parent')) {
            this.Children(this._name + '-contextmenu-icon-parent').Dispose();
            this.RemoveClass('app-component-hascontextmenu');
        }
    }

    /**
     * Is tree is dropable
     * @type {boolean}
     */
    get dropable() {
        return this._dropable;
    }

    /**
     * Is tree is dropable
     * @type {boolean}
     */
    set dropable(value) {
        this._dropable = value;
    }

    /**
     * Is tree is draggable
     * @type {boolean}
     */    
    get draggable() {
        return this._draggable;
    }

    /**
     * Is tree is draggable
     * @type {boolean}
     */    
    set draggable(value) {
        this._draggable = value;
    }

    /**
     * Is tree is sortable
     * @type {boolean}
     */    
    get sorting() {
        return this._sorting;
    }

    /**
     * Is tree is sortable
     * @type {boolean}
     */    
    set sorting(value) {
        this._sorting = value;
        this._setSorting();
    }

    /** 
     * @ignore
     * @private 
     */
    _setSorting() {
        if(this._sorting) {
            this.AddClass('-sortable');
        }
        else {
            this.RemoveClass('-sortable');
        }
    }
    
    /**
     * Expand node on click
     * @type {Boolean}
     */
    get expandOnClick() {
        return this._expandOnClick;
    }
    /**
     * Expand node on click
     * @type {Boolean}
     */
    set expandOnClick(value) {
        this._expandOnClick = value === true || value === 'true';
    }

    /**
     * Value Array
     * @type {Array}
     */
    set value(value) {
        this.nodes.value = value;
    }

    /**
     * Value Array
     * @type {Array}
     */
    get value() {
        return this.nodes.value;
    }

    /**
     * Multiple selection
     * @type {Boolean}
     */
    get multiple() {
        return this._multiple;
    }
    /**
     * Multiple selection
     * @type {Boolean}
     */
    set multiple(value) {
        value = this._convertProperty('Boolean', value);
        this._multiple = value;
        this._showMultiple();
    }

    /** 
     * @ignore
     * @private 
     */
    _showMultiple() {
        Array.from(this.allNodes).map(node => node.multiple = this._multiple);
    }

    /**
     * Remove hidden nodes
     * @type {Boolean}
     */
    get removeHiddenNodes() {
        return this._removeHiddenNodes;
    }
    /**
     * Remove hidden nodes
     * @type {Boolean}
     */
    set removeHiddenNodes(value) {
        this._removeHiddenNodes = value;
    }

    /**
     * sets thrid or full state of parent checks  
     * @param {Colibri.UI.TreeNode} node node to check
     */
    PerformCheckState(node) {
        
        this._allNodes.forEach((n, index) => {

            if(n.nodes.children > 0) {
                if(n.nodes.allNodesChecked) {
                    if(n.checkBox) {
                        n.checkBox.checked = true;
                        n.checkBox.thirdState = false;
                    }
                } else if(n.nodes.allNodesUnChecked)  {
                    if(n.checkBox) {
                        n.checkBox.checked = false;
                        n.checkBox.thirdState = false;
                    }
                } else {
                    if(n.checkBox) {
                        n.checkBox.checked = true;
                        n.checkBox.thirdState = true;
                    }
                }
            } 
        });

    }

    /**
     * Has searchbox in top of list
     * @type {Boolean}
     */
    get hasSearchBox() {
        return this._searchBox !== null;
    }
    /**
     * Has searchbox in top of list
     * @type {Boolean}
     */
    set hasSearchBox(value) {
        if(value) {
            this.handleScrollProperties = true;
            this.AddClass('app-component-has-search');
            this._searchBox = new Colibri.UI.Tree.SearchBox(this.name + '-searchbox', this);
            this._searchBox.shown = true;
            this._searchBox.AddHandler('Changed', this.__searchBoxChanged, false, this);
            this._searchBox.MoveTop();
        } else if(this._searchBox) {
            this.handleScrollProperties = false;
            this.RemoveClass('app-component-has-search');
            this._searchBox.Dispose();
            this._searchBox = null;
        }
    }
    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __searchBoxChanged(event, args) {
        this.Search(this._searchBox.value, true, this._searchFilterCallback);
    }

    /**
     * Has search icon in search box
     * @type {Boolean}
     */
    get searchBoxSearchIcon() {
        if(!this._searchBox) {
            return false;
        }
        return this._searchBox.hasIcon;
    }
    /**
     * Has search icon in search box
     * @type {Boolean}
     */
    set searchBoxSearchIcon(value) {
        if(!this._searchBox) {
            return;
        }
        this._searchBox.hasIcon = value;
    }
    
    /**
     * Searchbox placeholder
     * @type {String}
     */
    get searchBoxPlaceholder() {
        if(!this._searchBox) {
            return; 
        }
        return this._searchBox.placeholder;
    }
    /**
     * Searchbox placeholder
     * @type {String}
     */
    set searchBoxPlaceholder(value) {
        if(!this._searchBox) {
            return;
        }
        this._searchBox.placeholder = value;
    }

    /**
     * Filter callback
     * @type {Function}
     */
    get searchFilterCallback() {
        return this._searchFilterCallback;
    }
    /**
     * Filter callback
     * @type {Function}
     */
    set searchFilterCallback(value) {
        this._searchFilterCallback = value;
    }

    /**
     * Use external event on search
     * @type {Boolean}
     */
    get searchBoxUseEvent() {
        return this._searchBoxUseEvent;
    }
    /**
     * Use external event on search
     * @type {Boolean}
     */
    set searchBoxUseEvent(value) {
        this._searchBoxUseEvent = value;
    }

    get searchBoxText() {
        return this._searchBox.value;
    }

    set searchBoxText(value) {
        this._searchBox.value = value;
    }

    /**
     * Sets the focus on searchbox
     */
    FocusOnSearchBox() {
        if(!this._searchBox) {
            return;
        }
        this._searchBox.Focus();
    }

}

