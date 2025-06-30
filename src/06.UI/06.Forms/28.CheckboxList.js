/**
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 */
Colibri.UI.Forms.CheckboxList = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     */
    RenderFieldContainer() {

        this.AddClass('app-component-checkboxlist-field');


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
        this.value = this._fieldData?.default ?? false;

        this.values = this._fieldData?.values ?? [];

    }

    /** @protected */
    _handleEvents(input) {
        input.AddHandler('Changed', this.__thisBubbleWithComponent, false, this);
        input.AddHandler('Clicked', this.__thisBubblePreventDefault, false, this);
        input.AddHandler('ReceiveFocus', this.__thisBubble, false, this);
        input.AddHandler('LoosedFocus', this.__thisBubble, false, this);
    }

    /**
     * Focus on component
     */
    Focus() {
        this.contentContainer.Children('firstChild')?.Focus();
    }

    /**
     * Readonly
     * @type {boolean}
     */
    get readonly() {
        return this.contentContainer.Children('firstChild')?.readonly ?? false;
    }

    /**
     * Readonly
     * @type {boolean}
     */
    set readonly(value) {
        value = this._convertProperty('Boolean', value);
        this.contentContainer.ForEach((name, component) => {
            component.readonly = value;
        });
    }

    /**
     * Value
     * @type {Array}
     */
    get value() {
        const contentContainer = this.contentContainer;
        const ret = [];
        contentContainer.ForEach((name, component) => {
            if(component.checked) {
                ret.push(component.tag);
            }
        });
        return ret;
    }

    /**
     * Value
     * @type {Array}
     */
    set value(value) {

        if(!Array.isArray(value)) {
            return;
        }

        const contentContainer = this.contentContainer;
        for(let v of value) {
            try {
                if(v?.title === undefined) {
                    v = Array.findObject(this.values, 'value', v);
                }
                let input = contentContainer.Children(this._name + '-input-' + String.MD5(v.value + v.title));
                if(!input) {
                    input = new Colibri.UI.Checkbox(this._name + '-input-' + String.MD5(v.value + v.title), contentContainer);
                    input.shown = true;
                    input.placeholder = v.title;
                    input.tag = v;
                    input.tabIndex = true;
                    this._handleEvents(input);
                }
                input.checked = v.__checked ?? true;
            } catch(e) {}
        }

    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    get enabled() {
        return this.contentContainer.Children('firstChild')?.enabled ?? true;
    }

    /**
     * Enable/Disable
     * @type {boolean}
     */
    set enabled(value) {
        value = this._convertProperty('Boolean', value);
        this.contentContainer.ForEach((name, component) => {
            component.enabled = value;
        });
    }

    /**
     * Tab index
     * @type {number}
     */
    get tabIndex() {
        return this.contentContainer.Children('firstChild').tabIndex;
    }
    /**
     * Tab index
     * @type {number}
     */
    set tabIndex(value) {
        this.contentContainer.ForEach((name, component) => {
            component.tabIndex = (value++);
        });
    }

    /**
     * Array of values
     * @type {Array}
     */
    get values() {
        return this._values;
    }
    /**
     * Array of values
     * @type {Array}
     */
    set values(value) {
        this._values = value;
        this._showValues();
    }
    /** @private */
    _showValues() {

        const contentContainer = this.contentContainer;
        contentContainer.Clear();
        for(const v of this._values) {

            const input = new Colibri.UI.Checkbox(this._name + '-input-' + String.MD5(v.value + v.title), contentContainer);
            input.shown = true;
            input.placeholder = v.title;
            input.tag = v;
            input.tabIndex = true;
            if(v.__checked) {
                input.checked = true;
            } else {
                input.checked = false;
            }
            this._handleEvents(input);

        }


    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('CheckboxList', 'Colibri.UI.Forms.CheckboxList', '#{ui-fields-checkboxlist}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','noteClass','validate','valuegenerator','onchangehandler'])
