Colibri.Common.Cookie = class {
    
    static Set(c_name, value, exdays, path, domain, secure, samesite) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + 
            ((exdays==null) ? "" : "; expires=" + exdate.toUTCString()) + 
            (path == null ? '; path=/' : '; path=' + path) + 
            (domain ? '; domain=' + domain : '') + 
            (secure !== undefined && secure ? '; secure' : '') + 
            (samesite !== undefined ? '; SameSite=' + samesite : '');
        document.cookie = c_name + "=" + c_value;
    }

    static Get (c_name) {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for( i=0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g,"");
            if(x == c_name)
                return unescape(y);
        }
        return null;
    }

    static Delete(c_name) {
        document.cookie = c_name + '= ; expires = Thu, 01 Jan 1970 00:00:00 GMT'
    }
    
}