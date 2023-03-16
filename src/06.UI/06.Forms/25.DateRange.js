Colibri.UI.Forms.DateRange = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {
        this.AddClass('app-component-date-field');

        this._input1 = new Colibri.UI.DateSelector(this._name + '-input', contentContainer);
        this._input1.shown = true;
        this._input1.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args || {}, {component: this})));
        this._input1.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input1.AddHandler('Clicked', (event, args) => {
            this.Focus();
            this.Dispatch('Clicked', args);
            args.domEvent.stopPropagation();
            return false;
        });

        this._input1.AddHandler('PopupOpened', (event, args) => this.AddClass('-opened'));
        this._input1.AddHandler('PopupClosed', (event, args) => this.RemoveClass('-opened'));

        this._input2 = new Colibri.UI.DateSelector(this._name + '-input', contentContainer);
        this._input2.shown = true;
        this._input2.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args || {}, {component: this})));
        this._input2.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input2.AddHandler('Clicked', (event, args) => {
            this.Focus();
            this.Dispatch('Clicked', args);
            args.domEvent.stopPropagation();
            return false;
        });

        this._input2.AddHandler('PopupOpened', (event, args) => this.AddClass('-opened'));
        this._input2.AddHandler('PopupClosed', (event, args) => this.RemoveClass('-opened'));

        if(this._fieldData?.params?.readonly === undefined) {
            this.readonly = false;    
        }
        else {
            this.readonly = this._fieldData?.params?.readonly;
        }
        if(this._fieldData?.params?.enabled === undefined) {
            this.enabled = true;
        }
        else {
            this.enabled = this._fieldData.params.enabled;
        }

    }

}