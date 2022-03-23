Colibri.UI.Renderer = class {

    constructor(object, data) {

        if (!object) {
            throw new Error('Передайте в конструктор обьект для рендеринга');
        }

        if (!(object instanceof Colibri.UI.Component)) {
            throw new Error('Передайнный обьект не компонент');
        }

        if (!data) {
            throw new Error('Передайте данные для отображения');
        }

        this._object = object;
        this._data = data;

    }

    Render() {
        throw new Error('Необходимо переопределить этот метод');
    }


}