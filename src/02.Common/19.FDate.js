class FDate {
    
    constructor(sec = null, fs = null) {
        
        if (!sec && !fs) {
            this._setNow();
        }

        if(sec instanceof FDate) {
            this._sec = sec.seconds;
            this._fs = sec.fs;
        } else {
            this._sec = sec;
            this._fs  = fs ?? 0;
        }
    }

    _setNow() {
        const nowMs = performance.timeOrigin + performance.now();
        this._fromMilliseconds(nowMs);
    }

    _fromMilliseconds(ms) {
        const sec = Math.floor(ms / 1000);
        const frac = (ms / 1000) - sec;

        this.sec = sec; 
        this.fs  = frac * 1e15;
    }

    _toMilliseconds() {
        return (this.sec + this.fs / 1e15) * 1000;
    }

    static now() {
        return new FDate();
    }

    valueOf() {
        return this._toMilliseconds();
    }

    getTime() {
        return this._toMilliseconds();
    }

    setTime(ms) {
        this._fromMilliseconds(ms);
        return this.getTime();
    }

    toISOString() {
        return new Date(this.getTime()).toISOString();
    }

    toUTCString() {
        return new Date(this.getTime()).toUTCString();
    }

    toString() {
        return new Date(this.getTime()).toString();
    }

    getFullYear() { return new Date(this.getTime()).getUTCFullYear(); }
    getMonth()    { return new Date(this.getTime()).getUTCMonth(); }
    getDate()     { return new Date(this.getTime()).getUTCDate(); }
    getHours()    { return new Date(this.getTime()).getUTCHours(); }
    getMinutes()  { return new Date(this.getTime()).getUTCMinutes(); }
    getSeconds()  { return new Date(this.getTime()).getUTCSeconds(); }
    getMilliseconds() { return Math.floor(this.fs / 1e12); }

    get fs() {
        return this._fs;
    }
    set fs(value) {
        this._fs = value;
    }

    get seconds() {
        return this._sec;
    }
    set seconds(value) {
        this._sec = value;
    }

    clone() {
        return new Float64Date(this);
    }

    compare(other) {
        if (this.sec !== other.sec) return this.seconds - other.seconds;
        return this.fs - other.fs;
    }

}
