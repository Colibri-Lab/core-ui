/**
 * Node for tree component
 * @class
 * @namespace
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.TreeNode = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
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

    /**
     * @ignore 
     * @protected 
     */
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
            contextMenuIcon.AddHandler('Clicked', this.__contextMenuIconClicked, false, this);
        }
        
    }

    /**
     * @ignore 
     * @protected 
     */
    _removeContextMenuButton() {
        if(this._hasContextMenu && this.Children(this._name + '-contextmenu-icon-parent')) {
            this.Children(this._name + '-contextmenu-icon-parent').Dispose();
            this.container.querySelector('div').classList.remove('app-component-hascontextmenu');
        }
    }

    /**
     * @ignore 
     * @protected 
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Expanding', false, 'When node is expanding');
        this.RegisterEvent('Expanded', false, 'When node is expanded');
        this.RegisterEvent('Collapsing', false, 'When node is collapsing');
        this.RegisterEvent('Collapsed', false, 'When node is collapsed');
        this.RegisterEvent('CheckChanged', false, 'When multiple check changed');
    }
    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @returns {boolean}
     */
    __thisClicked(sender, args) {
        if(this._element.querySelector('div>em.expander') === args.domEvent.target) {
            this.expanded = !this.expanded;
        } else {
            const isIconClicked = args.domEvent.target.closest('em.icon') != null
            if(this._nodes.tree.Dispatch('NodeClicked', Object.assign({item: this, clickedOnIcon: isIconClicked}, args)) !== false) {
                this._nodes.tree.Select(this);
            }
            if(this.tree.expandOnClick) {
                this.expanded = true;
            }
        }
        args.domEvent.stopPropagation();
        return false;
    }
    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @returns {boolean}
     */
    __thisDoubleClicked(sender, args) {
        const isIconClicked = args.domEvent.target.closest('em.icon') != null;
        if(this._element.querySelector('div>em.expander') !== args.domEvent.target) {
            this._nodes.tree.Dispatch('NodeDoubleClicked', Object.assign({item: this, clickedOnIcon: isIconClicked}, args));
        }
        args.domEvent.stopPropagation();
        return false;
    }
    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @returns {boolean}
     */
    __thisContextMenuItemClicked(event, args) {
        this._nodes.tree.Dispatch('ContextMenuItemClicked', Object.assign({item: this}, args));
    }
    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @returns {boolean}
     */
    __contextMenuIconClicked(event, args) {
        this.parent.tree.Dispatch('ContextMenuIconClicked', Object.assign({item: this}, args));
    }
    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @returns {boolean}
     */
    __thisDoubleClicked2(event, args) {
    
        if(this._editable) {
            this.__nodeEditableStart(event, args);
        }
        else {
            this._nodes.tree.Dispatch('DoubleClicked', Object.assign({item: this}, args));
        }
        
        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
    }

    /**
     * @ignore 
     * @protected 
     */
    _handleEvents() {
        this.AddHandler('Clicked', this.__thisClicked);
        this.AddHandler('DoubleClicked', this.__thisDoubleClicked);

        this.AddHandler('ContextMenuItemClicked', this.__thisContextMenuItemClicked);
        this.AddHandler('DoubleClicked', this.__thisDoubleClicked2);

    }

    /**
     * @ignore 
     * @protected 
     */
    _bindHtmlEvents() {
        super._bindHtmlEvents();
    }

    /**
     * Ensures node is visible
     * @param {Colibri.UI.TreeNode} p node or tree (parent) that scrolls
     * @param {boolean} top if true, node will be on top of tree
     * @param {boolean} hr if true, node will be in horizontal center of tree
     * @public
     */
    EnsureVisible(p = null, top = null, hr = false) {
        let parent = this.parentNode;
        while(parent) {
            if(this.parentNode && this.parentNode.Expand) {
                this.parentNode.Expand();
            }
            parent = parent?.parentNode;
        }
        super.EnsureVisible(p || this.tree, top, hr);
    }

    /**
     * Disposes the node and its children
     * @public
     */
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

    /**
     * Node is expanded
     * @type {boolean}
     */
    get expanded() {
        return this._element.classList.contains('expanded');
    }

    /**
     * Node is expanded
     * @type {boolean}
     */
    set expanded(value) {
        if(value) {
            this.Dispatch('Expanding', {node: this._element});
            this._element.classList.add('expanded');
            if(this.tree.removeHiddenNodes) {
                this.nodes.Retreive();
            } 
            this.Dispatch('Expanded', {node: this._element});
        }
        else {
            this.Dispatch('Collapsing', {node: this._element});
            this._element.classList.remove('expanded');
            if(this.tree.removeHiddenNodes) {
                this.nodes.KeepInMind();
            }
            this.Dispatch('Collapsed', {node: this._element});
        }
    }

    /**
     * Node is expanded
     * @type {Colibri.UI.TreeNodes}
     */
    get nodes() {
        return this._nodes;
    }

    /**
     * Node text
     * @type {string}
     */
    get text() {
        return this._text.html();
    }

    /**
     * Node text
     * @type {string}
     */
    set text(value) {
        this._text.html(value);
    }

    /**
     * Node is leaf
     * @type {boolean}
     */
    get isLeaf() {
        return this._element.classList.contains('is-leaf');
    }

    /**
     * Node is leaf
     * @type {boolean}
     */
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

    /**
     * Node icon
     * @type {string}
     */
    get icon() {
        return this._element.querySelector('div em.icon').html();
    }

    /**
     * Node icon
     * @type {string}
     */
    set icon(value) {
        this._element.querySelector('div em.icon').html(value);
    }
    /**
     * Node icon
     * @type {string}
     */
    get iconElement() {
        return this._element.querySelector('div em.icon');
    }

    /**
     * Node is selected
     * @type {boolean}
     */
    get selected() {
        this._element.querySelector('div').classList.add('selected');
    }

    /**
     * Node is selected
     * @type {boolean}
     */
    set selected(value) {
        if(value) {
            this._element.querySelector('div').classList.add('selected');
        }
        else {
            this._element.querySelector('div').classList.remove('selected');
        }
    }

    /**
     * Node path
     * @type {string}
     */
    get path() {
        return super.path.replaceAll('nodes/', '');
    }

    /**
     * Parent node
     * @type {Colibri.UI.TreeNode}
     */
    get parentNode() {
        return this?.parent?.parent ?? null;
    }

    /**
     * Parent node
     * @type {Colibri.UI.TreeNode}
     */
    set parentNode(value) {
        const node = this.parentNode;
        
        this.parent.Children(this.name, null);
        this.Disconnect();
        value.nodes.Children(this.name, this);
        this.ConnectTo(value.nodes.container);

        value.isLeaf = false;
        node.isLeaf = node.nodes.children == 0;
    }

    /**
     * Searches for node with search method
     * @param {Function} method method to compare node
     * @returns {Colibri.UI.TreeNode}
     * @public
     */
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

    /**
     * Checks if node is parent of another node
     * @param {Colibri.UI.TreeNode} node node to check
     * @returns {boolean}
     * @public
     */
    isParentOf(node) {
        const found = node.FindParent((p) => p === this);
        return found !== null;
    }

    /**
     * Move to new parent node
     * @param {Colibri.UI.TreeNode} parent new parent node
     * @public
     */
    MoveTo(parent) {
        this.parentNode = parent;
    }

    /**
     * Expand node
     * @public
     */
    Expand() {
        this.expanded = true;
    }

    /**
     * Collapse node
     * @public
     */
    Collapse() {
        this.expanded = false;
    }

    /**
     * Expand all child nodes
     * @public
     */
    ExpandAll() {
        this.Expand();
        this.nodes.Expand();
    }

    /**
     * Collapse all child nodes
     * @public
     */
    CollapseAll() {
        this.Collapse();
        this.nodes.Collapse();
    }

    /**
     * Run editor of node
     * @public
     */
    Edit() {
        this.tree.selected = this;
        this.__nodeEditableStart(null, null);
    }

    /**
     * Shows all child nodes and itself
     * @public
     */
    ShowAll() {
        this.Show();
        const childs = this.nodes.Children();
        for(const child of childs) {
            if(child instanceof Colibri.UI.TreeNode) {
                child.ShowAll();
            }
        }        
    }

    /**
     * Hides all child nodes and itself
     * @public
     */
    HideAll() {
        this.Hide();
        const childs = this.nodes.Children();
        for(const child of childs) {
            if(child instanceof Colibri.UI.TreeNode) {
                child.HideAll();
            }
        }        
    }

    /**
     * Tree component
     * @type {Colibri.UI.Tree}
     */
    get tree() {
        return this?.parent?.tree;
    }

    /**
     * Is node editable
     * @type {boolean}
     */
    get editable() {
        return this._editable;
    }

    /**
     * Is node editable
     * @type {boolean}
     */
    set editable(value) {
        this._editable = value;
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
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
                this._checkBox.AddHandler('Changed', this.__checkChanged, false, this);
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
     * Has checkbox
     * @type {Boolean}
     */
    get hasCheckbox() {
        return this._hasCheckbox;
    }
    /**
     * Has checkbox
     * @type {Boolean}
     */
    set hasCheckbox(value) {
        this._hasCheckbox = value;
        this._showHasCheckbox();
    }
    /**
     * @ignore
     * @private
     */
    _showHasCheckbox() {
        if(this._hasCheckbox) {
            this._check.showElement();   
            if(!this._checkBox) {
                this._checkBox = new Colibri.UI.Checkbox('checkbox', this._check);
                this._checkBox.parent = this;
                this._checkBox.shown = true;
                this._checkBox.AddHandler('Changed', this.__checkChanged, false, this);
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
            this.tree.PerformCheckState(this);
        }
    }

    /**
     * Checkbox of node
     * @type {Colibri.UI.Checkbox}
     */
    get checkBox() {
        return this._checkBox;
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __checkChanged(event, args) {
        if(!this.isLeaf) {
            this.nodes.ForEach((name, node) => {
                node.checkBox.checked = this._checkBox.checked;
            });
        }
        this.tree.PerformCheckState(this);
        this.tree.Dispatch('CheckChanged', args);
    }

    
    /**
     * Founded string in search operation
     * @type {String}
     */
    get found() {
        return this._found;
    }
    /**
     * Founded string in search operation
     * @type {String}
     */
    set found(value) {
        this._found = value;
        this._showFound();
    }
    /**
     * @ignore
     * @private
     */
    _showFound() {
        if(!this._found) {
            this.text = this.text.replaceAll('<mark>', '').replaceAll('</mark>', '');
        } else {
            this.text = this.text.highliteTextInHtml(this._found);
        }
    }


}
