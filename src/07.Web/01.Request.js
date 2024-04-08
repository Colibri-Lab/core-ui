/**
 * Represents a utility for handling web requests.
 * @class
 * @extends Destructable
 */
Colibri.Web.Request = class extends Destructable {

    /**
     * Creates an instance of Request.
     */
    constructor() {
        super();
    }

    /**
     * Retrieves the URI of the request, prioritizing location.hash.
     * @returns {string} - The URI of the request.
     */
    get uri() {
        let h = App.Router.type === Colibri.Web.Router.RouteOnHash ? location.hash.substring(1) : location.pathname;
        if(h.indexOf('?') !== -1) {
            h = h.split('?')[0];
        }
        return h;
    }

    /**
     * Retrieves the path segments of the request.
     * @returns {Array} - The path segments of the request.
     */
    get path() {
        return this.uri.split('/').filter(v => v != '');
    }

    /**
     * Retrieves the query parameters of the request, prioritizing location.hash.
     * @returns {Object} - The query parameters of the request.
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
     * Retrieves the path in the hash.
     * @returns {string} - The path in the hash.
     */
    get hash() {
        let h = location.hash ? location.hash.substring(1) : '/';
        if(h.indexOf('?') !== -1) {
            h = h.split('?')[0];
        }
        return h;
    }

    /**
     * Retrieves the root path.
     * @returns {string} - The root path.
     */
    get rootPath() {
        return location.pathname;
    }

    /**
     * Sets the root path.
     * @param {string} [value='/'] - The value to set as the root path.
     */
    set rootPath(value = '/') {
        history.pushState({url: value}, '', value);
    }

}
