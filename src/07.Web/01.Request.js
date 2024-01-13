Colibri.Web.Request = class extends Destructable {

    constructor() {
        super();
    }

    /**
     * Возвращает путь запроса 
     * приоритет на location.hash
     */
    get uri() {
        let h = App.Router.type === Colibri.Web.Router.RouteOnHash ? location.hash.substring(1) : location.pathname;
        if(h.indexOf('?') !== -1) {
            h = h.split('?')[0];
        }
        return h;
    }

    /**
     * Возвращает путь запроса 
     * приоритет на location.hash
     */
    get path() {
        return this.uri.split('/').filter(v => v != '');
    }

    /**
     * Возвращает параметры запроса
     * приоритет на location.hash
     */
     get query() {
        let h = location.hash ? location.hash.substring(1) : location.search;
        if(h.indexOf('?') !== -1) {
            h = h.split('?')[1];
            if(h) {
                return h.toObject(['&', '='], (v) => decodeURI(v));
            }
        }
        return {};
    }

    /**
     * Возвращает путь в hash
     */
    get hash() {
        let h = location.hash ? location.hash.substring(1) : '/';
        if(h.indexOf('?') !== -1) {
            h = h.split('?')[0];
        }
        return h;
    }

}
