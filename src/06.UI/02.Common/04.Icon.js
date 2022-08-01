Colibri.UI.Icon = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<span />');
        this.AddClass('app-component-icon');
        
    }

    get icon() {
        return this._element.css('background-image');
    }

    set icon(value) {
        this._element.css('background-image', value);
    }

    set iconSVG(value) {
        this.html = eval(value);
    }

    set fill(value) {
        for(const el of this._element.querySelectorAll('path,circle,rect,polygon')) {
            el.attr('fill', value);
        }
    }

    get fill() {
        const el = this._element.querySelector('path,circle,rect,polygon');
        if(!el) {
            return null;
        }
        return el.attr('fill');
    }
    
}