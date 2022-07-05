Colibri.UI.Rgb = class {

    _r = 0;
    _g = 0;
    _b = 0;
    _a = 1;

    constructor(r = 0, g = 0, b = 0, a = 255) {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;
    }
    
    static Create(r = 0, g = 0, b = 0, a = 255) {
        return new Colibri.UI.Rgb(r, g, b, a);
    }

    fromObject(obj) {
        this._r = obj.r;
        this._g = obj.g;
        this._b = obj.b;
        this._a = obj.a ?? 255;
        return this;
    }

    fromHex(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]*?)$/i.exec(hex);
        if(!result) {
            this._r = this._g = this._b = 0;
        }
        else {
            this._r = parseInt(result[1], 16);
            this._g = parseInt(result[2], 16);
            this._b = parseInt(result[3], 16);    
            this._a = result[4] ? parseInt(result[4], 16) : this._a;    
        }
        return this;
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  l       The lightness
     */
    fromHSL(h,s,l) {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        this._r = parseInt(r * 255);
        this._g = parseInt(g * 255);
        this._b = parseInt(b * 255);
        return this;
    }

    /**
     * Converts an HSV color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes h, s, and v are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  v       The value
     * @return  Array           The RGB representation
     */
    fromHSV(h, s, v) {

        var r, g, b;

        if(h instanceof Object) {
            s = h.s;
            v = h.v;
            h = h.h;
        }

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        this._r = parseInt(r * 255);
        this._g = parseInt(g * 255);
        this._b = parseInt(b * 255);
        return this;
    }

    fromHue(hue) {
        this.fromHSV(hue, 1, 1);
        return this;
    }

    _toHex() {
        try {
            let alpha = this._a.toString(16).expand('0', 2);
            return '#' + this._r.toString(16).expand('0', 2) + this._g.toString(16).expand('0', 2) + this._b.toString(16).expand('0', 2) + (alpha == 'ff' ? '' : alpha); 
        }
        catch(e) {
            return '';
        }
    }

    _getHue() {
        return this._getHSV().h;
    }

    _getHSL() {
        const r = this._r / 255, g = this._g / 255, b = this._b / 255;

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

    _getHSV() {
        let r = this._r / 255, g = this._g / 255, b = this._b / 255;

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max == 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h, s: s, v: v };
    }

    get red() {
        return this._r;
    }
    get green() {
        return this._g;
    }
    get blue() {
        return this._g;
    }
    get alpha() {
        return this._a;
    }
    get hue() {
        return this._getHue();
    }
    get hex() {
        return this._toHex();
    }
    get hsl() {
        return this._getHSL();
    }
    get hsv() {
        return this._getHSV();
    }    

    set alpha(value) {
        this._a = value;
    }
}