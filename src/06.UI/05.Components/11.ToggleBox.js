
Colibri.UI.ToggleBox = class extends Colibri.UI.Component {

    constructor(name, container) {
        super(name, container, '<div />');

        this.AddClass('app-togglebox-component');

        this._element.append(Element.create('input', {type: 'hidden', value: 'on'}, {}));
        const span = Element.create('span', {class: 'toggle'});
        span.append(Element.create('span', {class: 'box'}));
        this._element.append(span);
        this._element.append(Element.create('span', {class: 'text'}, {}));

        
        this._input = this._element.querySelector('input');
        this._showState();    

    }

    _showState() {
        if(this._input.checked) {
            this.AddClass('-selected');
        }
        else {
            this.RemoveClass('-selected');
        }
    }

    _registerEventHandlers() {
        super._registerEventHandlers();

        this.AddHandler('Clicked', () => {
            this.Toggle();
        });

    }

    Toggle() {
        this._input.checked = !this._input.checked;
        this._showState(); 
    }

    get checked() {
        return this._input.checked;
    }

    set checked(value) {
        this._input.checked = value === 'true' || value === true;
        this._showState();
    }

    get label() {
        return this._element.querySelector('.text').html();
    } 

    set label(value) {
        this._element.querySelector('.text').html(value);
    }

}