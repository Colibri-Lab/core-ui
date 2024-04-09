/**
 * Class representing Base64 encoding and decoding utility functions.
 * @class
 * @memberof Colibri.Common
 */
Colibri.Common.Base64 = class {

    /**
     * Private property containing the Base64 key string.
     * @type {string}
     * @private
     */
    static _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    /**
     * Encode a string using Base64 encoding.
     * @param {string} _input - The input string to encode.
     * @returns {string} The Base64 encoded string.
     */
    static encode(_input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        _input = Colibri.Common.Base64._utf8_encode(_input);

        while (i < _input.length) {

            chr1 = _input.charCodeAt(i++);
            chr2 = _input.charCodeAt(i++);
            chr3 = _input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            Colibri.Common.Base64._keyStr.charAt(enc1) + Colibri.Common.Base64._keyStr.charAt(enc2) +
            Colibri.Common.Base64._keyStr.charAt(enc3) + Colibri.Common.Base64._keyStr.charAt(enc4);
        }
        return output;
    }

    /**
     * Decode a Base64 encoded string.
     * @param {string} _input - The Base64 encoded string to decode.
     * @returns {string} The decoded string.
     */
    static decode(_input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        _input = _input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < _input.length) {

            enc1 = Colibri.Common.Base64._keyStr.indexOf(_input.charAt(i++));
            enc2 = Colibri.Common.Base64._keyStr.indexOf(_input.charAt(i++));
            enc3 = Colibri.Common.Base64._keyStr.indexOf(_input.charAt(i++));
            enc4 = Colibri.Common.Base64._keyStr.indexOf(_input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }

        output = Colibri.Common.Base64._utf8_decode(output);

        return output;
    }

    /**
     * Private method for UTF-8 encoding.
     * @param {string} string - The input string to encode.
     * @returns {string} The UTF-8 encoded string.
     * @private
     */
    static _utf8_encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }

    /**
     * Private method for UTF-8 decoding.
     * @param {string} utftext - The UTF-8 encoded string to decode.
     * @returns {string} The decoded string.
     * @private
     */
    static _utf8_decode(utftext) {
        var string = "";
        var i = 0;
        var c = 0; 
        var c1 = 0;
        var c2 = 0;
        var c3 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }

}