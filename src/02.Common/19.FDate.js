Colibri.Common.FDate = class {

    constructor(sec = null, fs = null) {

        if (!sec && !fs) {
            this._setNow();
        }

        if (sec instanceof Colibri.Common.FDate) {
            this._sec = sec.seconds;
            this._fs = sec.fs;
        } else {
            this._sec = sec;
            this._fs = fs ?? 0;
        }
    }

    _setNow() {
        const nowMs = performance.timeOrigin + performance.now();
        this._fromMilliseconds(nowMs);
    }

    _fromMilliseconds(ms) {
        const sec = Math.floor(ms / 1000);
        const frac = (ms / 1000) - sec;

        this.seconds = sec;
        this.fs = frac * 1e15;
    }

    _toMilliseconds() {
        return (this.seconds + this.fs / 1e15) * 1000;
    }

    static now() {
        return new Colibri.Common.FDate();
    }

    static parse(s) {
        const [datePart, fsStr] = s.split("/");

        // Парсим читаемую дату (секунда целиком)
        const dateMs = Date.parse(datePart.slice(0, 19) + "Z"); // ms
        if (isNaN(dateMs)) throw new Error("Invalid date string");

        const sec = dateMs / 1000; // Float64 seconds
        const fs = Number(fsStr); // Float64 femtoseconds

        return new Colibri.Common.FDate(sec, fs);
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
        return this.__toString();
    }

    __toString() {
        // Читаемая дата из целой части секунд
        const secInt = Math.floor(this._sec);
        const date = new Date(secInt * 1000).toISOString().slice(0, 19);

        // Дробная часть для визуализации (секунды + часть fs), не для восстановления
        const fracSec = this._sec - secInt;
        const displayFrac = (fracSec + this._fs / 1e15).toFixed(15).slice(2);

        // Итоговая строка: YYYY-MM-DDTHH:MM:SS.<displayFrac>/fs
        return `${date}.${displayFrac}/${this._fs.toPrecision(17)}`;
    }

    getFullYear() { return new Date(this.getTime()).getUTCFullYear(); }
    getMonth() { return new Date(this.getTime()).getUTCMonth(); }
    getDate() { return new Date(this.getTime()).getUTCDate(); }
    getHours() { return new Date(this.getTime()).getUTCHours(); }
    getMinutes() { return new Date(this.getTime()).getUTCMinutes(); }
    getSeconds() { return new Date(this.getTime()).getUTCSeconds(); }
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
        if (this.seconds !== other.seconds) return this.seconds - other.seconds;
        return this.fs - other.fs;
    }

}
