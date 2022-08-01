Colibri.UI.ToolTip = class extends Colibri.UI.Component {

    static LB = 'lb';
    static RB = 'rb';
    static LT = 'lt';
    static RT = 'rt';

    /**
     * 
     * @param {string} name Coponent name
     * @param {*} container Component container|parenbt
     * @param {Array} orientation coords on container to point to, and orientation around the container, example: rt, rb; rt - container coords, rb - orientation
     */
    constructor(name, container, orientation = [Colibri.UI.ToolTip.RT, Colibri.UI.ToolTip.RB], point = null) {
        super(name, container, '<div />');

        this.AddClass('app-tooltip-component');

        this._orientation = orientation;
        this._point = point;

    }

    get orientation() {
        return this._orientation;
    }

    set orientation(value) {
        this._orientation = value;
    }

    _findParent() {
        const iconParent = this.parent.Children(this.parent.name + '-contextmenu-icon-parent') ?? this.parent;
        return this.parent.Children(this.parent.name + '-contextmenu-icon-parent') ? iconParent.Children('firstChild') : this.parent;
    }

    _findPointOnParent() {
        const parent = this._findParent();
        const ori = this._orientation[0];
        const parentBounds = parent.container.bounds(true, true);
        switch(ori) {
            default:
            case Colibri.UI.ToolTip.RB: {
                return {
                    left: parentBounds.left + parentBounds.outerWidth, 
                    top: parentBounds.top + parentBounds.outerHeight
                };
            }
            case Colibri.UI.ToolTip.LB: {
                return {
                    left: parentBounds.left, 
                    top: parentBounds.top + parentBounds.outerHeight
                };
            }
            case Colibri.UI.ToolTip.LT: {
                return {
                    left: parentBounds.left, 
                    top: parentBounds.top
                };
            }
            case Colibri.UI.ToolTip.RT: {
                return {
                    left: parentBounds.left + parentBounds.outerWidth, 
                    top: parentBounds.top
                };
            }
        }
    }

    _getOrientationPoint(pointOnParent) {
        const ori = this._orientation[1];
        const thisBounds = this.container.bounds(true, true);
        const parentBounds = this.parent.container.bounds(true, true);
        switch(ori) {
            default:
            case Colibri.UI.ToolTip.RB: {
                return {
                    left: pointOnParent.left - parentBounds.left, 
                    top: pointOnParent.top - parentBounds.top
                };
            }
            case Colibri.UI.ToolTip.LB: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth - parentBounds.left, 
                    top: pointOnParent.top - parentBounds.top
                };
            }
            case Colibri.UI.ToolTip.LT: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth - parentBounds.left, 
                    top: pointOnParent.top - thisBounds.outerHeight - parentBounds.top
                };
            }
            case Colibri.UI.ToolTip.RT: {
                return {
                    left: pointOnParent.left - parentBounds.left, 
                    top: pointOnParent.top - thisBounds.outerHeight - parentBounds.top
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
        const thisBounds = this.container.bounds(true, true);

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

        console.log(orientation, this._orientation)
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
            this._element.css('visibility', 'hidden');
            Colibri.Common.Delay(10).then(() => {
                this._setPosition();
                this._element.css('visibility', 'visible');
            });    
        }
    }

    Show(text, parent = null) {
        if(parent) {
            this.parent = parent;
        }
        this.value = text;
        if(!this.shown) {
            this.shown = true;
        }
    }

}