/**
 * Represents a utility class for handling MIME types.
 * @class
 * @memberof Colibri.Common
 */
Colibri.Common.MimeType = class {
    
    /**
     * A map of file extensions to MIME types.
     * @type {Object<string, string>}
     */
    static types = {
        "acx" :  "application/internet-property-stream",
        "ai" :  "application/postscript",
        "aif" :  "audio/x-aiff",
        "aifc" :  "audio/x-aiff",
        "aiff" :  "audio/x-aiff",
        "asf" :  "video/x-ms-asf",
        "asr" :  "video/x-ms-asf",
        "asx" :  "video/x-ms-asf",
        "au" :  "audio/basic",
        "avi" :  "video/x-msvideo",
        "flv" :  "video/x-msvideo",
        "axs" :  "application/olescript",
        "bas" :  "text/plain",
        "bcpio" :  "application/x-bcpio",
        "bin" :  "application/octet-stream",
        "bmp" :  "image/bmp",
        "c" :  "text/plain",
        "cat" :  "application/vnd.ms-pkiseccat",
        "cdf" :  "application/x-cdf",
        "cer" :  "application/x-x509-ca-cert",
        "class" :  "application/octet-stream",
        "clp" :  "application/x-msclip",
        "cmx" :  "image/x-cmx",
        "cod" :  "image/cis-cod",
        "cpio" :  "application/x-cpio",
        "crd" :  "application/x-mscardfile",
        "crl" :  "application/pkix-crl",
        "crt" :  "application/x-x509-ca-cert",
        "csh" :  "application/x-csh",
        "css" :  "text/css",
        "dcr" :  "application/x-director",
        "der" :  "application/x-x509-ca-cert",
        "dir" :  "application/x-director",
        "dll" :  "application/x-msdownload",
        "dms" :  "application/octet-stream",
        "doc" :  "application/msword",
        "docx" :  "application/msword",
        "dot" :  "application/msword",
        "dvi" :  "application/x-dvi",
        "dxr" :  "application/x-director",
        "eps" :  "application/postscript",
        "etx" :  "text/x-setext",
        "evy" :  "application/envoy",
        "exe" :  "application/octet-stream",
        "fif" :  "application/fractals",
        "flr" :  "x-world/x-vrml",
        "gif" :  "image/gif",
        "webp" :  "image/webp",
        "gtar" :  "application/x-gtar",
        "gz" :  "application/x-gzip",
        "h" :  "text/plain",
        "hdf" :  "application/x-hdf",
        "hlp" :  "application/winhlp",
        "hqx" :  "application/mac-binhex40",
        "hta" :  "application/hta",
        "htc" :  "text/x-component",
        "html" :  "text/html",
        "htt" :  "text/webviewhtml",
        "ico" :  "image/x-icon",
        "ief" :  "image/ief",
        "iii" :  "application/x-iphone",
        "ins" :  "application/x-internet-signup",
        "isp" :  "application/x-internet-signup",
        "jfif" :  "image/pipeg",
        "jpg" :  "image/jpeg",
        "jpe" :  "image/jpeg",
        "jpeg" : "image/jpeg",
        "png" :  "image/png",
        "js" :   "text/javascript",
        "latex" : "application/x-latex",
        "lha" :  "application/octet-stream",
        "lsf" :  "video/x-la-asf",
        "lsx" :  "video/x-la-asf",
        "lzh" :  "application/octet-stream",
        "m13" :  "application/x-msmediaview",
        "m14" :  "application/x-msmediaview",
        "m3u" :  "audio/x-mpegurl",
        "man" :  "application/x-troff-man",
        "mdb" :  "application/x-msaccess",
        "me" :  "application/x-troff-me",
        "mht" :  "message/rfc822",
        "mhtml" :  "message/rfc822",
        "mid" :  "audio/mid",
        "mny" :  "application/x-msmoney",
        "mov" :  "video/quicktime",
        "movie" :  "video/x-sgi-movie",
        "mp2" :  "video/mpeg",
        "mp3" :  "audio/mpeg",
        "wav" :  "audio/wav",
        "mpa" :  "video/mpeg",
        "mpe" :  "video/mpeg",
        "mpeg" :  "video/mpeg",
        "mpg" :  "video/mpeg",
        "mp4" :  "video/mp4",
        "mpp" :  "application/vnd.ms-project",
        "mpv2" :  "video/mpeg",
        "ms" :  "application/x-troff-ms",
        "mvb" :  "application/x-msmediaview",
        "nws" :  "message/rfc822",
        "oda" :  "application/oda",
        "p10" :  "application/pkcs10",
        "p12" :  "application/x-pkcs12",
        "p7b" :  "application/x-pkcs7-certificates",
        "p7c" :  "application/x-pkcs7-mime",
        "p7m" :  "application/x-pkcs7-mime",
        "p7r" :  "application/x-pkcs7-certreqresp",
        "p7s" :  "application/x-pkcs7-signature",
        "pbm" :  "image/x-portable-bitmap",
        "pdf" :  "application/pdf",
        "pfx" :  "application/x-pkcs12",
        "pgm" :  "image/x-portable-graymap",
        "pko" :  "application/ynd.ms-pkipko",
        "pma" :  "application/x-perfmon",
        "pmc" :  "application/x-perfmon",
        "pml" :  "application/x-perfmon",
        "pmr" :  "application/x-perfmon",
        "pmw" :  "application/x-perfmon",
        "pnm" :  "image/x-portable-anymap",
        "pot":  "application/vnd.ms-powerpoint",
        "ppm" :  "image/x-portable-pixmap",
        "pps" :  "application/vnd.ms-powerpoint",
        "ppt" :  "application/vnd.ms-powerpoint",
        "prf" :  "application/pics-rules",
        "ps" :  "application/postscript",
        "pub" :  "application/x-mspublisher",
        "qt" :  "video/quicktime",
        "ra" :  "audio/x-pn-realaudio",
        "ram" :  "audio/x-pn-realaudio",
        "ras" :  "image/x-cmu-raster",
        "rgb" :  "image/x-rgb",
        "rmi" :  "audio/mid",
        "roff" :  "application/x-troff",
        "rtf" :  "application/rtf",
        "rtx" :  "text/richtext",
        "scd" :  "application/x-msschedule",
        "sct" :  "text/scriptlet",
        "setpay" :  "application/set-payment-initiation",
        "setreg" :  "application/set-registration-initiation",
        "sh" :  "application/x-sh",
        "shar" :  "application/x-shar",
        "sit" :  "application/x-stuffit",
        "snd" :  "audio/basic",
        "spc" :  "application/x-pkcs7-certificates",
        "spl" :  "application/futuresplash",
        "src" :  "application/x-wais-source",
        "sst" :  "application/vnd.ms-pkicertstore",
        "stl" :  "application/vnd.ms-pkistl",
        "sv4cpio" :  "application/x-sv4cpio",
        "sv4crc" :  "application/x-sv4crc",
        "t" :  "application/x-troff",
        "tar" :  "application/x-tar",
        "tcl" :  "application/x-tcl",
        "tex" :  "application/x-tex",
        "texi" :  "application/x-texinfo",
        "texinfo" :  "application/x-texinfo",
        "tgz" :  "application/x-compressed",
        "tif" :  "image/tiff",
        "tiff" :  "image/tiff",
        "tr" :  "application/x-troff",
        "trm" :  "application/x-msterminal",
        "tsv" :  "text/tab-separated-values",
        "txt" :  "text/plain",
        "uls" :  "text/iuls",
        "ustar" :  "application/x-ustar",
        "vcf" :  "text/x-vcard",
        "vrml" :  "x-world/x-vrml",
        "wcm" :  "application/vnd.ms-works",
        "wdb" :  "application/vnd.ms-works",
        "wks" :  "application/vnd.ms-works",
        "wmf" :  "application/x-msmetafile",
        "wps" :  "application/vnd.ms-works",
        "wri" :  "application/x-mswrite",
        "wrl" :  "x-world/x-vrml",
        "wrz" :  "x-world/x-vrml",
        "xaf" :  "x-world/x-vrml",
        "xbm" :  "image/x-xbitmap",
        "xla" :  "application/vnd.ms-excel",
        "xlc" :  "application/vnd.ms-excel",
        "xlm" :  "application/vnd.ms-excel",
        "xls" :  "application/vnd.ms-excel",
        "xlsx" :  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "xlt" :  "application/vnd.ms-excel",
        "xlw" :  "application/vnd.ms-excel",
        "xof" :  "x-world/x-vrml",
        "xpm" :  "image/x-xpixmap",
        "xwd" :  "image/x-xwindowdump",
        "z" :  "application/x-compress",
        "zip" :  "application/zip", 
        "swf" : "application/x-shockwave-flash",
        "svg" : "image/svg+xml",
        "xml": "application/xml",
        "json": "application/json"
        
    }

    static externalTypes = {};

    /**
     * Returns the MIME type associated with the given file extension.
     * @param {string} ext - The file extension.
     * @returns {string|undefined} The MIME type, or undefined if not found.
     */
    static ext2type(ext) {
        if(Colibri.Common.MimeType.externalTypes) {
            let founded = null;
            Object.forEach(Colibri.Common.MimeType.externalTypes, (mimetype, value) => {
                const found = value.extensions ? value.extensions.filter(v => ext === v) : [];
                if(found.length > 0) {
                    founded = mimetype;
                    return false;
                }
                return true;
            });
            return founded;
        }
        return Colibri.Common.MimeType.types[ext];
    }

    /**
     * Returns the file extension associated with the given MIME type.
     * @param {string} type - The MIME type.
     * @returns {string|false} The file extension, or false if not found.
     */
    static type2ext(type) {
        if(Colibri.Common.MimeType.externalTypes) {
            if(Colibri.Common.MimeType.externalTypes[type]) {
                return Colibri.Common.MimeType.externalTypes[type].extensions[0];
            } else {
                return null;
            }
        } else {
            for(const key of Object.keys(Colibri.Common.MimeType.types)) {
                if(type == Colibri.Common.MimeType.types[key]) { 
                    return key;
                 }
            }
        }
        return false;
    }

    /**
     * Returns the file extension associated with the given base64 encoded data.
     * @param {string} base - The base64 encoded data.
     * @returns {string|false} The file extension, or false if not found.
     */
    static base2type(base) {
        var ret = false;
        var type = base.split('data:')[1];
        type = type.split(';')[0];
        Object.keys(Colibri.Common.MimeType.types).forEach(key => {
            if(type == Colibri.Common.MimeType.types[key]) { ret = key; return false; }
            return true;
        });
        return ret;
    }

    static name2type(name) {
        var parts = name.split('.');
        var ext = parts[parts.length - 1];
        return Colibri.Common.MimeType.ext2type(ext);
    }

    /**
     * Check if a file with the given extension is an image.
     * @param {string} ext - The file extension.
     * @returns {boolean} True if the file is an image, otherwise false.
     */
    static isImage(ext) { 
        if(ext.indexOf('/') !== -1) {
            return ext.split('/')[0] === 'image';
        }
        return ["gif", "jpeg", "jpg", "png", "bmp", "dib", "svg", "webp"].indexOf(ext.toLowerCase()) != -1; 
    }
    /**
     * Check if a file with the given extension is an audio file.
     * @param {string} ext - The file extension.
     * @returns {boolean} True if the file is an audio file, otherwise false.
     */
    static isAudio(ext) { 
        if(ext.indexOf('/') !== -1) {
            return ext.split('/')[0] === 'audio';
        }
        return ["mid", "mp3", "au","wav"].indexOf(ext.toLowerCase()) != -1; 
    }
    /**
     * Check if a file with the given extension is a video file.
     * @param {string} ext - The file extension.
     * @returns {boolean} True if the file is a video file, otherwise false.
     */
    static isVideo(ext) { 
        if(ext.indexOf('/') !== -1) {
            return ext.split('/')[0] === 'video';
        }    
        return ["wmv", "mpg", "mp4", "webm"].indexOf(ext.toLowerCase()) != -1; 
    }
    /**
     * Check if a file with the given extension is a Flash file.
     * @param {string} ext - The file extension.
     * @returns {boolean} True if the file is a Flash file, otherwise false.
     */
    static isFlash(ext) { return ["swf"].indexOf(ext.toLowerCase()) != -1; }
    /**
     * Check if a file with the given extension is editable.
     * @param {string} ext - The file extension.
     * @returns {boolean} True if the file is editable, otherwise false.
     */
    static isEditable(ext) { return ["txt", "js", "css", "scss", "less", "layout", "php", "htm", "html", "service", "xml", "xsl"].indexOf(ext.toLowerCase()) != -1; }
    /**
     * Check if a file with the given extension is viewable.
     * @param {string} ext - The file extension.
     * @returns {boolean} True if the file is viewable, otherwise false.
     */
    static isBrowserCapable(ext) { return ["jpg", "png", "gif", "swf", "html", "htm", "txt", "css", "js", "pdf", "wmv", "mpg", "mp4", "mid", "mp3", "au"].indexOf(ext.toLowerCase()) != -1; }
    /**
     * Get the icon class for a file with the given extension.
     * @param {string} ext - The file extension.
     * @returns {string} The icon class.
     */
    static isViewable(ext) { return isImage(ext) || isFlash(ext); }
    /**
     * Get the CodeMirror mode associated with a given file extension.
     * @param {string} ext - The file extension.
     * @returns {string} The CodeMirror mode.
     */
    static icon(ext) { return 'icon-file-' + ext; }
    
    /**
     * Get the CodeMirror mode associated with a given file extension.
     * @param {string} ext - The file extension.
     * @returns {string} The CodeMirror mode.
     */
    static ext2mode(ext) {
        
        if(ext == 'js') return 'javascript';
        else if(ext == 'css') return 'css';
        else if(ext == 'less') return 'text/x-less';
        else if(ext == 'scss') return 'text/x-scss';
        else if(ext == 'html' || ext == 'htm') return 'htmlmixed';
        else if(ext == 'php' || ext == 'layout' || ext == 'release' || ext == 'service') return 'php';
        else if(ext == 'xml') return 'xml';
        else if(ext == 'yaml') return 'yaml';
        else return Colibri.Common.MimeType.ext2type(ext);
        
    }

    /**
     * Get the CodeMirror requirements for a given file extension.
     * @param {string} ext - The file extension.
     * @param {string} [path='/res/codemirror'] - The base path for resources.
     * @returns {Object<string, string[]>} The CodeMirror requirements.
     */
    static extrequirements(ext, path = '/res/codemirror') {
        
        if(ext == 'js') return {
            js: [path + '/addon/hint/show-hint.js', path + '/addon/hint/javascript-hint.js', path + '/mode/javascript/javascript.js', path + '/addon/selection/active-line.js', path + '/addon/edit/matchbrackets.js', path + '/addon/fold/foldcode.js', path + '/addon/fold/foldgutter.js', path + '/addon/fold/brace-fold.js', path + '/addon/fold/xml-fold.js', path + '/addon/fold/indent-fold.js', path + '/addon/fold/comment-fold.js', path + '/addon/dialog/dialog.js', path + '/addon/search/searchcursor.js', path + '/addon/search/search.js', path + '/addon/scroll/annotatescrollbar.js', path + '/addon/search/matchesonscrollbar.js', path + '/addon/search/jump-to-line.js', path + '/addon/display/placeholder.js'], 
            css: [path + '/addon/hint/show-hint.css', path + '/addon/fold/foldgutter.css', path + '/addon/dialog/dialog.css', path + '/addon/search/matchesonscrollbar.css']};
        else if(ext == 'css' || ext == 'scss' || ext == 'less') return {
            js: [path + '/addon/hint/show-hint.js', path + '/addon/hint/css-hint.js', path + '/addon/hint/show-hint.js', path + '/addon/hint/css-hint.js', path + '/mode/css/css.js', path + '/addon/selection/active-line.js', path + '/addon/edit/matchbrackets.js', path + '/addon/fold/foldcode.js', path + '/addon/fold/foldgutter.js', path + '/addon/fold/brace-fold.js', path + '/addon/fold/xml-fold.js', path + '/addon/fold/indent-fold.js', path + '/addon/fold/comment-fold.js', path + '/addon/dialog/dialog.js', path + '/addon/search/searchcursor.js', path + '/addon/search/search.js', path + '/addon/scroll/annotatescrollbar.js', path + '/addon/search/matchesonscrollbar.js', path + '/addon/search/jump-to-line.js', path + '/addon/display/placeholder.js'], 
            css: [path + '/addon/hint/show-hint.css', path + '/addon/fold/foldgutter.css', path + '/addon/dialog/dialog.css', path + '/addon/search/matchesonscrollbar.css']};
        else if(ext == 'html' || ext == 'htm') return {
            js: [path + '/mode/xml/xml.js', path + '/addon/hint/show-hint.js', path + '/addon/hint/html-hint.js', path + '/mode/htmlmixed/htmlmixed.js', path + '/addon/selection/active-line.js', path + '/addon/edit/matchbrackets.js', path + '/addon/fold/foldcode.js', path + '/addon/fold/foldgutter.js', path + '/addon/fold/brace-fold.js', path + '/addon/fold/xml-fold.js', path + '/addon/fold/indent-fold.js', path + '/addon/fold/comment-fold.js', path + '/addon/dialog/dialog.js', path + '/addon/search/searchcursor.js', path + '/addon/search/search.js', path + '/addon/scroll/annotatescrollbar.js', path + '/addon/search/matchesonscrollbar.js', path + '/addon/search/jump-to-line.js', path + '/addon/display/placeholder.js'], 
            css: [path + '/addon/hint/show-hint.css', path + '/addon/fold/foldgutter.css', path + '/addon/dialog/dialog.css', path + '/addon/search/matchesonscrollbar.css']};
        else if(ext == 'php') return {
            js: [path + '/addon/hint/show-hint.js', path + '/addon/hint/html-hint.js', path + '/mode/htmlmixed/htmlmixed.js', path + '/mode/xml/xml.js', path + '/mode/javascript/javascript.js', path + '/mode/css/css.js', path + '/mode/clike/clike.js', path + '/mode/php/php.js', path + '/addon/selection/active-line.js', path + '/addon/edit/matchbrackets.js', path + '/addon/fold/foldcode.js', path + '/addon/fold/foldgutter.js', path + '/addon/fold/brace-fold.js', path + '/addon/fold/xml-fold.js', path + '/addon/fold/indent-fold.js', path + '/addon/fold/comment-fold.js', path + '/addon/dialog/dialog.js', path + '/addon/search/searchcursor.js', path + '/addon/search/search.js', path + '/addon/scroll/annotatescrollbar.js', path + '/addon/search/matchesonscrollbar.js', path + '/addon/search/jump-to-line.js', path + '/addon/display/placeholder.js'], 
            css: [path + '/addon/hint/show-hint.css', path + '/addon/fold/foldgutter.css', path + '/addon/dialog/dialog.css', path + '/addon/search/matchesonscrollbar.css']};
        else if(ext == 'xml') return {
            js: [path + '/addon/hint/show-hint.js', path + '/addon/hint/xml-hint.js', path + '/mode/xml/xml.js', path + '/addon/selection/active-line.js', path + '/addon/edit/matchbrackets.js', path + '/addon/fold/foldcode.js', path + '/addon/fold/foldgutter.js', path + '/addon/fold/brace-fold.js', path + '/addon/fold/xml-fold.js', path + '/addon/fold/indent-fold.js', path + '/addon/fold/comment-fold.js', path + '/addon/dialog/dialog.js', path + '/addon/search/searchcursor.js', path + '/addon/search/search.js', path + '/addon/scroll/annotatescrollbar.js', path + '/addon/search/matchesonscrollbar.js', path + '/addon/search/jump-to-line.js', path + '/addon/display/placeholder.js'], 
            css: [path + '/addon/hint/show-hint.css', path + '/addon/fold/foldgutter.css', path + '/addon/dialog/dialog.css', path + '/addon/search/matchesonscrollbar.css']};
        else if(ext == 'yaml') return {
            js: [path + '/mode/yaml/yaml.js', path + '/addon/selection/active-line.js', path + '/addon/edit/matchbrackets.js', path + '/addon/fold/foldcode.js', path + '/addon/fold/foldgutter.js', path + '/addon/fold/brace-fold.js', path + '/addon/fold/xml-fold.js', path + '/addon/fold/indent-fold.js', path + '/addon/fold/comment-fold.js', path + '/addon/dialog/dialog.js', path + '/addon/search/searchcursor.js', path + '/addon/search/search.js', path + '/addon/scroll/annotatescrollbar.js', path + '/addon/search/matchesonscrollbar.js', path + '/addon/search/jump-to-line.js', path + '/addon/display/placeholder.js'], 
            css: [path + '/addon/fold/foldgutter.css', path + '/addon/dialog/dialog.css', path + '/addon/search/matchesonscrollbar.css']};
        else return {
            js: [path + '/mode/xml/xml.js', path + '/addon/hint/show-hint.js', path + '/addon/hint/javascript-hint.js', path + '/addon/selection/active-line.js', path + '/addon/edit/matchbrackets.js', path + '/addon/fold/foldcode.js', path + '/addon/fold/foldgutter.js', path + '/addon/fold/brace-fold.js', path + '/addon/fold/xml-fold.js', path + '/addon/fold/indent-fold.js', path + '/addon/fold/comment-fold.js', path + '/addon/dialog/dialog.js', path + '/addon/search/searchcursor.js', path + '/addon/search/search.js', path + '/addon/scroll/annotatescrollbar.js', path + '/addon/search/matchesonscrollbar.js', path + '/addon/search/jump-to-line.js', path + '/addon/display/placeholder.js'], 
            css: [path + '/addon/hint/show-hint.css', path + '/addon/fold/foldgutter.css', path + '/addon/dialog/dialog.css', path + '/addon/search/matchesonscrollbar.css']};
        
    }


}

Colibri.Common.MimeType.Reload = () => {
    return new Promise((resolve, reject) => {        
        Colibri.IO.Request.Get('https://cdn.jsdelivr.net/gh/jshttp/mime-db@master/db.json', {}, {}, false).then((response) => {
            Colibri.Common.MimeType.externalTypes = JSON.parse(response.result);
            resolve();
        }).catch((error) => {
            console.log(error);
            reject(error);
        });
    });
}

