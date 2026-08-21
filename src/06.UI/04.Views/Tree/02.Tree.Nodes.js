/**
 * Nodes collection for tree component
 * @class
 * @namespace
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.TreeNodes = class extends Colibri.UI.Component {

    /**
     * @private 
     * @type {Colibri.UI.Tree} 
     * @ignore
     */
    _tree = null;

    /**
     * @constructor
     * @param {string} name name of component
     * @param {HTMLElement|Colibri.UI.Component} container container of component 
     */
    constructor(name, container, tree) {
        super(name, container, Element.create('div'));
        this._tree = tree;

        this.AddClass('nodes');
        this.Show();
        

    }
    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @returns {boolean}
     */
    __nodeExpanded(event, args) { 
        return this._tree.Dispatch('NodeExpanded', {node: event.sender}); 
    }
    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @returns {boolean}
     */
    __nodeCollapsed(event, args) { 
        return this._tree.Dispatch('NodeCollapsed', {node: event.sender}); 
    }
    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @returns {boolean}
     */
    __nodeExpanding(event, args) { 
        return this._tree.Dispatch('NodeExpanding', {node: event.sender}); 
    }
    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @returns {boolean}
     */
    __nodeCollapsing(event, args) { 
        return this._tree.Dispatch('NodeCollapsing', {node: event.sender}); 
    }

    /**
     * Adds a new node to nodes collection 
     * @param {string} name name of new node
     * @param {number} index index of new node
     * @returns {Colibri.UI.TreeNode}
     * @public
     */
    Add(name, index) {
        let node = null;
        if(name instanceof Colibri.UI.TreeNode) {
            node = name;
        }
        else {
            node = new Colibri.UI.TreeNode(name || 'node', this);
            node.AddHandler('Expanding', this.__nodeExpanding, false, this);
            node.AddHandler('Expanded', this.__nodeExpanded, false, this);
            node.AddHandler('Collapsing', this.__nodeCollapsing, false, this);    
            node.AddHandler('Collapsed', this.__nodeCollapsed, false, this);    
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

    /**
     * Move node before relation node
     * @param {Colibri.UI.TreeNode} node node to move
     * @param {Colibri.UI.TreeNode} relation node for moving relation
     * @public
     */
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

    /**
     * Dispose nodes collection
     * @public
     */
    Dispose() {
        if(this.parent instanceof Colibri.UI.TreeNode) {
            this.parent.isLeaf = true;
        }
        this.ForEach((nodeName, node) => {
            node.Dispose();
        });
        super.Dispose();
    }

    /**
     * Tree related to nodes collection
     * @type {Colibri.UI.Tree}
     */
    get tree() {
        return this._tree;
    }

    /**
     * Expand nodes
     * @public
     */
    Expand() {
        this.ForEach((nodeName, node) => {
            node.ExpandAll();
        })
    }

    /**
     * Collapse nodes
     * @public
     */
    Collapse() {
        this.ForEach((nodeName, node) => {
            node.Collapse();
        })
    }

    /**
     * Has visible nodes
     * @type {Boolean}
     */
    get hasVisibleNodes() {
        return this.visibleNodesCount > 0
    } 

    /**
     * Visible nodes count
     * @type {Number}
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

    /**
     * Is all nodes checked
     * @type {boolean}
     */
    get allNodesChecked() {

        let checked = 0;
        this.ForEach((name, node) => {
            if(node.checked) {
                checked++;
            }
        });

        return checked === this.children;

    }

    /**
     * Is all nodes unchecked
     * @type {boolean}
     */
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


