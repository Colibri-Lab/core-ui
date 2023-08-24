Colibri.UI.Forms.DateRange = class extends Colibri.UI.Forms.Field {

    RenderFieldContainer() {
        this.AddClass('app-component-daterange-field');

        const contentContainer = this.contentContainer; 

        this._input1 = new Colibri.UI.DateSelector(this._name + '-input1', contentContainer);
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

        this._input2 = new Colibri.UI.DateSelector(this._name + '-input2', contentContainer);
        this._input2.shown = true;
        this._input2.hasIcon = false;
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

        if(this._fieldData?.params?.format) {
            let dateformat = App.DateFormat || 'ru-RU';
            this._input1.format = new Intl.DateTimeFormat(this._fieldData?.params?.format?.locale || dateformat, this._fieldData?.params?.format?.options ?? {day: '2-digit', month: 'short', year: 'numeric'});
            this._input2.format = new Intl.DateTimeFormat(this._fieldData?.params?.format?.locale || dateformat, this._fieldData?.params?.format?.options ?? {day: '2-digit', month: 'short', year: 'numeric'});
        }

    }

    /**
     * Array of two date items
     * @type {Array}
     */
    get value() {
        return [this._input1.value, this._input2.value];
    }
    /**
     * Array of two date items
     * @type {Array}
     */
    set value(value) {
        if(!Array.isArray(value)) {
            value = [value ?? '', ''];
        }

        this._input1.value = value[0] !== undefined ? value[0] : null;
        this._input2.value = value[1] !== undefined ? value[1] : null;
    }

}