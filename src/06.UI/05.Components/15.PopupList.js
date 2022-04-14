
Colibri.UI.PopupList = class extends Colibri.UI.List {

    constructor(name, container, multiple, __render, titleField = 'title', valueField = 'value') {
        super(name, container, multiple);
        this.AddClass('app-component-popup-list-component');

        this.__renderElement = __render;
        this._titleField = titleField;
        this._valueField = valueField;

        this.AddHandler('ShadowClicked', (event, args) => {
            this.Hide();
        });

        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', (event, args) => {

            const bounds = this.parent.container.bounds();
            const b = this.container.bounds();
            if(!args.state) {
                this.top =  bounds.top - b.outerHeight;
            }

        });

    }

    set shown(value) {
        if(value) {
            this.AddClass(this.parent.name + '-selector-popup');
            this.hasShadow = value;
            this.BringToFront();
        } else {
            this.RemoveClass(this.parent.name + '-selector-popup');
            this.hasShadow = false;
            this.SendToBack();
        }
        super.shown = value;
    }

    get shown() {
        return super.shown;
    }

    Show() {
        const bounds = this.parent.container.bounds();
        this.shown = true;
        this.top = bounds.top + bounds.outerHeight;
        this.left = bounds.left;
        this.width = bounds.outerWidth;
        this.shown = true;
        if(this._selected.length && this._selected[0] instanceof Colibri.UI.List.Item) {
            this._selected[0].EnsureVisible(this);
        }

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
