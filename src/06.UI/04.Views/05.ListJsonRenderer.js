/**
 * List renderer for JSON data
 * @class
 * @extends Colibri.UI.Renderer
 * @memberof Colibri.UI.List
 * @example
 * ```
 * const data = {
 *      'group1': {
 *          'name': 'group1',
 *          'label': 'Group 1',
 *          'children': [
 *              {
 *                  'name': 'item1',
 *                  'label': 'Item 1'
 *              },
 *              {
 *                  'name': 'item2',
 *                  'label': 'Item 2'
 *              }
 *          ]
 *      },
 *      'group2': {
 *          'name': 'group2',
 *          'label': 'Group 2',
 *          'children': [
 *              {
 *                  'name': 'item3',
 *                  'label': 'Item 3'
 *              }
 *          ]
 *      }
 * };
 *
 * const list = new Colibri.UI.List(this._element, data);   
 * const renderer = new Colibri.UI.List.JsonRenderer(list, data);
 * ```
 */
Colibri.UI.List.JsonRenderer = class extends Colibri.UI.Renderer {

    /**
     * Render data in renderer as list items
     * @public
     */
    Render() {

        this._data = Object.values(this._data);
        this._data.forEach((grp) => {

            const group = this._object.AddGroup(grp.name, grp.label);
            group.tag = group;
            grp.children && grp.children.forEach((itm) => {
                const item = group.AddItem(itm);
                item.tag = itm;
            });

        });

    }
}
