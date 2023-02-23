Colibri.UI.LoadingBallun = class extends Colibri.UI.Component {

    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Element.create('div'));
        this.AddClass('colibri-ui-loadingballun');

        this._iconObject = new Colibri.UI.Icon(this.name + '-icon', this);
        this._textObject = new Colibri.UI.TextSpan(this.name + '-text', this);

        this._iconObject.shown = true;
        this._textObject.shown = false;

        this._iconObject.value = Colibri.UI.LoadingIcon;

    }

    set shown(value) {
        super.shown = value;
        if(value) {
            this.BringToFront();
        }
        else {
            this.SendToBack();
        }
    }

    /**
     * Текст
     * @type {string}
     */
    get text() {
        return this._text;
    }
    /**
     * Текст
     * @type {string}
     */
    set text(value) {
        this._text = value;
        this._showText();
    }
    _showText() {
        this._textObject.shown = !!this._text;
        this._textObject.value = this._text;
    }

    /**
     * Иконка
     * @type {string}
     */
    get icon() {
        return this._icon;
    }
    /**
     * Иконка
     * @type {string}
     */
    set icon(value) {
        this._icon = value;
        this._showIcon();
    }
    _showIcon() {
        this._iconObject.value = this._icon;       
    }

    Start(loadingText, completeText, errorText, completeIcon, errorIcon) {
        this._completeIcon = completeIcon;
        this._errorIcon = errorIcon;
        this._errorText = errorText;
        this._completeText = completeText;
        this.AddClass('-loading');
        this.RemoveClass('-complete');
        this.RemoveClass('-error');
        this.shown = true;
        this.icon = Colibri.UI.LoadingIcon;
        this.text = loadingText;
    }

    Error() {
        this.RemoveClass('-loading');
        this.AddClass('-error');
        this.text = this._errorText;
        this.icon = this._errorIcon;            
        Colibri.Common.Delay(3000).then(() => {
            this.shown = false;
        });
    }

    Complete() {
        this.RemoveClass('-loading');
        this.AddClass('-complete');
        this.text = this._completeText;
        this.icon = this._completeIcon;
        Colibri.Common.Delay(5000).then(() => {
            this.shown = false;
        });
    }

}