Colibri.UI.Renderer = class extends Destructable {

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

    Render() {
        throw new Error('#{ui-renderer-error4}');
    }


}