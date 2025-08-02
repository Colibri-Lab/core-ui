/**
 * @class
 * @extends Colibri.UI.List
 * @memberof Colibri.UI
 */
Colibri.UI.PopupList = class extends Colibri.UI.List {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     * @param {boolean} multiple is selection must be multiple
     * @param {string} titleField title field for show
     * @param {string} valueField value field to return in value property
     * @param {string|null} groupField field to group in list
     * @param {boolean} can select group
     */
    constructor(name, container, multiple, __render, titleField = 'title', valueField = 'value', groupField = null, canSelectGroup = false) {
        super(name, container, null, multiple);
        this.AddClass('app-component-popup-list-component');


        this.__renderElement = __render;
        this._titleField = titleField;
        this._valueField = valueField;
        this._groupField = groupField;
        this._canSelectGroup = canSelectGroup;
        this.tabIndex = null;
        this.AddHandler('ShadowClicked', this.__thisShadowClicked);

        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', this.__thisVisibilityChanged);
        this.AddHandler('KeyDown', Colibri.UI.Component.__disableHandler);

    }

    __thisShadowClicked(event, args) {
        this.Hide();
    }

    __thisVisibilityChanged(event, args) {
        const bounds = this.parent.container.bounds(true, true);
        if(!args.state) {
            this.top = null;
            this.bottom = (window.innerHeight - bounds.top);
        }
    }

    /** @private */
    __popupBounds() {
        return this.parent.container.bounds();
    }

    /**
     * Show/Hide component
     * @type {boolean}
     */
    set shown(value) {
        super.shown = value;
        this.container.hideShowProcess(() => {
            if(this.parent) {
                const bounds = this.__popupBounds();
                this.top = bounds.top + bounds.outerHeight;
                this.left = bounds.left;
                this.width = bounds.outerWidth;    
                if(value) {
                    this.AddClass(this.parent.name + '-selector-popup');
                    this.BringToFront();
                } else {
                    this.RemoveClass(this.parent.name + '-selector-popup');
                    this.SendToBack();
                }    
            }
            this.hasShadow = value;
            this.Dispatch('VisibilityChanged', {state: true});
            if(this._selected.length && this._selected[0] instanceof Colibri.UI.List.Item) {
                this._selected[0].EnsureVisible(this);
            }
        });
    }

    /**
     * Show/Hide component
     * @type {boolean}
     */
    get shown() {
        return super.shown;
    }

    /** @protected */
    __renderItemContent(itemData, item) {
        let html = '';

        try {
            if(this.__renderElement !== null) {
                if(typeof this.__renderElement === 'string') {
                    this.__renderElement = eval(this.__renderElement);
                }
                html = this.__renderElement(itemData, item);
            } else if(itemData[this._titleField ?? 'title'] !== null) {
                html = Lang ? Lang.Translate(itemData[this._titleField ?? 'title']) : itemData[this._titleField ?? 'title'];
            } else {
                html = itemData;
            }
        
            if(this._multiple) {
                html = '<div class="app-popup-list-item-content"><div>' + html + '</div>' + Colibri.UI.SelectCheckIcon + '</div>';
            }
        }
        catch(e) {
            console.log(e);
        }
        
        return html;
    }

    /**
     * Fill the items
     * @param {Array} value items
     * @param {Array} selectedValues Selected items
     */
    FillItems(value, selectedValues = null) {

        this.ClearAllGroups();
        this.ClearSelection(false);

        if(!Array.isArray(value)) {
            return;
        }

        const values = Object.values(value);
        if(this._groupField) {

            const selectedKeys = [];
    
            if(selectedValues !== undefined && selectedValues !== null && selectedValues !== '') {
                if(!Array.isArray(selectedValues)) {
                    selectedValues = [selectedValues];
                }
                selectedValues.forEach((val) => {
                    if(val) {
                        selectedKeys.push(String(val[this._valueField] ?? val));
                    }
                });
            }

            if(this._canSelectGroup) {
                const group = this.AddGroup('group', '');
                for(let val of values) {
                    if(val[this._groupField] === true) {
                        const item = group.AddItem(val, null);
                        item.AddClass('-group');
                    }
                    group.AddItem(val, null);
                }
            }
            else {
                const groups = {};
                for(let val of values) {
                    if(!val) {
                        continue;
                    }
                    if(!groups[String.MD5(val[this._groupField])]) {
                        groups[String.MD5(val[this._groupField])] = this.AddGroup(String.MD5(val[this._groupField]), val[this._groupField]);
                    }
                    if(selectedKeys.includes(String(val[this._valueField] ?? val))) {
                        groups[String.MD5(val[this._groupField])].AddItem(val, null, true);
                    }
                    else {
                        groups[String.MD5(val[this._groupField])].AddItem(val, null);
                    }
                    
                }
            }
    
            

        }
        else {

            const group = this.AddGroup('group', '');
            const selectedKeys = [];
    
            if(selectedValues !== undefined && selectedValues !== null && selectedValues !== '') {
                if(!Array.isArray(selectedValues)) {
                    selectedValues = [selectedValues];
                }
                selectedValues.forEach((val) => {
                    if(val) {     
                        selectedKeys.push(String(val[this._valueField] ?? val));
                    }
                });
            }

            for(let val of values) {
                if(!val) {
                    continue;
                }
                if(selectedKeys.includes(String(val[this._valueField] ?? val))) {
                    group.AddItem(val, null, true);
                }
                else { 
                    group.AddItem(val, null);
                }
            }
                
        }

    }

}
