
Colibri.UI.SlideDown = class extends Colibri.UI.Pane {

    constructor(name, container, element) {
        super(name, container, element);
        this.AddClass('app-component-slidedown-component');
        
        this.tabIndex = null;
        this.AddHandler('ShadowClicked', (event, args) => {
            this.Hide();
        });

    }

    set shown(value) {
        super.shown = value;
    }

    get shown() {
        return super.shown;
    }

    __renderItemContent(itemData) {
        let html = '';

        try {
            html = itemData[this._titleField ?? 'title'][Lang.Current] ?? itemData[this._titleField ?? 'title'] ?? itemData;
            if(this.__renderElement) {
                html = this.__renderElement(itemData);
            }
    
            if(this._multiple) {
                html = '<div class="app-popup-list-item-content"><div>' + html + '</div>' + Colibri.UI.SelectCheckIcon + '</div>';
            }
        }
        catch(e) {

        }
        
        return html;
    }

    FillItems(value, selectedValues = null) {

        this.Clear();
        this.ClearSelection(false);

        const values = Object.values(value);
        if(this._groupField) {

            

            const selectedKeys = [];
    
            if(selectedValues !== undefined && selectedValues !== null && selectedValues !== '') {
                if(!Array.isArray(selectedValues)) {
                    selectedValues = [selectedValues];
                }
                selectedValues.forEach((val) => {
                    selectedKeys.push(String(val[this._valueField] ?? val));
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
                    selectedKeys.push(String(val[this._valueField] ?? val));
                });
            }
    
            for(let val of values) {
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
