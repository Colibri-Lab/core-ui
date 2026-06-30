Colibri.Common.FDate = class {

    constructor(ms = null, ns = 0) {

        if(ms === null) {
            this._setNow();
        } else if(ms instanceof Colibri.Common.FDate) {
            this._ms = ms._ms;
            this._ns = ms._ns;
        } else {
            this._ms = Number(ms);
            this._ns = Number(ns);
        }
    }

    _setNow() {
        const now = performance.timeOrigin + performance.now();
        this._ms = Math.floor(now);
        this._ns = Math.round((now - this._ms) * 1e6);
    }

    static now() {
        return new Colibri.Common.FDate();
    }

    static parse(s) {
        const [date, ns] = s.split("/");

        const ms = Date.parse(date.slice(0, 23) + "Z");

        return new Colibri.Common.FDate(ms, Number(ns));
    }

    valueOf() {
        return this._ms;
    }

    toDate() {
        return new Date(this._ms);
    }

    getTime() {
        return this._ms;
    }

    setTime(ms) {
        this._ms = Number(ms);
        this._ns = 0;
        return this._ms;
    }

    toISOString() {
        return new Date(this._ms).toISOString();
    }

    toUTCString() {
        return new Date(this._ms).toUTCString();
    }

    toString() {
        return this.__toString();
    }

    __toString() {

        const d = new Date(this._ms);

        const yyyy = d.getUTCFullYear();
        const MM = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');

        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mm = String(d.getUTCMinutes()).padStart(2, '0');
        const ss = String(d.getUTCSeconds()).padStart(2, '0');

        const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
        const ns = String(this._ns).padStart(6, '0');

        return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.${ms}${ns}`;
    }

    getFullYear() { return new Date(this._ms).getUTCFullYear(); }
    getMonth() { return new Date(this._ms).getUTCMonth(); }
    getDate() { return new Date(this._ms).getUTCDate(); }
    getHours() { return new Date(this._ms).getUTCHours(); }
    getMinutes() { return new Date(this._ms).getUTCMinutes(); }
    getSeconds() { return new Date(this._ms).getUTCSeconds(); }
    getMilliseconds() { return new Date(this._ms).getUTCMilliseconds(); }

    get nanoseconds() {
        return this._ns;
    }

    set nanoseconds(value) {
        this._ns = Number(value);
    }

    get milliseconds() {
        return this._ms;
    }

    set milliseconds(value) {
        this._ms = Number(value);
    }

    clone() {
        return new Colibri.Common.FDate(this);
    }

    compare(other) {
        if(this._ms !== other._ms)
            return this._ms - other._ms;

        return this._ns - other._ns;
    }

    toBigIntNanoseconds() {
        return BigInt(this._ms) * 1000000n + BigInt(this._ns);
    }

    static fromBigIntNanoseconds(ns) {
        const ms = Number(ns / 1000000n);
        const nano = Number(ns % 1_000_000n);
        return new Colibri.Common.FDate(ms, nano);
    }

    addNanoseconds(ns) {
        const totalNs = this.toBigIntNanoseconds() + BigInt(ns);
        return Colibri.Common.FDate.fromBigIntNanoseconds(totalNs);
    }

}