Colibri.UI.Image = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<div />');
        this.AddClass('app-component-image');
        //default
        this._element.style.backgroundRepeat = 'no-repeat';
    }

    get source() {
        return this._element.style.backgroundImage;
    }

    set source(value) {
        this._element.style.backgroundImage = value;
    }

    get repeat() {
        return this._element.style.backgroundRepeat;
    }

    set repeat(value) {
        this._element.style.backgroundRepeat = value;
    }
}