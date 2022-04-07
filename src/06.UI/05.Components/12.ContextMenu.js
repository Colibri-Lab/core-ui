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

        itemObject.AddHandler('Clicked', (event, args) => {
            if(item.children) {
                // показываем дочернее меню
                this._childContextMenu = new AktionDigital.UI.ContextMenu(itemObject.name + '_contextmenu', document.body, 'right');
                this._childContextMenu.Show(item.children, itemObject);
                this._childContextMenu.AddHandler('Clicked', (event, args) => {
                    this.Dispatch('Clicked', args);
                    this._childContextMenu.Dispose();
                    this._childContextMenu = null;
                    args.domEvent.preventDefault();
                    args.domEvent.stopPropagation();
                    return false;
                });
            }
            else {
                this.Dispatch('Clicked', { menu: event.sender, menuData: event.sender.tag, domEvent: args.domEvent });
            }
            args.domEvent.preventDefault();
            args.domEvent.stopPropagation();
            return false;
        });

    

    }

    _renderItems() {
        this._items.forEach((item) => {
            this._addItem(item);
        });
    }

    _setPosition() {
        const iconParent = this.parent.Children(this.parent.name + '-contextmenu-icon-parent') ?? this.parent;
        const icon = this.parent.Children(this.parent.name + '-contextmenu-icon-parent') ? iconParent.Children('firstChild') : this.parent;

        const iconBounds = icon.container.bounds();
        const thisBounds = this.container.bounds();

        switch(this._orientation) {
            default:
            case 'right bottom': {
                let point = this._point || {
                    left: iconBounds.left, 
                    top: iconBounds.top + iconBounds.outerHeight
                } // нижний левый угол
                this.styles = {left: point.left + 'px', top: point.top + 'px'};
                break;
            }
            case 'left bottom': {
                let point = this._point || {
                    left: iconBounds.left + iconBounds.outerWidth, 
                    top: iconBounds.top + iconBounds.outerHeight
                } // нижний правый угол
                this.styles = {left: (point.left - thisBounds.outerWidth) + 'px', top: point.top + 'px'};
                break;
            }
            case 'right top': {
                let point = this._point || {
                    left: iconBounds.left, 
                    top: iconBounds.top
                } // верхний левый угол
                this.styles = {left: point.left + 'px', top: (point.top - thisBounds.outerHeight - 10) + 'px'};
                break;
            }
            case 'left top': {
                let point = this._point || {
                    left: iconBounds.left + iconBounds.outerWidth, 
                    top: iconBounds.top
                } // верхний правый угол
                this.styles = {left: (point.left - thisBounds.outerWidth) + 'px', top: (point.top - thisBounds.outerHeight - 10) + 'px'};
                break;
            }
        }

        this._checkPosition();

    }

    _checkPosition() {
        const thisBounds = this.container.bounds();

        let orientation = this._orientation;
        if(thisBounds.top + thisBounds.outerHeight > window.innerHeight) {
            orientation = orientation.replaceAll('bottom', 'top');
        }
        if(thisBounds.left + thisBounds.outerWidth > window.innerWidth) {
            orientation = orientation.replaceAll('right', 'left');
        }

        if(this._orientation != orientation) {
            this._orientation = orientation;
            this._setPosition();
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

    Show(menu, parent = null) {
        if(parent) {
            this.parent = parent;
        }
        this.value = menu;
        this.shown = true;
    }

    Dispose() {
        const shadow = document.querySelector('.app-component-shadow-div');
        shadow && shadow.remove();
        super.Dispose();
    }

}