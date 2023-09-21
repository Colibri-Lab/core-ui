Colibri.UI.ToolTip = class extends Colibri.UI.Component {

    static LB = 'lb';
    static LT = 'lt';
    static LM = 'lm';
    static RB = 'rb';
    static RT = 'rt';
    static RM = 'rm';

    /**
     * 
     * @param {string} name Coponent name
     * @param {*} container Component container|parenbt
     * @param {Array} orientation coords on container to point to, and orientation around the container, example: rt, rb; 
     *                rt - container coords, rb - orientation
     */
    constructor(name, container, orientation = [Colibri.UI.ToolTip.RT, Colibri.UI.ToolTip.RB], point = null) {
        super(name, container, Element.create('div'));

        this._arrow = new Colibri.UI.TextSpan('arrow', this._element);
        this._arrow.shown = true;

        this._contentContainer = new Colibri.UI.Pane('content', this._element);
        this._contentContainer.shown = true;

        this.AddClass('app-tooltip-component');

        this._orientation = orientation;
        this._element.data('orientation', orientation);
        this._point = point;

        this.AddHandler('ShadowClicked', (event, args) => this.__thisShadowClicked(event, args));

    }

    __thisShadowClicked(event, args) {
        this.shown = false;
    }

    get container() {
        return this._contentContainer.container;
    } 

    get orientation() {
        return this._orientation;
    }

    set orientation(value) {
        this._orientation = value;
        this._element.data('orientation', value);
    }

    _findParent() {
        return this.parent ?? null;
        // if(this.parent) {
        //     const iconParent = this.parent.Children(this.parent.name + '-contextmenu-icon-parent') ?? this.parent;
        //     return this.parent.Children(this.parent.name + '-contextmenu-icon-parent') ? iconParent.Children('firstChild') : this.parent;
        // } else {
        //     return null;
        // }
    }

    _findPointOnParent() {
        const parent = this._findParent();
        const ori = this._orientation[0];
        const parentBounds = parent.container.bounds(true, true);
        switch(ori) {
            default:
            case Colibri.UI.ToolTip.RT: { // правый верхний угол контейнера
                return {
                    left: parentBounds.left + parentBounds.outerWidth, 
                    top: parentBounds.top
                };
            }
            case Colibri.UI.ToolTip.RB: { // правый нижний угол контейнера
                return {
                    left: parentBounds.left + parentBounds.outerWidth, 
                    top: parentBounds.top + parentBounds.outerHeight
                };
            }
            case Colibri.UI.ToolTip.RM: { // правая середина контейнера
                return {
                    left: parentBounds.left + parentBounds.outerWidth, 
                    top: parentBounds.top + (parentBounds.outerHeight / 2)
                };
            }
            case Colibri.UI.ToolTip.LT: {
                return {
                    left: parentBounds.left, 
                    top: parentBounds.top
                };
            }
            case Colibri.UI.ToolTip.LB: {
                return {
                    left: parentBounds.left, 
                    top: parentBounds.top + parentBounds.outerHeight
                };
            }
            case Colibri.UI.ToolTip.LM: {
                return {
                    left: parentBounds.left, 
                    top: parentBounds.top + (parentBounds.outerHeight / 2)
                };
            }
        }
    }

    _getOrientationPoint(pointOnParent) {
        const ori = this._orientation[1];
        const thisBounds = this._element.bounds(true, true);
        const parentBounds = this.parent.container.bounds(true, true);
        
        switch(ori) {
            default:
            case Colibri.UI.ToolTip.RT: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth,
                    top: pointOnParent.top
                };
            }
            case Colibri.UI.ToolTip.RB: { // правая нижняя точка попапа к точке в контейнере
                return {
                    left: pointOnParent.left - thisBounds.outerWidth, //  - parentBounds.left 
                    top: pointOnParent.top - thisBounds.outerHeight // - parentBounds.top
                };
            }
            case Colibri.UI.ToolTip.RM: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth,
                    top: pointOnParent.top - (thisBounds.outerHeight / 2)
                };
            }
            case Colibri.UI.ToolTip.LT: {
                return {
                    left: pointOnParent.left, 
                    top: pointOnParent.top
                };
            }
            case Colibri.UI.ToolTip.LB: {
                return {
                    left: pointOnParent.left, 
                    top: pointOnParent.top - thisBounds.outerHeight
                };
            }
            case Colibri.UI.ToolTip.LM: {
                return {
                    left: pointOnParent.left, 
                    top: pointOnParent.top - (thisBounds.outerHeight / 2)
                };
            }
        }
    }

    _setPosition() {

        const pointOnParent = this._point || this._findPointOnParent();
        const point = this._getOrientationPoint(pointOnParent);
        this.styles = {left: point.left + 'px', top: point.top + 'px'};

    }

    _checkPosition() {
        const thisBounds = this._element.bounds(true, true);

        let orientation = [].concat(this._orientation);
        if(thisBounds.top + thisBounds.outerHeight > window.innerHeight) {
            // надо двинуть точку на паренте и относительную ориентацию
            // справа на лево, или слева на право
            orientation[0] = orientation[0].replaceAll('t', 'b');
            orientation[1] = orientation[1].replaceAll('b', 't');
            
        }
        if(thisBounds.left + thisBounds.outerWidth > window.innerWidth) {
            // надо двинуть точку на паренте и относительную ориентацию
            // справа на лево, или слева на право
            orientation[0] = orientation[0].replaceAll('r', 'l');
            orientation[1] = orientation[1].replaceAll('r', 'l');
        }
        
        if(this._orientation != orientation) {
            this._orientation = orientation;
            this._setPosition();
        }

    }

    get shown() {
        return super.shown;
    }
    set shown(value) {
        super.shown = value;
        this.BringToFront();
        if(value) {
            this._element.hideShowProcess(() => {
                this._setPosition();
                this.hasShadow = true;
            });
        } else {
            this.hasShadow = false;
        }
    }

    Show(parent = null) {
        if(parent) {
            this.parent = parent;
        }
        if(!this.shown) {
            this.shown = true;
        }
    }

    /**
     * String content
     * @type {String}
     */
    get value() {
        return this._contentContainer.value;
    }
    /**
     * String content
     * @type {String}
     */
    set value(value) {
        this._contentContainer.value = value;
    }

}