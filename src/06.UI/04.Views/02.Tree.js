Colibri.UI.Tree = class extends Colibri.UI.Component {

    _selected = null;

    constructor(name, container) {
        super(name, container, '<div />');

        this._allNodes = [];

        this._nodes = new Colibri.UI.TreeNodes('nodes', this);
        this._nodes.tree = this;
        this.AddClass('app-ui-tree-component');

        this._handleEvents();
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('NodeExpanded', false, 'Поднимается, когда ветка дерева раскрывается');
        this.RegisterEvent('NodeCollapsed', false, 'Поднимается, когда ветка дерева закрывается');
        this.RegisterEvent('SelectionChanged', false, 'Поднимается, когда ментяется выбранный элемент');
    }

    _handleEvents() {
        this.AddHandler('Clicked', (sender, args) => {
            this.UnselectedAll();
            this.Dispatch('SelectionChanged', {node: null});
        });
    }

    get nodes() {
        return this._nodes;
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
        this.UnselectedAll();
        node.selected = true;
        this._selected = node;
        this.Dispatch('SelectionChanged', {node: node});
    }

    UnselectedAll() {
        this._element.querySelectorAll('.selected').forEach(selected => selected.classList.remove('selected'));
        this._selected = null;
    }

    get selected() {
        return this._selected;
    }

    set selected(node) {
        this.Select(node);
    }

    get allNodes() {
        return this._allNodes;
    }

    FindNode(name) {
        let found = null;
        this._allNodes.forEach((node) => {
            if(node.name == name) {
                found = node;
                return false;
            }
            return true;
        });
        return found;
    }

    _createContextMenuButton() {
        if(!this._hasContextMenu || this.Children(this._name + '-contextmenu-icon-parent')) {
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
            contextMenuParent.container.css('bottom', (-1 * this.scrollTop) + 'px');
        }); 

    }

    _removeContextMenuButton() {
        if(this._hasContextMenu && this.Children(this._name + '-contextmenu-icon-parent')) {
            this.Children(this._name + '-contextmenu-icon-parent').Dispose();
            this.RemoveClass('app-component-hascontextmenu');
        }
    }

}

Colibri.UI.TreeNode = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<div><div><em class="expander"></em><em class="icon none"></em><span></span></div></div>');
        this._nodes = new Colibri.UI.TreeNodes('nodes', this);
        this._nodes.tree = container.tree;

        this._handleEvents();

        this.AddClass('node');
        this.Show();

        this.hasContextMenu = container.tree.hasContextMenu;
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
        this.RegisterEvent('Expanded', false, 'Поднимается, когда ветка дерева раскрывается');
        this.RegisterEvent('Collapsed', false, 'Поднимается, когда ветка дерева закрывается');
    }

    _handleEvents() {
        this.AddHandler('Clicked', (sender, args) => {
            if(this._element.querySelector('div>em.expander') === args.domEvent.target) {
                this.expanded = !this.expanded;
            } else {
                this._nodes.tree.Select(this);
            }
            args.domEvent.stopPropagation();
            return false;
        });

        this.AddHandler('ContextMenuItemClicked', (event, args) => this._nodes.tree.Dispatch('ContextMenuItemClicked', Object.assign({item: this}, args)));

    }

    _bindHtmlEvents() {
        super._bindHtmlEvents();
    }

    Dispose() {
        this._nodes.Dispose();
        super.Dispose();
    }

    get expanded() {
        return this._element.classList.contains('expanded');
    }

    set expanded(value) {
        if(value) {
            this._element.classList.add('expanded');
            this.Dispatch('Expanded', {node: this._element});
        }
        else {
            this._element.classList.remove('expanded');
            this.Dispatch('Collapsed', {node: this._element});
        }
    }

    get nodes() {
        return this._nodes;
    }

    get text() {
        return this._element.querySelector('div span').innerHTML;
    }

    set text(value) {
        this._element.querySelector('div span').innerHTML = value;
    }

    get isLeaf() {
        return this._element.classList.contains('is-leaf');
    }

    set isLeaf(value) {
        if (value) {
            this._element.classList.add('is-leaf');
        } else {
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
        return this.parent.parent;
    }

    set parentNode(value) {
        this.parent.Children(this.name, null);
        this.Disconnect();
        value.nodes.Add(this);
        this.ConnectTo(value.nodes.container);
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
}

Colibri.UI.TreeNodes = class extends Colibri.UI.Component {

    _tree = null;

    constructor(name, container) {
        super(name, container, '<div />');
        this.AddClass('nodes');
        this.Show();
    }

    Add(name) {
        const node = new Colibri.UI.TreeNode(name || 'node', this);
        node.AddHandler('Expanded', (event, args) => { return this._tree.Dispatch('NodeExpanded', {node: event.sender}); });
        node.AddHandler('Collapsed', (event, args) => { return this._tree.Dispatch('NodeCollapsed', {node: event.sender}); });
        this._tree.allNodes.push(node);
        return node;
    }

    Dispose() {
        this.ForEach((nodeName, node) => {
            node.Dispose();
        });
        super.Dispose();
    }

    get tree() {
        return this._tree;
    }

    set tree(value) {
        this._tree = value;
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
}

Colibri.UI.Tree.JsonRenderer = class extends Colibri.UI.Renderer {

    Render() {

        this._data = Object.values(this._data);
        this._data.forEach((node) => {

            const n = this._object.nodes.Add(node.permission)
            n.text = node.title;

            if(node.children && Object.countKeys(node.children) > 0) {
                Colibri.Common.Delay(100).then(() => {
                    const renderer = new Colibri.UI.Tree.JsonRenderer(n, node.children);
                    renderer.Render();
                });
            }
            else {
                n.isLeaf = true;
            }

        });

    }
}
