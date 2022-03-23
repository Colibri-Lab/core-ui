Colibri.Common.BrowserStorage = class {
    
    constructor() {

    }

    Set(name, value = true) {
        window.localStorage.setItem(name, value);
    }

    Get(name) {
        return window.localStorage.getItem(name);
    }

    Has(name) {
        return this.Get(name) === true || this.Get(name) === 'true';
    }

    
}