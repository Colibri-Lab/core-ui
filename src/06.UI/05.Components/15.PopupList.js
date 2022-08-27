
Colibri.UI.PopupList = class extends Colibri.UI.List {

    constructor(name, container, multiple, __render, titleField = 'title', valueField = 'value', groupField = null) {
        super(name, container, multiple);
        this.AddClass('app-component-popup-list-component');
        
        this.__renderElement = __render;
        this._titleField = titleField;
        this._valueField = valueField;
        this._groupField = groupField;

        this.AddHandler('ShadowClicked', (event, args) => {
            this.Hide();
        });

        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', (event, args) => {

            const bounds = this.parent.container.bounds(true, true);
            if(!args.state) {
                this.top = null;
                this.bottom = (window.innerHeight - bounds.top);
            }

        });

        this.AddHandler('KeyDown', (event, args) => {
            console.log(event, args);
            return false;
        });

    }


    set shown(value) {
        super.shown = value;
        
        this.container.hideShowProcess(() => {
            if(this.parent) {
                const bounds = this.parent.container.bounds();
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

    get shown() {
        return super.shown;
    }

    __renderItemContent(itemData) {

        let html = itemData[this._titleField ?? 'title'];
        if(this.__renderElement) {
            html = this.__renderElement(itemData);
        }

        if(this._multiple) {
            html = '<div class="app-popup-list-item-content"><div>' + html + '</div>' + Colibri.UI.SelectCheckIcon + '</div>';
        }
        
        return html;
    }

    FillItems(value, selectedValues = null) {

        this.Clear();
        this.ClearSelection(false);

        const values = Object.values(value);
        if(this._groupField) {

            const groups = {};

            const selectedKeys = [];
    
            if(selectedValues) {
                if(!Array.isArray(selectedValues)) {
                    selectedValues = [selectedValues];
                }
                selectedValues.forEach((val) => {
                    if(!groups[val[this._groupField]]) {
                        groups[val[this._groupField]] = this.AddGroup('group', val[this._groupField]);
                    }
                    groups[val[this._groupField]].AddItem(val, null, true);
                    selectedKeys.push(String(val[this._valueField] ?? val));
                });
            }
    
            for(let val of values) {
                if(selectedKeys.includes(String(val[this._valueField] ?? val))) {
                    continue;
                }
                if(!groups[val[this._groupField]]) {
                    groups[val[this._groupField]] = this.AddGroup('group', val[this._groupField]);
                }
                groups[val[this._groupField]].AddItem(val, null);
                
            }

        }
        else {

            const group = this.AddGroup('group', '');
            const selectedKeys = [];
    
            if(selectedValues) {
                if(!Array.isArray(selectedValues)) {
                    selectedValues = [selectedValues];
                }
                selectedValues.forEach((val) => {
                    group.AddItem(val, null, true);
                    selectedKeys.push(String(val[this._valueField] ?? val));
                });
            }
    
            for(let val of values) {
                if(selectedKeys.includes(String(val[this._valueField] ?? val))) {
                    continue;
                }
                group.AddItem(val, null);
            }
                
        }

    }



}
