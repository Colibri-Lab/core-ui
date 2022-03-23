Colibri.UI.SuccessButton = class extends Colibri.UI.Button {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-success-button-component');
        
        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;
    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
    }

}

Colibri.UI.ErrorButton = class extends Colibri.UI.Button {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-error-button-component');
        
        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;
    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
    }

}

Colibri.UI.GrayButton = class extends Colibri.UI.Button {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-gray-button-component');
        
        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;

    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
    }

}

Colibri.UI.SimpleButton = class extends Colibri.UI.Button {
    
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-simple-button-component');

        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;
    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
    }

}

Colibri.UI.OutlineBlueButton = class extends Colibri.UI.Button {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-outline-blue-button-component');

        this._icon = new Colibri.UI.Icon('icon', this);
        this._span = new Colibri.UI.TextSpan('span', this);
        this._span.shown = true;
    }

    get icon() {
        return this._icon.iconSVG;
    }

    set icon(value) {
        this._icon.shown = true;
        this._icon.iconSVG = value;
    }

    get value() {
        return this._span.value;
    }

    set value(value) {
        this._span.value = value;
    }

}
