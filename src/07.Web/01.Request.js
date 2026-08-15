/**
 * Represents a utility for handling web requests.
 * @class
 * @extends Destructable
 * @memberof Colibri.Web
 */
Colibri.Web.Request = class extends Destructable {

    /**
     * Initializes a new instance of the Request class.
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Retrieves the URI of the request, prioritizing location.hash.
     * @returns {string} - The URI of the request.
     * @example
     * ```
     * const uri = App.Request.uri; // Retrieves the URI of the request
     * ```
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
     * @example
     * ```
     * const path = App.Request.path; // Retrieves the path segments of the request
     * ```
     */
    get path() {
        return this.uri.split('/').filter(v => v != '');
    }

    /**
     * Retrieves the query parameters of the request, prioritizing location.hash.
     * @returns {Object} - The query parameters of the request.
     * @example
     * ```
     * const query = App.Request.query; // Retrieves the query parameters of the request
     * ```
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
     * @example
     * ```
     * const hash = App.Request.hash; // Retrieves the path in the hash
     * ```
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
     * @example
     * ```
     * const root = App.Request.rootPath; // Retrieves the root path
     * ```
     */
    get rootPath() {
        return location.pathname;
    }

    /**
     * Sets the root path.
     * @param {string} [value='/'] - The value to set as the root path.
     * @example
     * ```
     * App.Request.rootPath = '/new-root'; // Sets the root path, actualy calls history.pushState({url: '/new-root'}, '', '/new-root');
     * ```
     */
    set rootPath(value = '/') {
        history.pushState({url: value}, '', value);
    }

}
