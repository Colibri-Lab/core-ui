Colibri.UI.Editor = class extends Colibri.UI.Component {
    constructor(name, container, element) {
        super(name, container, element || '<input />');
        this.AddClass('app-editor-component');

        this._editedObject = null;

        this._element.addEventListener('change', (e) => this.Dispatch('Changed', {domEvent: e}));
        this._element.addEventListener('keyup', (e) => this.Dispatch('KeyUp', {domEvent: e}));
        this._element.addEventListener('keydown', (e) => this.Dispatch('KeyDown', {domEvent: e}));
        this._element.addEventListener('click', (e) => {
            this.Focus();
            e.stopPropagation();
            return false;
        });

        this.AddHandler('Changed', (event, args) => this.Validate());
        this.AddHandler('KeyUp', (event, args) => this.Validate());

    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Прозошло изменение данных компонента')
    }

    get invalid() {
        return this.ContainsClass('-invalid');
    }

    get editedObject() {
        return this._editedObject;
    }

    set editedObject(value) {
        this._editedObject = value;
    }

    set field(value) {
        this._fieldData = value;
        if(this._updateFieldData) {
            this._updateFieldData();
        }
    }

    get field() {
        return this._fieldData;
    }


}