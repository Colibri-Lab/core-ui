Colibri.UI.Renderer = class {

    constructor(object, data) {

        if (!object) {
            throw new Error('#{app-renderer-error1;Передайте в конструктор обьект для рендеринга}');
        }

        if (!(object instanceof Colibri.UI.Component)) {
            throw new Error('#{app-renderer-error2;Передайнный обьект не компонент}');
        }

        if (!data) {
            throw new Error('#{app-renderer-error3;Передайте данные для отображения}');
        }

        this._object = object;
        this._data = data;

    }

    Render() {
        throw new Error('#{app-renderer-error4;Необходимо переопределить этот метод}');
    }


}