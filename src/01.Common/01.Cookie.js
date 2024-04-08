/**
 * Represents a cookie utility for managing cookies in the browser.
 */
Colibri.Common.Cookie = class {
    
    /**
     * Sets a cookie.
     * @param {string} c_name - The name of the cookie.
     * @param {*} value - The value to set for the cookie.
     * @param {number} exdays - The number of days until the cookie expires.
     * @param {string} [path] - The path for which the cookie is valid.
     * @param {string} [domain] - The domain for which the cookie is valid.
     * @param {boolean} [secure] - Whether the cookie should only be sent over secure connections.
     * @param {string} [samesite] - The SameSite attribute for the cookie.
     */
    static Set(c_name, value, exdays, path, domain, secure, samesite) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = encodeURIComponent(value) + 
            ((exdays==null) ? "" : "; expires=" + exdate.toUTCString()) + 
            (path == null ? '; path=/' : '; path=' + path) + 
            (domain ? '; domain=' + domain : '') + 
            (secure !== undefined && secure ? '; secure' : '') + 
            (samesite !== undefined ? '; SameSite=' + samesite : '');
        document.cookie = c_name + "=" + c_value;
    }

    /**
     * Gets the value of a cookie.
     * @param {string} c_name - The name of the cookie to retrieve.
     * @returns {*} - The value of the cookie.
     */
    static Get (c_name) {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for( i=0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substring(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substring(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g,"");
            if(x == c_name)
                return decodeURIComponent(y);
        }
        return null;
    }

    /**
     * Deletes a cookie.
     * @param {string} c_name - The name of the cookie to delete.
     * @param {string} [path] - The path of the cookie to delete.
     * @param {string} [domain] - The domain of the cookie to delete.
     */
    static Delete(c_name, path, domain) {
        document.cookie = c_name + '=;max-age=0;' + (path == null ? '; path=/' : '; path=' + path) + (domain ? '; domain=' + domain : '');
    }
    
}