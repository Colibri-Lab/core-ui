Colibri.Common.BrowserStorage = class {
    
    constructor() {

    }

    Set(name, value = true) {
        window.localStorage.setItem(name, value);
    }

    Get(name) {
        return window.localStorage.getItem(name);
    }

    Delete(name) {
        window.localStorage.removeItem(name);
    }

    Has(name) {
        return !!this.Get(name);
    }

    
}