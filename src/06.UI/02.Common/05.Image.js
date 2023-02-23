Colibri.UI.Image = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Element.create('span'));
        this.AddClass('app-component-image');
    }

    get source() {
        return this._element.css('background-image');
    }

    set source(value) {
        this._element.css('background-image', value);
    }

    get repeat() {
        return this._element.css('background-repeat');
    }

    set repeat(value) {
        this._element.css('background-repeat', value);
    }

    set image(value) {
        let reader = new FileReader();
        reader.onload = (e) => {
            this.source = 'url("' + reader.result + '")';
        }
        reader.readAsDataURL(value);
        this._name = value.name;
    }

    get image() {
        const imageSrc = this.source.replaceAll('url("', '').replaceAll('")', '');
        const data = imageSrc.split(';');
        const mime = data[0].split(':')[1];
        const base64 = data[1].split(',')[1];
        return Base2File(base64, this._name, mime);
    }
}