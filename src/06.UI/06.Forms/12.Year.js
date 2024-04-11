/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.Year = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-year-field');

        const contentContainer = this.contentContainer;
        this._input = new Colibri.UI.YearSelector('selector', contentContainer, 2000, Date.Now().getFullYear());
        this._input.shown = true;

        this._input.AddHandler('Changed', (event, args) => this.Dispatch('Changed', Object.assign(args || {}, {component: this})));
        this._input.AddHandler('KeyUp', (event, args) => this.Dispatch('KeyUp', args));
        this._input.AddHandler('KeyDown', (event, args) => this.Dispatch('KeyDown', args));

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

    /**
     * Focus on component
     */
    Focus() {
        this._input.Focus();
    }

    /**
     * Value
     * @type {number}
     */
    get value() {
        return this._input.value.value;
    }

    /**
     * Value
     * @type {number}
     */
    set value(value) {
        this._input.value = value;
    }

    /**
     * Get value title
     * @returns {string}
     */
    getValueTitle() {
        return this._input.value.title;
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this._input && this._input.tabIndex;
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        if (this._input) {
            this._input.tabIndex = value === true ? Colibri.UI.tabIndex++ : value;
        }
    }
}

Colibri.UI.Forms.Field.RegisterFieldComponent('Year', 'Colibri.UI.Forms.Year', '#{ui-fields-year}')
