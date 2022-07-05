Colibri.Common.Font = class {

    _list = [];

    constructor() {
        this._load();
    }

    _load() {
        let { fonts } = document;
        const it = fonts.entries();
        
        let arr = [];
        let done = false;
        
        while (!done) {
            const font = it.next();
            if (!font.done) {
                arr.push(font.value[0]);
            } else {
                done = font.done;
            }
        }
            
        this._list = arr;
    }

    static Create() {
        return new Colibri.Common.Font();
    }

    get families() {
        let ret = [];
        for(const font of this._list) {
            ret.push(font.family);
        }
        return Array.unique(ret);
    }

    get lookup() {
        return this.families.map(v => { return {value: v, title: v}; });
    }

    get list() {
        return this._list;
    }

}