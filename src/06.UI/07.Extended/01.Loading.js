Colibri.UI.Loading = class extends Colibri.UI.Pane {

    constructor(name, container, children, sendToFront = true) {
        super(name, container, children || Element.create('div'));
        this.AddClass('app-loading-component');
        
        this._element.html(Colibri.UI.LoadingIcon);
        this._sendToFront = sendToFront;
    }

    set shown(value) {
        super.shown = value;
        if(this._sendToFront) {
            if (super.shown) {
                this.BringToFront();
            } else {
                this.SendToBack();
            }
        }
    }

}
