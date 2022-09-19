
const json_object = function(v) {
    return JSON.parse(v || '{}');
}

const json_array = function(v) {
    return JSON.parse(v || '[]');
}

const eval_default_values = function(defaultAsString) {
    if(typeof defaultAsString == 'string' && (defaultAsString.indexOf('json_object') !== -1 || defaultAsString.indexOf('json_array') !== -1)) {
        return eval(defaultAsString); 
    }
    return defaultAsString; 
}

const isIterable = (value) => {
    return Symbol.iterator in Object(value);
}

Array.unique = function(a) { return a.filter((v, i, ab) => { return a.indexOf(v) === i; }); }
Array.merge = function(a, ar) { 
    ar.forEach((o) => a.push(o));
    return this;
}
Array.part = function(a, e) {
    var r = [];
    a.forEach((o) => {
        if (eval(e))
            r.push(o);
    });
    return r;
}
Array.find = function(a, k, v) {
    var found = false;
    a.forEach((vv) => {
        if (vv[k] == v) {
            found = vv;
            return false;
        }
    });
    return found;
}

Array.findIndex = function(a, predicate) {
    if (a == null) {
        throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
    }
    var list = Object(a);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
            return i;
        }
    }
    return -1;
};

Array.enumerate = function(start, end, callback) {
    let ret = [];
    for(let i=start; i<=end; i++) {
        ret.push(callback(i));
    }
    return ret;
}

Array.enumerateRev = function(start, end, callback) {
    let ret = [];
    for(let i=end; i>=start; i--) {
        ret.push(callback(i));
    }
    return ret;
}

Array.toObject = function(a) {
    let ret = {};
    a.forEach((v, i) => {
        ret[i] = v;
    });
    return ret;
}

Array.findObject = function(arr, field, value) {
    for(let i=0; i<arr.length; i++) {
        const o = arr[i];
        if(o[field] == value) {
            return o;
        }
    }
    return null;
};

Array.replaceObject = function(arr, field, value, replace = null) {
    for(let i=0; i<arr.length;i++) {
        if(arr[i][field] == value) {
            if(replace) {
                arr[i] = replace;
            }
            else {
                arr.splice(i, 1);
            }
            return arr;
        }
    }
    arr.push(replace);
    return arr;
};

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }    
        else if(this[i] instanceof Object && array[i] instanceof Object) {
            if(!Object.shallowEqual(this[i], array[i])) {
                return false;
            }
        }       
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}

Array.toObjectWithKeys = function(array, fieldKey, fieldValue) {
    let ret = {};
    array.forEach((item) => {
        ret[item[fieldKey]] = item[fieldValue];
    });
    return ret;
}


// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

Object.forEach = function(o, callback) {
    if(!o) {
        return;
    }

    let keys = Object.keys(o);
    for (let i = 0; i < keys.length; i++) {
        if (o.hasOwnProperty(keys[i])) {
            if (callback.apply(o, [keys[i], o[keys[i]], i]) === false) {
                break;
            }
        }
    }
}

Object.forReverseEach = function(o, callback) {
    if(!o) {
        return;
    }
    
    let keys = Object.keys(o);
    for (let i = keys.length - 1; i >= 0; i--) {
        let k = keys[i];
        if (o.hasOwnProperty(k)) {
            if (callback.apply(o, [k, o[k]]) === false) {
                return false;
            }
        }
    }
}

Object.indexOf = function(o, name) {
    const keys = Object.keys(o);
    return keys.indexOf(name);
};

Object.countKeys = function(o) { return Object.keys(o).length; };

Object.toQueryString = function(o, splittersArray) {
    let ret = [];
    Object.keys(o).forEach((key) => {
        ret.push(key + splittersArray[1] + encodeURI(o[key]));
    });
    return ret.join(splittersArray[0]);
};

Object.toStyles = function(o) {
    let splittersArray = [';', ':'];
    let ret = [];
    Object.keys(o).forEach((key) => {
        if(o[key]) {
            ret.push(key.fromCamelCase('-') + splittersArray[1] + o[key]);
        }
    });
    return ret.join(splittersArray[0]);
};

Object.insertAt = function(object, key, value, index) {

    // Create a temp object and index variable
    let temp = {};
    let i = 0;
    let added = false;

    Object.forEach(object, (n, v) => {
        // If the indexes match, add the new item
        if (i === index && key && value) {
            temp[key] = value;
            added = true;
        }
        // Add the current item in the loop to the temp obj
        temp[n] = v;
        i++;
    });

    if (!added) {
        temp[key] = value;
    }

    return temp;

}

Object.toPlain = function(object, prefix) {
    let ret = {};
    Object.forEach(object, (k, v) => {
        if(v instanceof Object) {
            ret = Object.assign(ret, Object.toPlain(v, k + '-'));
        }
        else {
            ret[((prefix || '') + k).toCamelCase('-', false)] = v;
        }
    });
    return ret;
}

Object.cloneRecursive = function(object) {
    const ret = {};
    Object.forEach(object, (prop, value) => {
        if(value instanceof Function) {
            ret[prop] =  value;
        }
        else if(Array.isArray(value)) {
            ret[prop] = value.map((v) => {
                return v instanceof Object && !(v instanceof File) ? Object.cloneRecursive(v) : v;
            });
        }
        else if(value instanceof Object && !(value instanceof File)) {
            ret[prop] =  Object.cloneRecursive(value);
        }
        else {
            ret[prop] =  value;
        }
    });
    return ret;
}

Object.shallowEqual = function(object1, object2) {
    if(!object1 || !object2) {
        return object1 == object2;
    }
    if(typeof object1 !== 'object' || typeof object2 !== 'object') {
        return object1 == object2;
    }
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let key of keys1) {
        if (typeof object1[key] != typeof object2[key]) {
            return false;
        }
        if (Array.isArray(object1[key])) {
            if(!object1[key].equals(object2[key])) {
                return false;
            }
        }
        else if(object1[key] instanceof Object) {
            if(!Object.shallowEqual(object1[key], object2[key])) {
                return false;
            }
        }
        else if (object1[key] !== object2[key]) {
            return false;
        }
    }
    return true;
}

Object.setValue = function(obj, path, value) {
    let properties = Array.isArray(path) ? path : path.split(".");

    if (properties.length > 1) {
        if (!obj.hasOwnProperty(properties[0]) || typeof obj[properties[0]] !== "object") obj[properties[0]] = {}
        return Object.setValue(obj[properties[0]], properties.slice(1), value)
    } else {
        obj[properties[0]] = value
        return true
    }
}

Object.getValue = function(obj, path, _default = undefined) {
    let properties = Array.isArray(path) ? path : path.split(".");

    if (properties.length > 1) {
        return (properties[0] in obj) ? Object.getValue(obj[properties[0]], properties.slice(1)) : _default;
    } else {
        return obj[properties[0]] ?? _default;
    }
}

Object.map = function(obj, func) {
    let newObject = {};
    Object.forEach(obj, (key, value) => {
        const newval = func(key, value);
        if(newval) {
            newObject[key] = newval;
        }
    });
    return newObject;
}

/* String prototype expansion */
String.prototype.stripHtml = function() { return this.replace(/<[^>]+>/gim, "").replace(/<\/[^>]+>/gim, "").replace(/&nbsp;/gim, ""); }
String.prototype.ltrim = function(c) { return this.replace(new RegExp('^' + (c != undefined ? c : '\\s') + '+'), ""); }
String.prototype.rtrim = function(c) { return this.replace(new RegExp((c != undefined ? c : '\\s') + '+$'), ""); }
String.prototype.trim = function(c) { return this.replace(new RegExp('^' + (c != undefined ? c : '\\s') + '*(.*?)' + (c != undefined ? c : '\\s') + '*$'), '$1'); }
String.prototype.splitA = function(separator) {
    var retArr = new Array();
    var s = this;

    if (separator.length != 0) {
        let i = 0;
        while (s.indexOf(separator) != -1) {
            retArr[i] = s.substring(0, s.indexOf(separator));
            s = s.substring(s.indexOf(separator) + separator.length, s.length + 1);
            i++;
        }
        retArr[i] = s;
    } else {
        for (let i = 0; i < s.length; i++)
            retArr[i] = s.substring(i, i + 1);
    }
    return retArr;
}
String.prototype.toInt = function() {
    return this / 1;
}
String.prototype.isFinite = function() { return isFinite(this); }
String.prototype.isNumeric = function() { return this.isFinite((this * 1.0)); }
String.prototype.isEmail = function() {
    if (this.indexOf(" ") != -1) {
        return false;
    } else if (this.indexOf("@") == -1) {
        return false;
    } else if (this.indexOf("@") == 0) {
        return false;
    } else if (this.indexOf("@") == (this.length - 1)) {
        return false;
    }

    let arrayString = this.splitA("@");
    if (arrayString[1].indexOf(".") == -1) {
        return false;
    } else if (arrayString[1].indexOf(".") == 0) {
        return false;
    } else if (arrayString[1].charAt(arrayString[1].length - 1) == ".") {
        return false;
    }
    return true;
}
String.prototype.repeat = function(n) {
    var a = [];
    var s = this;
    while (a.length < n) {
        a.push(s);
    }
    return a.join('');
}
String.prototype.expand = function(c, l) {
    if (this.length >= l) {
        return this;
    } else {
        return c.repeat(l - this.length) + this;
    }
}
String.prototype.toDate = function() {

    if (this.isNumeric()) {
        return parseInt(this).toDateFromUnixTime();
    }

    let t = this.replace('T', ' ');
    if(t.indexOf('.') !== -1) {
        t = t.split(/\./);
        t = t[0];
    }

    t = t.split('+')[0];
    let parts = t.split(' ');
    let dateParts = parts[0].split('-');
    let timeParts = parts[1] ? parts[1].split(':') : ['0', '0', '0'];
    return new Date((dateParts[0] + '').toInt(), (dateParts[1] + '').toInt() - 1, (dateParts[2] + '').toInt(), (timeParts[0] + '').toInt(), (timeParts[1] + '').toInt(), (timeParts[2] + '').toInt());
}
String.prototype.toShortDate = function() {
    var parts = this.split(/\/|\.|\-/);
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parts[0]);

}
String.prototype.words = function(l) {
    var a = this.split(/ |,|\.|-|;|:|\(|\)|\{|\}|\[|\]/);

    if (a.length > 0) {
        if (a.length == 1)
            return this + '';
        else if (a.length < l)
            return this + '';

        let i = 0;
        for (let j = 0; j < l; j++) {
            i = i + a[j].length + 1;
        }

        return this.substr(0, i) + '...';
    } else {
        return this.substr(0, l) + '...';
    }
}
String.prototype.replaceAll = function(from, to) {
    let s = this;
    let s1 = s.replace(from, to);
    while (s != s1) {
        s = s1;
        s1 = s.replace(from, to);
    }
    return s1;
}
String.prototype.template = function(values) {
    return this.replace(/{(.+?)(?:\|(.*?))?}/g, (keyExpr, key, defaultVal) => {
        return eval(`typeof values?.${key}`) === 'undefined' ? (defaultVal ?? "") : eval(`values.${key}`);
    })
}
String.prototype.replaceArray = function(from, to) {
    let ret = this;
    from.forEach(function(el) {
        ret = ret.replaceAll(el, to);
    });
    return ret;
}
String.prototype.replaceObject = function(obj, wrappers) {
    let ret = this;
    Object.forEach(obj, function(name, value) {
        ret = ret.replaceAll((wrappers && wrappers.length > 0 ? wrappers[0] : '') + name + (wrappers && wrappers.length > 1 ? wrappers[1] : ''), value);
    });
    return ret;
}
String.prototype.fromMoney = function() {
    return parseInt(val.replace(/\s*/g, ''));
}
String.prototype.fromTimeString = function() {
    let parts = this.split(':');
    return parseInt(parseInt(parts[2]) + parseInt(parts[1]) * 60 + parseInt(parts[0]) * 60 * 60);
}
String.prototype.capitalize = function() {
    return this.substr(0, 1).toUpperCase() + this.substr(1);
}
String.prototype.Transliterate = function() {
    let val = this;

    let A = new Array();
    A["Ё"] = "YO";
    A["Й"] = "I";
    A["Ц"] = "TS";
    A["У"] = "U";
    A["К"] = "K";
    A["Е"] = "E";
    A["Н"] = "N";
    A["Г"] = "G";
    A["Ш"] = "SH";
    A["Щ"] = "SCH";
    A["З"] = "Z";
    A["Х"] = "H";
    A["Ъ"] = "'";
    A["ё"] = "yo";
    A["й"] = "i";
    A["ц"] = "ts";
    A["у"] = "u";
    A["к"] = "k";
    A["е"] = "e";
    A["н"] = "n";
    A["г"] = "g";
    A["ш"] = "sh";
    A["щ"] = "sch";
    A["з"] = "z";
    A["х"] = "h";
    A["ъ"] = "'";
    A["Ф"] = "F";
    A["Ы"] = "I";
    A["В"] = "V";
    A["А"] = "A";
    A["П"] = "P";
    A["Р"] = "R";
    A["О"] = "O";
    A["Л"] = "L";
    A["Д"] = "D";
    A["Ж"] = "ZH";
    A["Э"] = "E";
    A["ф"] = "f";
    A["ы"] = "i";
    A["в"] = "v";
    A["а"] = "a";
    A["п"] = "p";
    A["р"] = "r";
    A["о"] = "o";
    A["л"] = "l";
    A["д"] = "d";
    A["ж"] = "zh";
    A["э"] = "e";
    A["Я"] = "YA";
    A["Ч"] = "CH";
    A["С"] = "S";
    A["М"] = "M";
    A["И"] = "I";
    A["Т"] = "T";
    A["Ь"] = "'";
    A["Б"] = "B";
    A["Ю"] = "YU";
    A["я"] = "ya";
    A["ч"] = "ch";
    A["с"] = "s";
    A["м"] = "m";
    A["и"] = "i";
    A["т"] = "t";
    A["ь"] = "'";
    A["б"] = "b";
    A["ю"] = "yu";

    val = val.replace(/([\u0410-\u0451])/g,
        function(str, p1, offset, s) {
            if (A[str] != 'undefined') { return A[str]; }
        }
    )
    return val;
};
String.prototype.CyrToUrl = function(words) {
    if (words == undefined) words = 3;

    let val = this.Transliterate()
        .trim()
        .replaceArray([" ", "|", ".", ",", "(", ")", "[", "]", "!", "@", ":", ";", "*", "#", "$", "%", "^"], "-")
        .replaceArray(["'", "?", '"', '…', '&quot;', "\\", "/", '«', '»', /[0-9]/i], "")
        .replaceAll('--', '-')
        .toLowerCase();

    val = val.split('-');
    let v = [];
    val.forEach(function(vv) {
        v.push(vv.trim());
    });
    val = v.splice(0, words).join('-');
    return val.trim();

}
String.prototype.ellipsis = function(length) {
    var str = this;
    if (!str) {
        return str;
    }

    str = str + '';

    let strlen = str.length;
    if (strlen <= length)
        return str;


    let cliplen = parseInt((length - 3) / 2);
    return str.substr(0, cliplen) + '...' + str.substr(strlen - cliplen - 1, strlen);
}
String.prototype.reverse = function() { return this.split("").reverse().join(""); }
String.prototype.hexToString = function() {
    let string = '';
    for (let i = 0; i < this.length; i += 2) {
        string += String.fromCharCode(parseInt(this.substr(i, 2), 16));
    }
    return string;
};

String.fromObject = function(object, delimiters, callback) {
    let ret = [];
    Object.forEach(object, function(name, value) {
        ret.push(name + delimiters[1] + (callback ? callback(value) : value));
    });
    return ret.join(delimiters[0]);
}
String.prototype.toObject = function(delimiters, callback, keyCallback) {
    
    let ret = {};
    if(!(this + '')) {
        return ret;
    }
    
    let parts = this.split(delimiters[0]);
    if(parts.length == 0) {
        return ret;
    }

    parts.forEach((part) => {
        part = part.split(delimiters[1]);
        ret[keyCallback ? keyCallback(part[0]) : part[0]] = callback ? callback(part[1]) : part[1];
    });
    
    return ret;
}
String.prototype.replaceDateMonthName = function(months) {
    let n = this + '';
    const enMonths = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < enMonths.length; i++) {
        n = n.replaceAll(enMonths[i], months[i]);
    }
    return n;
}
String.prototype.toCamelCase = function(splitter, firstIsCapital) {
    splitter = splitter || '-';
    if (this.trim().indexOf('--') === 0) { return this; }

    let parts = this.split(splitter);
    let ret = [];
    parts.forEach((part, index) => {
        ret.push(index == 0 && firstIsCapital || index > 0 ? part.capitalize() : part);
    });
    return ret.join('');
}
String.prototype.fromCamelCase = function(splitter) {
    splitter = splitter || '-';
    if (this.trim().indexOf('--') === 0) { return this; }

    return this.replaceAll(new RegExp('([A-Z])'), (v) => { return splitter + v.toLowerCase(); }).rtrim('-').ltrim('-');

}
String.prototype.firstCharsOfWords = function() {
    let parts = this.split(' ');
    let chars = [];
    parts.forEach((part) => {
        chars.push(part.substr(0, 1).toUpperCase());
    });
    return chars.join('');
}
String.prototype.isInt = function() {
    return Number.isInteger(Number(this));
}
String.prototype.isFloat = function() {
    return this.isNumeric() && !Number.isInteger(this);
}
String.prototype.isDate = function() {
    return (new Date(this) !== "Invalid Date") && !isNaN(new Date(this));
}
String.prototype.fio = function() {
    const parts = this.split(' ');
    return (parts[0].capitalize() + ' ' + (parts.length > 1 ? (parts[1].substring(0, 1) + '. ' + (parts.length > 2 ? parts[2].substring(0, 1) + '.' : '')) : '')).trim();
}
String.prototype.extractExt = function() {
    const parts = this.split('.');
    return parts[parts.length - 1];
}
String.prototype.pathinfo = function() {
    try {
        const parts = this.split('/');
        const ret = {};
        ret.basename = parts[parts.length - 1];
        
        const fileparts = ret.basename.split('.');
        ret.ext = fileparts.length > 1 ? fileparts[fileparts.length - 1] : '';
        ret.filename = fileparts[0];
        
        ret.dirname = this.replaceAll(ret.basename, '');
        
        return ret;
    }
    catch (e) {
        return {};
    }
};

String.prototype.urlinfo = function() {
    try {
        const parts = this.split('?');
        const ret = {};
        ret.url = parts[0];
        ret.options = parts[1] !== undefined ? parts[1].toObject(['&', '=', null, (v) => decodeURIComponent(v)]) : {};
        return ret;
    }
    catch (e) {
        return {};
    }
};

String.prototype.removeXmlEntities = function() {
    let s = this + '';
    s = s.replaceAll('&laquo;', '«');
    s = s.replaceAll('&raquo;', '»');
    s = s.replaceAll('&ndash;', '–');
    s = s.replaceAll('&mdash;', '—');
    s = s.replaceAll('&nbsp;', ' ');
    return s;
}

String.prototype.setBaseUrl = function(baseUrl) {
    return this.replaceAll('src="/', 'src="' + baseUrl + '/');
}

String.prototype.copyToClipboard = function() {
    const text = this + '';
    return new Promise((resolve, reject) => {
        if (!navigator.clipboard) {
            var textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                var successful = document.execCommand('copy');
                if(!successful) {
                    throw 'error';
                }
                document.body.removeChild(textArea);
                resolve();
            } catch (err) {
                reject('can not copy');
            }
            finally {
                document.body.removeChild(textArea);
            }

            return;
        }
        
        navigator.clipboard.writeText(text).then(function() {
            resolve();
        }, function(err) {
            reject('can not copy');
        });
    });

}

String.MD5 = function(e) {
    if(!e) {
        e = '';
    }
    
    function h(a, b) {
        var c, d, e, f, g;
        e = a & 2147483648;
        f = b & 2147483648;
        c = a & 1073741824;
        d = b & 1073741824;
        g = (a & 1073741823) + (b & 1073741823);
        return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f
    }

    function k(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & c | ~b & d, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function l(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & d | c & ~d, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function m(a, b, d, c, e, f, g) {
        a = h(a, h(h(b ^ d ^ c, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function n(a, b, d, c, e, f, g) {
        a = h(a, h(h(d ^ (b | ~c), e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function p(a) {
        var b = "",
            d = "",
            c;
        for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
        return b
    }
    var f = [],
        q, r, s, t, a, b, c, d;
    e = function(a) {
        a = a.replace(/\r\n/g, "\n");
        for (var b = "", d = 0; d < a.length; d++) {
            var c = a.charCodeAt(d);
            128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
        }
        return b
    }(e);
    f = function(b) {
        var a, c = b.length;
        a = c + 8;
        for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
        a = (g - g % 4) / 4;
        e[a] |= 128 << g % 4 * 8;
        e[d - 2] = c << 3;
        e[d - 1] = c >>> 29;
        return e
    }(e);
    a = 1732584193;
    b = 4023233417;
    c = 2562383102;
    d = 271733878;
    for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
    return (p(a) + p(b) + p(c) + p(d)).toLowerCase()
};

String.GUID = function() {
    return (Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4());
};

String.Password = function(l) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charset2 = '!@#%^&*()';
    let retVal = "";
    for (let i = 0, n = charset.length; i < l; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    for(let i = 0, n2 = charset2.length, n = retVal.length; i < retVal.length / 4; i++) {
        const index = Math.floor(Math.random() * n);
        retVal = retVal.substring(0, index - 1) + charset2.charAt(Math.floor(Math.random() * n2)) + retVal.substring(index);
    }
    return retVal;
}

String.EscapeRegExp = function(string) {
    return string ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : string;
}


/**
 * Например:
 * String.Pluralize('Один файл|{n} файла|{n} файлов', 1) //output: Один файл
 * String.Pluralize('Один файл|{n} файла|{n} файлов', 10) //output: 10 файлов
 *
 * @param {string} template
 * @param {int} count
 * @returns {string}
 * @constructor
 */
String.Pluralize = function(template, count) {
    let cases = [2, 0, 1, 1, 1, 2],
        words = template.split("|");
    while(words.length <= 2) words.push(words[words.length - 1]);
    return words[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]].replace('{n}', count);
}


String.prototype.sha256 = function() {
    const msgBuffer = new TextEncoder().encode(this);
    return new Promise((resolve, reject) => {
        crypto.subtle.digest('SHA-256', msgBuffer).then(hashBuffer => {
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            resolve(hashHex);
        }).catch(error => reject(error));            
    });

}

String.prototype.rc4 = function(key) {
    let str = this;
    var s = [], j = 0, x, res = '';
    for (var i = 0; i < 256; i++) {
        s[i] = i;
    }
    for (i = 0; i < 256; i++) {
        j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
    }
    i = 0;
    j = 0;
    for (var y = 0; y < str.length; y++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
        res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
    }
    return res;
}

String.prototype.hex2bin = function() {
    var bytes = [];
    for(var i=0; i< this.length-1; i+=2)
        bytes.push(parseInt(this.substring(i, i + 2), 16));
    return String.fromCharCode.apply(String, bytes);    
}

String.prototype.bin2hex = function() {
    var i = 0, l = this.length, chr, hex = '';
    for (i; i < l; ++i) {
        chr = this.charCodeAt(i).toString(16)
        hex += chr.length < 2 ? '0' + chr : chr
    }
    return hex;
}

/* number prototype expansion */
Number.prototype.toDateFromUnixTime = function() {
    let d = new Date();
    d.setTime(this * 1000);
    return d;
}
Number.prototype.formatSequence = function(labels, viewnumber) {
    let s = this + " ";
    if (!viewnumber)
        s = "";

    let ssecuence = this + '';
    let sIntervalLastChar = ssecuence.substr(ssecuence.length - 1, 1);
    if (parseInt(ssecuence) > 10 && parseInt(ssecuence) < 20) {
        return s + labels[2];
    } else {
        switch (parseInt(sIntervalLastChar)) {
            case 1:
                return s + labels[0];
            case 2:
            case 3:
            case 4:
                return s + labels[1];
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                return s + labels[2];
        }
    }
}
Number.prototype.decPlaces = function() {
    var n = this + '';
    n = n.split('.');
    if (n.length <= 1) {
        return 0;
    }
    return n[1].length;
}
Number.prototype.toMoney = function(digits, force, space) {
    var result = '';
    if (digits == undefined) {
        digits = 2;
    }
    if (!space) {
        space = ' ';
    }

    let price = '' + this.toFixed(digits);
    let parts = price.split(/\.|\,/);
    price = parts[0];

    let dec = (parts[1] != null) ? parts[1] : '';

    let len = price.length;
    let count = Math.floor(len / 3);

    for (let i = 0; i < count; i++) {
        result = (!(i == (count - 1) && len % 3 == 0) ? space : '') + price.substr(len - (i + 1) * 3, 3) + result;
    }

    result = price.substr(0, len - count * 3) + result;
    return result + (dec ? ',' + dec : (force ? ',' + '0'.repeat(digits) : ''));
}
Number.prototype.toTimeString = function(daySplitter) {
    let days = 0;
    let hours = 0;
    let mins = 0;
    let secs = 0;
    let number = this;

    if (number >= 60) {
        secs = number % 60;
        number = parseInt(number / 60);
        if (number >= 60) {
            mins = number % 60;
            number = parseInt(number / 60);
            if (number >= 24) {
                hours = number % 24;
                number = parseInt(number / 24);
                days = number;
            } else
                hours = number;
        } else
            mins = number;
    } else {
        secs = number;
    }

    let txt = [];
    days > 0 && txt.push((days + '').expand("0", 2));
    hours > 0 && txt.push((hours + '').expand("0", 2));
    mins > 0 && txt.push((mins + '').expand("0", 2));
    secs > 0 && txt.push((secs + '').expand("0", 2));
    txt = txt.join(':');

    txt = txt.ltrim("0");
    txt = txt.ltrim(":");
    txt = txt.rtrim(":");

    if (daySplitter && Array.isArray(daySplitter)) {
        let ret = [];
        const parts = txt.split(':');
        parts.forEach((part, index) => {
            ret.push(parseInt(part).formatSequence(daySplitter[4 - parts.length + index], true));
        });
        txt = ret.join(' ');
    }
    else if (daySplitter && txt.split(':').length > 3) {
        // day exists
        txt = txt.replace(':', daySplitter);
    }

    return txt;
}
Number.prototype.toSizeString = function(postfixes, range, remove0s) {
    let number = this;
    let j = 0;
    for (j = 0; j < postfixes.length; j++) {
        if (number <= range)
            break;
        else
            number = number / range;
    }
    number = number.toFixed(2)
    if(remove0s) {
        number = number.replaceAll('.00', '');
    }
    return number + " " + postfixes[j];
}
Number.prototype.percentOf = function(max) {
    return (this * 100) / max;
}
Number.prototype.isInt = function() {
    return Number.isInteger(this);
}
Number.prototype.isFloat = function() {
    return Number.isFloat(this);
}
Number.random = function(min, max) {
    return Math.floor(min + Math.random() * (max + 1));
}
Number.Rnd4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
Number.unique = function() {
    return (window.performance.getEntries()[0].duration + window.performance.now() + Math.random()) * 1e13;
}


/* date prototype expansion */
Date.prototype.toDbDate = function() {
    return this.getFullYear() + '-' + ((this.getMonth() + 1) + '').expand('0', 2) + '-' + (this.getDate() + '').expand('0', 2) + ' ' + (this.getHours() + '').expand('0', 2) + ':' + (this.getMinutes() + '').expand('0', 2) + ':' + (this.getSeconds() + '').expand('0', 2);
}
Date.prototype.toUnixTime = function() {
    return this.getTime() / 1000;
}
Date.prototype.toShortDateString = function() {
    return this.getFullYear() + '-' + ((this.getMonth() + 1) + '').expand('0', 2) + '-' + (this.getDate() + '').expand('0', 2);
}
Date.prototype.toTimeString = function() {
    if(this == 'Invalid Date') {
        return '00:00:00';
    }
    return (this.getHours() + '').expand('0', 2) + ':' + (this.getMinutes() + '').expand('0', 2) + ':' + (this.getSeconds() + '').expand('0', 2);
}
Date.prototype.timezoneoffset = (new Date()).getTimezoneOffset() / 60;
Date.prototype.toLocalTime = function() { this.setTime(this.getTime() - this.timezoneoffset * 60 * 60 * 1000); return this; };
Date.prototype.addMinute = function(min) { this.setTime(this.getTime() + min * 60 * 1000); return this; }
Date.prototype.Diff = function(dt) { return parseInt((dt.getTime() - this.getTime()) / 1000); }
Date.prototype.DiffInMonths = function(dateTo) {
    return dateTo.getMonth() - this.getMonth() + 
      (12 * (dateTo.getFullYear() - this.getFullYear()))
}
Date.prototype.Age = function(removeNazad = false, returnFull = false) {
    let time = Math.abs((new Date()).getTime() / 1000 - this.getTime() / 1000); // to get the time since that moment

    let tokens = [
        [31536000, ['год', 'года', 'лет']],
        [2592000, ['месяц', 'месяца', 'месяцев']],
        [604800, ['неделю', 'недели', 'недель']],
        [86400, ['день', 'дня', 'дней']],
        [3600, ['час', 'часа', 'часов']],
        [60, ['минуту', 'минуты', 'минут']],
        [1, ['секунду', 'секунды', 'секунд']]
    ];

    let retArray = [];
    for (let u = 0; u < tokens.length; u++) {
        let labels = tokens[u][1];
        let unit = tokens[u][0];

        if (time < parseInt(unit)) continue;
        let numberOfUnits = Math.floor(time / unit);
        let ret = (numberOfUnits > 1 ? numberOfUnits + ' ' : '') + numberOfUnits.formatSequence(labels, false) + (removeNazad ? '' : ' назад');
        if (ret == 'день' + (removeNazad ? '' : ' назад'))
            ret = 'вчера';
        
        if(returnFull) {
            retArray.push(ret);
        }
        else {
            return ret;
        }
    }
    if(returnFull) {
        return retArray.join(' ');
    }
    else {
        return 'только что';
    }
}
Date.prototype.format = function(formatString) { return this.toString(formatString); }
Date.prototype.DayIndex = function() {
    var start = new Date(this.getFullYear(), 0, 0);
    var diff = this - start;
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}
Date.prototype.toShortRUString = function(showYear, showDay) {
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return (showDay === undefined || showDay === true ? this.getDate() + ' ' : '') + months[this.getMonth()] + (showYear === undefined || showYear === true ? ' ' + this.getFullYear() : '');
}
Date.prototype.copy = function() {
    let dt = new Date();
    dt.setTime(this.getTime());
    return dt;
}
Date.Now = function() { return new Date(); }
Date.Ms = function() { return Date.Now().getTime(); }
Date.Mc = function() { return (window.performance.getEntries()[0].duration + window.performance.now()) * 1e13; }
Date.from = function(from) {
    let dt = new Date();
    dt.setTime(parseInt(from));
    return dt;
}

/**
 * Удостоверяется, что элемент виден в паренте
 * @param {Element} container
 */
Element.prototype.ensureInViewport = function(container) {

    //Determine container top and bottom
    let cTop = container.scrollTop;
    let cBottom = cTop + container.clientHeight;

    //Determine element top and bottom
    let eTop = this.offsetTop;
    let eBottom = eTop + this.clientHeight;

    //Check if out of view
    if (eTop - this.clientHeight < cTop) {
        container.scrollTop -= (cTop - eTop) + this.clientHeight;
    } else if (eBottom > cBottom) {
        container.scrollTop += (eBottom - cBottom);
    }
}

/**
 * Проверяет видим ли элемент полностью
 * @param {Element} container
 */
Element.prototype.inInViewport = function(container) {

    //Determine container top and bottom
    let cTop = container.scrollTop;
    let cBottom = cTop + container.clientHeight;

    //Determine element top and bottom
    let eTop = this.offsetTop;
    let eBottom = eTop + this.clientHeight;

    //Check if out of view
    if (eTop - this.clientHeight < cTop) {
        return false;
    } else if (eBottom > cBottom) {
        return false;
    }
    return true;
}

Element.prototype.index = function() {
    return Array.prototype.indexOf.call(this.parentElement.children, this);
}

/**
 * Краткая запись для установки атрибута
 * @param {string} name название атрибута
 * @param {string} value значение атрибута
 */
Element.prototype.attr = function(name, value) {
    if(name === undefined && value === undefined) {
        let ret = {};
        for(const attr of this.attributes) {
            ret[attr.name] = attr.value;
        }
        return ret;
    }
    else if (value === undefined) {
        return this.getAttribute(name);
    } else {
        value !== null ? this.setAttribute(name, value) : this.removeAttribute(name);
        return this;
    }
}

/**
 * Создает элемент
 * @param {string} name название элемента
 * @param {Object} attr атрибуты
 * @param {Object} data dataset
 * @param ns
 * @returns {HTMLElement}
 */
Element.create = function(name, attr, data = null, ns = null) {
    const element = ns ? document.createElementNS(ns, name) : document.createElement(name);
    Object.forEach(attr, (n, v) => element.attr(n, v));
    data && element.data(data);
    return element;
}


/**
 * Создает элемент на основе HTML
 * @param {string} name название элемента
 * @param {Object} attr атрибуты
 * @param {Object} data dataset
 * @param ns
 * @returns {HTMLElement}
 */
Element.fromHtml = function(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.childNodes;
}

/**
 * Краткая запись для работы с dataset
 * @param {string} name название свойства data-
 * @param {*} value значение свойства
 */
Element.prototype.data = function(name, value) {
    if (name === undefined) {
        return this.dataset;
    } else if (name instanceof Object) {
        Object.forEach(Object.toPlain(name), (k, v) => {
            this.dataset[k] = v;
        });
        return this;
    } else if (value === undefined) {
        return this.dataset[name];
    } else {
        this.dataset[name] = value;
        return this;
    }
}

/**
 * Дополнительные данные обьекта
 * @param {string} name название свойства data-
 * @param {*} value значение свойства
 */
Element.prototype.tag = function(name, value) {
    if (!this._tag) {
        this._tag = {};
    }
    if (name === undefined) {
        return this._tag;
    }
    else if (value === undefined) {
        return this._tag[name];
    } else {
        this._tag[name] = value;
        return this;
    }
}

/**
 * Запихивает элемент в конец списка дочерних элементов родителя
 * @param {HTMLElement} parent родительский элемент
 */
Element.prototype.appendTo = function(parent) {
    parent.appendChild(this);
    return this;
}

/**
 * Запихивает заданный элемент в список дочерних элементов текущего элемента в конец
 * @param {HTMLElement} child дочерний элемент
 */
Element.prototype.append = function(child) {

    try {
        this.appendChild(child);
        return child;
    }
    catch(e) {
        let lastNode = null;
        for (let i = 0; i < child.length; i++) {
            if (child[i].nodeName != '#text') {
                lastNode = this.appendChild(child[i]);
            }
        }
        return lastNode;
    }
    
    
}

/**
 * Запихивает текущий элемент в список дочерних элементов заданного элемента в начало
 * @param {HTMLElement} parent родительский элемент
 */
Element.prototype.prependTo = function(parent) {
    if (parent.childNodes.length > 0) {
        parent.insertBefore(this, parent.childNodes[0]);
    } else {
        parent.appendChild(this);
    }
    return this;
}

/**
 * Запихивает заданный элемент в список дочерних элементов текущего элемента в начало
 * @param {HTMLElement} child дочерний элемент
 */
Element.prototype.prepend = function(child) {
    try {
        if (this.childNodes.length > 0) {
            this.insertBefore(child, this.childNodes[0]);
        } else {
            this.appendChild(child);
        }    
        return child;
    }
    catch(e) {
        let lastNode = null;
        for (let i = 0; i < child.length; i++) {
            if (child[i].nodeName != '#text') {
                if (this.childNodes.length > 0) {
                    lastNode = this.insertBefore(child[i], this.childNodes[0]);
                } else {
                    lastNode = this.appendChild(child[i]);
                }
            }
        }
        return lastNode;
    }
}

/**
 * Запихивает заданный элемент в прямо за текущим элементом
 * @param {HTMLElement} element элемент
 */
Element.prototype.after = function(element) {
    if (element.nextElementSibling) {
        element.parentElement.insertBefore(this, element.nextElementSibling);
    } else {
        element.parentElement.appendChild(this);
    }
    return this;
}

/**
 * Запихивает заданный элемент перед текущим элементом
 * @param {HTMLElement} element элемент
 */
Element.prototype.before = function(element) {
    this.parentElement.insertBefore(element, this);
    return this;
}

/**
 * Окружает элемент другим элементом
 */
Element.prototype.wrapWith = function(element) {
    this.remove();
    element.append(this);
    return this;
}

Element.prototype.hideElement = function() {
    this.dataset.shown = this.css('display');
    this.css('display', 'none');
    return this;
}

Element.prototype.showElement = function(element) {
    if (this.dataset.shown && this.dataset.shown !== 'none') {
        this.css('display', this.dataset.shown);
    } else {
        this.css('display', 'block');
    }
    return this;
}

/**
 * Возвращает следующий элемент
 */
Element.prototype.next = function() {
    return this.nextElementSibling;
}

/**
 * Возвращает предыдущий элемент
 */
Element.prototype.prev = function() {
    return this.previousElementSibling;
}

/**
 * Возвращает родительский элемент
 */
Element.prototype.parent = function() {
    return this.parentElement;
}

/**
 * Возвращает родительский элемент
 */
 !Element.prototype.closest  && (Element.prototype.closest = function(selector) {
    let elem = this;

    while (elem !== document.body) {
        elem = elem.parentElement;
        if (elem.matches(selector)) return elem;
    }

    return null;
});

/**
 * Устанавливает или возвращает стили
 * @param {(string|Object)} [name] название стиля или обьект содержащий все стили
 * @param {string} [value] значение
 */
Element.prototype.css = function(name, value) {

    let styleObject = this.attr('style');
    styleObject = styleObject ? styleObject.toObject([';', ':'], null, (v) => v && v.toCamelCase()) : {};
    if (name === undefined) {
        return getComputedStyle(this);
    } else if (name instanceof Object) {
        name = Object.assign(styleObject, name);
        this.attr('style', Object.toStyles(name, [';', ':']));
        return this;
    } else {
        if (value === undefined) {
            return styleObject && styleObject[name] !== undefined ? styleObject[name] : getComputedStyle(this)[name]; 
        } else {
            styleObject[name.toCamelCase()] = value;
            this.attr('style', Object.toStyles(styleObject, [';', ':']));
            return this;
        }
    }

}

/**
 * Возвращает местоположение и размеры элемента
 */
Element.prototype.bounds = function(includeBorders = false, includeMargin = false) {

    const rect = this.getBoundingClientRect();
    const win = this.ownerDocument.defaultView;

    let position = {
        top: rect.top + win.pageYOffset,
        left: rect.left + win.pageXOffset,
    };

    const style = getComputedStyle(this);

    position.width = this.offsetWidth;
    position.height = this.offsetHeight;

    position.outerWidth = position.width;
    position.outerHeight = position.height;

    if(style.boxSizing == 'content-box') {
        position.outerWidth += (parseInt(style.paddingLeft ?? 0)) + (parseInt(style.paddingRight ?? 0));
        position.outerHeight += (parseInt(style.paddingTop ?? 0)) + (parseInt(style.paddingBottom ?? 0));
    }

    position.outerWidth += (includeBorders ? ((parseInt(style.borderRightWidth ?? 0)) + (parseInt(style.borderLeftWidth ?? 0))) : 0)
    position.outerWidth += (includeMargin ? ((parseInt(style.marginRight ?? 0)) + (parseInt(style.marginLeft ?? 0))) : 0);
    position.outerHeight += (includeBorders ? ((parseInt(style.borderTopWidth ?? 0)) + (parseInt(style.borderBottomWidth ?? 0))) : 0)
    position.outerHeight += (includeMargin ? ((parseInt(style.marginTop ?? 0)) + (parseInt(style.marginBottom ?? 0))) : 0);

    return position;

}

/**
 * Устанавливает или возвращает содержание в виде HTML
 * @param {string} value содержание
 */
Element.prototype.html = function(value) {
    if (value === undefined) {
        return this.innerHTML;
    } else {
        this.innerHTML = value;
        return this;
    }
}

/**
 * Устанавливает или возвращает содержание в виде text
 * @param {string} value содержание
 */
Element.prototype.text = function(value) {
    if (value === undefined) {
        return this.innerText;
    } else {
        this.innerText = value;
        return this;
    }
}

if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.oMatchesSelector;
}
Element.prototype.is = function(selector) {
    return this.matches(selector);
}

Element.prototype.clone = function(ns) {

    let attr = {};
    let data = {};
    if (this.hasAttributes()) {
        for (let i = 0; i < this.attributes.length; i++) {
            if (this.attributes[i].name.indexOf('data-') !== -1) {
                data[this.attributes[i].name.replaceAll('data-').toCamelCase()] = this.attributes[i].value;
            } else {
                attr[this.attributes[i].name] = this.attributes[i].value;
            }
        }
    }

    if(!ns) {
        ns = attr['xmlns'] ?? null;
        delete attr['xmlns'];
    }

    return Element.create(this.tagName, attr, data, ns);

}

Element.prototype.hideShowProcess = function(callback, timeout = 50) {
    this.css('visibility', 'hidden');
    document.body.css('overflow', 'hidden');
    Colibri.Common.Delay(timeout).then(() => {
        callback(); 
        this.css('visibility', null);
        document.body.css('overflow', null);
    });
}


Element.prototype.emitCustomEvent = function (eventName, args) {
    var event = new CustomEvent(eventName, { detail: args });
    this.dispatchEvent(event);
}

Element.prototype.emitMouseEvent = function (eventType) {
    const event = document.createEvent('MouseEvents');
    event.initMouseEvent(eventType, true, true, window, 0, 0, 345, 7, 220, false, false, true, false, 0, null);
    this.dispatchEvent(event);
}

Element.prototype.emitHtmlEvents = function (object, type) {
    if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(type, false, true);
        this.dispatchEvent(evt);
    } else {
        this.fireEvent("on" + type);
    }
}

DOMTokenList.prototype.clear = function() {
    for(let i = 0; i < this.length; i++) {
        this.remove(this.item(i));
    }
}


function Base2File(data, filename, mime, isBase) {
    var bstr = isBase ? atob(data) : data, 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

function DownloadFile(data, filename, mime, isBase = true) {
    var a = Element.create('a', {href: window.URL.createObjectURL(Base2File(data, filename, mime, isBase), {type: mime}), download: filename});
    document.body.append(a);
    a.click();
    document.body.removeChild(a);
}


function DownloadFileByPath(path, filename) {
    if(!DownloadOnDevice(path, filename)) {
        const pi = path.pathinfo();
        var a = Element.create('a', {href: path, download: filename ?? pi.filename});
        document.body.append(a);
        a.click();
        document.body.removeChild(a);
    }
}

function DownloadOnDevice(path, filename) {

    try {
        if(!window.hasOwnProperty("cordova")){
            return false;
        }

        let storage = '';
        if(cordova.platformId === 'android') {
            storage = cordova.file.externalRootDirectory;
        } 
        else if(cordova.platformId === 'electron') {
            return false;
        }

        const fileTransfer = new FileTransfer();
        fileTransfer.download(path, storage + 'Download/' + filename,  function(entry) {

            const mime = Colibri.Common.MimeType.ext2type(entry.name.pathinfo().ext);

            cordova.plugins.fileOpener2.open(
                cordova.file.externalRootDirectory + 'Download/' + filename,
                mime,
                {
                    error : function(e) {
                        console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                    },
                    success : function () {
                        console.log('file opened successfully');
                    }
                }
            );

        }, function(err) {
            console.log("Error");
            console.dir(err);
        });

        return true;
        
    }
    catch(e) {
        return false;
    }


}

File.prototype.download = function() {
    var a = Element.create('a', {href: window.URL.createObjectURL(this, {type: this.type}), download: this.name});
    document.body.append(a);
    a.click();
    document.body.removeChild(a);
}

window.resizeEndTimeout = -1;
window.addEventListener('resize', (e) => {

    if (window.resizeEndTimeout != -1) {
        clearTimeout(window.resizeEndTimeout);
    }

    window.resizeEndTimeout = setTimeout(() => {
        window.dispatchEvent(new Event('resized'));
    }, 100);

});

Function.isPromise = function(p) {
    return (typeof p === 'object' && typeof p.then === 'function');
}

