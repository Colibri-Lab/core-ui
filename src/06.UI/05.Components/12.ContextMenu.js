Colibri.UI.ContextMenu = class extends Colibri.UI.Component {

    constructor(name, container, orientation = 'right bottom', point = null) {
        super(name, container, '<div />');

        this.AddClass('app-contextmenu-component');

        this._orientation = orientation;
        this._point = point;

        this.AddHandler('ShadowClicked', (event, args) => {
            this.Hide();
            this.Dispatch('Clicked', {menuData: null, menu: null});
        });
    }

    get orientation() {
        return this._orientation;
    }

    set orientation(value) {
        this._orientation = value;
    }

    _addItem(item) {
        
        const itemObject = new Colibri.UI.TextSpan(item.name, this);
        itemObject.tag = item;
        
        itemObject.shown = true;
        itemObject.AddClass('app-contextmenu-item-component');
        
        const icon = new Colibri.UI.Icon(item.name + '-icon', itemObject);
        const text = new Colibri.UI.TextSpan(item.name + '-text', itemObject);

        if(item.icon) {
            icon.value = item.icon;
            icon.shown = true;
        }
        else {
            icon.shown = false;
        }

        text.value = item.title;
        text.shown = true;

        itemObject.AddHandler('Clicked', (event, args) => this.Dispatch('Clicked', {menu: event.sender, menuData: event.sender.tag}));

    }

    _renderItems() {
        this._items.forEach((item) => {
            this._addItem(item);
        });
    }

    _setPosition() {
        const iconParent = this.parent.Children(this.parent.name + '-contextmenu-icon-parent') ?? this.parent;
        const icon = iconParent.Children('firstChild');

        const iconBounds = icon.container.bounds();
        const thisBounds = this.container.bounds();

        let point = this._point || {
            left: iconBounds.left, 
            top: iconBounds.top + iconBounds.outerHeight
        }

        switch(this._orientation) {
            default:
            case 'right bottom': {
                if(point.top + thisBounds.outerHeight > window.innerHeight) {
                    point.top = window.innerHeight - thisBounds.outerHeight;
                }
                if(point.left + thisBounds.outerWidth > window.innerWidth) {
                    point.left = window.innerWidth - thisBounds.outerWidth;
                }
                this.styles = {left: point.left + 'px', top: point.top + 'px'};
                break;
            }
            case 'left bottom': {
                if(point.top + thisBounds.outerHeight > window.innerHeight) {
                    point.top = window.innerHeight - thisBounds.outerHeight;
                }
                if(point.left - thisBounds.outerWidth < 0) { 
                    point.left = thisBounds.outerWidth;
                }
                this.styles = {left: (point.left + iconBounds.outerWidth - thisBounds.outerWidth) + 'px', top: point.top + 'px'};
                break;
            }
            case 'right top': {
                if(point.left + thisBounds.outerWidth > window.innerWidth) {
                    point.left = window.innerWidth - thisBounds.outerWidth;
                }
                if(point.top - thisBounds.outerHeight < 0) { 
                    point.top = thisBounds.outerHeight;
                } 
                this.styles = {left: point.left + 'px', top: (point.top - thisBounds.outerHeight) + 'px'};
                break;
            }
            case 'left top': {
                if(point.top - thisBounds.outerHeight < 0) { 
                    point.top = thisBounds.outerHeight;
                }
                if(point.left - thisBounds.outerWidth < 0) { 
                    point.left = thisBounds.outerWidth;
                }
                this.styles = {left: (point.left - thisBounds.outerWidth + iconBounds.outerWidth) + 'px', top: (point.top - thisBounds.outerHeight) + 'px'};
                break;
            }
        }

    }

    get value() {
        return this._items;
    }

    set value(items) {
        this._items = items;
        this._renderItems();
    }

    set shown(value) {
        super.shown = value;
        this.BringToFront();
        this.hasShadow = value;
        if(value) {
            this._element.css('visibility', 'hidden');
            Colibri.Common.Delay(10).then(() => {
                this._setPosition();
                this._element.css('visibility', 'visible');
            });    
        }
    }

    Dispose() {
        const shadow = document.querySelector('.app-component-shadow-div');
        shadow && shadow.remove();
        super.Dispose();
    }

}