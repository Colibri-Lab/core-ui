Colibri.UI.Icon = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, Element.create('span'));
        this.AddClass('app-component-icon');
        
    }

    get icon() {
        return this._element.css('background-image');
    }

    set icon(value) {
        this._element.css('background-image', value);
    }

    set iconSVG(value) {
        if(!value) {
            return;
        }

        this._iconSVG = value;
        
        if(this._element.querySelector('svg')) {
            this._element.querySelector('svg').remove();
        }
        try {
            const iconc = eval(this._iconSVG);
            this._element.append(Element.fromHtml(iconc));
        } catch(e) {
            console.log('Unknown icon: ' + value); console.trace();
        }
    }

    get iconSVG() {
        return this._iconSVG;
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

    set stroke(value) {
        for(const el of this._element.querySelectorAll('path,circle,rect,polygon')) {
            el.attr('stroke', value);
        }
    }

    get stroke() {
        const el = this._element.querySelector('path,circle,rect,polygon');
        if(!el) {
            return null;
        }
        return el.attr('stroke');
    }

    get dot() {
        return this._dot;
    }

    set dot(value) {
        this._dot = value === 'true' || value === true;
        this._setDot();
    }
    _setDot() {
        if(this._dot) {
            this._dotElement = Element.create('em', {class: 'app-component-icon-dot'});
            this._element.append(this._dotElement);
        }
        else {
            this._dotElement.remove();
        }
    }
    
}