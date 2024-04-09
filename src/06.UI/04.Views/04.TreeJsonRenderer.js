/**
 * @class
 * @extends Colibri.UI.Renderer
 * @memberof Colibri.UI.Tree
 */
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