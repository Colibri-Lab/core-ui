/**
 * Tree renderer from JSON data
 * @class
 * @extends Colibri.UI.Renderer
 * @memberof Colibri.UI.Tree
 * @example
 * ```
 * const data = {
 *      'node1': {
 *          'permission': 'node1',
 *          'title': 'Node 1',
 *          'children': {
 *              'node1.1': {
 *                  'permission': 'node1.1',
 *                  'title': 'Node 1.1'
 *              },
 *              'node1.2': {
 *                  'permission': 'node1.2',
 *                  'title': 'Node 1.2'
 *              }
 *          }
 *      },
 *      'node2': {
 *          'permission': 'node2',
 *          'title': 'Node 2'
 *      }
 * };
 *
 * const tree = new Colibri.UI.Tree(this._element, data);   
 * const renderer = new Colibri.UI.Tree.JsonRenderer(tree, data);
 * 
 * ```
 */
Colibri.UI.Tree.JsonRenderer = class extends Colibri.UI.Renderer {

    /**
     * Render data in renderer as nodes
     * @public
     */
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