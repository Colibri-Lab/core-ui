/**
 * Checkbox list field component
 * @class
 * @extends Colibri.UI.Forms.Field
 * @memberof Colibri.UI.Forms
 * @example
 * ```
 * const form = new Colibri.UI.Forms.Form('form', this);
 * form.fields = {
 *      'checkboxlist': {
 *          'component': 'CheckboxList',
 *          'desc': 'Check me',
 *          'default': '',
 *          'values': [
 *              {
 *                  'value': 'option1',
 *                  'title': 'Option 1'
 *              },
 *              {
 *                  'value': 'option2',
 *                  'title': 'Option 2'
 *              },
 *              {
 *                  'value': 'option3',
 *                  'title': 'Option 3'
 *              }
 *          ]
 *      }
 * };
 * form.value = {
 *      'checkboxlist': ['option1', 'option2']
 * };
 * form.AddHandler('Changed', (event, args) => {
 *      console.log('Form changed', form.value);
 * });
 * 
 * in html template
 * 
 * <Forms.Form name="form" fields="fields" value="value">
 *     <fields>
 *      {
 *          'checkboxlist': {
 *              'component': 'CheckboxList',
 *              'desc': 'Check me',
 *              'default': '',
 *              'values': [ 
 *                 {    
 *                    'value': 'option1',
 *                    'title': 'Option 1'
 *                 },
 *                 {
 *                    'value': 'option2',
 *                    'title': 'Option 2'
 *                 },
 *                 {
 *                    'value': 'option3',
 *                    'title': 'Option 3'
 *                 }
 *              ]
 *          }
 *     </fields>
 * </Forms.Form>
 * 
 * ```
 */
Colibri.UI.Forms.CheckboxList = class extends Colibri.UI.Forms.Field {

    /**
     * Render field component
     * @protected
     * @ignore
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
        if(this._fieldData?.params?.showunlisted) {
            this._showUnlisted = !!this._fieldData?.params?.showunlisted;
        }
        this.value = this._fieldData?.default ?? false;

        this.values = this._fieldData?.values ?? [];

    }

    /**
     * @ignore 
     * @protected 
     */
    _handleEvents(input) {
        input.AddHandler('Changed', this.__thisBubbleWithComponent, false, this);
        input.AddHandler('Clicked', this.__thisBubblePreventDefault, false, this);
        input.AddHandler('ReceiveFocus', this.__thisBubble, false, this);
        input.AddHandler('LoosedFocus', this.__thisBubble, false, this);
    }

    /**
     * Focus on component
     * @public
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
                if(!input && this._showUnlisted) {
                    input = new Colibri.UI.Checkbox(this._name + '-input-' + String.MD5(v.value + v.title), contentContainer);
                    input.shown = true;
                    input.placeholder = v.title;
                    input.tag = v;
                    input.tabIndex = true;
                    this._handleEvents(input);
                }
                input && (input.checked = v.__checked ?? true);
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
    /** 
     * @ignore
     * @private 
     */
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
Colibri.UI.Forms.Field.RegisterFieldComponent('CheckboxList', 'Colibri.UI.Forms.CheckboxList', '#{ui-fields-checkboxlist}', null, ['required','enabled','canbeempty','readonly','list','template','greed','viewer','fieldgenerator','generator','transformer','noteClass','validate','valuegenerator','onchangehandler'])
