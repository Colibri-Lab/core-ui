/**
 * @class
 * @namespace
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.Tree = class extends Colibri.UI.Component {

    /** @type {Colibri.UI.TreeNode|null} */
    _selected = null;

    constructor(name, container) {
        super(name, container, Element.create('div'));

        this._allNodes = new Set();

        this._nodes = new Colibri.UI.TreeNodes('nodes', this, this);
        this.AddClass('app-ui-tree-component');

        this._handleEvents();
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('NodeExpanded', false, 'Поднимается, когда ветка дерева раскрывается');
        this.RegisterEvent('NodeCollapsed', false, 'Поднимается, когда ветка дерева закрывается');
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда ментяется выбранный элемент');
        this.RegisterEvent('NodeEditCompleted', false, 'Поднимается, когда заканчивается редактирование узла');
        this.RegisterEvent('NodeClicked', false, 'Поднимается, когда ткнули в узел');
        this.RegisterEvent('CheckChanged', false, 'When node checkbox is changed');
    }

    _handleEvents() {
        this.AddHandler('Clicked', (sender, args) => {
            this.ClearSelection();
            this.Dispatch('SelectionChanged', {node: null});
        });
    }

    /** @type {Colibri.UI.TreeNodes} */
    get nodes() {
        return this._nodes;
    }

    Search(term, asAjar = false) {
        if(!term) {
            this.allNodes.forEach((node) => node.Show());    
        }
        else {
            this.allNodes.forEach((node) => {
                if(node.text.toLowerCase().indexOf(term.toLowerCase()) === -1) {
                    node.Hide();
                }
                else {
                    let p = node.parentNode;
                    while(p) {
                        p.Show();
                        p = p.parentNode;
                    }
                    if(asAjar) {
                        node.ShowAll();
                    } else {
                        node.Show();
                    }
                }
            }); 
        }
        
    }

    ExpandAll() {
        this.nodes.ForEach((nodeName, node) => {
            node.ExpandAll();
        })
    }

    CollapseAll() {
        this.nodes.ForEach((nodeName, node) => {
            node.CollapseAll();
        })
    }

    Select(node) {
        this.ClearSelection();
        this._selected = node;
        if(node !== null) {
            node.selected = true;
        }
        this.Dispatch('SelectionChanged', {node: node});
    }

    ClearSelection() {
        this._element.querySelectorAll('.selected').forEach(selected => selected.classList.remove('selected'));
        this._selected = null;
    }

    /** @type {Colibri.UI.TreeNode} */
    get selected() {
        return this._selected;
    }

    /**
     * @param {Colibri.UI.TreeNode} node
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
     * @returns {Set}
     */
    get allNodes() {
        return this._allNodes;
    }

    FindNode(name) {
        for(const node of this._allNodes) {
            if(node.name == name) {
                return node;
            }
        }
        return null;
    }

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

    get hasTreeContextMenu() {
        return this._hasTreeContextMenu;
    }

    set hasTreeContextMenu(value) {
        this._hasTreeContextMenu = value === true || value === 'true';
        this._createContextMenuButton();
    }

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
        contextMenuIcon.AddHandler('Clicked', (event, args) => this.Dispatch('ContextMenuIconClicked', args));    

        this.AddHandler('Scrolled', (event, args) => {
            contextMenuParent.container.css('bottom', (-1 * this.scrollTop + 10) + 'px');
        }); 
        this.Dispatch('Scrolled');

    }

    _removeContextMenuButton() {
        if(this._hasTreeContextMenu && this._hasContextMenu && this.Children(this._name + '-contextmenu-icon-parent')) {
            this.Children(this._name + '-contextmenu-icon-parent').Dispose();
            this.RemoveClass('app-component-hascontextmenu');
        }
    }

    
    get dropable() {
        return this._dropable;
    }

    set dropable(value) {
        this._dropable = value;
    }

    
    get draggable() {
        return this._draggable;
    }

    set draggable(value) {
        this._draggable = value;
    }

    get sorting() {
        return this._sorting;
    }
    set sorting(value) {
        this._sorting = value;
        this._setSorting();
    }

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

    // sets thrid or full state of parent checks
    _performCheckState(node) {
        
        this._allNodes.forEach((n, index) => {

            if(n.nodes.children > 0) {
                if(n.nodes.allNodesChecked) {
                    n.checkBox.checked = true;
                    n.checkBox.thirdState = false;
                } else if(n.nodes.allNodesUnChecked)  {
                    n.checkBox.checked = false;
                    n.checkBox.thirdState = false;
                } else {
                    n.checkBox.checked = true;
                    n.checkBox.thirdState = true;
                }
            } 
        });

    }

}

Colibri.UI.TreeNode = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Element.fromHtml('<div><div><dd drop="before"></dd><em class="expander"></em><em class="check"></em><em class="icon none"></em><span></span><input type="text" /><dd drop="after"></dd><span class="node-tip"></span></div></div>')[0]);
        this._nodes = new Colibri.UI.TreeNodes('nodes', this, container.tree);

        this._div = this._element.querySelector(':scope > div');
        this._input = this._element.querySelector('input');
        this._text = this._element.querySelector('div span');
        this._tipSpan = this._element.querySelector(':scope > div > .node-tip');
        this._check = this._element.querySelector(':scope > div > .check');

        this._handleEvents();

        this.AddClass('node');
        this.Show();

        this.hasContextMenu = container.tree.hasContextMenu;
        this.dropable = this.tree.dropable;
        this.draggable = this.tree.draggable;
        this.isLeaf = true;

    }

    _createContextMenuButton() {
        if(!this._hasContextMenu || this.Children(this._name + '-contextmenu-icon-parent')) {
            return;
        }


        const container = this.container.querySelector('div');
        container.classList.add('app-component-hascontextmenu');

        const contextMenuParent = new Colibri.UI.Pane(this._name + '-contextmenu-icon-parent', container);
        contextMenuParent.parent = this;
        contextMenuParent.AddClass('app-contextmenu-icon-component');
        contextMenuParent.shown = true;
        this.Children(this._name + '-contextmenu-icon-parent', contextMenuParent);

        if(this._nodes.tree._recreateNodeIcon) {
            this._nodes.tree._recreateNodeIcon(this);
        }
        else {
            const contextMenuIcon = new Colibri.UI.Icon(this._name + '-contextmenu-icon', contextMenuParent);
            contextMenuIcon.shown = true;
            contextMenuIcon.value = Colibri.UI.ContextMenuIcon;
            contextMenuIcon.AddHandler('Clicked', (event, args) => this.parent.tree.Dispatch('ContextMenuIconClicked', Object.assign({item: this}, args)));    
        }
        
    }

    _removeContextMenuButton() {
        if(this._hasContextMenu && this.Children(this._name + '-contextmenu-icon-parent')) {
            this.Children(this._name + '-contextmenu-icon-parent').Dispose();
            this.container.querySelector('div').classList.remove('app-component-hascontextmenu');
        }
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Expanded', false, 'When node is expanded');
        this.RegisterEvent('Collapsed', false, 'When node is collapsed');
        this.RegisterEvent('CheckChanged', false, 'When multiple check changed');
    }


    _handleEvents() {
        this.AddHandler('Clicked', (sender, args) => {
            if(this._element.querySelector('div>em.expander') === args.domEvent.target) {
                this.expanded = !this.expanded;
            } else {
                if(this._nodes.tree.Dispatch('NodeClicked', Object.assign({item: this}, args)) !== false) {
                    this._nodes.tree.Select(this);
                }
                if(this.tree.expandOnClick) {
                    this.expanded = true;
                }
            }
            args.domEvent.stopPropagation();
            return false;
        });

        this.AddHandler('ContextMenuItemClicked', (event, args) => this._nodes.tree.Dispatch('ContextMenuItemClicked', Object.assign({item: this}, args)));
        this.AddHandler('DoubleClicked', (event, args) => {
            
            if(this._editable) {
                this.__nodeEditableStart(event, args);
            }
            else {
                this._nodes.tree.Dispatch('DoubleClicked', Object.assign({item: this}, args));
            }
            
            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });

    }

    _bindHtmlEvents() {
        super._bindHtmlEvents();
    }

    EnsureVisible() {
        let parent = this.parentNode;
        while(parent) {
            this.parentNode.Expand();
            parent = parent.parentNode;
        }
        super.EnsureVisible();
    }

    Dispose() {
        
        try {
            this.tree.allNodes.delete(this);
        }
        catch(e) {}
        
        const node = this.parentNode;
        this._nodes.Dispose();
        super.Dispose();

        try {
            if(node instanceof Colibri.UI.TreeNode) {
                node.isLeaf = this.parent.children == 0;
            }    
        }
        catch(e) {}

    }

    /**
     * Tooltip text
     * @type {string}
     */
    get toolTip() {
        return this._tipSpan.html();
    }
    /**
     * Tooltip text
     * @type {string}
     */
    set toolTip(value) {
        this._tipSpan.html(value);
    }

    get expanded() {
        return this._element.classList.contains('expanded');
    }

    set expanded(value) {
        if(value) {
            this._element.classList.add('expanded');
            if(this.tree.removeHiddenNodes) {
                this.nodes.Retreive();
            } 
            this.Dispatch('Expanded', {node: this._element});
        }
        else {
            this._element.classList.remove('expanded');
            if(this.tree.removeHiddenNodes) {
                this.nodes.KeepInMind();
            }
            this.Dispatch('Collapsed', {node: this._element});
        }
    }

    get nodes() {
        return this._nodes;
    }

    get text() {
        return this._text.html();
    }

    set text(value) {
        this._text.html(value);
    }

    get isLeaf() {
        return this._element.classList.contains('is-leaf');
    }

    set isLeaf(value) {
        if (value) {
            if(this._multiple && this._checkBox) {
                this._checkBox.hasThirdState = false;
            }
            this._element.classList.add('is-leaf');
        } else {
            if(this._multiple && this._checkBox) {
                this._checkBox.hasThirdState = true;
            }
            this._element.classList.remove('is-leaf');
        }
    }

    get icon() {
        return this._element.querySelector('div em.icon').html();
    }

    set icon(value) {
        this._element.querySelector('div em.icon').html(value);
    }

    get selected() {
        this._element.querySelector('div').classList.add('selected');
    }

    get path() {
        return super.path.replaceAll('nodes/', '');
    }

    set selected(value) {
        if(value) {
            this._element.querySelector('div').classList.add('selected');
        }
        else {
            this._element.querySelector('div').classList.remove('selected');
        }
    }

    get parentNode() {
        return this?.parent?.parent ?? null;
    }

    set parentNode(value) {
        const node = this.parentNode;
        
        this.parent.Children(this.name, null);
        this.Disconnect();
        value.nodes.Children(this.name, this);
        this.ConnectTo(value.nodes.container);

        value.isLeaf = false;
        node.isLeaf = node.nodes.children == 0;
    }

    FindParent(method) {
        let p = this;
        while(p instanceof Colibri.UI.TreeNode) {
            if(method(p)) {
                return p;
            }
            p = p.parentNode;
        }
        return null;
    }

    MoveTo(parent) {
        this.parentNode = parent;
    }

    Expand() {
        this.expanded = true;
    }

    Collapse() {
        this.expanded = false;
    }

    ExpandAll() {
        this.Expand();
        this.nodes.Expand();
    }

    CollapseAll() {
        this.Collapse();
        this.nodes.Collapse();
    }

    Edit() {
        this.tree.selected = this;
        this.__nodeEditableStart(null, null);
    }

    ShowAll() {
        this.Show();
        const childs = this.Children();
        for(const child of childs) {
            child.ShowAll();
        }        
    }

    HideAll() {
        this.Hide();
        const childs = this.Children();
        for(const child of childs) {
            child.HideAll();
        }        
    }

    get tree() {
        return this?.parent?.tree;
    }

    get editable() {
        return this._editable;
    }

    set editable(value) {
        this._editable = value;
    }

    __nodeEditableStart(event, args) {
        if(!this._editable) {
            return true;
        }

        this.AddClass('editing');
        this._input.value = this.text;
        this._input.focus();
        this._input.select();
        const keydownHandler = (e) => {
            if(e.code == 'Enter' || e.code == 'NumpadEnter') {
                if(this.tree.Dispatch('NodeEditCompleted', {value: this._input.value, node: this, mode: 'save'})) {
                    this.text = this._input.value;
                }
                this.RemoveClass('editing');
                this._input.removeEventListener('keydown', keydownHandler);
                this._input.removeEventListener('blur', blurHandler);
            }
            else if(e.code == 'Escape') {
                this.tree.Dispatch('NodeEditCompleted', {value: this.text, node: this, mode: 'cancel'});
                this.RemoveClass('editing');
                this._input.removeEventListener('keydown', keydownHandler);
                this._input.removeEventListener('blur', blurHandler);
            }
        }
        const blurHandler = (e) => {
            this.tree?.Dispatch('NodeEditCompleted', {value: this.text, node: this, mode: 'cancel'});
            this.RemoveClass('editing');
            this._input.removeEventListener('keydown', keydownHandler);
            this._input.removeEventListener('blur', blurHandler);
        }
        this._input.addEventListener('keydown', keydownHandler);
        this._input.addEventListener('blur', blurHandler);
    }

    /**
     * Multiple
     * @type {Boolean}
     */
    get multiple() {
        return this._multiple;
    }
    /**
     * Multiple
     * @type {Boolean}
     */
    set multiple(value) {
        value = this._convertProperty('Boolean', value);
        this._multiple = value;
        if(this._multiple) {
            this._check.showElement();   
            if(!this._checkBox) {
                this._checkBox = new Colibri.UI.Checkbox('checkbox', this._check);
                this._checkBox.parent = this;
                this._checkBox.shown = true;
                this._checkBox.AddHandler('Changed', (event, args) => this.__checkChanged(event, args));
            }
        } else {
            this._check.hideElement();
            if(this._checkBox) {
                this._checkBox.Dispose();
                this._checkBox = null;
            }
        }
    }

    /**
     * Checked
     * @type {Boolean}
     */
    get checked() {
        return this._checkBox ? this._checkBox.checked : false;
    }
    /**
     * Checked
     * @type {Boolean}
     */
    set checked(value) {
        value = this._convertProperty('Boolean', value);
        if(this._checkBox) {
            this._checkBox.checked = value;
            if(!this.isLeaf) {
                this.nodes.ForEach((name, node) => {
                    node.checkBox.checked = this._checkBox.checked;
                });
            }
            this.tree._performCheckState(this);
        }
    }

    get checkBox() {
        return this._checkBox;
    }

    __checkChanged(event, args) {
        if(!this.isLeaf) {
            this.nodes.ForEach((name, node) => {
                node.checkBox.checked = this._checkBox.checked;
            });
        }
        this.tree._performCheckState(this);
        this.tree.Dispatch('CheckChanged', args);
    }


}

Colibri.UI.TreeNodes = class extends Colibri.UI.Component {

    /** @type {Colibri.UI.Tree} */
    _tree = null;

    constructor(name, container, tree) {
        super(name, container, Element.create('div'));
        this._tree = tree;

        this.AddClass('nodes');
        this.Show();
        

    }

    Add(name, index) {
        let node = null;
        if(name instanceof Colibri.UI.TreeNode) {
            node = name;
        }
        else {
            node = new Colibri.UI.TreeNode(name || 'node', this);
            node.AddHandler('Expanded', (event, args) => { return this._tree.Dispatch('NodeExpanded', {node: event.sender}); });
            node.AddHandler('Collapsed', (event, args) => { return this._tree.Dispatch('NodeCollapsed', {node: event.sender}); });    
        }

        if(this.parent instanceof Colibri.UI.TreeNode) {
            this.parent.isLeaf = false;
        }
        this._tree.allNodes.add(node);
        if(index != node.childIndex) {
            this.Children(name, node, index);
        }

        if(this._tree.multiple) {
            node.multiple = this._tree.multiple;
        }

        return node;
    }

    Move(node, relation) {

        let index = relation;
        if(relation instanceof Colibri.UI.TreeNode) {
            this.ForEach((name, n, i) => {
                if(relation.name == name) {
                    index = i;
                    return false;
                }
                return true;
            });
        }

        this.Children(node.name, node, index);


    }

    Dispose() {
        if(this.parent instanceof Colibri.UI.TreeNode) {
            this.parent.isLeaf = true;
        }
        this.ForEach((nodeName, node) => {
            node.Dispose();
        });
        super.Dispose();
    }

    get tree() {
        return this._tree;
    }

    Expand() {
        this.ForEach((nodeName, node) => {
            node.ExpandAll();
        })
    }

    Collapse() {
        this.ForEach((nodeName, node) => {
            node.Collapse();
        })
    }

    /**
     * Has visible nodes
     * @type {Boolean}
     * @readonly
     */
    get hasVisibleNodes() {
        return this.visibleNodesCount > 0
    } 

    /**
     * Visible nodes count
     * @type {Number}
     * @readonly
     */
    get visibleNodesCount() {
        let visibleNodes = 0;
        this.ForEach((name, node) => {
            if(node.shown) {
                visibleNodes++;
            }
        });
        return visibleNodes;
    }

    /**
     * Value Array
     * @type {Array}
     */
    set value(value) {
     
        if(!Array.isArray(value)) {
            value = Object.values(value);
        }

        this.Clear();

        for(const vnode of value) {
            const node = this.Add('node' + vnode.id);
            node.text = this.tree.__renderText ? this.tree.__renderText(vnode) : vnode?.name ?? vnode?.title ?? 'Node ' + vnode.id;
            node.tag = vnode;
            if(vnode.children) {
                node.nodes.value = vnode.children;
            }
        }
        
    }

    get allNodesChecked() {

        let checked = 0;
        this.ForEach((name, node) => {
            if(node.checked) {
                checked++;
            }
        });

        return checked === this.children;

    }
    get allNodesUnChecked() {

        let checked = 0;
        this.ForEach((name, node) => {
            if(node.checked) {
                checked++;
            }
        });

        return checked === 0;

    }

}


