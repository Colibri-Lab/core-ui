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

    _addedClasses = [];

    /**
     * @constructor
     * @param {string} name Coponent name
     * @param {*} container Component container|parenbt
     * @param {Array} orientation coords on container to point to, and orientation around the container, example: rt, rb; rt - container coords, rb - orientation
     * @param {Array<{title,name,icon}>} items context menu items
     */
    constructor(name, container, orientation = [Colibri.UI.ContextMenu.LB, Colibri.UI.ContextMenu.LT], point = null, items = []) {
        super(name, container, Element.create('div'));

        this.AddClass('app-contextmenu-component');

        this._orientation = orientation;
        this._point = point;

        this.AddHandler(['VisibilityChanged', 'Resized'], (event, args) => {
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
                    if(this._childContextMenu) {
                        this._childContextMenu.Dispose();
                        this._childContextMenu = null;
                    }

                    // показываем дочернее меню
                    this._childContextMenu = new Colibri.UI.ContextMenu(itemObject.name + '_contextmenu', document.body, [Colibri.UI.ContextMenu.RT, Colibri.UI.ContextMenu.LT]);
                    this._childContextMenu.Show(item.children, itemObject);
                    this._childContextMenu.hasShadow = false;
                    this._childContextMenu.AddHandler('Clicked', (event, args) => {
                        this.Dispatch('Clicked', args);
                        this._childContextMenu.Dispose();
                        this._childContextMenu = null;
                        args.domEvent && args.domEvent.preventDefault();
                        args.domEvent && args.domEvent.stopPropagation();
                        return false;
                    });
                    if(this._addedClasses.length > 0) {
                        this._childContextMenu.AddClass(this._addedClasses);
                    }
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
            default:s
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
                    left: pointOnParent.left - thisBounds.outerWidth, 
                    top: pointOnParent.top - thisBounds.outerHeight
                };
            }
            case Colibri.UI.ContextMenu.LB: {
                return {
                    left: pointOnParent.left, 
                    top: pointOnParent.top - thisBounds.outerHeight
                };
            }
            case Colibri.UI.ContextMenu.LT: {
                return {
                    left: pointOnParent.left, 
                    top: pointOnParent.top
                };
            }
            case Colibri.UI.ContextMenu.RT: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth, 
                    top: pointOnParent.top
                };
            }
        }
    }

    /** @private */
    _setPosition(selectedBounds = null) {
        const pointOnParent = this._point || this._findPointOnParent();
        const point = selectedBounds ?? this._getOrientationPoint(pointOnParent);
        this.styles = {left: point.left + 'px', top: point.top + 'px'};
        this.RemoveClass('-rt', '-rb', '-lt', '-lb');
        this.AddClass('-' + this._orientation[0] + this._orientation[1]);

    }

    /** @private */
    _checkPosition() {
        const thisBounds = this.container.bounds(true, true);
        if(thisBounds.top + thisBounds.outerHeight > window.innerHeight) {
            thisBounds.top = window.innerHeight - thisBounds.outerHeight;
        }
        if(thisBounds.left + thisBounds.outerWidth > document.body.offsetWidth) {
            thisBounds.left = document.body.offsetWidth - thisBounds.outerWidth;
        }
        if(thisBounds.top < 0) {
            thisBounds.top = 0;
        }
        if(thisBounds.left < 0) {
            thisBounds.left = 0;
        }
        this._setPosition(thisBounds);

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
        items = this._convertProperty('Array', items);
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
                this.handleVisibilityChange = true;
                this.handleResize = true;
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
        if(this._childContextMenu) {
            this._childContextMenu.Dispose();
            this._childContextMenu = null;
        }
        super.Dispose();
    }

    AddClass(className) {
        if(!this._addedClasses) {
            this._addedClasses = [];
        }
        this._addedClasses.push(className);
        super.AddClass(className);
    }

 
}