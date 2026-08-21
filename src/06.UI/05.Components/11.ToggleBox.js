/**
 * Toggle box component
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 * @example
 * ```
 * const toggleBox = new Colibri.UI.ToggleBox('toggleBox', this);
 * toggleBox.label = 'Toggle me';
 * toggleBox.checked = true;
 * toggleBox.AddHandler('Changed', (event, args) => {
 *     console.log('Toggle state:', args.state);
 * });
 * 
 * in html template
 * 
 * <ToggleBox name="toggleBox" label="Toggle me" checked="true" />
 * 
 * then in js
 * 
 * const toggleBox = this.Children('toggleBox');
 * toggleBox.AddHandler('Changed', (event, args) => {
 *     console.log('Toggle state:', args.state);   
 * });
 * ```
 */
Colibri.UI.ToggleBox = class extends Colibri.UI.Component {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container, Element.create('div'));

        this.AddClass('app-togglebox-component');

        this._element.append(Element.create('input', {type: 'hidden', value: 'on'}, {}));
        const span = Element.create('span', {class: 'toggle'});
        span.append(Element.create('span', {class: 'box'}));
        this._element.append(span);
        this._element.append(Element.create('span', {class: 'text'}, {}));

        
        this._input = this._element.querySelector('input');
        this._showState();    

    }

    /**
     * @ignore 
     * @protected 
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'Когда изменилось состояние переключателя');
    }

    /** 
     * @ignore
     * @private 
     */
    _showState() {
        if(this._input.checked) {
            this.AddClass('-selected');
        }
        else {
            this.RemoveClass('-selected');
        }
    }

    /**
     * @ignore 
     * @protected 
     */
    _registerEventHandlers() {
        super._registerEventHandlers();
 
        this.AddHandler('Clicked', () => {
            this.Toggle();
        });

    }

    /**
     * Toggle the box
     * @public
     */
    Toggle() {
        if(!this.enabled) {
            return;
        }
        this._input.checked = !this._input.checked;
        this._showState(); 
        this.Dispatch('Changed', {state: this._input.checked});
    }

    /**
     * Checked
     * @type {boolean}
     */
    get checked() {
        return this._input.checked;
    }

    /**
     * Checked
     * @type {boolean}
     */
    set checked(value) {
        this._input.checked = value === 'true' || value === true;
        this._showState();
    }

    /**
     * Label
     * @type {string}
     */
    get label() {
        return this._element.querySelector('.text').html();
    } 

    /**
     * Label
     * @type {string}
     */
    set label(value) {
        this._element.querySelector('.text').html(value);
    }

}