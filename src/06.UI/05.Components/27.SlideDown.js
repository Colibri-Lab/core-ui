
Colibri.UI.SlideDown = class extends Colibri.UI.Pane {

    constructor(name, container, element) {
        super(name, container, element);
        this.AddClass('app-component-slidedown-component');
        
        this.tabIndex = null;
        this.AddHandler('ShadowClicked', (event, args) => {
            this.Hide();
        });

    }




}
