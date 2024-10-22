/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.ContextMenu = class extends Colibri.UI.Component {

    /** Left bottom */
    static LB = 'lb';
    /** Right bottom */
    static RB = 'rb';

    /** Left top */
    static LT = 'lt';
    /** Right top */
    static RT = 'rt'; 

    /**
     * @constructor
     * @param {string} name Coponent name
     * @param {*} container Component container|parenbt
     * @param {Array} orientation coords on container to point to, and orientation around the container, example: rt, rb; rt - container coords, rb - orientation
     * @param {Array<{title,name,icon}>} items context menu items
     */
    constructor(name, container, orientation = [Colibri.UI.ContextMenu.RT, Colibri.UI.ContextMenu.RB], point = null, items = []) {
        super(name, container, Element.create('div'));

        this.AddClass('app-contextmenu-component');

        this._orientation = orientation;
        this._point = point;

        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', (event, args) => {
            this._checkPosition();
        });

        this.AddHandler('ShadowClicked', (event, args) => {
            this.Hide();
            this.Dispatch('Clicked', {menuData: null, menu: null});
        });

        this.value = items;
    }

    /**
     * Orientation 
     * @type {string}
     */
    get orientation() {
        return this._orientation;
    }

    /**
     * Orientation 
     * @type {string}
     */
    set orientation(value) {
        this._orientation = value;
    }

    /** @private */
    _addItem(item) {
        if(item.name === 'separator' || item.name == '-') {
            const itemObject = new Colibri.UI.Hr('separator-' + Date.Mc(), this);
            itemObject.shown = true;
        }
        else {
            const itemObject = new Colibri.UI.TextSpan(item.name, this);
            itemObject.tag = item;
            
            itemObject.shown = true;
            itemObject.AddClass('app-contextmenu-item-component');
            if(item.className) {
                itemObject.AddClass('-' + item.className);
            }
            
            const icon = new Colibri.UI.Icon(item.name + '-icon', itemObject);
            const text = new Colibri.UI.TextSpan(item.name + '-text', itemObject);
            const arrow = new Colibri.UI.Icon(item.name + '-arrow', itemObject);
            arrow.value = Colibri.UI.ContextMenuRightArrowIcon;

            if (item.children) {
                arrow.shown = true;
            } 

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
                    this._childContextMenu = new Colibri.UI.ContextMenu(itemObject.name + '_contextmenu', document.body, [Colibri.UI.ContextMenu.RT, Colibri.UI.ContextMenu.RB]);
                    this._childContextMenu.Show(item.children, itemObject);
                    this._childContextMenu.AddHandler('Clicked', (event, args) => {
                        this.Dispatch('Clicked', args);
                        this._childContextMenu.Dispose();
                        this._childContextMenu = null;
                        args.domEvent && args.domEvent.preventDefault();
                        args.domEvent && args.domEvent.stopPropagation();
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
    

    }

    /** @private */
    _renderItems() {
        this._items.forEach((item) => {
            this._addItem(item);
        });
    }

    /** @private */
    _findParent() {
        if(this.parent) {
            const iconParent = this.parent.Children(this.parent.name + '-contextmenu-icon-parent') ?? this.parent;
            return this.parent.Children(this.parent.name + '-contextmenu-icon-parent') ? iconParent.Children('firstChild') : this.parent;
        } else {
            return null;
        }
    }

    /** @private */
    _findPointOnParent() {
        const parent = this._findParent();
        const ori = this._orientation[0];
        const parentBounds = parent.container.bounds(true, true);
        switch(ori) {
            default:
            case Colibri.UI.ContextMenu.RB: {
                return {
                    left: parentBounds.left + parentBounds.outerWidth, 
                    top: parentBounds.top + parentBounds.outerHeight
                };
            }
            case Colibri.UI.ContextMenu.LB: {
                return {
                    left: parentBounds.left, 
                    top: parentBounds.top + parentBounds.outerHeight
                };
            }
            case Colibri.UI.ContextMenu.LT: {
                return {
                    left: parentBounds.left, 
                    top: parentBounds.top
                };
            }
            case Colibri.UI.ContextMenu.RT: {
                return {
                    left: parentBounds.left + parentBounds.outerWidth, 
                    top: parentBounds.top
                };
            }
        }
    }

    /** @private */
    _getOrientationPoint(pointOnParent) {
        const ori = this._orientation[1];
        const thisBounds = this._element.bounds(true, true);
        switch(ori) {
            default: 
            case Colibri.UI.ContextMenu.RB: {
                return {
                    left: pointOnParent.left, 
                    top: pointOnParent.top
                };
            }
            case Colibri.UI.ContextMenu.LB: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth, 
                    top: pointOnParent.top
                };
            }
            case Colibri.UI.ContextMenu.LT: {
                return {
                    left: pointOnParent.left, 
                    top: pointOnParent.top - thisBounds.outerHeight
                };
            }
            case Colibri.UI.ContextMenu.RT: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth, 
                    top: pointOnParent.top - thisBounds.outerHeight
                };
            }
        }
    }

    /** @private */
    _setPosition() {

        const pointOnParent = this._point || this._findPointOnParent();
        const point = this._getOrientationPoint(pointOnParent);
        this.styles = {left: point.left + 'px', top: point.top + 'px'};

    }

    /** @private */
    _checkPosition() {
        const thisBounds = this.container.bounds(true, true);

        let orientation = [].concat(this._orientation);
        if(thisBounds.top + thisBounds.outerHeight > window.innerHeight) {
            // надо двинуть точку на паренте и относительную ориентацию
            // справа на лево, или слева на право
            orientation[0] = orientation[0].replaceAll('t', 'b');
            orientation[1] = orientation[1].replaceAll('b', 't');
            
        }
        if(thisBounds.left + thisBounds.outerWidth > window.innerWidth) {
            orientation[0] = orientation[0].replaceAll('r', 'l');
            orientation[1] = orientation[1].replaceAll('r', 'l');
        }

        if(this._orientation != orientation) {
            this._orientation = orientation;
            this._setPosition();
        }

    }

    /**
     * Value array
     * @type {Array}
     */
    get value() {
        return this._items;
    }

    /**
     * Value array
     * @type {Array}
     */
    set value(items) {
        this._items = items;
        this._renderItems();
    }

    /**
     * Show/Hide component
     * @type {boolean}
     */
    get shown() {
        return super.shown;
    }
    /**
     * Show/Hide component
     * @type {boolean}
     */
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

    /**
     * Show context menu
     * @param {Array} menu menu items
     * @param {Colibri.UI.Component} parent parent component
     */
    Show(menu, parent = null) {
        if(parent) {
            this.parent = parent;
        }
        this.value = menu;
        this.shown = true;
    }

    /**
     * Dispose the component
     */
    Dispose() {
        const shadow = this._element.next();
        if(shadow && shadow.classList.contains('app-component-shadow-div')) {
            shadow.remove();
        }
        super.Dispose();
    }

}