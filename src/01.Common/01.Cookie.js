Colibri.Common.Cookie = class {
    
    static Set(c_name, value, exdays, path, domain, secure, samesite) {

        if(App.Device.isIOs && WKWebViewCookies) {
            WKWebViewCookies.setCookie({
                name: c_name,
                value: value,
                domain: domain
            });
        } else {
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
    }

    static Get (c_name) {
        if(App.Device.isIOs && WKWebViewCookies) {
            return WKWebViewCookies[c_name];
        } else {
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
    }

    static Delete(c_name, path, domain) {
        document.cookie = c_name + '=;max-age=0;' + (path == null ? '; path=/' : '; path=' + path) + (domain ? '; domain=' + domain : '');
    }
    
}