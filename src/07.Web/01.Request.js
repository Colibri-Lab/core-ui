Colibri.Web.Request = class {

    /**
     * Возвращает путь запроса 
     * приоритет на location.hash
     */
    get uri() {
        let h = location.hash ? location.hash.substr(1) : location.pathname;
        if(h.indexOf('?') !== -1) {
            h = h.split('?')[0];
        }
        return h;
    }

    /**
     * Возвращает параметры запроса
     * приоритет на location.hash
     */
     get query() {
        let h = location.hash ? location.hash.substr(1) : location.search;
        if(h.indexOf('?') !== -1) {
            h = h.split('?')[1];
            if(h) {
                return h.toObject(['&', '='])
            }
        }
        return {};
    }

    /**
     * Возвращает путь в hash
     */
    get hash() {
        let h = location.hash ? location.hash.substr(1) : '/';
        if(h.indexOf('?') !== -1) {
            h = h.split('?')[0];
        }
        return h;
    }

}
