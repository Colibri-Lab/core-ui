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
    constructor(name, container, orientation = [Colibri.UI.ToolTip.RT, Colibri.UI.ToolTip.RB], point = null, permanent = false) {
        super(name, container, Element.create('div'));

        this._arrow = new Colibri.UI.TextSpan('arrow', this._element);
        this._arrow.shown = true;

        this._contentContainer = new Colibri.UI.Pane('content', this._element);
        this._contentContainer.shown = true;

        this.AddClass('app-tooltip-component');

        this._orientation = orientation;
        this._element.data('orientation', orientation);
        this._point = point;
        this._permanent = permanent ?? false;

        this.AddHandler('ShadowClicked', (event, args) => this.__thisShadowClicked(event, args));

    }

    __thisShadowClicked(event, args) {
        if(!this._permanent) {
            this.shown = false;
        }
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
    }

    _findPointOnParent() {
        const parent = this._findParent();
        const ori = this._orientation[0];
        const parentBounds = parent.container.bounds(true, true);
        if(parent.container.contains(this._element)) {
            parentBounds.left = 0;
            parentBounds.top = 0;
        }
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
            case Colibri.UI.ToolTip.LM: {
                return {
                    left: parentBounds.left, 
                    top: parentBounds.top + (parentBounds.outerHeight / 2)
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
            case Colibri.UI.ToolTip.RM: {
                return {
                    left: parentBounds.left + parentBounds.outerWidth, 
                    top: parentBounds.top + (parentBounds.outerHeight / 2)
                };
            }
        }
    }

    _getOrientationPoint(pointOnParent) {
        const ori = this._orientation[1];
        const thisBounds = this._element.bounds(true, true);
        switch(ori) {
            default:
            case Colibri.UI.ToolTip.RB: {
                return {
                    left: pointOnParent.left, 
                    top: pointOnParent.top
                };
            }
            case Colibri.UI.ToolTip.LB: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth, 
                    top: pointOnParent.top
                };
            }
            case Colibri.UI.ToolTip.LM: {
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
            case Colibri.UI.ToolTip.RT: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth, 
                    top: pointOnParent.top - thisBounds.outerHeight
                };
            }
            case Colibri.UI.ToolTip.RM: {
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
        this.hasShadow = value && !this._permanent;
        if(value) {
            this._element.css('visibility', 'hidden');
            Colibri.Common.Delay(10).then(() => {
                this._setPosition();
                this._element.css('visibility', 'visible');
            });    
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

    /**
     * Is the tooltip permenantly shown
     * @type {Boolean}
     */
    get permanent() {
        return this._permanent;
    }
    /**
     * Is the tooltip permenantly shown
     * @type {Boolean}
     */
    set permanent(value) {
        this._permanent = value;
        this._showPermanent();
    }
    _showPermanent() {
        if(this._permanent && !this.shown) {
            this.shown = true;
            this.hasShadow = false;
        } 
    }

}