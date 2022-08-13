Colibri.Common.Scrolling = class {


    constructor(element) {
        
        this._element = element;

        this.supportsPassive = false;
        // try {
        //   window.addEventListener('test', null, Object.defineProperty({}, 'passive', { get: function () { this.supportsPassive = true; }  }));
        // } catch(e) {
        //     console.log('supportsPassive', e)
        // }
        // console.log('supportsPassive', this.supportsPassive);
        
        this.wheelOpt = this.supportsPassive ? { passive: false } : false;
        this.wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
    
    }

    Create(element) {
        return new Colibri.Common.Scrolling(element);
    }

    __preventDefault(e) {
        try { e.preventDefault(); } catch(e) {}
    }

    __preventDefaultForScrollKeys(e) {
        const keys = [37,38,39,40];
        if (keys.indexOf(e.keyCode) !== -1) {
            this.__preventDefault(e);
            return false;
        }
        return true;
    }
    

    Disable() {
        this._element.addEventListener('DOMMouseScroll', this.__preventDefault, false); // older FF
        this._element.addEventListener(this.wheelEvent, this.__preventDefault, this.wheelOpt); // modern desktop
        this._element.addEventListener('touchmove', this.__preventDefault, this.wheelOpt); // mobile
        this._element.addEventListener('keydown', this.__preventDefaultForScrollKeys, false);
    }

    Enable() {
        this._element.removeEventListener('DOMMouseScroll', this.__preventDefault, false);
        this._element.removeEventListener(this.wheelEvent, this.__preventDefault, this.wheelOpt); 
        this._element.removeEventListener('touchmove', this.__preventDefault, this.wheelOpt);
        this._element.removeEventListener('keydown', this.__preventDefaultForScrollKeys, false);
    }

}