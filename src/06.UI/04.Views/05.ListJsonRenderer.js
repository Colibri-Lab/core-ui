/**
 * @class
 * @extends Colibri.UI.Renderer
 * @memberof Colibri.UI.List
 */
Colibri.UI.List.JsonRenderer = class extends Colibri.UI.Renderer {

    /**
     * Render data in renderer as list items
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
