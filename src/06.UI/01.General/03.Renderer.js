/**
 * Base renderer class
 * @class
 * @memberof Colibri.UI
 */
Colibri.UI.Renderer = class extends Destructable {

    /**
     * @constructor
     * @param {Colibri.UI.Component} object Component for rendering
     * @param {*} data Data for rendering
     */
    constructor(object, data) {
        super();
        
        if (!object) {
            throw new Error('#{ui-renderer-error1}');
        }

        if (!(object instanceof Colibri.UI.Component)) {
            throw new Error('#{ui-renderer-error2}');
        }

        if (!data) {
            throw new Error('#{ui-renderer-error3}');
        }

        this._object = object;
        this._data = data;

    }

    /**
     * @description Run render process, must be overloaded
     */
    Render() {
        throw new Error('#{ui-renderer-error4}');
    }


}