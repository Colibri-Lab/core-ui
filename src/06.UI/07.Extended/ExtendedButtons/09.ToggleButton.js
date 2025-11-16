/**
 * Toggle button
 * @class
 * @extends Colibri.UI.ExtendedButton
 * @memberof Colibri.UI
 */
Colibri.UI.ToggleButton = class extends Colibri.UI.ExtendedButton {
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-toggle-button-component');
        this.AddClass('-has-value');

        this._autoResetSiblingButtonsState = false;
        this.iconPosition = 'right';
        this.icon = this.icon || 'Colibri.UI.SelectArrowIcon';
        
        this._autoChangeState = false;
        this.state = 'expanded';

        this.AddHandler('Clicked', this.__thisClicked);

    }

    __thisClicked(event, args) {
        if(!this._autoChangeState) {
            return true;
        }
        if(this.state === 'expanded') {
            this.state = 'collapsed';
        } else {
            if(this._autoResetSiblingButtonsState) {
                this.parent.ForEach((name, component) => {
                    if(component instanceof Colibri.UI.ToggleButton) {
                        component.state = 'collapsed';
                    }
                });
            }
            this.state = 'expanded';
        }
    }

    /**
     * Stat of button
     * @type {expanded,collapsed}
     */
    get state() {
        return this._state;
    }
    /**
     * Stat of button
     * @type {expanded,collapsed}
     */
    set state(value) {
        this._state = value;
        this._showState();
    }
    /** @private */
    _showState() {
        if(this.stateIcons && Object.isObject(this.stateIcons)) {
            this.icon = this.stateIcons[this._state];
        }

        this.RemoveClass(['-collapsed', '-expanded'])
        if(this._state === 'expanded') {
            this.AddClass('-expanded');
            this.value = '#{ui-toggle-button-collapse}';
        } else {
            this.AddClass('-collapsed');
            this.value = '#{ui-toggle-button-expand}';
        }
        
    }

    /**
     * Has text
     * @type {Boolean}
     */
    get hasValue() {
        return this._hasValue;
    }
    /**
     * Has text
     * @type {Boolean}
     */
    set hasValue(value) {
        value = this._convertProperty('Boolean', value);
        this._hasValue = value;
        if(this._hasValue) {
            this.AddClass('-has-value');
        } else {
            this.RemoveClass('-has-value');
        }
    }

    /**
     * Automaticaly change state
     * @type {Boolean}
     */
    get autoChangeState() {
        return this._autoChangeState;
    }
    /**
     * Automaticaly change state
     * @type {Boolean}
     */
    set autoChangeState(value) {
        value = this._convertProperty('Boolean', value);
        this._autoChangeState = value;
    }

    /**
     * Icons for state
     * @type {Object}
     */
    get stateIcons() {
        return this._stateIcons;
    }
    /**
     * Icons for state
     * @type {Object}
     */
    set stateIcons(value) {
        value = this._convertProperty('Object', value);
        this._stateIcons = value;
    }

    /**
     * Reset sibling buttons state to collapsed
     * @type {Boolean}
     */
    get autoResetSiblingButtonsState() {
        return this._autoResetSiblingButtonsState;
    }
    /**
     * Reset sibling buttons state to collapsed
     * @type {Boolean}
     */
    set autoResetSiblingButtonsState(value) {
        value = this._convertProperty('Boolean', value);
        this._autoResetSiblingButtonsState = value;
    }

}