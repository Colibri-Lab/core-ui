/**
 * @class
 * @extends Colibri.UI.Component
 * @memberof Colibri.UI
 */
Colibri.UI.ToolTip = class extends Colibri.UI.Component {

    /** Left bottom */
    static LB = 'lb';
    /** Left top */
    static LT = 'lt';
    /** Left middle */
    static LM = 'lm';
    /** Right bottom */
    static RB = 'rb';
    /** Right top */
    static RT = 'rt';
    /** Right middle */
    static RM = 'rm';

    /**
     * @constructor
     * @param {string} name Coponent name
     * @param {*} container Component container|parenbt
     * @param {Array} orientation coords on container to point to, and orientation around the container, example: rt, rb; rt - container coords, rb - orientation
     * @param {{left, top}|null} point point to show tooltip
     * @param {boolean} permanent is tooltip shows permanently 
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

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __thisShadowClicked(event, args) {
        if(!this._permanent) {
            this.shown = false;
        }
    }

    /**
     * Container element
     * @type {Element}
     * @readonly
     */
    get container() {
        return this._contentContainer.container;
    } 

    /**
     * Orientation
     * @type {Array<string>}
     */
    get orientation() {
        return this._orientation;
    }

    /**
     * Orientation
     * @type {Array<string>}
     */
    set orientation(value) {
        this._orientation = value;
        this._element.data('orientation', value);
    }

    /** @private */
    _findParent() {
        return this.parent ?? null;
    }

    /** @private */
    _findPointOnParent() {
        try {
            const parent = this._findParent();
            const ori = this._orientation[0];
            const parentBounds = parent.container ? parent.container.bounds(true, true) : {top: 0, left: 0, width: 0, height: 0};
            if(parent?.container?.contains(this._element)) {
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
        } catch(e) {

        }
        
        return {left: 0, top: 0};    
    }

    /** @private */
    _getOrientationPoint(pointOnParent) {
        const ori = this._orientation[1];
        const thisBounds = this._element.bounds(true, true);
        switch(ori) {
            default:
            case Colibri.UI.ToolTip.LB: {
                return {
                    left: pointOnParent.left, 
                    top: pointOnParent.top - thisBounds.outerHeight
                };
            }
            case Colibri.UI.ToolTip.LM: {
                return {
                    left: pointOnParent.left, 
                    top: pointOnParent.top - (thisBounds.outerHeight / 2) - 10
                };
            }
            case Colibri.UI.ToolTip.LT: {
                return {
                    left: pointOnParent.left, 
                    top: pointOnParent.top  - 10
                };
            }
            case Colibri.UI.ToolTip.RB: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth, 
                    top: pointOnParent.top - thisBounds.outerHeight - 10
                };
            }
            case Colibri.UI.ToolTip.RT: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth, 
                    top: pointOnParent.top - 10
                };
            }
            case Colibri.UI.ToolTip.RM: {
                return {
                    left: pointOnParent.left - thisBounds.outerWidth, 
                    top: pointOnParent.top - (thisBounds.outerHeight / 2) - 10
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
        this.hasShadow = value && !this._permanent;
        if(value) {
            this._element.css('visibility', 'hidden');
            Colibri.Common.Delay(10).then(() => {
                this._setPosition();
                this._element.css('visibility', 'visible');
            });    
        }
    }

    /**
     * Show tooltip on component
     * @param {Colibri.UI.Component} parent parent component
     */
    Show(parent = null, permanent = false) {
        if(parent) {
            this.parent = parent;
        }
        this.permanent = permanent;
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
    /** @private */
    _showPermanent() {
        if(this._permanent && !this.shown) {
            this.shown = true;
            this.hasShadow = false;
        } 
    }

}