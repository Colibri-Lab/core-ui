String.SpecialChars = '[!\"#\$%&\'\(\)\*\+,-\.\/:;<=>\?@\[\\\\^\\]_`{\|}~]';
RegExp.SpecialChars = /(?![a-zA-Z0-9!"#\$%&'\(\)\*\+,-\.\/:;<=>\?@\[\\^\]_`{\|}~])./;

/**
 * Prevents the default behavior of an event and stops its propagation.
 * @global
 * @param {Event} e - The event object.
 * @returns {boolean} Returns false to indicate that the default action should be prevented.
 * @example
 * ```
 * element.addEventListener('click', nullhandler);
 * ```
 */
function nullhandler(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
};

/**
 * Parses a JSON string into a JavaScript object.
 * If the input string is null or undefined, it defaults to an empty object ({}).
 * @global
 * @param {string} v - The JSON string to parse.
 * @returns {Object} Returns the parsed JavaScript object.
 * @example
 * ```
 * const obj = json_object('{"key": "value"}');
 * ```
 */
function json_object(v) {
    return JSON.parse(v || '{}');
};

/**
 * Parses a JSON string into a JavaScript array.
 * If the input string is null or undefined, it defaults to an empty array ([]).
 * @global
 * @param {string} v - The JSON string to parse.
 * @returns {Array} Returns the parsed JavaScript array.
 * @example
 * ```
 * const arr = json_array('[1, 2, 3]');
 * ```
 */
function json_array(v) {
    return JSON.parse(v || '[]');
};

/**
 * Stable stringify for objects.
 * @global
 * @param {*} obj - The object to stringify.
 * @returns {string} Returns the stable stringified representation of the object.
 * @example
 * ```
 * const str = stableStringify({ b: 1, a: 2 });
 * ```
 */
function stableStringify(obj) {
    if (obj === null || typeof obj !== "object") {
        return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
        return "[" + obj.map(stableStringify).join(",") + "]";
    }

    const keys = Object.keys(obj).sort();

    return "{" + keys.map(k => {
        return JSON.stringify(k) + ":" + stableStringify(obj[k]);
    }).join(",") + "}";
}

/**
 * Evaluates a default value string.
 * If the default value is a string and contains 'json_object' or 'json_array',
 * it evaluates the string as JavaScript code.
 * Otherwise, it returns the default value as is.
 * @global
 * @param {string} defaultAsString - The default value string to evaluate.
 * @returns {any} Returns the evaluated default value.
 * @example
 * ```
 * const obj = eval_default_values('json_object(\'{"key": "value"}\')');
 * const arr = eval_default_values('json_array(\'[1, 2, 3]\')');
 * ```
 */
function eval_default_values(defaultAsString) {
    if (typeof defaultAsString == 'string' && (defaultAsString.indexOf('json_object') !== -1 || defaultAsString.indexOf('json_array') !== -1)) {
        return eval(defaultAsString);
    }
    return defaultAsString;
};

/**
 * Checks whether a value is iterable.
 * @global
 * @param {any} value - The value to check.
 * @returns {boolean} Returns true if the value is iterable, false otherwise.
 * @example
 * ```
 * const arr = [1, 2, 3];
 * console.log(isIterable(arr)); // true
 * console.log(isIterable(123)); // false
 * ```
 */
function isIterable(value) {
    return Symbol.iterator in Object(value);
}

/**
 * Extends the prototype of Intl.NumberFormat to provide a method for unformatting a formatted number string.
 * @prototypeof Intl.NumberFormat
 * @param {string} stringNumber - The formatted number string to unformat.
 * @returns {number} Returns the unformatted number.
 * @example
 * ```
 * const formatter = new Intl.NumberFormat('en-US');
 * const unformatted = formatter.unformat('1,234.56'); // 1234.56
 * ```
 */
Intl.NumberFormat.prototype.unformat = function (stringNumber) {
    const thousandSeparator = this.format(11111).replace(/\p{Number}/gu, '');
    const decimalSeparator = this.format(1.1).replace(/\p{Number}/gu, '');

    return parseFloat(stringNumber
        .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
        .replace(new RegExp('\\' + decimalSeparator), '.')
    );
}

/**
 * Extrapolates the Float32Array to the specified maximum length.
 * @prototypeof Float32Array
 * @method
 * @param {number} max - The maximum length to extrapolate to.
 * @returns {Float32Array} Returns the extrapolated Float32Array.
 * @example
 * ```
 * const arr = new Float32Array([1, 2, 3]);
 * const extrapolated = arr.extrapolate(5); // Float32Array [1, 1.5, 2, 2.5, 3]
 * ```
 */
Float32Array.prototype.extrapolate = function (max) {
    const output = new Float32Array(max);
    const ratio = (this.length - 1) / (max - 1);

    for (let i = 0; i < max; i++) {
        const pos = i * ratio;
        const left = Math.floor(pos);
        const right = Math.min(left + 1, this.length - 1);
        const t = pos - left;

        // линейная интерполяция
        output[i] = this[left] * (1 - t) + this[right] * t;
    }

    return output;
}

/**
 * Appends elements to the Float32Array to reach the specified maximum length.
 * @prototypeof Float32Array
 * @method
 * @param {number} max - The maximum length to append to.
 * @param {function|null} valueCallback - A callback function to generate values for the appended elements. If null, 0 is used.
 * @returns {Float32Array} Returns the appended Float32Array.
 * @example
 * ```
 * const arr = new Float32Array([1, 2, 3]);
 * const appended = arr.appendTo(5, i => i * 2); // Float32Array [1, 2, 3, 6, 8]
 * ```
 */
Float32Array.prototype.appendTo = Float32Array.prototype.expandTo = function (max, valueCallback = null) {
    const output = new Float32Array(max);
    const len = this.length;
    output.set(this, 0);
    for (let i = len; i < max; i++) {
        output[i] = valueCallback ? valueCallback(i) : 0;
    }
    return output;
}

/**
 * Prepends elements to the Float32Array to reach the specified maximum length.
 * @prototypeof Float32Array
 * @method
 * @param {number} max - The maximum length to prepend to.
 * @param {function|null} valueCallback - A callback function to generate values for the prepended elements. If null, 0 is used.
 * @returns {Float32Array} Returns the prepended Float32Array.
 * @example
 * ```
 * const arr = new Float32Array([1, 2, 3]);
 * const prepended = arr.prependTo(5, i => i * 2); // Float32Array [0, 0, 1, 2, 3]
 * ```
 */
Float32Array.prototype.prependTo = function (max, valueCallback = null) {
    const output = new Float32Array(max);
    let prependCount = max - this.length;
    output.set(this, prependCount);
    while (prependCount >= 0) {
        prependCount--;
        output[prependCount] = valueCallback ? valueCallback(prependCount) : 0;
    }
    return output;
}

/**
 * Searches the value in the Float32Array and returns the index of the closest value.
 * @prototypeof Float32Array
 * @method
 * @param {number} value - The value to search for.
 * @returns {number} Returns the index of the closest value, or -1 if not found.
 * @example
 * ```
 * const arr = new Float32Array([1, 2, 3]);
 * const index = arr.findByValue(2.5); // 1
 * ```
 */
Float32Array.prototype.crop = function (startIndex, endIndex) {
    return this.subarray(startIndex, endIndex);
}

/**
 * Searches the value in the Float32Array and returns the index of the closest value.
 * @prototypeof Float32Array
 * @method
 * @param {number} value - The value to search for.
 * @returns {number} Returns the index of the closest value, or -1 if not found.
 * @example
 * ```
 * const arr = new Float32Array([1, 2, 3]);
 * const index = arr.findByValue(2.5); // 1
 * ```
 */
Float32Array.prototype.findByValue = function (value) {
    if (value < this[0] || value > this[this.length - 1]) {
        return -1;
    }
    let closestIndex = 0;
    let minDiff = Math.abs(this[0] - value);
    for (let i = 1; i < this.length; i++) {
        const diff = Math.abs(this[i] - value);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
        }
    }
    return closestIndex;
}

/**
 * Returns the maximum value in the array.
 * @prototypeof Float32Array
 * @method
 * @returns {number} Returns the maximum value in the array.
 * @example
 * ```
 * const arr = new Float32Array([1, 2, 3]);
 * const max = arr.max(); // 3
 * ```
 */
Float32Array.prototype.max = function () {
    return Math.max(...this);
}

/**
 * Returns the minimum value in the array.
 * @prototypeof Float32Array
 * @method
 * @returns {number} Returns the minimum value in the array.
 * @example
 * ```
 * const arr = new Float32Array([1, 2, 3]);
 * const min = arr.min(); // 1
 * ```
 */
Float32Array.prototype.min = function () {
    return Math.min(...this);
}

/**
 * Appends elements to the Float64Array to reach the specified maximum length.
 * @prototypeof Float64Array
 * @method
 * @param {number} max - The maximum length of the resulting Float64Array.
 * @param {function|null} valueCallback - A callback function to generate values for the appended elements. If null, 0 is used.
 * @returns {Float64Array} Returns the appended Float64Array.
 * @example
 * ```
 * const arr = new Float64Array([1, 2, 3]);
 * const expanded = arr.appendTo(5, i => i); // Float64Array [1, 2, 3, 3, 4]
 * ```
 */
Float64Array.prototype.appendTo = Float64Array.prototype.expandTo = function (max, valueCallback = null) {
    const output = new Float64Array(max);
    const len = this.length;
    output.set(this, 0);
    for (let i = len; i < max; i++) {
        output[i] = valueCallback ? valueCallback(i) : 0;
    }
    return output;
}

/**
 * Prepends elements to the Float64Array to reach the specified maximum length.
 * @prototypeof Float64Array
 * @method
 * @param {number} max - The maximum length of the resulting Float64Array.
 * @param {function|null} valueCallback - A callback function to generate values for the prepended elements. If null, 0 is used.
 * @returns {Float64Array} Returns the prepended Float64Array.
 * @example
 * ```
 * const arr = new Float64Array([1, 2, 3]);
 * const expanded = arr.prependTo(5, i => i); // Float64Array [0, 1, 2, 3, 4]
 * ```
 */
Float64Array.prototype.prependTo = function (max, valueCallback = null) {
    const output = new Float64Array(max);
    let prependCount = max - this.length;
    output.set(this, prependCount);
    while (prependCount >= 0) {
        prependCount--;
        output[prependCount] = valueCallback ? valueCallback(prependCount) : 0;
    }
    return output;
}

/**
 * Searches the value in the Float64Array and returns the index of the closest value.
 * @prototypeof Float64Array
 * @method
 * @param {number} value - The value to search for.
 * @returns {number} Returns the index of the closest value, or -1 if not found.
 * @example
 * ```
 * const arr = new Float64Array([1, 2, 3]);
 * const index = arr.findByValue(2.5); // 1
 * ```
 */
Float64Array.prototype.findByValue = function (value) {
    if (value < this[0] || value > this[this.length - 1]) {
        return -1;
    }
    let closestIndex = 0;
    let minDiff = Math.abs(this[0] - value);
    for (let i = 1; i < this.length; i++) {
        const diff = Math.abs(this[i] - value);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
        }
    }
    return closestIndex;
}

/**
 * Returns the maximum value in the array.
 * @prototypeof Float64Array
 * @method
 * @example
 * ```
 * const arr = new Float64Array([1, 2, 3]);
 * const max = arr.max(); // 3
 * ```
 */
Float64Array.prototype.max = function () {
    return Math.max(...this);
}

/**
 * Returns the minimum value in the array.
 * @prototypeof Float64Array
 * @method
 * @example
 * ```
 * const arr = new Float64Array([1, 2, 3]);
 * const min = arr.min(); // 1
 * ```
 */
Float64Array.prototype.min = function () {
    return Math.min(...this);
}

/**
 * @prototypeof Array
 * @method
 * @static
 * @returns {Array} Returns the array itself if it is an array, otherwise returns a new array containing the value.
 * @example
 * ```
 * const arr1 = Array.coalesce([1, 2, 3]); // [1, 2, 3]
 * const arr2 = Array.coalesce(5); // [5]
 * ```
 */
Array.coalesce = function(v) {
    return Array.isArray(v) ? v : [v];
}

/**
 * Returns a new array containing only unique elements from the original array.
 * @prototypeof Array
 * @method
 * @static
 * @param {Array} a - The original array.
 * @returns {Array} Returns a new array with unique elements.
 * @example
 * ```
 * const arr = [1, 2, 2, 3];
 * const uniqueArr = Array.unique(arr); // [1, 2, 3]
 * ```
 */
Array.unique = function (a) { return a.filter((v, i, ab) => { return a.indexOf(v) === i; }); }

/**
 * Merges another array into the current array.
 * @prototypeof Array
 * @method
 * @static
 * @param {Array} a - The current array.
 * @param {Array} ar - The array to merge into the current array.
 * @returns {Array} Returns the merged array.
 * @example
 * ```
 * const arr1 = [1, 2];
 * const arr2 = [3, 4];
 * const mergedArr = Array.merge(arr1, arr2); // [1, 2, 3, 4]
 * ```
 */
Array.merge = function (a, ar) {
    ar.forEach((o) => a.push(o));
    return this;
};

/**
 * Returns a new array containing elements that meet a specified condition.
 * @prototypeof Array
 * @method
 * @static
 * @param {Array} a - The array to filter.
 * @param {(Function|string)} e - The condition function or string to evaluate elements against.
 * @returns {Array} Returns a new array containing filtered elements.
 * @example
 * ```
 * const arr = [1, 2, 3, 4];
 * const filteredArr = Array.part(arr, x => x > 2); // [3, 4]
 * ```
 */
Array.part = function (a, e) {
    var r = [];
    a.forEach((o, index) => {
        if (e instanceof Function) {
            if (e(o, index)) {
                r.push(o);
            }
        } else {
            if (eval(e)) {
                r.push(o);
            }
        }
    });
    return r;
};

/**
 * Finds the first element in an array that matches a specified key-value pair.
 * @prototypeof Array
 * @method
 * @static
 * @param {Array} a - The array to search.
 * @param {string} k - The key to search for.
 * @param {any} v - The value to search for.
 * @returns {any|null} Returns the found element or null if not found.
 * @example
 * ```
 * const arr = [{id: 1}, {id: 2}, {id: 3}];
 * const found = Array.find(arr, 'id', 2); // {id: 2}
 * ```
 */
Array.find = function (a, k, v) {
    var found = false;
    a.forEach((vv) => {
        if (vv[k] == v) {
            found = vv;
            return false;
        }
    });
    return found;
};

/**
 * Finds the index of the first element in an array that satisfies a provided function.
 * @prototypeof Array
 * @method
 * @static
 * @param {Array} a - The array to search.
 * @param {Function} predicate - The function used to test each element of the array.
 * @returns {number} Returns the index of the found element or -1 if not found.
 * @example
 * ```
 * const arr = [1, 2, 3, 4];
 * const index = Array.findIndex(arr, x => x > 2); // 2
 * ```
 */
Array.findIndex = function (a, predicate) {
    if (a == null) {
        throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
    }
    var list = [...a];
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

/**
 * Generates an array of values by invoking a callback function for each index from start to end.
 * @prototypeof Array
 * @method
 * @static
 * @param {number} start - The start index.
 * @param {number} end - The end index.
 * @param {Function} callback - The callback function to invoke for each index.
 * @returns {Array} Returns the generated array.
 * @example
 * ```
 * const arr = Array.enumerate(1, 5, i => i * 2); // [2, 4, 6, 8, 10]
 * ```
 */
Array.enumerate = function (start, end, callback) {
    let ret = [];
    for (let i = start; i <= end; i++) {
        ret.push(callback(i));
    }
    return ret;
};

/**
 * Generates an array of values by invoking a callback function for each index in reverse order from end to start.
 * @prototypeof Array
 * @method
 * @static
 * @param {number} start - The start index.
 * @param {number} end - The end index.
 * @param {Function} callback - The callback function to invoke for each index.
 * @returns {Array} Returns the generated array.
 * @example
 * ```
 * const arr = Array.enumerateRev(1, 5, i => i * 2); // [10, 8, 6, 4, 2]
 * ```
 */
Array.enumerateRev = function (start, end, callback) {
    let ret = [];
    for (let i = end; i >= start; i--) {
        ret.push(callback(i));
    }
    return ret;
};

/**
 * Converts an array to an object.
 * @prototypeof Array
 * @method
 * @static
 * @param {Array} a - The array to convert.
 * @returns {Object} Returns the converted object.
 * @example
 * ```
 * const arr = [1, 2, 3];
 * const obj = Array.toObject(arr); // {0: 1, 1: 2, 2: 3}
 * ```
 */
Array.toObject = function (a) {
    if (Object.isObject(a)) {
        return a;
    }

    let ret = {};
    a.forEach((v, i) => {
        ret[i] = v;
    });
    return ret;
};

/**
 * Finds the first object in an array that matches a specified field-value pair.
 * @prototypeof Array
 * @method
 * @static
 * @param {Array} arr - The array to search.
 * @param {(string|Function)} field - The field name or function used to extract field values.
 * @param {any} value - The value to search for.
 * @returns {Object|null} Returns the found object or null if not found.
 * @example
 * ```
 * const arr = [{id: 1}, {id: 2}, {id: 3}];
 * const found = Array.findObject(arr, 'id', 2); // {id: 2}
 * ```
 */
Array.findObject = function (arr, field, value = null) {
    for (let i = 0; i < arr.length; i++) {
        const o = arr[i];
        if (value === null && typeof field === 'function') {
            if (field(o)) {
                return o;
            }
        }
        else if (field.indexOf('.') !== -1) {
            let v = null;
            try {
                v = eval('o[\'' + field.replaceAll('.', '\'][\'') + '\']');
            } catch (e) { }
            if (v == value) {
                return o;
            }
        }
        else {
            if (o[field] == value) {
                return o;
            }
        }
    }
    return null;
};

/**
 * Replaces or removes an object from an array based on a specified field-value pair.
 * @prototypeof Array
 * @method
 * @static
 * @param {Array} arr - The array to modify.
 * @param {string} field - The field name to search for.
 * @param {any} value - The value to search for.
 * @param {Object|null} replace - The object to replace with (or null to remove).
 * @param {boolean} insertIfNotExists - Whether to insert the replace object if not found.
 * @returns {Array} Returns the modified array.
 * @example
 * ```
 * const arr = [{id: 1}, {id: 2}, {id: 3}];
 * Array.replaceObject(arr, 'id', 2, {id: 4}); // [{id: 1}, {id: 4}, {id: 3}]
 * Array.replaceObject(arr, 'id', 5, {id: 6}, true); // [{id: 1}, {id: 4}, {id: 3}, {id: 6}]
 * Array.replaceObject(arr, 'id', 1, null); // [{id: 4}, {id: 3}, {id: 6}]
 * ```
 */
Array.replaceObject = function (arr, field, value, replace = null, insertIfNotExists = true) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][field] == value) {
            if (replace) {
                arr[i] = replace;
            }
            else {
                arr.splice(i, 1);
            }
            return arr;
        }
    }
    if (insertIfNotExists) {
        arr.push(replace);
    }
    return arr;
};

/**
 * Calculates the average of all elements in the array.
 * @prototypeof Array
 * @method
 * @returns {number} Returns the average value.
 * @example
 * ```
 * const arr = [1, 2, 3, 4];
 * const average = arr.avg(); // 2.5
 * ```
 */
Array.prototype.avg = function () {
    return this.reduce((a, b) => a + b, 0) / this.length;
}

/**
 * Joins the elements of the array into a string, limiting the number of items included and appending a message for any additional items.
 * @prototypeof Array
 * @method
 * @param {string} splitter - The string to use as a separator between elements.
 * @param {number} maxItems - The maximum number of items to include in the joined string.
 * @param {string} text - The text to append if there are more items than maxItems (default: ' and %s more').
 * @returns {string} Returns the joined string.
 * @example
 * ```
 * const arr = ['apple', 'banana', 'cherry', 'date'];
 * const result = arr.joinMax(', ', 2); // "apple, banana and 2 more"
 * ```
 */
Array.prototype.joinMax = function (splitter, maxItems, text = ' and %s more') {
    return this.slice(0, maxItems).join(splitter) + (this.length > maxItems ? text.replaceAll('%s', this.length - maxItems) : '');
}

/**
 * Shuffles the elements of the array in place using the Fisher-Yates algorithm.
 * @prototypeof Array
 * @method
 * @returns {Array} Returns the shuffled array.
 * @example
 * ```
 * const arr = [1, 2, 3, 4];
 * const shuffledArr = arr.shuffle(); // e.g., [3, 1, 4, 2]
 * ```
 */
Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this; // возвращаем массив для цепочек
};

/**
 * Returns a new array containing the first 'l' elements of the original array.
 * @param {number} l - The number of elements to include in the new array.
 * @returns {Array} Returns a new array containing the first 'l' elements.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = [1, 2, 3, 4, 5];
 * const part = arr.part(3); // [1, 2, 3]
 * const partFromIndex = arr.part(3, 2); // [3, 4, 5]
 * ```
 */
Array.prototype.part = function (l, start = 0) {
    let ret = [];
    for (let i = start; i < l; i++) {
        ret.push(this[i]);
    }
    return ret;
}

/**
 * Returns a new array containing a specific page of elements from the original array, based on the specified page number and page size.
 * @param {number} page - The page number (1-based index).
 * @param {number} pagesize - The number of elements per page.
 * @returns {Array} Returns a new array containing the elements for the specified page.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = [1, 2, 3, 4, 5];
 * const page1 = arr.page(1, 2); // [1, 2]
 * const page2 = arr.page(2, 2); // [3, 4]
 * const page3 = arr.page(3, 2); // [5]
 * ```
 */
Array.prototype.page = function (page, pagesize) {
    let ret = [];
    const start = (page - 1) * pagesize;
    if (this.length < start + pagesize) {
        return this;
    }
    for (let i = start; i < start + pagesize; i++) {
        ret.push(this[i]);
    }
    return ret;
}

/**
 * Converts the elements of the array into an object, using each element as a key and setting the corresponding value to null.
 * @returns {Object} Returns the resulting object with keys from the array elements and values set to null.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = ['key1', 'key2', 'key3'];
 * const obj = arr.toObjectFromKeys(); // { key1: null, key2: null, key3: null }
 * ```
 */
Array.prototype.toObjectFromKeys = function () {
    const ret = {};
    for (const k of this) {
        ret[k] = null;
    }
    return ret;
}

/**
 * Returns the index of the first element that satisfies the specified condition.
 * @param {*} value - The value to compare against.
 * @param {string} condition - The condition to use for comparison (default: '==').
 * @returns {number} Returns the index of the first matching element, or -1 if no match is found.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = [1, 2, 3, 4, 5];
 * const index = arr.indexOfCondition(3, '=='); // 2
 * const indexStrict = arr.indexOfCondition(3, '==='); // 2
 * const indexNot = arr.indexOfCondition(3, '!='); // 0
 * const indexGreater = arr.indexOfCondition(3, '>'); // 3
 * ```
 */
Array.prototype.indexOfCondition = function (value, condition = '==') {
    for (let i = 0; i < this.length; i++) {
        if (condition === '==' && this[i] == value) {
            return i;
        }
        if (condition === '===' && this[i] === value) {
            return i;
        }
        if (condition === '!=' && this[i] != value) {
            return i;
        }
        if (condition === '!==' && this[i] !== value) {
            return i;
        }
        if (condition === '<' && this[i] < value) {
            return i;
        }
        if (condition === '<=' && this[i] <= value) {
            return i;
        }
        if (condition === '>' && this[i] > value) {
            return i;
        }
        if (condition === '>=' && this[i] >= value) {
            return i;
        }
    }
    return -1;
}

/**
 * Returns the last 'n' elements of the array and removes them from the original array.
 * @param {number} n - The number of elements to return.
 * @returns {Array} Returns the last 'n' elements.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = [1, 2, 3, 4, 5];
 * const lastTwo = arr.last(2); // [4, 5]
 * console.log(arr); // [1, 2, 3]
 * ```
 */
Array.prototype.last = function (n) {
    return this.splice(this.length - n, this.length);
}

/**
 * Compares the current array with another array to check for equality.
 * @param {Array} array - The array to compare with.
 * @returns {boolean} Returns true if the arrays are equal, false otherwise.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr1 = [1, 2, 3];
 * const arr2 = [1, 2, 3];
 * const arr3 = [1, 2, 4];
 * console.log(arr1.equals(arr2)); // true
 * console.log(arr1.equals(arr3)); // false
 * ```
 */
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] instanceof Object && array[i] instanceof Object) {
            if (!Object.shallowEqual(this[i], array[i])) {
                return false;
            }
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

/**
 * Sorts the array based on multiple fields.
 * @param {Array} fields - An array of objects specifying fields and sort order.
 * @param {Function|null} handler - Optional handler function for custom sorting logic.
 * @returns {Array} Returns the sorted array.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = [{name: 'Alice', age: 30}, {name: 'Bob', age: 25}, {name: 'Alice', age: 25}];
 * const sortedArr = arr.multiSort([{name: 'name', order: 'asc'}, {name: 'age', order: 'desc'}]);
 * /// sortedArr will be [{name: 'Alice', age: 30}, {name: 'Alice', age: 25}, {name: 'Bob', age: 25}]
 * ```
 */
Array.prototype.multiSort = function (fields, handler = null) {
    this.sort((a, b) => {

        for (const field of fields) {
            if (a[field.name] == b[field.name]) {
                continue;
            }

            if (handler) {
                return handler(field.name, field.order, a, b);
            }

            if (field.order === 'asc') {
                return a[field.name] > b[field.name] ? 1 : -1;
            } else {
                return a[field.name] > b[field.name] ? -1 : 1;
            }
        }

    });
    return this;
}

/**
 * Flattens a nested array structure into a single array.
 * @returns {Array} Returns the flattened array.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const nestedArr = [[1, 2], [3, 4], [5]];
 * const flatArr = nestedArr.concatAll(); // [1, 2, 3, 4, 5]
 * ```
 */
Array.prototype.concatAll = function () {
    let ret = [];
    for (const item of this) {
        ret = [...ret, ...item];
    }
    return ret;
}

/**
 * Calculates the standard deviation of the array.
 * @returns {number} Returns the standard deviation.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = [1, 2, 3, 4, 5];
 * const stdDev = arr.stanDeviate(); // 1.5811388300841898
 * ```
 */
Array.prototype.stanDeviate = function () {
    if (this.length === 0) {
        return 0;
    }
    const total = this.reduce((a, b) => parseFloat(a || 0) + parseFloat(b || 0));
    const mean = total / this.length;
    const diffSqredArr = this.map(v => Math.pow((parseFloat(v || 0) - parseFloat(mean || 0)), 2));
    return (Math.sqrt(diffSqredArr.reduce((f, n) => parseFloat(f || 0) + parseFloat(n || 0)) / (this.length - 1)));
};

/**
 * Returns an array containing elements that are present in both arrays.
 * @param {Array} arr - The array to intersect with.
 * @returns {Array} Returns the intersected array.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr1 = [1, 2, 3];
 * const arr2 = [2, 3, 4];
 * const intersection = arr1.intersect(arr2); // [2, 3]
 * ```
 */
Array.prototype.intersect = function (arr) {
    return this.filter(value => arr.includes(value));
};
/**
 * Returns an array containing elements that are not present in second arrays.
 * @param {Array} arr - The array to intersect with.
 * @returns {Array} Returns the intersected array.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr1 = [1, 2, 3];
 * const arr2 = [2, 3, 4];
 * const difference = arr1.diference(arr2); // [1, 4]
 * ```
 */
Array.prototype.diference = function (arr) {
    return this.filter(value => !arr.includes(value)).concat(arr.filter(value => !this.includes(value)));
};

/**
 * Converts the array elements into an object with each element as a key, and the value set to true.
 * @returns {Object} Returns the object with array elements as keys.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = ['key1', 'key2', 'key3'];
 * const obj = arr.toObjectAsTrue(); // { key1: true, key2: true, key3: true }
 * ```
 */
Array.prototype.toObjectAsTrue = function () {
    let ret = {};
    for (const v of this) {
        ret[v] = true;
    }
    return ret;
}

/**
 * Calculates the sum of all elements in the array.
 * @param {(string|Function)} field - Optional field to specify which values to sum.
 * @returns {number} Returns the sum of values.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = [1, 2, 3, 4];
 * const total = arr.sum(); // 10   
 * ```
 */
Array.prototype.sum = function (field = null, maxRows = null) {
    let arr = [].concat(this);
    if (maxRows !== null) {
        arr = arr.splice(0, maxRows);
    }
    if (!field) {
        return arr.reduce((partialSum, a) => partialSum + a, 0);
    } else {
        return arr.map(typeof field == 'function' ? field : v => v[field]).reduce((partialSum, a) => partialSum + a, 0);
    }
}

/**
 * Calculates the average of all elements in the array.
 * @param {(string|Function)} field - Optional field to specify which values to average.
 * @returns {number} Returns the average value.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = [1, 2, 3, 4];
 * const average = arr.avg(); // 2.5
 * ```
 */
Array.prototype.avg = function (field = null) {
    if (!field) {
        return this.sum() / this.length;
    } else {
        return this.map(typeof field == 'function' ? field : v => v[field]).sum() / this.length;
    }
}

/**
 * Calculates the max of all elements in the array.
 * @param {(string|Function)} field - Optional field to specify which values to find the maximum of.
 * @returns {number} Returns the maximum value.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = [1, 2, 3, 4];
 * const max = arr.max(); // 4
 * ```
 */
Array.prototype.max = function (field = null) {
    let max = -9999999999;
    for (const v of this) {
        let f = (typeof field == 'function' ? field() : v[field]);
        if (f > max) {
            max = f;
        }
    }
    return max;
}

/**
 * Calculates the min of all elements in the array.
 * @param {(string|Function)} field - Optional field to specify which values to find the minimum of.
 * @returns {number} Returns the minimum value.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = [1, 2, 3, 4];
 * const min = arr.min(); // 1
 * ```
 */
Array.prototype.min = function (field = null) {
    let min = 9999999999;
    for (const v of this) {
        let f = (typeof field == 'function' ? field() : v[field]);
        if (f < min) {
            min = f;
        }
    }
    return min;
}

/**
 * Converts an array of objects into an object with specified keys and values.
 * @param {Array} array - The array of objects.
 * @param {string} fieldKey - The field to use as keys in the resulting object.
 * @param {string} fieldValue - The field to use as values in the resulting object.
 * @returns {Object} Returns the resulting object.
 * @prototypeof Array
 * @method
 * @example
 * ```
 * const arr = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}];
 * const obj = Array.toObjectWithKeys(arr, 'id', 'name'); // {1: 'Alice', 2: 'Bob'}
 * ```
 */
Array.toObjectWithKeys = function (array, fieldKey, fieldValue) {
    let ret = {};
    array.forEach((item) => {
        ret[item[fieldKey]] = item[fieldValue];
    });
    return ret;
};

/**
 * Converts an object into an array of objects with specified keys and values.
 * @param {Object} object - The object to convert.
 * @param {string} fieldKey - The field to use as keys in the resulting array of objects.
 * @param {string} fieldValue - The field to use as values in the resulting array of objects.
 * @returns {Array} Returns the resulting array of objects.
 * @prototypeof Array
 * @static
 * @method
 * @example
 * ```
 * const obj = {1: 'Alice', 2: 'Bob'};
 * const arr = Array.fromObjectWithKeys(obj, 'id', 'name'); // [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}]
 * ```
 */
Array.fromObjectWithKeys = function (object, fieldKey, fieldValue) {
    let ret = [];
    Object.forEach(object, (key, value) => {
        const item = {};
        item[fieldKey] = key;
        item[fieldValue] = value;
        ret.push(item);
    });
    return ret;
};

/**
 * Calculates the count of occurrences of each unique value in an array based on a specified field or function.
 * @param {Array} array - The array to analyze.
 * @param {(string|Function)} fieldKey - The field name or function used to extract values for counting.
 * @returns {Object} Returns an object with unique values as keys and their counts as values.
 * @prototypeof Array
 * @static
 * @method
 * @example
 * ```
 * const arr = [{type: 'A'}, {type: 'B'}, {type: 'A'}];
 * const counts = Array.calculateCountByKey(arr, 'type'); // { A: 2, B: 1 }
 * ```
 */
Array.calculateCountByKey = function (array, fieldKey) {
    let ret = {};
    array.forEach((item) => {
        let key = fieldKey;
        if (typeof fieldKey === 'function') {
            key = fieldKey(item);
        } else {
            key = item[key];
        }
        if (!ret[key]) {
            ret[key] = 0;
        }
        ret[key]++;
    });
    return ret;
};

/**
 * Calculates the sum of all elements in the given array.
 * @param {Array} ar - The array to calculate the sum.
 * @returns {number} Returns the sum of values.
 * @prototypeof Array
 * @static
 * @method
 * @example
 * ```
 * const arr = [1, 2, 3, 4];
 * const total = Array.sum(arr); // 10
 * ```
 */
Array.sum = function (ar) {
    return ar.reduce((partialSum, a) => partialSum + a, 0);
};

/**
 * Organizes objects by specifying keys array.
 * @param {Array} objects - The array of objects to organize.
 * @param {Array} keysArray - The array of keys to organize the objects.
 * @returns {Array} Returns the organized array of objects.
 * @prototypeof Array
 * @static
 * @method
 * @example
 * ```
 * const objects = [{a: 1, b: 2}, {a: 3, b: 4}];
 * const keysArray = ['b', 'a'];
 * const organizedObjects = Array.organizeObjectKeys(objects, keysArray); // [{b: 2, a: 1}, {b: 4, a: 3}]
 * ```
 */
Array.organizeObjectKeys = function (objects, keysArray) {
    let ret = [];
    for (const obj of objects) {
        ret.push(Object.organizeKeys(obj, keysArray));
    }
    return ret;
};

/**
 * Creates a new object containing specified keys and their corresponding values from the original object.
 * @param {Object} obj - The original object.
 * @param {Array} keysArray - An array of keys to include in the new object.
 * @returns {Object} Returns a new object with the specified keys.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2, c: 3};
 * const keysArray = ['b', 'c'];
 * const organized = Object.organizeKeys(obj, keysArray); // {b: 2, c: 3}
 * ```
 */
Object.organizeKeys = function (obj, keysArray) {
    let ret = {};
    for (const key of keysArray) {
        ret[key] = obj[key];
    }
    return ret;
};

/**
 * Creates an array of keys from an object where the corresponding values are truthy.
 * @param {Object} object - The object to extract keys from.
 * @returns {Array} Returns an array of keys with truthy values.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 0, c: 3};
 * const keys = Object.fromObjectAsTrue(obj); // ['a', 'c']
 * ```
 */
Object.fromObjectAsTrue = function (object) {
    let ret = [];
    Object.forEach(object, (name, value) => {
        if (value) {
            ret.push(name);
        }
    });
    return ret;
};

/**
 * Checks if a value is an object (excluding arrays).
 * @param {*} o - The value to check.
 * @returns {boolean} Returns true if the value is an object (excluding arrays), false otherwise.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * const result = Object.isObject(obj); // true
 * const arr = [1, 2, 3];
 * const result2 = Object.isObject(arr); // false
 * ```
 */
Object.isObject = function (o) {
    return o instanceof Object && !Array.isArray(o);
};

/**
 * Checks if a value is a plain object (not an instance of a class).
 * @param {*} obj - The value to check.
 * @returns {boolean} Returns true if the value is a plain object, false otherwise.
 * @prototypeof Object
 * @static
 * @method
 */
Object.isPlainObject = function (obj) {
    if (obj === null || typeof obj !== 'object') return false;
    return Object.getPrototypeOf(obj) === Object.prototype || Object.getPrototypeOf(obj) === null;
};

/**
 * Checks if a value is a File.
 * @param {*} o - The value to check.
 * @returns {boolean} Returns true if the value is a file, false otherwise.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const file = new File(["content"], "example.txt");
 * const result = Object.isFile(file); // true
 * const notFile = {};
 * const result2 = Object.isFile(notFile); // false
 * ```
 */
Object.isFile = function (o) {
    return o instanceof File && !Array.isArray(o);
}

/**
 * Checks if a value is a Blob.
 * @param {*} o - The value to check.
 * @returns {boolean} Returns true if the value is a Blob, false otherwise.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const blob = new Blob(["content"], { type: "text/plain" });
 * const result = Object.isBlob(blob); // true
 * const notBlob = {};
 * const result2 = Object.isBlob(notBlob); // false
 * ```
 */
Object.isBlob = function (o) {
    return o instanceof Blob && !Array.isArray(o);
}

/**
 * Checks if a value is a Date.
 * @param {*} o - The value to check.
 * @returns {boolean} Returns true if the value is a Date, false otherwise.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const date = new Date();
 * const result = Object.isDate(date); // true
 * const notDate = {};
 * const result2 = Object.isDate(notDate); // false
 * ```
 */
Object.isDate = function (o) {
    return o instanceof Date && !Array.isArray(o);
}

/**
 * Checks if an object is empty (has no properties or all properties are empty).
 * @param {Object} o - The object to check.
 * @returns {boolean} Returns true if the object is empty, false otherwise.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj1 = {};
 * const result1 = Object.isEmpty(obj1); // true
 * const obj2 = {a: null, b: ''};
 * const result2 = Object.isEmpty(obj2); // true
 * const obj3 = {a: 1};
 * const result3 = Object.isEmpty(obj3); // false
 * ```
 */
Object.isEmpty = function (o) {
    return Object.values(o).filter(v => v !== '' && v !== null).length === 0;
};

/**
 * Converts an object to an extended object (not implemented).
 * @param {Object} object - The object to convert.
 * @returns {Object} Returns the extended object.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * const extended = Object.convertToExtended(obj); // {a: 1, b: 2}
 * ```
 */
Object.convertToExtended = function (object) {
    return object;
};

/**
 * Sorts the properties of an object based on a provided sorting function.
 * @param {Object} object - The object to sort.
 * @param {Function} fn - The sorting function that determines the order of properties.
 * @returns {Object} Returns the sorted object.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {b: 2, a: 1};
 * const sorted = Object.sort(obj, (key, value) => key.charCodeAt(0));
 * /// sorted: {a: 1, b: 2}
 * ```
 */
Object.sort = function (object, fn) {
    const indexes = [];
    const keys = Object.keys(object);
    const values = Object.values(object);
    for (i = 0; i < values.length; i++) {
        const key = keys[i];
        const value = values[i];
        indexes[fn(key, value, object, i)] = [key, value];
    }
    const ret = {};
    for (const v of indexes) {
        if (v) {
            ret[v[0]] = v[1];
        }
    }
    return ret;
}

/**
 * Recursively sorts the properties of an object alphabetically.
 * @param {Object} object - The object to sort.
 * @returns {Object} Returns the sorted object.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {b: 2, a: {d: 4, c: 3}};
 * const sorted = Object.sortPropertiesRecursive(obj);
 * /// sorted: {a: {c: 3, d: 4}, b: 2}
 * ```
 */
Object.sortPropertiesRecursive = function (object) {
    if (!(object instanceof Object)) {
        return object;
    }

    const keys = Object.keys(object);
    keys.sort();
    const ret = {};
    for (const key of keys) {
        let v;
        if (Object.isObject(object[key])) {
            v = Object.sortPropertiesRecursive(object[key]);
        } else if (Array.isArray(object[key])) {
            let rows = [];
            for (const row of object[key]) {
                rows.push(Object.sortPropertiesRecursive(row));
            }
            v = rows;
        } else {
            v = object[key];
        }
        ret[key] = v;
    }
    return ret;
}

/** 
 * Creates an object from an array of objects, using one field as the key and another as the value (optional).
 * @param {Array} array - The array of objects.
 * @param {string} keyField - The field to use as the key.
 * @param {string|null} valueField - The field to use as the value (optional).  
 * @returns {Object} Returns the resulting object.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const arr = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}];
 * const obj = Object.createFromArray(arr, 'id', 'name'); // {1: 'Alice', 2: 'Bob'}
 * ```
 */
Object.createFromArray = function (array, keyField, valueField = null) {
    const ret = {};
    array.forEach((v) => {
        ret[v[keyField]] = valueField ? v[valueField] : v;
    });
    return ret;
}

/**
 * Iterates over the properties of an object, invoking a callback function for each property.
 * @param {Object} o - The object to iterate over.
 * @param {Function} callback - The callback function to invoke for each property.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const arr1 = [1, 2, 3, 4];
 * const arr2 = [3, 4];
 * const arr3 = [1, 2, 3, 4];
 * arr1.equals(arr2); // false
 * arr1.equals(arr3); // true
 * ```
 */
Object.defineProperty(Array.prototype, "equals", { enumerable: false });

/**
 * Iterates over the properties of an object in reverse order, invoking a callback function for each property.
 * @param {Object} o - The object to iterate over.
 * @param {Function} callback - The callback function to invoke for each property.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * Object.forEach(obj, (key, value) => {
 *     console.log(key, value);
 * });
 * ```
 */
Object.forEach = function (o, callback) {
    if (!o) {
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
};

/**
 * Retrieves the index of a property in an object.
 * @param {Object} o - The object to search.
 * @param {string} name - The name of the property.
 * @returns {number} Returns the index of the property.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * const index = Object.indexOf(obj, 'b'); // 1
 * ```
 */
Object.forReverseEach = function (o, callback) {
    if (!o) {
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
};

/**
 * Counts the number of keys in an object.
 * @param {Object} o - The object to count keys from.
 * @returns {number} Returns the number of keys in the object.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * const count = Object.countKeys(obj); // 2
 * ```
 */
Object.indexOf = function (o, name) {
    const keys = Object.keys(o);
    return keys.indexOf(name);
};

/**
 * Counts the number of keys in an object.
 * @param {Object} o - The object to count keys from.
 * @returns {number} Returns the number of keys in the object.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * const count = Object.countKeys(obj); // 2
 * ```
 */
Object.countKeys = function (o) { return o && o instanceof Object && !Array.isArray(o) ? Object.keys(o).length : 0; };

/**
 * Converts an object to a query string format.
 * @param {Object} o - The object to convert.
 * @param {Array} splittersArray - An array containing the separator strings.
 * @returns {string} Returns the query string.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * const queryString = Object.toQueryString(obj, ['&', '=']); // "a=1&b=2"
 * ```
 */
Object.toQueryString = function (o, splittersArray, encode = true, removeEmpty = false) {
    let ret = [];
    Object.keys(o).forEach((key) => {
        let val = o[key];
        if (Object.isObject(val)) {
            val = Object.toQueryString(val, splittersArray, encode, removeEmpty);
        }
        if (removeEmpty && !val) {
            return true;
        }
        ret.push(key + splittersArray[1] + (encode ? encodeURI(val) : val));
    });
    return ret.join(splittersArray[0]);
};

/**
 * Converts an object to a CSS styles string.
 * @param {Object} o - The object to convert.
 * @returns {string} Returns the CSS styles string.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {color: 'red', fontSize: '12px'};
 * const styles = Object.toStyles(obj); // "color: red; font-size: 12px;"
 * ```
 */
Object.toStyles = function (o) {
    let splittersArray = [';', ':'];
    let ret = [];
    Object.keys(o).forEach((key) => {
        if (o[key]) {
            ret.push(key.fromCamelCase('-') + splittersArray[1] + o[key]);
        }
    });
    return ret.join(splittersArray[0]);
};

/**
 * Find last key of object
 * @param {Object} o object to find last key
 * @returns {string}
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * const lastKey = Object.lastKey(obj); // "b"
 * ```
 */
Object.lastKey = function (o) {
    const keys = Object.keys(o);
    return keys[keys.length - 1];
}

/**
 * Find last value of object
 * @param {Object} o object to find last value
 * @returns {*}
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * const lastValue = Object.lastValue(obj); // 2
 * ```
 */
Object.lastValue = function (o) {
    return o[Object.lastKey(o)];
}

/**
 * Enum internal objects and sum specific property within
 * @param {Object} o object fo enumerate
 * @param {string} field field within value of object properties
 * @returns {Number}
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {
 *     a: {value: 1},
 *     b: {value: 2}
 * };
 * const sum = Object.sumInternal(obj, 'value'); // 3
 * ```
 */
Object.sumInternal = function (o, field) {
    let s = 0;
    Object.forEach(o, (key, value) => {
        s += parseFloat(value[field] ?? 0);
    });
    return s;
}

/**
 * Inserts a key-value pair into an object at a specified index.
 * @param {Object} object - The object to insert into.
 * @param {string} key - The key to insert.
 * @param {*} value - The value to insert.
 * @param {number} index - The index at which to insert the key-value pair.
 * @returns {Object} Returns the modified object.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * const newObj = Object.insertAt(obj, 'c', 3, 1); // {a: 1, c: 3, b: 2}
 * ```
 */
Object.insertAt = function (object, key, value, index) {

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

};

/**
 * Converts a nested object to a plain object with flattened keys.
 * @param {Object} object - The object to convert.
 * @param {string} [prefix=''] - Optional prefix to prepend to flattened keys.
 * @param {Array|Function<Number>} [except=[]] - Optional array of keys to exclude from flattening or a function to determine exclusion. Except function must return 0 if need to flatten, 1 if need to just add, and -1 if need to skip 
 * @param {boolean} [useCamelCase=true] - Optional flag to convert keys to camel case.
 * @param {string} [splitter='-'] - Optional string to use as a separator for flattened keys.
 * @returns {Object} Returns the plain object with flattened keys.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const nestedObj = {a: {b: 1, c: 2}, d: 3};
 * const plainObj = Object.toPlain(nestedObj); // {a-b: 1, a-c: 2, d: 3}
 * ```
 */
Object.toPlain = function (object, prefix = '', except = [], useCamelCase = true, splitter = '-') {
    if (Array.isArray(except)) {
        except = (k, v) => except.indexOf(k) === -1 ? -1 : (Object.isObject(v) ? 0 : 1);
    }
    let ret = {};
    Object.forEach(object, (k, v) => {
        const exceptResult = except(k, v);
        if (exceptResult === 0 && v instanceof Object) {
            ret = Object.assign(ret, Object.toPlain(v, prefix + k + splitter, except, useCamelCase, splitter));
        }
        else if (exceptResult === 1) {
            ret[(useCamelCase ? (prefix + k).toCamelCase(splitter, false) : (prefix + k)).trimString(splitter)] = v;
        }
    });
    return ret;
};

/**
 * Reorganizes an object
 * @param {Object} object - The object to reorganize.
 * @param {string|Function|null} [newKeyName=null] - Optional new key name to reorganize the object (not supported yet).
 * @returns {Object} Returns the reorganized object.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: {id: 1, name: 'Alice'}, b: {id: 2, name: 'Bob'}};
 * const reorganized = Object.reorganize(obj, 'id');
 * /// reorganized: {1: {a: {id: 1, name: 'Alice'}}, 2: {b: {id: 2, name: 'Bob'}}}
 * ```
 */
Object.reorganize = function (object, newKeyName = null) {

    if (newKeyName === null) {
        throw new Error('New key name is not supported yet');
    }

    object = Object.cloneRecursive(object);

    let ret = {};

    const reorganizeLevel = (obj) => {

        for (const key in obj) {
            const v = obj[key];

            let kval = null;
            if (newKeyName instanceof Function) {
                kval = newKeyName(key, v);
            } else if (typeof newKeyName === 'string') {
                kval = v[newKeyName];
            }
            if (kval) {
                if (!ret[kval]) {
                    ret[kval] = {};
                }
                ret[kval][key] = v;
            }
            if (Object.isObject(v)) {
                reorganizeLevel(v);
            }

        }

    }

    reorganizeLevel(object);
    return ret;

};

/**
 * Creates a deep clone of an object, optionally excluding specified keys.
 * @param {Object|string} object - The object to clone, or a JSON string representation of the object.
 * @param {Function|null} [callback=null] - Optional callback function to apply to the cloned object.
 * @param {Array} [excludeKeys=[]] - Optional array of keys to exclude from the cloned object.
 * @returns {Object} Returns the cloned object.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * const clonedObj = Object.cloneRecursive(obj); // {a: 1, b: 2}
 * ```
 */
Object.cloneRecursive = function (object, callback = null, excludeKeys = []) {
    if (typeof object == 'string') {
        object = JSON.parse(object);
    }

    let ret;
    if (Array.isArray(object)) {
        ret = [];
        for (const o of object) {
            if (Object.isPlainObject(o)) {
                ret.push(Object.cloneRecursive(o, callback, excludeKeys));
            } else {
                ret.push(o);
            }
        }
    } else if (Object.isPlainObject(object)) {
        ret = {};
        const keys = Object.keys(object);
        for (const prop of keys) {
            const value = object[prop];

            if (excludeKeys.indexOf(prop) !== -1) {
                continue;
            }

            if (value instanceof Function) {
                ret[prop] = value;
            }
            else if (Array.isArray(value)) {
                ret[prop] = value.map((v) => {
                    return Object.isPlainObject(v) ? Object.cloneRecursive(v) : v;
                });
            }
            else if (Object.isPlainObject(value)) {
                ret[prop] = Object.cloneRecursive(value, callback, excludeKeys);
            }
            else {
                ret[prop] = value;
            }
        }
    } else {
        ret = object;
    }

    if (callback) {
        ret = callback(ret);
    }
    return ret;
};

/**
 * Checks if two objects are shallowly equal.
 * @param {Object} object1 - The first object to compare.
 * @param {Object} object2 - The second object to compare.
 * @returns {boolean} Returns true if the objects are shallowly equal, false otherwise.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj1 = {a: 1, b: 2};
 * const obj2 = {a: 1, b: 2};
 * const isEqual = Object.shallowEqual(obj1, obj2); // true
 * ```
 */
Object.shallowEqual = function (a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (!Object.isObject(a) || !Object.isObject(b)) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
        return Array.shallowEqual(a, b);
    }

    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();

    if (a instanceof File && b instanceof File) {
        return a.name === b.name &&
            a.size === b.size &&
            a.type === b.type &&
            a.lastModified === b.lastModified;
    }

    if (Array.isArray(a) !== Array.isArray(b)) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key)) return false;

        const va = a[key], vb = b[key];
        if (Array.isArray(va) && Array.isArray(vb)) {
            if (!Array.shallowEqual(va, vb)) return false;
        } else if (Object.isObject(va) && Object.isObject(vb)) {
            if (!Object.shallowEqual(va, vb)) return false;
        } else if (va !== vb) {
            return false;
        }
    }

    return true;
};

/**
 * Checks if two arrays are shallowly equal.
 * @param {Array} array1 - The first array to compare.
 * @param {Array} array2 - The second array to compare.
 * @returns {boolean} Returns true if the arrays are shallowly equal, false otherwise.
 * @prototypeof Array
 * @static
 * @method
 * @example
 * ```
 * const arr1 = [1, 2, 3];
 * const arr2 = [1, 2, 3];
 * const isEqual = Array.shallowEqual(arr1, arr2); // true
 * ```
 */
Array.shallowEqual = function (a, b) {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        const va = a[i], vb = b[i];

        if (Array.isArray(va) && Array.isArray(vb)) {
            if (!Array.shallowEqual(va, vb)) return false;
        } else if (Object.isObject(va) && Object.isObject(vb)) {
            if (!Object.shallowEqual(va, vb)) return false;
        } else if (va instanceof Date && vb instanceof Date) {
            if (va.getTime() !== vb.getTime()) return false;
        } else if (va instanceof File && vb instanceof File) {
            if (va.name !== vb.name || va.size !== vb.size || va.type !== vb.type || va.lastModified !== vb.lastModified) return false;
        } else if (va !== vb) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if two arrays of objects are shallowly equal by comparing their stringified representations.
 * @param {Array} array1 - The first array of objects to compare.
 * @param {Array} array2 - The second array of objects to compare.
 * @returns {boolean} Returns true if the arrays of objects are shallowly equal, false otherwise.
 * @prototypeof Array
 * @static
 * @method
 * @example
 * ```
 * const arr1 = [{a: 1}, {b: 2}];
 * const arr2 = [{a: 1}, {b: 2}];
 * const isEqual = Array.shallowEqualObjects(arr1, arr2); // true
 * ```
 */
Array.shallowEqualObjects = function (a, b) {
    return a?.length === b?.length &&
        a.every((v, i) => JSON.stringify(v) === JSON.stringify(b[i]));
}

/**
 * Sets the value of a property in an object using dot notation.
 * @param {Object} obj - The object to set the value in.
 * @param {string|Array} path - The path to the property, either as a dot-separated string or as an array of keys.
 * @param {*} value - The value to set.
 * @returns {boolean} Returns true if the value was successfully set, false otherwise.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {};
 * Object.setValue(obj, 'a.b.c', 42); // obj is now { a: { b: { c: 42 } } }
 * ```
 */
Object.setValue = function (obj, path, value) {
    let properties = Array.isArray(path) ? path : path.split(".");

    if (properties.length > 1) {
        if (!obj.hasOwnProperty(properties[0]) || typeof obj[properties[0]] !== "object") obj[properties[0]] = {}
        return Object.setValue(obj[properties[0]], properties.slice(1), value)
    } else {
        obj[properties[0]] = value
        return true
    }
};

/**
 * Retrieves the value of a property in an object using dot notation.
 * @param {Object} obj - The object to retrieve the value from.
 * @param {string|Array} path - The path to the property, either as a dot-separated string or as an array of keys.
 * @param {*} [_default=undefined] - Optional default value if the property is not found.
 * @returns {*} Returns the value of the property, or the default value if not found.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: {b: {c: 42}}};
 * const value = Object.getValue(obj, 'a.b.c'); // 42
 * const defaultValue = Object.getValue(obj, 'a.b.d', 'default'); // 'default'
 * ```
 */
Object.getValue = function (obj, path, _default = undefined) {
    let properties = Array.isArray(path) ? path : path.split(".");

    if (properties.length > 1) {
        return (properties[0] in obj) ? Object.getValue(obj[properties[0]], properties.slice(1)) : _default;
    } else {
        return obj[properties[0]] ?? _default;
    }
};

/**
 * Maps over the properties of an object, applying a function to each key-value pair.
 * @param {Object} obj - The object to map over.
 * @param {Function} func - The mapping function to apply to each key-value pair.
 * @returns {Object} Returns a new object with the mapped key-value pairs.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2};
 * const mapped = Object.map(obj, (key, value) => value * 2); // {a: 2, b: 4}
 * ```
 */
Object.map = function (obj, func, usenewValAsKeyValuObject = false) {
    let newObject = {};
    Object.forEach(obj, (key, value) => {
        const newval = func(key, value);
        if (newval) {
            if (usenewValAsKeyValuObject) {
                newObject[Object.keys(newval)[0]] = Object.values(newval)[0];
            } else {
                newObject[key] = newval;
            }
        }
    });
    return newObject;
};

/**
 * Filters over the properties of an object, applying a function to each key-value pair.
 * @param {Object} obj - The object to filter over.
 * @param {Function} func - The filtering function to apply to each key-value pair.
 * @returns {Object} Returns a new object with the filtered key-value pairs.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2, c: 3};
 * const filtered = Object.filter(obj, (key, value) => value > 1); // {b: 2, c: 3}
 * ```
 */
Object.filter = function (obj, func) {
    let newObject = {};
    Object.forEach(obj, (key, value) => {
        if (func(key, value)) {
            newObject[key] = value;
        }
    });
    return newObject;
};

/**
 * Creates a new object containing only the specified keys from the original object.
 * @param {Object} obj - The original object.
 * @param {Array} keys - An array of keys to include in the new object.
 * @returns {Object} Returns a new object with the specified keys.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const obj = {a: 1, b: 2, c: 3};
 * const plucked = Object.pluck(obj, ['a', 'c']); // {a: 1, c: 3}
 * ```
 */
Object.pluck = function (obj, keys) {
    const nobj = {};
    for (const key of keys) {
        nobj[key] = obj[key];
    }
    return nobj;
}

/**
 * Checks if a function is a class constructor.
 * @param {Function} fn - The function to check.
 * @returns {boolean} Returns true if the function is a class constructor, false otherwise.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * class MyClass {}
 * const isClass = Object.isClass(MyClass); // true
 * const isNotClass = Object.isClass(function() {}); // false
 * ```
 */
Object.isClass = function (fn) {
    return typeof fn === 'function' &&
        /^class\s/.test(Function.prototype.toString.call(fn));
}

/**
 * Recursively assigns properties from the source object to the target object.
 * @param {Object} source - The source object to copy properties from.
 * @param {Object} target - The target object to copy properties to.
 * @returns {Object} Returns the modified target object.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const source = {a: 1, b: {c: 2}};
 * const target = {b: {d: 3}, e: 4};
 * Object.assignRecursive(source, target);
 * /// target is now {a: 1, b: {c: 2, d: 3}, e: 4}
 * ```
 */
Object.assignRecursive = function (source, target) {
    if (source instanceof Object && target instanceof Object) {
        for (const key in source) {
            if (source[key] instanceof Object && target[key] instanceof Object) {
                Object.assignRecursive(source[key], target[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}

/**
 * Extracts the values of a specified key from an array of objects.
 * @param {Array} arrayOfObjects - The array of objects to extract values from.
 * @param {string} key - The key whose values should be extracted.
 * @returns {Array} Returns an array of values corresponding to the specified key.
 * @prototypeof Array
 * @static
 * @method
 * @example
 * ```
 * const arr = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}];
 * const names = Array.pluck(arr, 'name'); // ['Alice', 'Bob']
 * ```
 */
Array.pluck = function (arrayOfObjects, key) {
    let ret = [];
    for (const obj of arrayOfObjects) {
        ret.push(obj[key]);
    }
    return ret;
}

/**
 * Converts an array of text objects into a formatted HTML string.
 * @param {object} textAsObject object to render
 * @param {boolean} showLineBrakes show line breaks
 * @param {string} itemsTag item tag
 * @param {boolean} isPrintVersion is printable version
 * @returns {string} Returns a formatted HTML string.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * const textAsObject = [
 *     {type: 'title', txt: 'Title'},
 *     {type: 'default', txt: 'Some text.'},
 *     {type: 'strong', txt: 'Important!'},
 *     {type: 'anchor', txt: 'Click here', command: 'https://example.com'}
 * ];
 * const htmlString = Object.PerformFormatConversion(textAsObject, true, 'p', false);
 * ```
 */
Object.PerformFormatConversion = function (textAsObject, showLineBrakes = false, itemsTag = 'p', isPrintVersion = false) {
    if (typeof textAsObject === 'string') {
        return '<div>' + textAsObject + '</div>';
    }

    if (!textAsObject) {
        return '<div />';
    }

    if (!Array.isArray(textAsObject) || textAsObject.length === 0) {
        return '';
    }

    let ret = [];
    for (const obj of textAsObject) {
        if (obj?.type) {
            let color = (obj?.color ? ' style="color: ' + obj.color + '"' : '');
            switch (obj.type) {
                case 'br': {
                    ret.push(showLineBrakes ? '<br />' : '');
                    break;
                }
                default:
                case 'default': {
                    ret.push(!obj?.txt ? '' : '<' + itemsTag + ' class="default"' + color + '>' + obj.txt + '</' + itemsTag + '>');
                    break;
                }
                case 'strong': {
                    color = (obj?.color ? ' style="color: ' + obj.color + '"' : '');
                    ret.push(!obj?.txt ? '' : '<' + itemsTag + ' ' + (isPrintVersion ? '' : 'class="strong"') + '' + color + '>' + (isPrintVersion ? '<b>' : '') + obj.txt + (isPrintVersion ? '</b>' : '') + '</' + itemsTag + '>');
                    break;
                }
                case 'title': {
                    color = (obj?.color ? ' style="color: ' + obj.color + '"' : '');
                    if (isPrintVersion) {
                        ret.push(!obj?.txt ? '' : '<b>' + obj.txt + '</b>');
                    }
                    else {
                        ret.push(!obj?.txt ? '' : '<' + itemsTag + ' class="title"' + color + '>' + obj.txt + '</' + itemsTag + '>');
                    }
                    break;
                }
                case 'anchor': {
                    color = (obj?.color ? ' style="color: ' + obj.color + '"' : '');
                    ret.push(!obj.txt ? '' : '<a href="' + obj.command + '" ' + color + '>' + obj.txt + '</a>');
                    break;
                }
            }
        }
        else if (obj?.txt) {
            ret.push('<' + itemsTag + '>' + obj.txt + '</' + itemsTag + '>');
        }
    }
    return '<div>' + ret.join('') + '</div>';
}

/**
 * Checks if a class has all specified keys in its prototype.
 * @param {string} clsString - The string representation of the class.
 * @param {Array} keys - An array of keys to check for in the class prototype.
 * @returns {boolean} Returns true if all specified keys exist in the class prototype, false otherwise.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * class MyClass {
 *     method1() {}
 *     method2() {}
 * }
 * const hasAllKeys = Object.hasAllOfKeys('MyClass', ['method1', 'method2']);
 */
Object.hasAllOfKeys = function (clsString, keys) {
    let allExists = true;
    const clsObject = eval(clsString);
    for (const key of keys) {
        if (!clsObject.prototype.hasOwnProperty(key)) {
            allExists = false;
        }
    }

    return allExists;
}

/**
 * Checks if a class has a static method with the specified name.
 * @param {Function} cls - The class to check.
 * @param {string} methodName - The name of the static method to check for.
 * @returns {boolean} Returns true if the class has the specified static method, false otherwise.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * class MyClass {
 *     static myStaticMethod() {}
 * }
 * const hasStaticMethod = Object.hasStaticMethod(MyClass, 'myStaticMethod'); // true
 * ՝՝՝
 */
Object.hasStaticMethod = function (cls, methodName) {
    return cls && typeof cls[methodName] === 'function';
}

/**
 * Recursively checks if a class or any of its nested classes have a static method with the specified name.
 * @param {Function} cls - The class to check.
 * @param {string} methodName - The name of the static method to check for.
 * @returns {boolean} Returns true if the class or any nested classes have the specified static method, false otherwise.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * class MyClass {
 *     static myStaticMethod() {}
 *     static NestedClass = class {
 *         static nestedStaticMethod() {}
 *     }
 * }
 * const hasNestedStaticMethod = Object.hasStaticMethodRecursive(MyClass, 'nestedStaticMethod'); // true
 * ```
 */
Object.hasStaticMethodRecursive = function (cls, methodName) {
    if (!cls) {
        return false;
    }

    if (Object.hasStaticMethod(cls, methodName)) {
        return true;
    }

    for (const key in cls) {
        const value = cls[key];
        if (Object.hasStaticMethodRecursive(value, methodName)) {
            return true;
        }

    }

    return false;
}

/**
 * Recursively lists all child classes of a given class that satisfy a specified condition.
 * @param {string} clsString - The string representation of the class.
 * @param {Function} checkFunction - A function that checks if a class satisfies a condition.
 * @returns {Array} Returns an array of strings representing the child classes that satisfy the condition.
 * @prototypeof Object
 * @static
 * @method
 * @example
 * ```
 * class MyClass {
 *     static myStaticMethod() {}
 *     static NestedClass = class {
 *         static nestedStaticMethod() {}
 *     }
 * }
 * const childClasses = Object.listChildsWith('MyClass', cls => Object.hasStaticMethod(cls, 'nestedStaticMethod')); // ['MyClass.NestedClass']
 * ```
 */
Object.listChildsWith = function (clsString, checkFunction) {
    let cls = null;
    try {
        cls = eval(clsString);
    } catch (e) {

    }
    if (!cls || !(Object.isClass(cls) || Object.isPlainObject(cls))) {
        return false;
    }

    let list = [];
    if (checkFunction(cls)) {
        list.push(clsString);
    }

    for (const key in cls) {
        const l = Object.listChildsWith(clsString + '.' + key, checkFunction);
        if (l.length) {
            list = list.concat(l);
        }
    }

    return list;
}

/**
 * Returns an array of all captured groups in a string that match the regular expression.
 * @param {string} str - The string to search for matches.
 * @returns {Array} Returns an array containing all captured groups.
 * @prototypeof RegExp
 * @method
 * @example
 * ```
 * const regex = /(\\w+)@(\\w+).com/;
 * const str = "test@example.com";
 * const groups = regex.all(str); // ['test', 'example']
 * ```
 */
RegExp.prototype.all = function (str) {
    let ret = [];
    const matches = str.match(this);
    if (matches) {
        for (let index = 1; index < matches.length; index++) {
            ret.push(matches[index]);
        }
    }
    if (ret.length === 0 && Array.isArray(matches) && matches.length > 0 && str === matches[0]) {
        ret.push(str);
    }
    return ret;
}

/**
 * Escapes special characters in a string to create a valid regular expression pattern.
 * @param {string} string - The string to escape.
 * @returns {string} Returns the escaped string.
 * @prototypeof RegExp
 * @static
 * @method
 * @example
 * ```
 * const escaped = RegExp.quote("test@example.com"); // "test\\@example\\.com"
 * ```
 */
RegExp.quote = function (string) {
    if (typeof string === 'string') {
        return string.replace(/[.,*+?^${}()|[\]\\]/g, "\\$&");
    }
    return string;
}

/**
 * Encodes HTML special characters to prevent HTML injection.
 * By default encodes: <, >, &, and "
 * @param {string} str - The input string to encode
 * @returns {string} - Encoded HTML string
 * @prototypeof String
 * @method
 * @public
 * @example
 * ```
 * const encoded = "<div>Hello & welcome!</div>".encodeHTML(); 
 * /// "&lt;div&gt;Hello &amp; welcome!&lt;/div&gt;"
 * ```
 */
String.prototype.encodeHTML = function () {
    const str = this.toString();
    return str
        .replace(/&/g, '&amp;')  // Encode ampersand first
        .replace(/</g, '&lt;')   // Encode less-than
        .replace(/>/g, '&gt;')   // Encode greater-than
        .replace(/"/g, '&quot;'); // Encode double quotes
};

/**
 * Compresses a string using the LZW algorithm.
 * @returns {Array} Returns an array of compressed codes.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const compressed = "TO BE FILLED"; // Example output
 * ```
 */
String.prototype.lzwCompress = function () {
    const dict = new Map();
    const data = (this + "").split("");
    const out = [];
    let dictSize = 256;

    // initialize dictionary with single-char entries
    for (let i = 0; i < 256; i++) {
        dict.set(String.fromCharCode(i), i);
    }

    let w = "";
    for (const c of data) {
        const wc = w + c;
        if (dict.has(wc)) {
            w = wc;
        } else {
            out.push(dict.get(w));
            dict.set(wc, dictSize++);
            w = c;
        }
    }

    // output the code for w.
    if (w !== "") out.push(dict.get(w));
    return out;
}

/**
 * Decompresses a string using the LZW algorithm.
 * @returns {string} Returns the decompressed string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const compressed = [84, 79, 32, 66, 69, 32, 70, 73, 76, 76, 69, 68]; // Example input
 * const decompressed = compressed.lzwDecompress(); // "TO BE FILLED"
 * ```
 */
String.prototype.lzwDecompress = function () {
    const dict = new Map();
    let dictSize = 256;

    // initialize dictionary
    for (let i = 0; i < 256; i++) {
        dict.set(i, String.fromCharCode(i));
    }

    let w = String.fromCharCode(this[0]);
    let result = w;
    for (let i = 1; i < this.length; i++) {
        const k = this[i];
        let entry;
        if (dict.has(k)) {
            entry = dict.get(k);
        } else if (k === dictSize) {
            entry = w + w.charAt(0);
        } else {
            throw new Error("Bad compressed k: " + k);
        }

        result += entry;

        // add w+entry[0] to the dictionary.
        dict.set(dictSize++, w + entry.charAt(0));

        w = entry;
    }
    return result;
}

/**
 * Compresses a string using Gzip compression.
 * @returns {Promise<string>} Returns a promise that resolves to the compressed string in base64 format.
 * @prototypeof String
 * @async 
 * @method
 * @example
 * ```
 * const compressed = await "Hello, world!".compressGzip();
 * const decompressed = await compressed.decompressGzip(); // "Hello, world!"
 * ```
 */
String.prototype.compressGzip = async function () {
    try {
        const cs = new CompressionStream('gzip');
        const writer = cs.writable.getWriter();
        writer.write(new TextEncoder().encode(this + ''));
        writer.close();
        const compressed = await new Response(cs.readable).arrayBuffer();
        return btoa(String.fromCharCode(...new Uint8Array(compressed)));
    } catch (e) {
        return this + '';
    }
}

/**
 * Decompresses a Gzip-compressed string.
 * @returns {Promise<string>} Returns a promise that resolves to the decompressed string.
 * @prototypeof String
 * @method
 * @async
 * @example
 * ```
 * const compressed = await "Hello, world!".compressGzip();
 * const decompressed = await compressed.decompressGzip(); // "Hello, world!"
 * ```
 */
String.prototype.decompressGzip = async function () {
    try {
        const bytes = Uint8Array.from(atob(this + ''), c => c.charCodeAt(0));
        const ds = new DecompressionStream('gzip');
        const writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const decompressed = await new Response(ds.readable).text();
        return decompressed;
    } catch (e) {
        return this + '';
    }
}

/**
 * Removes formatting characters and converts the string to a number using the current locale settings.
 * @returns {number|string} Returns the unformatted number if successful, otherwise an empty string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const unformatted = "1,234.56".unformatCurrent(); // 1234.56
 * ```
 */
String.prototype.unformatCurrent = function () {
    return (this + '') === '' ? '' : new Intl.NumberFormat(App.NumberFormat).unformat(this);
}
/**
 * Formats the string as a number using the current locale settings.
 * @returns {string} Returns the formatted string representation of the number if successful, otherwise an empty string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const formatted = "1234.56".formatCurrent(); // "1,234.56"
 * ```
 */
String.prototype.formatCurrent = function () {
    return (this + '') === '' || isNaN(this) ? '' : new Intl.NumberFormat(App.NumberFormat).format(this);
}
/**
 * Removes HTML tags and entities from the string.
 * @returns {string} Returns the string with HTML tags removed.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const stripped = "<p>Hello&nbsp;world!</p>".stripHtml(); // "Hello world!"
 * ```
 */
String.prototype.stripHtml = function () { return this.replace(/<[^>]+>/gim, "").replace(/<\/[^>]+>/gim, "").replace(/&nbsp;/gim, ""); };

/**
 * Highlights occurrences of a search string within the HTML content of the string.
 * @param {string} search - The search string to highlight.
 * @returns {string} Returns the HTML content with highlighted occurrences of the search string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const highlighted = "<p>Hello world!</p>".highliteTextInHtml("world"); // "<p>Hello <mark>world</mark>!</p>"
 * ```
 */
String.prototype.highliteTextInHtml = function (search) {
    const html = this + '';

    if (!search) return html;

    const container = document.createElement('div');
    container.innerHTML = html;

    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const nodes = [];
    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    const searchLower = search.toLowerCase();

    nodes.forEach(node => {
        const text = node.nodeValue;
        const textLower = text.toLowerCase();
        const index = textLower.indexOf(searchLower);

        if (index !== -1) {
            const before = text.substring(0, index);
            const match = text.substring(index, index + search.length);
            const after = text.substring(index + search.length);

            const span = document.createElement('span');
            span.innerHTML =
                before +
                '<mark>' + match + '</mark>' +
                after;

            node.parentNode.replaceChild(span, node);
        }
    });

    return container.innerHTML;
}
/**
 * Removes leading whitespace or specified characters from the string.
 * @param {string} [c] - Optional characters to trim from the beginning of the string.
 * @returns {string} Returns the string with leading whitespace or specified characters removed.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const trimmed = "   Hello world!   ".ltrim(); // "Hello world!   "
 * const trimmedChars = "xxHello world!xx".ltrim("x"); // "Hello world!xx"
 * ```
 */
String.prototype.ltrim = function (c) { return this.replace(new RegExp('^' + (c != undefined ? c : '\\s') + '+'), ""); }
/**
 * Removes trailing whitespace or specified characters from the string.
 * @param {string} [c] - Optional characters to trim from the end of the string.
 * @returns {string} Returns the string with trailing whitespace or specified characters removed.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const trimmed = "   Hello world!   ".rtrim(); // "   Hello world!"
 * const trimmedChars = "xxHello world!xx".rtrim("x"); // "xxHello world!"
 * ```
 */
String.prototype.rtrim = function (c) { return this.replace(new RegExp((c != undefined ? c : '\\s') + '+$'), ""); }
/**
 * Removes leading and trailing whitespace or specified characters from the string.
 * @param {string} [c] - Optional characters to trim from the beginning and end of the string.
 * @returns {string} Returns the string with leading and trailing whitespace or specified characters removed.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const trimmed = "   Hello world!   ".trimString(); // "Hello world!"
 * const trimmedChars = "xxHello world!xx".trimString("x"); // "Hello world!"
 * ```
 */
String.prototype.trimString = function (c) {
    return this.replace(new RegExp('^' + (c != undefined ? RegExp.quote(c) : '\\s') + '*(.*?)' + (c != undefined ? RegExp.quote(c) : '\\s') + '*$'), '$1');
}
/**
 * Checks if the string contains all specified symbols.
 * @param {Array} arr - An array of symbols to check for in the string.
 * @returns {boolean} Returns true if the string contains all specified symbols, otherwise false.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const contains = "Hello world!".containsSymbols(["H", "w"]); // true
 * const notContains = "Hello world!".containsSymbols(["H", "x"]); // false
 * ```
 */
String.prototype.containsSymbols = function (arr) {
    for (const s of arr) {
        if (this.indexOf(s) === -1) {
            return false;
        }
    }
    return true;
};
/**
 * Splits the string into an array of substrings using the specified separator.
 * @param {string} separator - The string or regular expression used to separate the string.
 * @returns {Array} Returns an array of substrings.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const parts = "apple,banana,cherry".splitA(","); // ["apple", "banana", "cherry"]
 * const chars = "abc".splitA(""); // ["a", "b", "c"]
 * ```
 */
String.prototype.trim = function (c) { return this.trimString(c); }
/**
 * Attempts to convert the string to an integer.
 * @returns {number} Returns the integer value if successful, otherwise NaN.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const intValue = "42".toInt(); // 42
 * const invalidInt = "abc".toInt(); // NaN
 * ```
 */
String.prototype.splitA = function (separator) {
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
};
/**
 * Attempts to convert the string to a floating-point number.
 * @returns {number} Returns the floating-point value if successful, otherwise NaN.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const floatValue = "3.14".toFloat(); // 3.14
 * const invalidFloat = "abc".toFloat(); // NaN
 * ```
 */
String.prototype.toInt = function () {
    return this / 1;
};
/**
 * Attempts to convert the string to a floating-point number.
 * @returns {number} Returns the floating-point value if successful, otherwise NaN.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const floatValue = "3.14".toFloat(); // 3.14
 * const invalidFloat = "abc".toFloat(); // NaN
 * ```
 */
String.prototype.toFloat = function () {
    return this / 1.0;
};
/**
 * Checks if the string represents a finite number.
 * @returns {boolean} Returns true if the string represents a finite number, otherwise false.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const finite = "123".isFinite(); // true
 * const notFinite = "abc".isFinite(); // false
 * ```
 */
String.prototype.isFinite = function () { return isFinite(this); }
/**
 * Checks if the string represents a numeric value.
 * @returns {boolean} Returns true if the string represents a numeric value, otherwise false.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const numeric = "123".isNumeric(); // true
 * const notNumeric = "abc".isNumeric(); // false
 * ```
 */
String.prototype.isNumeric = function () { return this ? this.isFinite(this * 1.0) : false; }

/**
 * Checks if the string represents a valid email address.
 * @returns {boolean} Returns true if the string represents a valid email address, otherwise false.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const validEmail = "user@example.com".isEmail(); // true
 * const invalidEmail = "user@example".isEmail(); // false
 * ```
 */
String.prototype.isEmail = function () {
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
};

/**
 * Checks if the string represents a valid email address with additional validation for the main domain and TLD.
 * @returns {boolean} Returns true if the string represents a valid email address, otherwise false.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const validEmail = "user@example.com".isEmail2(); // true
 * const invalidEmail = "user@example".isEmail2(); // false
 * ```
 */
String.prototype.isEmail2 = function () {
    const email = (this + '');
    if (typeof email !== 'string') return false;

    const m = email.trim().toLowerCase().match(
        /^[a-z0-9._%+-]+@([a-z-]+)\.([a-z.]{2,})$/
    );
    if (!m) return false;

    const mainDomain = m[1];          // основной домен (без TLD)
    const tld = m[2];

    if (/\d/.test(mainDomain)) return false;

    const knownTlds = new Set([
        'com', 'net', 'org', 'edu', 'gov', 'mil',
        'io', 'ai', 'app', 'dev', 'info', 'biz',
        'ru', 'am', 'us', 'uk', 'de', 'fr', 'it', 'es',
        'group', 'tech', 'online'
    ]);

    if (!knownTlds.has(tld.split('.').pop())) return false;

    return true;
};

/**
 * Repeats the string a specified number of times.
 * @param {number} n - The number of times to repeat the string.
 * @returns {string} Returns the repeated string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const repeated = "abc".repeat(3); // "abcabcabc"
 * ```
 */
String.prototype.repeat = function (n) {
    var a = [];
    var s = this;
    while (a.length < n) {
        a.push(s);
    }
    return a.join('');
};
/**
 * Expands the string to a specified length by padding it with a specified character.
 * @param {string} c - The character used for padding.
 * @param {number} l - The desired length of the expanded string.
 * @returns {string} Returns the expanded string.
 * @prototypeof String  
 * @method
 * @example
 * ```
 * const expanded = "abc".expand("0", 5); // "00abc"
 * ```
 */
String.prototype.expand = function (c, l) {
    if (this.length >= l) {
        return (this + '');
    } else {
        return c.repeat(l - this.length) + (this + '');
    }
};
/**
 * Converts the string to a Date object.
 * @returns {Date} Returns the Date object representing the date and time parsed from the string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const date = "2024-06-15".toDate(); // Sat Jun 15 2024 00:00:00 GMT+0000 (Coordinated Universal Time)
 * ```
 */
String.prototype.toDate = function () {

    if (this.length === 14) { // возможно формат YYYYMMDDHHMMSS
        return new Date(this.substring(0, 4) + '-' + this.substring(4, 6) + '-' + this.substring(6, 8) + 'T' + this.substring(8, 10) + ':' + this.substring(10, 12) + ':' + this.substring(12, 14) + Date.getTimezoneString());
    } else if (this.split('-').length === 6) { // возможно формат YYYY-MM-DD-HH-MM-SS
        const parts = this.split('-');
        return new Date(parts[0] + '-' + parts[1] + '-' + parts[2] + ' ' + parts[3] + ':' + parts[4] + ':' + (parts[5] || '00'));
    }

    if (this.isNumeric()) {
        return parseInt(this).toDateFromUnixTime();
    }

    if (new Date(this + 'T00:00:00' + Date.getTimezoneString()) != 'Invalid Date') {
        return new Date(this + 'T00:00:00' + Date.getTimezoneString());
    }

    if (new Date(this) != 'Invalid Date') {
        return new Date(this);
    }

    let t = this.replace('T', ' ');
    if (t.indexOf('.') !== -1) {
        t = t.split(/\./);
        t = t[0];
    }

    t = t.split('+')[0];
    let parts = t.split(' ');
    let dateParts = parts[0].split('-');
    let timeParts = parts[1] ? parts[1].split(':') : ['0', '0', '0'];
    return new Date((dateParts[0] + '').toInt(), (dateParts[1] + '').toInt() - 1, (dateParts[2] + '').toInt(), (timeParts[0] + '').toInt(), (timeParts[1] + '').toInt(), (timeParts[2] + '').toInt() || 0);
};
/**
 * Converts the string from DDMMYYYY format to a Date object.
 * @returns {Date} Returns the Date object representing the date parsed from the string in DDMMYYYY format.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const date = "15-06-2024".fromDDMMYYYY(); // Sat Jun 15 2024 00:00:00 GMT+0000 (Coordinated Universal Time)
 * ```
 */
String.prototype.fromDDMMYYYY = function () {
    let splitter = '-';
    if (this.indexOf('.') !== -1) {
        splitter = '.';
    }
    return (this.split(splitter)[2] + '-' + this.split(splitter)[1] + '-' + this.split(splitter)[0]).toDate();
}
/**
 * Converts the string from European date format to a Date object.
 * @returns {Date} Returns the Date object representing the date and time parsed from the string in European date format.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const date = "15.06.2024 14:30:00".fromEuropeanDate(); // Sat Jun 15 2024 14:30:00 GMT+0000 (Coordinated Universal Time)
 * ```
 */
String.prototype.fromEuropeanDate = function () {
    const euroDate = this;
    const parts = euroDate.split(' ');
    const date = parts[0];
    const time = parts[1] ?? '00:00:00';

    const dateParts = date.split('.');

    return new Date(dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0] + ' ' + time);
}

/**
 * Converts the string to a Date object with a short date format (DD/MM/YYYY).
 * @returns {Date} Returns the Date object representing the date parsed from the string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const date = "15/06/2024".toShortDate(); // Sat Jun 15 2024 00:00:00 GMT+0000 (Coordinated Universal Time)
 * ```
 */
String.prototype.toShortDate = function () {
    var parts = this.split(/\/|\.|\-/);
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parts[0]);

};
/**
 * Truncates the string to a specified number of words followed by an ellipsis.
 * @param {number} l - The maximum number of words to include.
 * @returns {string} Returns the truncated string with an ellipsis.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const truncated = "This is a long sentence.".words(4); // "This is a long..."
 * ```
 */
String.prototype.words = function (l) {
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

        return this.substring(0, i) + '...';
    } else {
        return this.substring(0, l) + '...';
    }
};
/**
 * Breaks the string into chunks of a specified size, inserting a zero-width space between each chunk.
 * @param {number} [chunkSize=100] - The size of each chunk. Default is 100.
 * @returns {string} Returns the string with zero-width spaces inserted between chunks.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const broken = "This is a long string that will be broken into chunks.".breakAll(10);
 * /// "This is a​ long stri​ng that w​ill be bro​ken into c​hunks."
 * ```
 */
String.prototype.breakAll = function (chunkSize = 100) {
    if (chunkSize <= 0) return this.toString();
    return this.replace(
        new RegExp(`(.{${chunkSize}})`, 'g'),
        '$1\u200B'   // невидимый "zero-width space", браузеры его переносят
    );
};

/**
 * Replaces placeholders in the string with values from an object using template syntax.
 * @param {Object} values - The object containing values to substitute into the template.
 * @returns {string} Returns the string with placeholders replaced by corresponding values from the object.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const template = "Hello, {name|Guest}!";
 * const result = template.template({ name: "Alice" }); // "Hello, Alice!"
 * const resultWithDefault = template.template({}); // "Hello, Guest!"
 * ```
 */
String.prototype.template = function (values) {
    return this.replace(/{(.+?)(?:\|(.*?))?}/g, (keyExpr, key, defaultVal) => {
        return eval(`typeof values?.${key}`) === 'undefined' ? (defaultVal ?? "") : eval(`values.${key}`);
    })
};
/**
 * Replaces substrings in the string with specified replacements from an array.
 * @param {string[]} from - The substrings to replace.
 * @param {string[]} to - The replacement substrings.
 * @returns {string} Returns the string with specified replacements.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const str = "Hello, world!";
 * const result = str.replaceArray(["Hello", "world"], ["Hi", "everyone"]); // "Hi, everyone!"
 * ```
 */
String.prototype.replaceArray = function (from, to) {
    let ret = this;
    from.forEach(function (el) {
        ret = ret.replaceAll(el, to);
    });
    return ret;
};
/**
 * Replaces placeholders in the string with values from an object using key-value pairs.
 * @param {Object} obj - The object containing key-value pairs for replacement.
 * @param {string[]} [wrappers] - Optional wrappers to surround keys in the string.
 * @returns {string} Returns the string with placeholders replaced by corresponding values from the object.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const str = "Hello, {name}!";
 * const result = str.replaceObject({ name: "Alice" }, ["{", "}"]); // "Hello, Alice!"
 * ```
 */
String.prototype.replaceObject = function (obj, wrappers) {
    let ret = this;
    Object.forEach(obj, function (name, value) {
        ret = ret.replaceAll((wrappers && wrappers.length > 0 ? wrappers[0] : '') + name + (wrappers && wrappers.length > 1 ? wrappers[1] : ''), value);
    });
    return ret;
};
/**
 * Converts the string representing a monetary value to an integer (removes spaces).
 * @returns {number} Returns the integer value parsed from the monetary string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const moneyValue = "1 234 567".fromMoney(); // 1234567
 * ```
 */
String.prototype.fromMoney = function () {
    return parseInt(this.replace(/\s*/g, ''));
};
/**
 * Converts the string representing a time in HH:MM:SS format to seconds.
 * @returns {number} Returns the time in seconds parsed from the string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const timeInSeconds = "01:30:45".fromTimeString(); // 5445
 * ```
 */
String.prototype.fromTimeString = function () {
    let parts = this.split(':');
    return parseInt(parseInt(parts[2]) + parseInt(parts[1]) * 60 + parseInt(parts[0]) * 60 * 60);
};
/**
 * Capitalizes the first character of the string.
 * @returns {string} Returns the string with the first character capitalized.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const capitalized = "hello world".capitalize(); // "Hello world"
 * ```
 */
String.prototype.capitalize = function () {
    return this.substring(0, 1).toUpperCase() + this.substring(1);
};
/**
 * Transliterates the string, converting characters from one script to another.
 * This method aims to convert characters from one writing system to another.
 * Specific rules for transliteration should be implemented separately.
 * @returns {string} The transliterated string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const transliterated = "Привет мир".Transliterate(); // "Privet mir"
 * ```
 */
String.prototype.Transliterate = function () {
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
        function (str, p1, offset, s) {
            if (A[str] != 'undefined') { return A[str]; }
        }
    )
    return val;
};
/**
 * Converts Cyrillic characters to URL-friendly format.
 * @param {number} [words=3] - Number of words to include in the generated URL.
 * @returns {string} The generated URL string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const url = "Привет мир".CyrToUrl(); // "privet-mir"
 * ```
 */
String.prototype.CyrToUrl = function (words) {
    if (words == undefined) words = 3;

    let val = this.Transliterate()
        .trimString()
        .replaceArray([" ", "|", ".", ",", "(", ")", "[", "]", "!", "@", ":", ";", "*", "#", "$", "%", "^"], "-")
        .replaceArray(["'", "?", '"', '…', '&quot;', "\\", "/", '«', '»', /[0-9]/gi], "")
        .replaceAll('--', '-')
        .toLowerCase();

    val = val.split('-');
    let v = [];
    val.forEach(function (vv) {
        v.push(vv.trimString());
    });
    val = v.splice(0, words).join('-');
    return val.trimString();

};
/**
 * Truncates a string and appends ellipsis (...) if its length exceeds the specified length.
 * @param {number} length - The maximum length of the truncated string.
 * @param {boolean} [hasTitle=false] - Indicates whether to include a title attribute with the full string.
 * @returns {string} The truncated string with ellipsis.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const truncated = "This is a long string".ellipsis(10); // "This i...ring"
 * ```
 */
String.prototype.ellipsis = function (length, hasTitle = false) {
    var str = this;
    if (!str) {
        return str;
    }

    str = str + '';

    let strlen = str.length;
    if (strlen <= length)
        return str;


    let cliplen = parseInt((length - 3) / 2);
    let ret = str.substr(0, cliplen) + '...' + str.substr(strlen - cliplen - 1, strlen);
    if (hasTitle) {
        ret = '<span title="' + this + '">' + ret + '</span>';
    }
    return ret;
};
/**
 * Reverses the order of characters in the string.
 * @returns {string} The reversed string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const reversed = "Hello".reverse(); // "olleH"
 * ```
 */
String.prototype.reverse = function () { return this.split("").reverse().join(""); }
/**
 * Converts a hexadecimal string to its equivalent ASCII string.
 * @returns {string} The ASCII string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const asciiString = "48656c6c6f".hexToString(); // "Hello"
 * ```
 */
String.prototype.hexToString = function () {
    let string = '';
    for (let i = 0; i < this.length; i += 2) {
        string += String.fromCharCode(parseInt(this.substr(i, 2), 16));
    }
    return string;
};
/**
 * Replaces the last part of the string separated by the specified delimiter with the new part.
 * @param {string} splitter - The delimiter used to split the string.
 * @param {string} newPart - The new part to replace the last part with.
 * @returns {string} The modified string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const modified = "path/to/file.txt".replaceLastPart("/", "newfile.txt"); // "path/to/newfile.txt"
 * ```
 */
String.prototype.replaceLastPart = function (splitter, newPart) {
    let parts = this.split(splitter);
    parts.splice(-1);
    return parts.join(splitter) + splitter + newPart;
};
/**
 * Converts an object to a string representation using specified delimiters.
 * @param {object} object - The object to convert.
 * @param {string[]} delimiters - Array containing two delimiters for key-value pairs and items separation.
 * @param {Function} [callback] - Function to process each value in the object.
 * @returns {string} The string representation of the object.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const obj = { key1: "value1", key2: "value2" };
 * const str = String.fromObject(obj, [",", ":"]); // "key1:value1,key2:value2"
 * ```
 */
String.fromObject = function (object, delimiters, callback) {
    let ret = [];
    Object.forEach(object, function (name, value) {
        ret.push(name + delimiters[1] + (callback ? callback(value) : value));
    });
    return ret.join(delimiters[0]);
};
/**
 * Converts a string representation of an object to an object.
 * @param {string[]} delimiters - Array containing two delimiters for key-value pairs and items separation.
 * @param {Function} [callback] - Function to process each value in the resulting object.
 * @param {Function} [keyCallback] - Function to process each key in the resulting object.
 * @returns {object} The object created from the string representation.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const str = "key1:value1,key2:value2";
 * const obj = str.toObject([",", ":"]); // { key1: "value1", key2: "value2" }
 * ```
 */
String.prototype.toObject = function (delimiters, callback, keyCallback) {

    let ret = {};
    if (!(this + '')) {
        return ret;
    }

    let parts = this.split(delimiters[0]).filter(v => v != '').map(v => (v + '').trimString());
    if (parts.length == 0) {
        return ret;
    }

    parts.forEach((part) => {
        part = part.split(delimiters[1]);
        const key = part.shift().trimString();
        const value = part.join(':').trimString();
        ret[keyCallback ? keyCallback(key) : key] = callback ? callback(value) : value;
    });

    return ret;
};
/**
 * Replaces month names in the string with the specified months.
 * @param {string[]} months - Array containing month names.
 * @returns {string} The string with replaced month names.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const dateStr = "Jan 15, 2024";
 * const replaced = dateStr.replaceDateMonthName(["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]); // "Янв 15, 2024"
 * ```
 */
String.prototype.replaceDateMonthName = function (months) {
    let n = this + '';
    const enMonths = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < enMonths.length; i++) {
        n = n.replaceAll(enMonths[i], months[i]);
    }
    return n;
};
/**
 * Converts a string to camelCase format.
 * @param {string} [splitter='-'] - The delimiter to split the string into words.
 * @param {boolean} [firstIsCapital=false] - Indicates whether the first letter should be capitalized.
 * @returns {string} The camelCase formatted string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const camelCaseStr = "hello-world".toCamelCase(); // "helloWorld"
 * const capitalizedCamelCaseStr = "hello-world".toCamelCase("-", true); // "HelloWorld"
 * ```
 */
String.prototype.toCamelCase = function (splitter, firstIsCapital) {
    splitter = splitter || '-';
    if (this.trimString().indexOf('--') === 0) { return this; }

    let parts = this.split(splitter);
    let ret = [];
    parts.forEach((part, index) => {
        ret.push(index == 0 && firstIsCapital || index > 0 ? part.capitalize() : part);
    });
    return ret.join('');
};
/**
 * Converts a camelCase formatted string to its original format.
 * @param {string} [splitter='-'] - The delimiter to insert between words.
 * @returns {string} The original formatted string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const originalStr = "helloWorld".fromCamelCase(); // "hello-world"
 * const customSplitterStr = "helloWorld".fromCamelCase("_"); // "hello_world"
 * ```
 */
String.prototype.fromCamelCase = function (splitter) {
    splitter = splitter || '-';
    if (this.trimString().indexOf('--') === 0) { return this; }

    return this.replaceAll(new RegExp('([A-Z])', 'g'), (v) => { return splitter + v.toLowerCase(); }).rtrim('-').ltrim('-');

};
/**
 * Counts the occurrences of a specified character in the string.
 * @param {string} c - The character to count.
 * @returns {number} The number of occurrences of the specified character in the string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const count = "hello world".countCharIn("o"); // 2
 * ```
 */
String.prototype.countCharIn = function (c) {
    return (this.match(new RegExp(c, "g")) || []).length;
};
/**
 * Retrieves the first character of each word in the string.
 * @returns {string} The concatenated first characters of words.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const firstChars = "hello world".firstCharsOfWords(); // "HW"
 * ```
 */
String.prototype.firstCharsOfWords = function () {
    let parts = this.split(' ');
    let chars = [];
    parts.forEach((part) => {
        chars.push(part.substr(0, 1).toUpperCase());
    });
    return chars.join('');
};
/**
 * Check if the string is valid json
 * @returns {Boolean}
 * @prototypeof String
 * @method
 * @example
 * ```
 * const isValidJson = '{"key": "value"}'.isJson(); // true
 * const isNotValidJson = 'invalid json'.isJson(); // false
 * ```
 */
String.prototype.isJson = function () {
    try {
        JSON.parse(this);
        return true;
    } catch (e) {
        return false;
    }
};
/**
 * Checks if the string represents an integer.
 * @returns {boolean} true if the string represents an integer, otherwise false.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const isInteger = "123".isInt(); // true
 * const isNotInteger = "123.45".isInt(); // false
 * ```
 */
String.prototype.isInt = function () {
    return Number.isInteger(Number(this));
};
/**
 * Checks if the string represents a floating-point number.
 * @returns {boolean} true if the string represents a float, otherwise false.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const isFloat = "123.45".isFloat(); // true
 * const isNotFloat = "123".isFloat(); // false
 * ```
 */
String.prototype.isFloat = function () {
    return this.isNumeric() && !Number.isInteger(Number(this));
};
/**
 * Checks if the string represents a valid date.
 * @returns {boolean} true if the string represents a valid date, otherwise false.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const isValidDate = "2024-06-15".isDate(); // true
 * const isNotValidDate = "invalid date".isDate(); // false
 * ```
 */
String.prototype.isDate = function () {
    return (new Date(this) !== "Invalid Date") && !isNaN(new Date(this));
};

/**
 * Converts a string containing a full name to abbreviated form (e.g., John D.).
 * @returns {string} The abbreviated full name.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const abbreviatedName = "John Doe".makeFio(); // "John D."
 * ```
 */
String.prototype.makeFio = function () {
    const parts = this.split(' ');
    return (parts[0].capitalize() + ' ' + (parts.length > 1 ? (parts[1].substring(0, 1) + '. ' + (parts.length > 2 ? parts[2].substring(0, 1) + '.' : '')) : '')).trimString();
};
/**
 * Extracts the file extension from the string.
 * @returns {string} The extracted file extension.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const extension = "file.txt".extractExt(); // "txt"
 * ```
 */
String.prototype.extractExt = function () {
    const parts = this.split('.');
    return parts[parts.length - 1].toLowerCase();
};
/**
 * Extracts information about the file path.
 * @returns {object} An object containing information about the file path (basename, extension, filename, dirname).
 * @prototypeof String
 * @method
 * @example
 * ```
 * const pathInfo = "/path/to/file.txt".pathinfo();
 * /// pathInfo = { basename: "file.txt", ext: "txt", filename: "file", dirname: "/path/to/" }
 * ```
 */
String.prototype.pathinfo = function () {
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

/**
 * Extracts information from a URL string including the URL and its query parameters.
 * @returns {object} An object containing the URL and its options (query parameters).
 * @prototypeof String
 * @method
 * @example
 * ```
 * const urlInfo = "https://example.com/page?param1=value1&param2=value2".urlinfo();
 * /// urlInfo = { url: "https://example.com/page", options: { param1: "value1", param2: "value2" } }
 * ```
 */
String.prototype.urlinfo = function () {
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

/**
 * Removes XML entities from the string.
 * @returns {string} The string with XML entities replaced.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const cleanedString = "This &laquo;is&raquo; a test &ndash; string.".removeXmlEntities(); // "This «is» a test – string."
 * ```
 */
String.prototype.removeXmlEntities = function () {
    let s = this + '';
    s = s.replaceAll('&laquo;', '«');
    s = s.replaceAll('&raquo;', '»');
    s = s.replaceAll('&ndash;', '–');
    s = s.replaceAll('&mdash;', '—');
    s = s.replaceAll('&nbsp;', ' ');
    s = s.replaceAll('&ldquo;', '“');
    s = s.replaceAll('&rdquo;', '”');
    s = s.replaceAll('&hellip;', '…');
    s = s.replaceAll('&harr;', '⇔');
    s = s.replaceAll('&rarr;', '→');
    s = s.replaceAll('&larr;', '←');
    return s;
};

/**
 * Sets the base URL for relative URLs in the string.
 * @param {string} baseUrl - The base URL to prepend to relative URLs.
 * @returns {string} The modified string with the base URL set.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const modifiedString = '<img src="/images/pic.jpg">'.setBaseUrl("https://example.com");
 * /// Result: '<img src="https://example.com/images/pic.jpg">'
 * ```
 */
String.prototype.setBaseUrl = function (baseUrl) {
    return this.replaceAll('src="/', 'src="' + baseUrl + '/');
};
/**
 * Copies the string to the clipboard.
 * @returns {Promise} A promise that resolves when the string is successfully copied to the clipboard.
 * @prototypeof String
 * @method
 * @example
 * ```
 * "Hello, world!".copyToClipboard().then(() => {
 *     console.log("Copied to clipboard!");
 * }).catch((error) => {
 *     console.error("Failed to copy to clipboard:", error);
 * });
 * ```
 */
String.prototype.copyToClipboard = function () {
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
                if (!successful) {
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

        navigator.clipboard.writeText(text).then(function () {
            resolve();
        }, function (err) {
            reject('can not copy');
        });
    });
};
/**
 * Calculates the MD5 hash of the string.
 * @param {string} [e=''] - The string to calculate the MD5 hash for.
 * @returns {string} The MD5 hash of the string.
 * @prototypeof String
 * @method
 * @static
 * @example
 * ```
 * const hash = String.MD5("Hello, world!"); // "6cd3556deb0da54bca060b4c39479839"
 * ```
 */
String.MD5 = function (e) {
    if (!e) {
        e = '';
    }
    e = e + '';

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
    e = function (a) {
        a = a.replace(/\r\n/g, "\n");
        for (var b = "", d = 0; d < a.length; d++) {
            var c = a.charCodeAt(d);
            128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
        }
        return b
    }(e);
    f = function (b) {
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
/**
 * Generates a GUID (Globally Unique Identifier).
 * @returns {string} The generated GUID.
 * @prototypeof String
 * @method
 * @static
 * @example
 * ```
 * const guid = String.GUID(); // e.g., "3f2504e0-4f89-11d3-9a0c-0305e82c3301"
 * ```
 */
String.GUID = function () {
    return (Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4());
};
/**
 * Checks if the string is a valid GUID.
 * @returns {boolean} True if the string is a valid GUID, false otherwise.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const isValidGuid = "3f2504e0-4f89-11d3-9a0c-0305e82c3301".isGUID(); // true
 * const isNotValidGuid = "invalid-guid".isGUID(); // false
 * ```
 */
String.prototype.isGUID = function () {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(this);
};
/**
 * Generates a random password of the specified length.
 * @param {number} l - The length of the password to generate.
 * @returns {string} The generated password.
 * @prototypeof String
 * @method
 * @static
 * @example
 * ```
 * const password = String.Password(12); // e.g., "aB3!dE4@fG5"
 * ```
 */
String.Password = function (l) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charset2 = '!@#%^&*()';
    const charset3 = '0123456789';
    let retVal = "";
    for (let i = 0, n = charset.length; i < l; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    for (let i = 0, n2 = charset2.length, n = retVal.length; i < retVal.length / 4; i++) {
        const index = Math.floor(Math.random() * n);
        retVal = retVal.substring(0, index - 1) + charset2.charAt(Math.floor(Math.random() * n2)) + retVal.substring(index);
    }
    for (let i = 0, n2 = charset3.length, n = retVal.length; i < retVal.length / 4; i++) {
        const index = Math.floor(Math.random() * n);
        retVal = retVal.substring(0, index - 1) + charset3.charAt(Math.floor(Math.random() * n2)) + retVal.substring(index);
    }
    return retVal;
};
/**
 * Escapes special characters in a regular expression pattern.
 * @param {string} string - The regular expression pattern to escape.
 * @returns {string} The escaped regular expression pattern.
 * @prototypeof String
 * @method
 * @static
 * @example
 * ```
 * const escapedPattern = String.EscapeRegExp("Hello. (world)?"); // "Hello\. \(world\)\?"
 * ```
 */
String.EscapeRegExp = function (string) {
    return string ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : string;
};


/**
 * Pluralizes a string based on the count.
 * @param {string} template - The template string containing plural forms separated by '|'. Use '{n}' as a placeholder for the count.
 * @param {number} count - The count used to determine which plural form to use.
 * @returns {string} The pluralized string.
 * @prototypeof String
 * @method
 * @static
 * @example
 * ```
 * const pluralized = String.Pluralize("apple|apples", 2); // "apples"
 * const pluralizedWithCount = String.Pluralize("{n} apple|{n} apples", 5); // "5 apples"
 * ```
 */
String.Pluralize = function (template, count) {
    let cases = [2, 0, 1, 1, 1, 2],
        words = template.split("|");
    while (words.length <= 2) words.push(words[words.length - 1]);
    return words[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]].replace('{n}', count);
};

/**
 * Calculates the SHA-256 hash of the string.
 * @returns {Promise<string>} A promise that resolves with the SHA-256 hash of the string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * "Hello, world!".sha256().then(hash => {
 *     console.log("SHA-256 hash:", hash);
 * }).catch(error => {
 *     console.error("Error calculating SHA-256 hash:", error);
 * });
 * ```
 */
String.prototype.sha256 = function () {
    const msgBuffer = new TextEncoder().encode(this);
    return new Promise((resolve, reject) => {
        crypto.subtle.digest('SHA-256', msgBuffer).then(hashBuffer => {
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            resolve(hashHex);
        }).catch(error => reject(error));
    });

};
/**
 * Encrypts the string using the RC4 algorithm with the provided key.
 * @param {string} key - The key used for encryption.
 * @returns {string} The encrypted string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const encrypted = "Hello, world!".rc4("secretkey");
 * ```
 */
String.prototype.rc4 = function (key) {
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
};
/**
 * Converts the hexadecimal string to a binary string.
 * @returns {string} The binary string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const binaryStr = "48656c6c6f".hex2bin(); // "Hello"
 * ```
 */
String.prototype.hex2bin = function () {
    var bytes = [];
    for (var i = 0; i < this.length - 1; i += 2)
        bytes.push(parseInt(this.substring(i, i + 2), 16));
    return String.fromCharCode.apply(String, bytes);
};
/**
 * Converts the binary string to a hexadecimal string.
 * @returns {string} The hexadecimal string.
 * @prototypeof String  
 * @method
 * @example
 * ```
 * const hexStr = "Hello".bin2hex(); // "48656c6c6f"
 * ```
 */
String.prototype.bin2hex = function () {
    var i = 0, l = this.length, chr, hex = '';
    for (i; i < l; ++i) {
        chr = this.charCodeAt(i).toString(16)
        hex += chr.length < 2 ? '0' + chr : chr
    }
    return hex;
};

/**
 * Converts a Markdown-formatted string to HTML.
 * @returns {string} The HTML representation of the Markdown string.
 * @prototypeof String
 * @method
 * @example
 * ```
 * const html = "# Heading\n\nThis is **bold** text.".markdownToHtml();
 * /// Result: "<h1>Heading</h1><br><br>This is <b>bold</b> text."
 * ```
 */
String.prototype.markdownToHtml = function () {
    let html = this;

    // Заголовки
    html = html.replace(/^###### (.*)$/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*)$/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*)$/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gim, '<h1>$1</h1>');

    // Жирный и курсив
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<b><i>$1</i></b>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>');
    html = html.replace(/\*(.*?)\*/gim, '<i>$1</i>');

    // Блоки кода с языком (закрытые)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, function (match, lang, code) {
        const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const languageClass = lang ? ` lang="${lang}"` : "";
        return `<pre><code${languageClass}>${escaped}</code></pre>`;
    });

    // Блоки кода без закрытия (до конца текста)
    html = html.replace(/```(\w+)?\n([\s\S]*)$/gim, function (match, lang, code) {
        const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const languageClass = lang ? ` lang="${lang}"` : "";
        return `<pre><code${languageClass}>${escaped}</code></pre>`;
    });

    // Инлайн‑код
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Ссылки
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

    // Изображения
    html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />');

    // Цитаты
    html = html.replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>');

    // Горизонтальная линия
    html = html.replace(/^---$/gim, '<hr/>');

    // Списки
    html = html.replace(/^\s*-\s+(.*)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

    // Нумерованные списки
    html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ol>$1</ol>');

    // Переводы строк
    html = html.replace(/\n/g, '<br>');

    return html.trim();
};

/**
 * Checks if the number is approximately equal to another number within a specified tolerance.
 * @param {number} tolerance - The maximum allowed difference between the two numbers.
 * @param {number} check - The number to compare against.
 * @returns {boolean} True if the numbers are approximately equal, false otherwise.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const isApprox = (5).approximateCheck(0.1, 5.05); // true
 * const isNotApprox = (5).approximateCheck(0.1, 5.2); // false
 * ```
 */
Number.prototype.approximateCheck = function (tolerance, check) {
    return Math.abs(this - check) <= tolerance;
}


/**
 * Formats the number according to the current locale.
 * @returns {string} The formatted number string.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const formatted = (1234567.89).formatCurrent(); // e.g., "1,234,567.89"
 * ```
 */
Number.prototype.formatCurrent = function () { return isNaN(this) ? '' : new Intl.NumberFormat(App.NumberFormat).format(this); }
/**
 * Converts the Unix timestamp to a JavaScript Date object.
 * @returns {Date} The Date object corresponding to the Unix timestamp.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const date = (1625079600).toDateFromUnixTime(); // Fri Jul 01 2021 00:00:00 GMT+0000 (Coordinated Universal Time)
 * ```
 */
Number.prototype.toDateFromUnixTime = function () { let d = new Date(); d.setTime(this * 1000); return d; };
/**
 * Formats the number as a sequence with different labels depending on its last digit.
 * @param {string[]} labels - Array of labels for different sequences.
 * @param {boolean} [viewnumber=true] - Whether to include the number in the output.
 * @returns {string} The formatted sequence.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const sequence = (5).formatSequence(["item", "items", "items"], true); // "5 items"
 * ```
 */
Number.prototype.formatSequence = function (labels, viewnumber) {
    let s = this + " ";
    if (!viewnumber) { s = ""; }

    let ssecuence = this + '';
    let sIntervalLastChar = ssecuence.slice(-1);
    let sIntervalLast2Chars = ssecuence.slice(-2);
    if (parseInt(sIntervalLast2Chars) > 10 && parseInt(sIntervalLast2Chars) < 20) {
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
};
/**
 * Returns the number of decimal places.
 * @returns {number} The number of decimal places.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const decimalPlaces = (123.456).decPlaces(); // 3
 * ```
 */
Number.prototype.decPlaces = function () {
    var n = this + '';
    n = n.split('.');
    if (n.length <= 1) {
        return 0;
    }
    return n[1].length;
};

/**
 * Returns the decimal part of the number as an integer.
 * @param {number} [places=2] - The number of decimal places to consider.
 * @returns {number} The decimal part of the number as an integer.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const decimalPart = (123.456).decimals(2); // 45
 * ```
 */
Number.prototype.decimals = function (places = 2) {
    // Handle negative numbers by working with absolute value
    const absNum = Math.abs(this + 0);

    // Get decimal part
    const decimalPart = absNum - Math.floor(absNum);

    // Convert to integer (remove leading "0.")
    return parseInt((Math.round(decimalPart * Math.pow(10, decimalPart.toString().split(".")[1]?.length || 0)) + '').substring(0, places));
}
/**
 * Formats the number as a money string.
 * @param {number} [digits=2] - The number of digits after the decimal point.
 * @param {boolean} [force=true] - Whether to force displaying the decimal part.
 * @param {string} [space=' '] - The character used to separate thousands.
 * @param {boolean} [useNulls=true] - Whether to remove '.00' from the result.
 * @returns {string} The formatted money string.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const money = (1234.56).toMoney(); // "1 234,56"
 * ```
 */
Number.prototype.toMoney = function (digits, force = true, space = ' ', useNulls = true, dotSign = ',') {
    var result = '';
    if (digits == undefined) {
        digits = 2;
    }
    if (space === null) {
        space = ' ';
    }

    let price = '' + this.toFixed(digits);
    let parts = price.split(/\.|\,/);
    price = parts[0];

    let dec = (parts[1] != null) ? parts[1] : '';

    let len = price.length;
    let count = Math.floor(len / 3);

    for (let i = 0; i < count; i++) {
        result = (!(i == (count - 1) && len % 3 == 0) ? space : '') + price.substring(len - (i + 1) * 3, len - (i + 1) * 3 + 3) + result;
    }

    result = price.substring(0, len - count * 3) + result;
    let ret = (result + (dec ? dotSign + dec : (force ? dotSign + '0'.repeat(digits) : ''))).trimString('.').trimString(',');
    if (!useNulls) {
        ret = ret.replaceAll('.' + '0'.repeat(digits), '');
        ret = ret.replaceAll(',' + '0'.repeat(digits), '');
    }
    return ret;
};

/**
 * Formats the number according to the provided type.
 * @param {string} type - The type of formatting ('money', 'percent', or any other).
 * @param {number} [decimal=2] - The number of decimal places.
 * @param {string} [unit=null] - The unit to append to the formatted number.
 * @param {string} [currencyCode=null] - The currency code for 'money' type formatting.
 * @returns {string} The formatted number string.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const formattedMoney = (1234.56).intlFormat('money'); // e.g., "$1,234.56"
 * const formattedPercent = (0.1234).intlFormat('percent'); // "12.34%"
 * const formattedDecimal = (1234.56).intlFormat('decimal', 2, 'units'); // "1,234.56 units"
 * ```
 */
Number.prototype.intlFormat = function (type, decimal = 2, unit = null, currencyCode = null) {
    let v = this;
    if (type === 'money') {
        const formatter = new Intl.NumberFormat(App.NumberFormat, { style: 'currency', currency: currencyCode ?? App.Currency.code, maximumFractionDigits: decimal ?? 2 });
        v = formatter.format(parseFloat(v));
        // v = parseFloat(v).toMoney(decimal ?? 2);
    }
    else if (type === 'percent') {
        const formatter = new Intl.NumberFormat(App.NumberFormat, { style: 'percent', maximumFractionDigits: decimal ?? 2, minimumFractionDigits: decimal ?? 2 });
        if (v > 1) {
            v = v / 100;
        }
        v = formatter.format(parseFloat(v));
        // v = parseFloat(v).toMoney(decimal ?? 2);
    }
    else {
        const formatter = new Intl.NumberFormat(App.NumberFormat, { style: 'decimal', maximumFractionDigits: decimal ?? 2, minimumFractionDigits: decimal ?? 2 });
        v = formatter.format(parseFloat(v));
        if (unit) {
            v = v + ' ' + (Array.isArray(unit) ? parseFloat(v).formatSequence(unit, false) : unit);
        }
    }
    return v;
};

/**
 * Formats the number according to the provided units.
 * @param {Object} units - An object mapping unit multipliers to their corresponding labels.
 * @returns {string} The formatted number with the appropriate unit label.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const units = { 1: 'unit', 1000: 'kilo', 1000000: 'mega' };
 * const formatted = (1500).formatUnits(units); // "1.5 kilo"
 * ```
 */
Number.prototype.formatUnits = function (units) {
    // find the closest smaller or equal unit multiplier
    const keys = Object.keys(units)
        .map(Number)
        .sort((a, b) => a - b);

    let chosen = 1;
    for (const k of keys) {
        if (this >= k) chosen = k;
        else break;
    }

    const formatted = (this / chosen).toFixed(3).replace(/\.?0+$/, '');
    return `${formatted} ${Lang.Translate(units[chosen])}`;
};
/**
 * Converts the number to a time string.
 * @param {string} [daySplitter] - The character used to separate days from hours.
 * @param {boolean} [trim00=true] - Whether to trim leading '00' and ':' characters.
 * @returns {string} The formatted time string.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const timeString = (3661).toTimeString(); // "01:01:01"
 * const timeStringWithDays = (90061).toTimeString(' days '); // "1 days 01:01:01"
 * ```
 */
Number.prototype.toTimeString = function (daySplitter, trim00 = true, hasSeconds = true) {
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
    txt.push((mins + '').expand("0", 2));
    txt.push((secs + '').expand("0", 2));
    txt = txt.join(':');

    if (trim00) {
        txt = txt.ltrim("0");
        txt = txt.ltrim(":");
    }
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

    if (!hasSeconds) {
        txt = txt.split(daySplitter).splice(2, 1).join(daySplitter);
    }

    return txt;
};
/**
 * Converts the number to a size string.
 * @param {string[]} postfixes - Array of postfixes for different size units.
 * @param {number} range - The range used to determine the size unit.
 * @param {boolean} [remove0s=false] - Whether to remove '.00' from the result.
 * @param {boolean|Number} [approximate=false] - Whether to round the number to the nearest integer.
 * @param {boolean} [shownumber=true] - Whether to include the number in the output.
 * @returns {string} The formatted size string.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const sizeString = (1024).toSizeString(); // "1 Kb"
 * const sizeStringWithPostfixes = (1048576).toSizeString(['bytes', 'KB', 'MB', 'GB'], 1024); // "1 MB"
 * const sizeStringWithoutNumber = (2048).toSizeString(['bytes', 'KB', 'MB'], 1024, false, false, false); // "KB"
 * ```
 */
Number.prototype.toSizeString = function (postfixes = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb'], range = 1024, remove0s = false, approximate = false, shownumber = true) {
    let number = this;
    let isMinus = number < 0;
    if (isMinus) {
        number = Math.abs(number);
    }
    let j = 0;
    for (j = 0; j < postfixes.length; j++) {
        if (number < range)
            break;
        else
            number = number / range;
    }
    number = number.toFixed(2)
    if (remove0s) {
        number = number.replaceAll('.00', '');
    }
    if (approximate) {
        number = parseFloat(number).toFixed(approximate);
    }
    return (shownumber ? (isMinus ? '-' : '') + number + ' ' : '') + postfixes[j];
};
/**
 * Calculates the percentage of the current number relative to a maximum value.
 * @param {number} max - The maximum value.
 * @returns {number} The percentage.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const percentage = (50).percentOf(200); // 25
 * ```
 */
Number.prototype.percentOf = function (max) { return (this * 100) / max; };
/**
 * Checks if the number is an integer.
 * @returns {boolean} True if the number is an integer, false otherwise.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const isInteger = (5).isInt(); // true
 * const isNotInteger = (5.5).isInt(); // false
 * ```
 */
Number.prototype.isInt = function () { return Number.isInteger(this); };
/**
 * Checks if the number is a float.
 * @returns {boolean} True if the number is a float, false otherwise.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const isFloat = (5.5).isFloat(); // true
 * const isNotFloat = (5).isFloat(); // false
 * ```
 */
Number.prototype.isFloat = function () { return Number.isFloat(this); };
/**
 * Checks if the number is numeric.
 * @returns {boolean} Always returns true.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const isNumeric = (5).isNumeric(); // true
 * const isAlsoNumeric = (5.5).isNumeric(); // true
 * ```
 */
Number.prototype.isNumeric = function () { return true; };
/**
 * Generates a random number between the specified range.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The random number.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const randomNum = Number.random(1, 10); // e.g., 5
 * ```
 */
Number.random = function (min, max) { return Math.floor(min + Math.random() * (max + 1)); };
/**
 * Generates a random hexadecimal string of length 4.
 * @returns {string} The random hexadecimal string.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const randomHex = Number.Rnd4(); // e.g., "1a2b"
 * ```
 */
Number.Rnd4 = function () { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); };
/**
 * Generates a unique number based on the current timestamp, performance data, and randomness.
 * @returns {number} The unique number.
 * @prototypeof Number
 * @method
 * @example
 * ```
 * const uniqueNum = Number.unique(); // e.g., 123456789012345
 * ```
 */
Number.unique = function () { return (window.performance.getEntries()[0].duration + window.performance.now() + Math.random()) * 1e13; };

/**
 * Formats the date as a string in the 'YYYY-MM-DD HH:mm:ss' format.
 * @returns {string} The formatted date string.
 * @prototypeof Date
 * @method
 * @example 
 * ```
 * const date = new Date();
 * const dbDate = date.toDbDate(); // e.g., "2024-06-15T12:34:56.789Z"
 * ```
 */
Date.prototype.toDbDate = function () {
    if (this.toString() === 'Invalid Date') {
        return null;
    }
    return this.toISOString();
};
/**
 * Formats the date as a string in the 'YYYY-MM-DD HH:mm:ss' format, adjusted to local time.
 * @returns {string} The formatted local date string.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const localDateTime = date.toLocalDateTimeString(); // e.g., "2024-06-15 12:34:56"
 * ```
 */
Date.prototype.toLocalDateTimeString = function () {
    if (this.toString() === 'Invalid Date') {
        return null;
    }
    return this.getFullYear() + '-' + ((this.getMonth() + 1) + '').expand('0', 2) + '-' + (this.getDate() + '').expand('0', 2) + ' ' + (this.getHours() + '').expand('0', 2) + ':' + (this.getMinutes() + '').expand('0', 2) + ':' + (this.getSeconds() + '').expand('0', 2);
}
/**
 * Converts the date to Unix timestamp (seconds since January 1, 1970).
 * @returns {number} The Unix timestamp.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const unixTime = date.toUnixTime(); // e.g., 1625079600
 * ```
 */
Date.prototype.toUnixTime = function () { return this.getTime() / 1000; };
/**
 * Formats the date as a short date string in the 'YYYY-MM-DD' format.
 * @returns {string} The formatted short date string.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const shortDate = date.toShortDateString(); // e.g., "2024-06-15"
 * ```
 */
Date.prototype.toShortDateString = function () { return this.getFullYear() + '-' + ((this.getMonth() + 1) + '').expand('0', 2) + '-' + (this.getDate() + '').expand('0', 2); };

/**
 * Formats the date as a period string in the 'YYYY-MM' format.
 * @returns {string} The formatted period string.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const periodString = date.toDatePeriodString(); // e.g., "2024-06"
 * ```
 */
Date.prototype.toDatePeriodString = function () { return this.getFullYear() + '-' + ((this.getMonth() + 1) + '').expand('0', 2); };
/**
 * Formats the time part of the date as a string in the 'HH:mm:ss' format.
 * @param {boolean} [hasSeconds=true] - Whether to include seconds in the output.
 * @returns {string} The formatted time string.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const timeString = date.toTimeString(); // e.g., "12:34:56"
 * const timeStringWithoutSeconds = date.toTimeString(false); // e.g., "12:34"
 * ```
 */
Date.prototype.toTimeString = function (hasSeconds = true) { if (this == 'Invalid Date') { return '00:00:00'; }; return (this.getHours() + '').expand('0', 2) + ':' + (this.getMinutes() + '').expand('0', 2) + (hasSeconds ? ':' + (this.getSeconds() + '').expand('0', 2) : ''); };
/**
 * Checks if the given year is a leap year.
 * @param {number} year - The year to check.
 * @returns {boolean} True if the year is a leap year, false otherwise.
 * @prototypeof Date    
 * @method
 * @static
 * @example
 * ```
 * const isLeap = Date.isLeapYear(2020); // true
 * const isNotLeap = Date.isLeapYear(2021); // false
 * ```
 */
Date.isLeapYear = function (year) { return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); };

/**
 * Returns the timezone offset of the current date in the format '+HHMM' or '-HHMM'.
 * @returns {string} The timezone offset string.
 * @prototypeof Date
 * @method
 * @static
 * @example
 * ```
 * const timezoneOffset = Date.getTimezoneString(); // e.g., "+0200"
 * ```
 */
Date.getTimezoneString = function () {
    const m = new Date().getTimezoneOffset(); // minutes, positive for GMT-
    const sign = m > 0 ? "-" : "+";
    const abs = Math.abs(m);
    const hh = String(Math.floor(abs / 60)).padStart(2, "0");
    const mm = String(abs % 60).padStart(2, "0");
    return `${sign}${hh}${mm}`;
}


/**
 * Returns the number of days in the given month and year.
 * @param {number} year - The year.
 * @param {number} month - The month (0-based index).
 * @returns {number} The number of days in the month.
 * @prototypeof Date
 * @method
 * @static
 * @example
 * ```
 * const days = Date.daysInMonth(2024, 1); // 29
 * ```
 */
Date.daysInMonth = function (year, month) { return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]; };

/**
 * Returns an array of period strings (in 'YYYY-MM' format) between the current date and the specified start date.
 * @param {Date} dateFrom - The start date.
 * @returns {string[]} An array of period strings.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const periods = date.getPeriods(new Date(2024, 0, 1)); // e.g., ["2024-01", "2024-02", ...]
 * ```
 */
Date.prototype.getPeriods = function (dateFrom) {
    let periods = [];
    while (dateFrom < this) {
        periods.push(dateFrom.getFullYear() + '-' + ((dateFrom.getMonth() + 1) + '').expand('0', 2));
        dateFrom = dateFrom.addMonths(1);
    }
    return periods;
}

/**
 * Returns the number of days in the month of the current date.
 * @returns {number} The number of days in the month.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const days = date.daysInMonth(); // e.g., 30
 * ```
 */
Date.prototype.daysInMonth = function () { return Date.daysInMonth(this.getFullYear(), this.getMonth()); };
/**
 * Represents the timezone offset of the current date in hours.
 * @prototypeof Date
 * @property
 * @example
 * ```
 * const date = new Date();
 * const offset = date.timezoneoffset; // e.g., -2
 * ```
 */
Date.prototype.timezoneoffset = (new Date()).getTimezoneOffset() / 60;
/**
 * Converts the current date to the local time based on the timezone offset.
 * @returns {Date} The date converted to local time.
 * @method
 * @prototypeof Date
 * @example
 * ```
 * const date = new Date();
 * const localDate = date.toLocalTime(); // e.g., converts to local time
 * ```
 */
Date.prototype.toLocalTime = function () { this.setTime(this.getTime() - this.timezoneoffset * 60 * 60 * 1000); return this; };
/**
 * Adds the specified number of minutes to the current date.
 * @param {number} min - The number of minutes to add.
 * @returns {Date} The updated date.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.addMinute(30); // Adds 30 minutes to the current date
 * ```
 */
Date.prototype.addMinute = function (min) { this.setTime(this.getTime() + min * 60 * 1000); return this; };
/**
 * Adds the specified number of seconds to the current date.
 * @param {number} sec - The number of seconds to add.
 * @returns {Date} The updated date.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.addSeconds(45); // Adds 45 seconds to the current date
 * ```
 */
Date.prototype.addSeconds = function (sec) { this.setTime(this.getTime() + sec * 1000); return this; };
/**
 * Adds the specified number of hours to the current date.
 * @param {number} hours - The number of hours to add.
 * @returns {Date} The updated date.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.addHours(2); // Adds 2 hours to the current date
 * ```
 */
Date.prototype.addHours = function (hours) { this.setTime(this.getTime() + hours * 60 * 60 * 1000); return this; };
/**
 * Adds the specified number of days to the current date.
 * @param {number} days - The number of days to add.
 * @returns {Date} The updated date.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.addDays(5); // Adds 5 days to the current date
 * ```
 */
Date.prototype.addDays = function (days) { this.setTime(this.getTime() + days * 24 * 60 * 60 * 1000); return this; };
/**
 * Adds the specified number of years to the current date.
 * @param {number} years - The number of years to add.
 * @returns {Date} The updated date.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.addYears(3); // Adds 3 years to the current date
 * ```
 */
Date.prototype.addYears = function (years) { this.setFullYear(this.getFullYear() + years); return this; };
/**
 * Adds the specified number of months to the current date.
 * @param {number} months - The number of months to add.
 * @param {boolean} [setDay=true] - Whether to adjust the day to be within the new month's range.
 * @returns {Date} The updated date.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.addMonths(2); // Adds 2 months to the current date
 * date.addMonths(-1, false); // Subtracts 1 month without adjusting the day
 * ```
 */
Date.prototype.addMonths = function (months, setDay = true) { let n = this.getDate(); this.setMonth(this.getMonth() + months); if (setDay) { this.setDate(Math.min(n, this.daysInMonth())); } return this; };
/**
 * Checks if the current date is a working day (not a weekend or holiday).
 * @param {string[]} holidays - An array of holiday dates in 'YYYY-MM-DD' format.
 * @returns {boolean} True if it's a working day, false otherwise.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const isWorking = date.isWorkingDay(['2024-12-25']); // Checks if it's a working day
 * ```
 */
Date.prototype.isWorkingDay = function (holidays) { return !([0, 6].indexOf(this.getDay()) !== -1 || holidays.indexOf(this.toShortDateString()) !== -1); };
/**
 * Checks if the current date is a holiday.
 * @param {string[]} holidays - An array of holiday dates in 'YYYY-MM-DD' format.
 * @returns {boolean} True if it's a holiday, false otherwise.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const isHoliday = date.isHoliday(['2024-12-25']); // Checks if it's a holiday
 * ```
 */
Date.prototype.isHoliday = function (holidays) { return !(holidays.indexOf(this.toShortDateString()) !== -1); };
/**
 * Adds the specified number of working days to the current date, considering holidays.
 * @param {number} days - The number of working days to add. Positive values for future dates, negative values for past dates.
 * @param {string[]} holidays - An array of holiday dates in 'YYYY-MM-DD' format.
 * @param {boolean} [holidaysOnly=false] - If true, only holidays will be considered as working days.
 * @returns {Date} The updated date.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.addWorkingDays(5, ['2024-12-25']); // Adds 5 working days, skipping weekends and the specified holiday
 * ```
 */
Date.prototype.addWorkingDays = function (days, holidays, holidaysOnly = false) {
    let addFactor = days < 0 ? -1 : 1;

    while (true) {

        this.addDays(addFactor);
        if (holidaysOnly ? this.isHoliday(holidays) : this.isWorkingDay(holidays)) {
            days -= addFactor;
        }
        if (days === 0) {
            break;
        }
    }

    return this;
};
/**
 * Finds the next working day from the current date, considering holidays.
 * @param {number} [addFactor=1] - The factor to add (1 for next working day, -1 for previous working day).
 * @param {string[]} [holidays=[]] - An array of holiday dates in 'YYYY-MM-DD' format.
 * @param {boolean} [holidaysOnly=false] - If true, only holidays will be considered as working days.
 * @returns {Date} The next working day.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.nextWorkingDay(1, ['2024-12-25']); // Finds the next working day, skipping weekends and the specified holiday
 * ```
 */
Date.prototype.nextWorkingDay = function (addFactor = 1, holidays = [], holidaysOnly = false) {
    while (!(holidaysOnly ? this.isHoliday(holidays) : this.isWorkingDay(holidays))) {
        this.addDays(1 * addFactor);
    }
    return this;
};
/**
 * Creates a copy of the current date object.
 * @returns {Date} The copied date object.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const copy = date.Copy(); // Creates a copy of the current date
 * ```
 */
Date.prototype.Copy = function () { let d = new Date(); d.setTime(this.getTime()); return d; };
/**
 * Calculates the difference in seconds between the current date and the specified date.
 * @param {Date} dt - The date to compare with.
 * @returns {number} The difference in seconds.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const diffInSeconds = date.Diff(new Date()); // Calculates the difference in seconds
 * ```
 */
Date.prototype.Diff = function (dt) { return parseInt((dt.getTime() - this.getTime()) / 1000); };

/**
 * Resets the current date to the first day of the year (January 1st) at 00:00:00.000.
 * @returns {Date} The updated date.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.ResetToFirstDayOfYear(); // Resets the date to January 1st at 00:00:00.000
 * ```
 */
Date.prototype.ResetToFirstDayOfYear = function () {
    this.setMonth(0);
    this.setDate(1);
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
}

/**
 * Resets the current date to the last day of the year (December 31st) at 23:59:59.999.
 * @returns {Date} The updated date.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.ResetToLastDayOfYear(); // Resets the date to December 31st at 23:59:59.999
 * ```
 */
Date.prototype.ResetToLastDayOfYear = function () {
    this.setMonth(11);
    this.setDate(31);
    this.setHours(23);
    this.setMinutes(59);
    this.setSeconds(59);
    this.setMilliseconds(999);
    return this;
}
/**
 * Calculates the difference in months between the current date and the specified date.
 * @param {Date} dateTo - The date to compare with.
 * @returns {number} The difference in months.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const diffInMonths = date.DiffInMonths(new Date()); // Calculates the difference in months
 * ```
 */
Date.prototype.DiffInMonths = function (dateTo) {
    let d = new Date();
    d.setTime(this.getTime());
    let i = 0;
    while (d <= dateTo) {
        d.setMonth(d.getMonth() + 1);
        i++;
    }
    return i - 1;
};
/**
 * Calculates the difference in days between the current date and the specified date.
 * @param {Date} dateTo - The date to compare with.
 * @returns {number} The difference in days.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const diffInDays = date.DiffInDays(new Date()); // Calculates the difference in days
 * ```
 */
Date.prototype.DiffInDays = function (dateTo) {
    return Math.ceil(this.Diff(dateTo) / 86400);
};
/**
 * Calculates holidays count within two dates
 * @param {Date} dateTo date to
 * @param {Array} holidays holidays with holidays mark
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const holidays = [{ date: '2024-12-25', isholiday: true }];
 * const diffInHolidays = date.DiffInDaysHolidays(new Date(), holidays); // Calculates the number of holidays between the dates
 * ```
 */
Date.prototype.DiffInDaysHolidays = function (dateTo, holidays) {
    let holidays2 = holidays.filter(v => v.isholiday).map(v => v.date);
    let d = new Date();
    d.setTime(this.getTime());
    let i = 0;
    while (d <= dateTo) {
        if (holidays2.indexOf(d.toShortDateString()) !== -1) {
            i++;
        }
        d.addDays(1);
    }
    return i;
}
/**
 * Calculates the difference in years between the current date and the specified date.
 * @param {Date} dateTo - The date to compare with.
 * @returns {number} The difference in years.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const diffInYears = date.DiffInYears(new Date()); // Calculates the difference in years
 * ```
 */
Date.prototype.DiffInYears = function (dateTo) {
    let d = new Date();
    d.setTime(this.getTime());
    let i = 0;
    while (d <= dateTo) {
        d.setMonth(d.getMonth() + 12);
        i++;
    }
    return i - 1;
};
/**
 * Calculates the difference between two dates in years, months, and days.
 * @param {Date} dateTo - The date to compare with.
 * @returns {Object} An object containing the difference in years, months, and days.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const diffFull = date.DiffFull(new Date()); // Calculates the difference in years, months, and days
 * ```
 */
Date.prototype.DiffFull = function (dateTo) {

    // не считаем дату начала и считаем дату окончания полностью
    let time1 = this.toShortDateString().toDate().addDays(1); // меньше
    let time2 = dateTo.toShortDateString().toDate().addDays(1); // больше

    let y = time1.DiffInYears(time2);
    time1.addYears(y);

    let m = time1.DiffInMonths(time2);
    time1.addMonths(m, false);

    let d = time1.DiffInDays(time2);
    return { days: d > 0 ? d : 0, months: m > 0 ? m : 0, years: y > 0 ? y : 0 };

};
/**
 * Calculates the difference between two dates in years, months, and days and formats the result as tokens.
 * @param {Date} dateTo - The date to compare with.
 * @param {string} [splitter=' '] - The separator between tokens.
 * @param {string[][]} [tokens] - An array of tokens for years, months, and days.
 * @returns {string} The formatted difference string.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const diffFullTokens = date.DiffFullTokens(new Date()); // Calculates the difference in years, months, and days and formats the result as tokens
 * ```
 */
Date.prototype.DiffFullTokens = function (
    dateTo,
    splitter = ' ',
    tokens = [
        ['год', 'года', 'лет'],
        ['месяц', 'месяца', 'месяцев'],
        ['день', 'дня', 'дней']
    ]) {
    const diff = this.DiffFull(dateTo);
    return (diff.years > 0 ? diff.years.formatSequence(tokens[0], true).replaceAll(' ', '&nbsp;') + splitter : '') +
        (diff.months > 0 ? diff.months.formatSequence(tokens[1], true).replaceAll(' ', '&nbsp;') + splitter : '') +
        (diff.days > 0 ? diff.days.formatSequence(tokens[2], true).replaceAll(' ', '&nbsp;') : '');

};
/**
 * Calculates the age based on the current date.
 * @param {boolean} [removeNazad=false] - Whether to remove the "назад" (ago) suffix.
 * @param {boolean} [returnFull=false] - Whether to return the full age string.
 * @param {string[][]} [tokens=null] - An array of tokens for years, months, weeks, days, hours, minutes, and seconds.
 * @returns {string} The age string.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const age = date.Age(); // Calculates the age based on the current date
 * ```
 */
Date.prototype.Age = function (removeNazad = false, returnFull = false, tokens = null, nazad = 'назад', day = 'день', yesterday = 'вчера', justnow = 'только что') {
    let time = Math.abs((new Date()).getTime() / 1000 - this.getTime() / 1000); // to get the time since that moment

    tokens = tokens || [
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
        let ret = (numberOfUnits > 1 ? numberOfUnits + ' ' : '') + numberOfUnits.formatSequence(labels, false) + (removeNazad ? '' : ' ' + nazad);
        if (ret == day + (removeNazad ? '' : ' ' + nazad))
            ret = yesterday;

        if (returnFull) {
            retArray.push(ret);
        }
        else {
            return ret;
        }
    }
    if (returnFull) {
        return retArray.join(' ');
    }
    else {
        return justnow;
    }
};
/**
 * Formats the date using the specified format string.
 * @param {string} formatString - The format string.
 * @returns {string} The formatted date string.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const formattedDate = date.format({ year: 'numeric', month: 'long', day: 'numeric' }); // e.g., "15 июня 2024"
 * ```
 */
Date.prototype.format = function (formatObject, dateFormat = 'ru-RU') {
    let dateformat = dateFormat || App.DateFormat || 'ru-RU';
    const params = formatObject;
    const format = new Intl.DateTimeFormat(dateformat, params);
    if ((this + '') === 'Invalid Date') {
        return '';
    }
    return format.format(this);
};
/**
 * Formats the date according to the locale, optionally including time and excluding day.
 * @param {boolean} [withTime=false] - Whether to include time.
 * @param {boolean} [withoutDay=false] - Whether to exclude day.
 * @param {boolean} [withoutYear=false] - Whether to exclude year.
 * @param {boolean} [withSeconds=false] - Whether to include seconds.
 * @param {boolean} [withoutMonth=false] - Whether to exclude month.
 * @returns {string} The formatted date string.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const formattedDate = date.intlFormat(true, false); // e.g., "15 июня 2024, 12:34"
 * ```
 */
Date.prototype.intlFormat = function (withTime = false, withoutDay = false, withoutYear = false, withSeconds = false, withoutMonth = false) {
    let dateformat = App.DateFormat || 'ru-RU';
    const params = { day: '2-digit', month: 'short', year: 'numeric' };
    if (withTime) {
        params.hour = '2-digit';
        params.minute = '2-digit';
        if (withSeconds) {
            params.second = '2-digit';
        }
    }
    if (withoutDay) {
        delete params.day;
    }
    if (withoutYear) {
        delete params.year;
    }
    if (withoutMonth) {
        delete params.month;
    }
    const format = new Intl.DateTimeFormat(dateformat, params);
    if ((this + '') === 'Invalid Date') {
        return '';
    }
    return format.format(this);
};
/**
 * Gets the day index of the year.
 * @returns {number} The day index.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const dayIndex = date.DayIndex(); // e.g., 166
 * ```
 */
Date.prototype.DayIndex = function () {
    var start = new Date(this.getFullYear(), 0, 0);
    var diff = this - start;
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};
/**
 * Returns a short Russian date string optionally showing the year and day.
 * @param {boolean} [showYear=true] - Whether to show the year.
 * @param {boolean} [showDay=true] - Whether to show the day.
 * @returns {string} The short Russian date string.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const shortRUString = date.toShortRUString(); // e.g., "15 июн 2024"
 * ```
 */
Date.prototype.toShortRUString = function (showYear, showDay) {
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return (showDay === undefined || showDay === true ? this.getDate() + ' ' : '') + months[this.getMonth()] + (showYear === undefined || showYear === true ? ' ' + this.getFullYear() : '');
};
/**
 * Creates a copy of the current date object.
 * @returns {Date} The copied date object.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const copy = date.copy(); // Creates a copy of the current date
 * ```
 */
Date.prototype.copy = function () {
    let dt = new Date();
    dt.setTime(this.getTime());
    return dt;
};
/**
 * Sets the date to the start of the current year.
 * @returns {Date} The updated date object.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.setAsStartOfYear(); // Sets the date to January 1st of the current year
 * ```
 */
Date.prototype.setAsStartOfYear = function () {
    this.setDate(1);
    this.setMonth(0);
    return this;
};
/**
 * Sets the date to the end of the current year.
 * @returns {Date} The updated date object.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.setAsEndOfYear(); // Sets the date to December 31st of the current year
 * ```
 */
Date.prototype.setAsEndOfYear = function () {
    this.setMonth(11);
    this.setDate(31);
    return this;
};
/**
 * Sets the date to the start of the current year.
 * @returns {Date} The updated date object.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.setAsStartOfDay(); // Sets the date to the start of the current day (00:00:00.000)
 * ```
 */
Date.prototype.setAsStartOfDay = function () {
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
};
/**
 * Sets the date to the end of the current day.
 * @returns {Date} The updated date object.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * date.setAsEndOfDay(); // Sets the date to the end of the current day (23:59:59.000)
 * ```
 */
Date.prototype.setAsEndOfDay = function () {
    this.setHours(23);
    this.setMinutes(59);
    this.setSeconds(59);
    this.setMilliseconds(0);
    return this;
};
/**
 * Gets the quarter of the year.
 * @returns {number} The quarter number.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const quarter = date.getQuarter(); // e.g., 2
 * ```
 */
Date.prototype.getQuarter = function () {
    return Math.floor((this.getMonth() + 3) / 3);
};
/**
 * Converts the date to a quarter string.
 * @param {string} [quarterName='квартал'] - The name of the quarter.
 * @param {boolean} [numberOnly=false] - Whether to return only the quarter number.
 * @returns {string} The quarter string.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const date = new Date();
 * const quarterString = date.toQuarterString(); // e.g., "2 квартал 2024"
 * const quarterNumberOnly = date.toQuarterString('квартал', true); // e.g., "2"
 * ```
 */
Date.prototype.toQuarterString = function (quarterName = 'квартал', numberOnly = false) {
    let quarter = this.getQuarter();
    if (numberOnly) {
        return quarter;
    }
    return quarter + ' ' + quarterName + ' ' + this.getFullYear();
};
/**
 * Gets the current date and time.
 * @returns {Date} The current date and time.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const now = Date.Now(); // e.g., "2024-06-15T12:34:56.789Z"
 * ```
 */
Date.Now = function () { return new Date(); };
/**
 * Gets the current time in milliseconds.
 * @returns {number} The current time in milliseconds.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const currentTimeMs = Date.Ms(); // e.g., 1623762896789
 * ```
 */
Date.Ms = function () { return Date.Now().getTime(); };
/**
 * Gets a unique timestamp.
 * @returns {number} The unique timestamp.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const uniqueTimestamp = Date.Mc(); // e.g., 162376289678900000
 * ```
 */
Date.Mc = function () { return (window.performance.getEntries()[0].duration + window.performance.now()) * 1e13; };
/**
 * Creates a date object from the specified timestamp.
 * @param {number} from - The timestamp.
 * @returns {Date} The date object.
 * @prototypeof Date
 * @method
 * @example
 * ```
 * const dateFromTimestamp = Date.from(1623762896789); // Creates a date object from the timestamp
 * ```
 */
Date.from = function (from) {
    let dt = new Date();
    dt.setTime(parseInt(from));
    return dt;
};
/**
 * Converts a quarter and year to a period start or end date string.
 * @param {number} quarter - The quarter number (1 to 4).
 * @param {number} year - The year.
 * @param {number} [startOrEnd=1] - 1 for start date, 2 for end date.
 * @returns {string} The period start or end date string.
 * @prototypeof Date
 * @method
 * @static
 * @example
 * ```
 * const periodStart = Date.QuarterToPeriod(1, 2024); // "01.01.2024"
 * const periodEnd = Date.QuarterToPeriod(1, 2024, 2); // "31.03.2024"
 * ```
 */
Date.QuarterToPeriod = function (quarter, year, startOrEnd = 1) {

    let ret = '';
    if (quarter == 1) {
        ret = startOrEnd == 1 ? '01.01.' + year : '31.03.' + year;
    }
    else if (quarter == 2) {
        ret = startOrEnd == 1 ? '01.01.' + year : '30.06.' + year;
    }
    else if (quarter == 3) {
        ret = startOrEnd == 1 ? '01.01.' + year : '30.09.' + year;
    }
    else if (quarter == 4) {
        ret = startOrEnd == 1 ? '01.01.' + year : '31.12.' + year;
    }

    return ret;

}

/**
 * Guesses the value of an input element based on the provided key.
 * @param {string} key - The key pressed (e.g., 'Backspace', 'Delete', or a character).
 * @returns {string} The guessed value of the input element after the key press.
 * @prototypeof HTMLInputElement
 * @method
 * @example
 * ```
 * const inputElement = document.querySelector('input');
 * const guessedValue = inputElement.guessValue('a'); // Guesses the value after pressing 'a'
 * ```
 */
HTMLInputElement.prototype.guessValue = function (key) {
    const value = this.value;

    const start = this.selectionStart;
    const end = this.selectionEnd;

    if (key === 'Backspace') {
        if (start === end && start > 0) {
            return value?.slice(0, start - 1) + value?.slice(end);
        } else {
            return value?.slice(0, start) + value?.slice(end);
        }
    }

    if (key === 'Delete') {
        if (start === end && end < value.length) {
            return value.slice(0, start) + value?.slice(end + 1);
        } else {
            return value.slice(0, start) + value?.slice(end);
        }
    }

    if ((key?.length ?? 0) > 1) {
        return value;
    }

    return value.slice(0, start) + key + value?.slice(end);
}

/**
 * Animates scrolling to a specified scrollTop value within a specified duration.
 * @param {number} to - The target scrollTop value to scroll to.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @prototypeof Element
 * @method
 * @example
 * ```
 * const element = document.querySelector('.scrollable');   
 * element.animateScrollTop(200, 1000); // Scrolls to scrollTop 200 over 1 second
 * ```
 */
Element.prototype.animateScrollTop = function (to, duration) {
    let start = this.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;
    console.log(start, to, change);

    const animateScroll = () => {
        currentTime += increment;
        let val = Math.easeInOutQuad(currentTime, start, change, duration);
        this.scrollTop = val;
        if (currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };
    animateScroll();
};

/**
 * Animates scrolling to a specified scrollTop value within a specified duration.
 * @param {number} to - The target scrollTop value to scroll to.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @prototypeof Element
 * @method
 * @example
 * ```
 * const element = document.querySelector('.scrollable');   
 * element.animateScrollLeft(200, 1000); // Scrolls to scrollLeft 200 over 1 second
 * ```
 */
Element.prototype.animateScrollLeft = function (to, duration) {
    let start = this.scrollLeft,
        change = to - start,
        currentTime = 0,
        increment = 20;

    const animateScroll = () => {
        currentTime += increment;
        let val = Math.easeInOutQuad(currentTime, start, change, duration);
        this.scrollLeft = val;
        if (currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };
    animateScroll();
};

/**
 * Animates the height of the element to a specified value over a given duration.
 * @param {number} height - The target height in pixels.
 * @param {number} [duration=1000] - The duration of the animation in milliseconds.
 * @param {Function|null} [callback=null] - An optional callback function to be called after the animation completes.
 * @prototypeof Element
 * @method
 * @example
 * ```
 * const element = document.querySelector('.box');
 * element.animateHeight(200, 1000, () => {
 *     console.log('Animation complete!');
 * }); // Animates the height to 200px over 1 second
 * ```
 */
Element.prototype.animateHeight = function (height, duration = 1000, callback = null) {
    const targetHeight = height;
    const startTime = performance.now();

    const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1); // 0 → 1 linearly
        this.style.height = (targetHeight * progress) + 'px';

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            if (callback) {
                callback();
            }
        }
    }

    this.style.height = '0px';
    requestAnimationFrame(tick);

};

/**
 * Animates the height of the element down to zero over a given duration.
 * @param {number} height - The initial height in pixels.
 * @param {number} [duration=1000] - The duration of the animation in milliseconds.
 * @param {Function|null} [callback=null] - An optional callback function to be called after the animation completes.
 * @prototypeof Element
 * @method
 * @example
 * ```
 * const element = document.querySelector('.box');
 * element.animateHeightDown(200, 1000, () => {
 *     console.log('Animation complete!');
 * }); // Animates the height down to 0px over 1 second
 * ```
 */
Element.prototype.animateHeightDown = function (height, duration = 1000, callback = null) {
    const targetHeight = 0;
    const startTime = performance.now();

    const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1); // 0 → 1 linearly
        this.style.height = (targetHeight * progress) + 'px';

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            if (callback) {
                callback();
            }
        }
    }

    this.style.height = height + 'px';
    requestAnimationFrame(tick);

}


/**
 * Ensures that the element is visible within its parent container.
 * Scrolls the container to bring the element into view if necessary.
 * @param {Element} container The parent container element.
 * @param {number} [top=null] Additional offset from the top of the container.
 * @prototypeof Element
 * @method
 * @example
 * ```
 * const container = document.querySelector('.scrollable');
 * const element = document.querySelector('.item');
 * element.ensureInViewport(container, 20); // Ensures the element is visible within the container with an additional offset of 20px from the top
 * ```
 */
Element.prototype.ensureInViewport = function (container, top = null) {

    //Determine container top and bottom
    let cTop = container.scrollTop;
    let cBottom = cTop + container.clientHeight;

    //Determine element top and bottom
    let containerTop = container.bounds().top;
    let thisTop = this.bounds().top;
    let eTop = thisTop - containerTop + container.scrollTop;
    let eBottom = eTop + this.clientHeight;

    //Check if out of view
    if (eTop - this.clientHeight < cTop) {
        container.scrollTop -= (cTop - eTop) + this.clientHeight;
    } else if (eBottom > cBottom) {
        container.scrollTop += (eBottom - cBottom);
    }
    if (top) {
        container.scrollTop -= top;
    }
};

/**
 * Ensures that the element is visible within its parent container.
 * Scrolls the container to bring the element into view if necessary.
 * @param {Element} container The parent container element.
 * @param {number} [top=null] Additional offset from the top of the container.
 * @prototypeof Element
 * @method
 * @example
 * ```
 * const container = document.querySelector('.scrollable');
 * const element = document.querySelector('.item');
 * element.ensureInViewportHr(container, 20); // Ensures the element is visible within the container with an additional offset of 20px from the left
 * ```
 */
Element.prototype.ensureInViewportHr = function (container, left = null) {
    //Determine container top and bottom
    let cLeft = container.scrollLeft;
    let cRight = cLeft + container.clientWidth;

    //Determine element top and bottom
    let eLeft = this.offsetLeft;
    let eRight = eLeft + this.clientWidth;

    //Check if out of view
    if (eLeft - this.clientWidth < cLeft) {
        container.scrollLeft -= (cLeft - eLeft) + this.clientWidth;
    } else if (eRight > cRight) {
        container.scrollLeft += (eRight - cRight);
    }
    if (left) {
        container.scrollLeft -= left;
    }
};

/**
 * Checks if the element is fully visible within its parent container.
 * @param {Element} container The parent container element.
 * @returns {boolean} True if the element is fully visible, false otherwise.
 * @prototypeof Element
 * @method
 * @example
 * ```
 * const container = document.querySelector('.scrollable');
 * const element = document.querySelector('.item');
 * const isVisible = element.inInViewport(container); // Checks if the element is fully visible within the container
 * ```
 */
Element.prototype.inInViewport = function (container) {

    //Determine container top and bottom
    const containerBounds = container.bounds();
    const elementBounds = this.bounds();

    let scrollTop = containerBounds.top + container.scrollTop;
    let scrollBottom = containerBounds.top + scrollTop + container.clientHeight;

    //Determine element top and bottom
    let eTop = elementBounds.top;
    let eBottom = elementBounds.top + elementBounds.outerHeight;

    //Check if out of view
    if (eTop - elementBounds.outerHeight < scrollTop) {
        return false;
    } else if (eBottom > scrollBottom) {
        return false;
    }
    return true;
};

/**
 * Returns the index of the element within its parent's list of children.
 * @returns {number|null} The index of the element, or null if it has no parent.
 * @prototypeof Element
 * @method
 * @example
 * ```
 * const element = document.querySelector('.item');
 * const index = element.index(); // Gets the index of the element within its parent's list of children
 * ```
 */
Element.prototype.index = function () {
    if (this.parentElement) {
        return Array.prototype.indexOf.call(this.parentElement.children, this);
    } else {
        return null;
    }
};

/**
 * Provides a shortcut for working with element attributes.
 * @param {string} [name] The name of the attribute.
 * @param {string} [value] The value of the attribute.
 * @returns {string|Element} The value of the attribute if only name is provided, otherwise returns the element itself.
 * @prototypeof Element 
 * @method
 * @example
 * ```
 * const element = document.querySelector('.item');
 * const attrValue = element.attr('data-id'); // Gets the value of the 'data-id' attribute
 * element.attr('data-id', '123'); // Sets the value of the 'data-id' attribute to '123'
 * ```
 */
Element.prototype.attr = function (name, value) {
    if (name === undefined && value === undefined) {
        let ret = {};
        for (const attr of this.attributes) {
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
};

/**
 * Creates a new element with the specified name, attributes, and dataset.
 * @param {string} name The name of the element.
 * @param {Object} [attr] Attributes to be set on the element.
 * @param {Object} [data=null] Dataset to be set on the element.
 * @param {string} [ns=null] Namespace for creating elements in a different XML namespace.
 * @returns {HTMLElement} The newly created element.
 * @prototypeof Element
 * @method
 * @example
 * ```
 * const element = Element.create('div', { class: 'item' }, { id: '123' });
 * ```
 */
Element.create = function (name, attr, data = null, ns = null) {
    const element = ns ? document.createElementNS(ns, name) : document.createElement(name);
    Object.forEach(attr, (n, v) => element.attr(n, v));
    data && element.data(data);
    return element;
};


/**
 * Creates DOM elements from the provided HTML string and returns them as a document fragment.
 * @param {string} html The HTML string.
 * @returns {NodeList} The NodeList containing the created elements.
 * @prototypeof Element
 * @method
 */
Element.fromHtml = function (html) {
    var template = document.createElement('template');
    html = html.trimString();
    template.innerHTML = html;
    return template.content.childNodes;
};

/**
 * Returns the path of the element, representing its ancestry within the DOM tree.
 * @returns {string} The path of the element.
 * @prototypeof Element
 * @method
 */
Element.prototype.path = function () {
    let path = [];
    let p = this;
    while (p.parent()) {
        path.push(p.attr('data-object-name') ? p.attr('data-object-name') : p.nodeName.toLowerCase());
        p = p.parent();
    }
    return path.join('/');
}

/**
 * Provides a shortcut for working with the `data-*` attributes of the element.
 * @param {string} [name] The name of the data attribute.
 * @param {*} [value] The value of the data attribute.
 * @returns {Object|string|Element} The dataset object if no arguments are provided, the value of the specified dataset property if only name is provided, otherwise returns the element itself.
 * @prototypeof Element
 * @method
 */
Element.prototype.data = function (name, value) {
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
};

/**
 * Attaches additional custom data to the element using a private `_tag` property.
 * @param {string} [name] The name of the property.
 * @param {*} [value] The value of the property.
 * @returns {Object|string|Element} The tag object if no arguments are provided, the value of the specified property if only name is provided, otherwise returns the element itself.
 * @prototypeof Element
 * @method
 */
Element.prototype.tag = function (name, value) {
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
};
/**
 * Inserts the element at the specified index within the parent's list of children.
 * If the index exceeds the number of children, appends the element to the end.
 * @param {HTMLElement} parent The parent element.
 * @param {number} index The index at which to insert the element.
 * @returns {HTMLElement} The inserted element.
 * @prototypeof Element
 * @method
 */
Element.prototype.insertAtIndex = function (parent, index) {
    const childOnIndex = parent.children[index];
    if (childOnIndex) {
        parent.insertBefore(this, childOnIndex);
    } else {
        parent.append(this);
    }
    return this;
}

/**
 * Appends the element to the end of the parent's list of child elements.
 * @param {HTMLElement} parent The parent element.
 * @returns {HTMLElement} The appended element.
 * @prototypeof Element
 * @method
 */
Element.prototype.appendTo = function (parent) {
    parent.appendChild(this);
    return this;
};

/**
 * Appends the specified child element(s) to the end of the current element's list of children.
 * @param {HTMLElement|NodeList} child The child element or list of child elements to append.
 * @returns {HTMLElement} The last appended child element.
 * @prototypeof Element
 * @method
 */
Element.prototype.append = function (child) {

    try {
        this.appendChild(child);
        return child;
    }
    catch (e) {
        let lastNode = null;
        for (let i = 0; i < child.length; i++) {
            if (child[i].nodeName != '#text') {
                lastNode = this.appendChild(child[i]);
            }
        }
        return lastNode;
    }


};

/**
 * Prepends the element to the beginning of the parent's list of child elements.
 * @param {HTMLElement} parent The parent element.
 * @returns {HTMLElement} The prepended element.
 * @prototypeof Element
 * @method
 */
Element.prototype.prependTo = function (parent) {
    if (parent.childNodes.length > 0) {
        parent.insertBefore(this, parent.childNodes[0]);
    } else {
        parent.appendChild(this);
    }
    return this;
};

/**
 * Prepends the specified child element(s) to the beginning of the current element's list of children.
 * @param {HTMLElement|NodeList} child The child element or list of child elements to prepend.
 * @returns {HTMLElement} The last prepended child element.
 * @prototypeof Element
 * @method
 */
Element.prototype.prepend = function (child) {
    try {
        if (this.childNodes.length > 0) {
            this.insertBefore(child, this.childNodes[0]);
        } else {
            this.appendChild(child);
        }
        return child;
    }
    catch (e) {
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
};

/**
 * Inserts the specified element after the current element.
 * @param {HTMLElement} element The element to insert.
 * @returns {HTMLElement} The current element.
 * @prototypeof Element
 * @method
 */
Element.prototype.after = function (element) {
    if (this.nextElementSibling && this.parentElement) {
        this.parentElement.insertBefore(element, this.nextElementSibling);
    } else if (this.parentElement) {
        this.parentElement.appendChild(element);
    }
    return this;
};

/**
 * Inserts the specified element before the current element.
 * @param {HTMLElement} element The element to insert.
 * @returns {HTMLElement} The current element.
 * @prototypeof Element
 * @method
 */
Element.prototype.before = function (element) {
    this.parentElement.insertBefore(element, this);
    return this;
};

/**
 * Wraps the current element with the specified wrapper element.
 * @param {HTMLElement} element The wrapper element.
 * @returns {HTMLElement} The current element.
 * @prototypeof Element
 * @method
 */
Element.prototype.wrapWith = function (element) {
    this.remove();
    element.append(this);
    return this;
};

/**
 * Hides the current element by setting its display property to 'none'.
 * Stores the previous display value in the 'shown' dataset attribute.
 * @returns {HTMLElement} The current element.
 * @prototypeof Element
 * @method
 */
Element.prototype.hideElement = function () {
    this.dataset.shown = this.css('display');
    this.css('display', 'none');
    return this;
};

/**
 * Shows the current element by setting its display property to its previous value stored in the 'shown' dataset attribute.
 * If the 'shown' attribute is not set or is 'none', sets the display property to 'block'.
 * @param {HTMLElement} [element] The element to show.
 * @returns {HTMLElement} The current element.
 * @prototypeof Element
 * @method
 */
Element.prototype.showElement = function (element) {
    if (this.dataset.shown && this.dataset.shown !== 'none') {
        this.css('display', this.dataset.shown);
    } else {
        this.css('display', 'block');
    }
    return this;
};

/**
 * Returns the next sibling element.
 * @returns {HTMLElement|null} The next sibling element, or null if there is none.
 * @prototypeof Element
 * @method
 */
Element.prototype.next = function () {
    return this.nextElementSibling;
};

/**
 * Returns the previous sibling element.
 * @returns {HTMLElement|null} The previous sibling element, or null if there is none.
 * @prototypeof Element
 * @method
 */
Element.prototype.prev = function () {
    return this.previousElementSibling;
};

/**
 * Returns the parent element.
 * @returns {HTMLElement|null} The parent element, or null if there is none.
 * @prototypeof Element
 * @method
 */
Element.prototype.parent = function () {
    return this.parentElement;
};


if (!Element.prototype.closest) {
    /**
     * Finds the closest ancestor of the current element (or the element itself) that matches the specified selector.
     * @param {string} selector A CSS selector string to match the ancestor element against.
     * @returns {HTMLElement|null} The closest ancestor element that matches the selector, or null if none is found.
     * @prototypeof Element
     * @method
     */
    Element.prototype.closest = function (selector) {
        let elem = this;

        while (elem !== document.body) {
            elem = elem.parentElement;
            if (elem.matches(selector)) return elem;
        }

        return null;
    };
}


/**
 * Returns closest component object
 * @returns Colibri.UI.Component|null
 * @prototypeof Element
 * @method
 */
Element.prototype.closestComponent = function () {
    // return this.closest('[data-object-name]')?.getUIComponent() ?? null;
    return this.closest('[data-object-name]')?.getUIComponent() ?? null;
}

/**
 * Retrieves the computed style value of the specified CSS property for the element.
 * @param {string} name The name of the CSS property.
 * @returns {string} The computed style value of the specified CSS property.
 * @prototypeof Element
 * @method
 */
Element.prototype.computedCss = function (name) {
    return getComputedStyle(this)[name];
}

/**
 * Sets or retrieves styles for the element.
 * @param {(string|Object)} [name] The name of the style or an object containing all styles.
 * @param {string} [value] The value of the style.
 * @returns {Element|string|Object} The element itself, computed style value, or styles object.
 * @prototypeof Element
 * @method
 */
Element.prototype.css = function (name, value) {

    let styleObject = this.attr('style');
    styleObject = styleObject ? styleObject.toObject([';', ':'], null, (v) => v && v.toCamelCase()) : {};
    if (name === undefined) {
        return getComputedStyle(this);
    } else if (name === null) {
        this.attr('style', null);
    } else if (name instanceof Object) {
        name = Object.assign(styleObject, name);
        this.attr('style', Object.toStyles(name, [';', ':']));
        return this;
    } else {
        if (value === undefined) {
            return styleObject && styleObject[name] !== undefined ? styleObject[name] : getComputedStyle(this)[name];
        } else {
            if (value === null) {
                delete styleObject[name.toCamelCase()];
            } else {
                styleObject[name.toCamelCase()] = value;
            }
            this.attr('style', Object.toStyles(styleObject, [';', ':']));
            return this;
        }
    }

};

/**
 * Returns the position and dimensions of the element.
 * @param {boolean} [includeBorders=false] Whether to include borders in the calculation.
 * @param {boolean} [includeMargin=false] Whether to include margins in the calculation.
 * @param {Element} [parent=null] The parent element for calculating offset.
 * @returns {Object} An object containing the position and dimensions of the element.
 * @prototypeof Element
 * @method
 */
Element.prototype.bounds = function (includeBorders = false, includeMargin = false, parent = null) {

    const rect = this.getBoundingClientRect();
    const win = this.ownerDocument.defaultView;

    const offsetX = parent ? parent.scrollLeft : win.scrollX;
    const offsetY = parent ? parent.scrollTop : win.scrollY;

    let position = {
        top: rect.top + offsetY,
        left: rect.left + offsetX
    };

    const style = getComputedStyle(this);

    position.width = this.offsetWidth;
    position.height = this.offsetHeight;

    position.outerWidth = position.width;
    position.outerHeight = position.height;

    if (style.boxSizing == 'content-box') {
        position.outerWidth += (parseInt(style.paddingLeft ?? 0)) + (parseInt(style.paddingRight ?? 0));
        position.outerHeight += (parseInt(style.paddingTop ?? 0)) + (parseInt(style.paddingBottom ?? 0));
    }

    position.outerWidth += (includeBorders ? ((parseInt(style.borderRightWidth ?? 0)) + (parseInt(style.borderLeftWidth ?? 0))) : 0)
    position.outerWidth += (includeMargin ? ((parseInt(style.marginRight ?? 0)) + (parseInt(style.marginLeft ?? 0))) : 0);
    position.outerHeight += (includeBorders ? ((parseInt(style.borderTopWidth ?? 0)) + (parseInt(style.borderBottomWidth ?? 0))) : 0)
    position.outerHeight += (includeMargin ? ((parseInt(style.marginTop ?? 0)) + (parseInt(style.marginBottom ?? 0))) : 0);

    position.center = { left: position.left + position.outerWidth / 2, top: position.top + position.outerHeight / 2 };
    position.relativeCenter = { left: position.center.left - position.left, top: position.center.top - position.top };

    return position;

};

/**
 * Returns the offset of the element.
 * @returns {Object} An object containing the offset of the element.
 * @prototypeof Element
 * @method
 */
Element.prototype.offset = function () { return this.bounds(); };
/**
 * Returns the position of the element.
 * @returns {Object} An object containing the position of the element.
 * @prototypeof Element
 * @method
 */
Element.prototype.position = function () {
    const bounds = this.bounds();
    return { left: bounds.left, top: bounds.top };
};

// Element.prototype.index = function() {
//     return Array.prototype.indexOf.call(this.parentElement.childNodes, this);
// };

/**
 * Sets or retrieves the HTML content of the element.
 * @param {string} [value] The HTML content to set.
 * @returns {Element|string} The element itself or the HTML content.
 * @prototypeof Element
 * @method
 */
Element.prototype.html = function (value) {
    if (value === undefined) {
        return this.innerHTML;
    } else {
        this.innerHTML = value;
        return this;
    }
};

/**
 * Retrieves the ouer HTML content of the element.
 * @returns {Element|string} The element itself or the HTML content.
 * @prototypeof Element
 * @method
 */
Element.prototype.outerHtml = function () {
    return this.outerHTML;
};

/**
 * Sets or retrieves the text content of the element.
 * @param {string} [value] The text content to set.
 * @returns {Element|string} The element itself or the text content.
 * @prototypeof Element
 * @method
 */
Element.prototype.text = function (value) {
    if (value === undefined) {
        return this.innerText;
    } else {
        this.innerText = value;
        return this;
    }
};


if (!Element.prototype.matches) {
    /**
     * Polyfill for the Element.matches method, providing compatibility with various vendor-prefixed implementations.
     * Matches the element against a specified CSS selector.
     * @function matches
     * @memberof Element.prototype
     * @param {string} selector The CSS selector to match against.
     * @returns {boolean} true if the element matches the selector, otherwise false.
     * @prototypeof Element
     * @method
     */
    Element.prototype.matches = function() {
        return (Element.prototype.matchesSelector || 
                Element.prototype.msMatchesSelector || 
                Element.prototype.webkitMatchesSelector || 
                Element.prototype.mozMatchesSelector || 
                Element.prototype.oMatchesSelector).call(this, arguments[0]);
    };
};

/**
 * Checks if the element matches the specified selector.
 * @param {string} selector The CSS selector to match against.
 * @returns {boolean} true if the element matches the selector, otherwise false.
 * @prototypeof Element
 * @method
 */
Element.prototype.is = function (selector) {
    return this.matches(selector);
};
/**
 * Clones the element, including attributes and data attributes, and creates a new element.
 * @function clone
 * @memberof Element.prototype
 * @param {string} [ns] The namespace URI of the cloned element.
 * @returns {HTMLElement} The cloned element.
 * @prototypeof Element
 * @method
 */
Element.prototype.clone = function (ns) {

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

    if (!ns) {
        ns = attr['xmlns'] ?? null;
        delete attr['xmlns'];
    }

    return Element.create(this.tagName, attr, data, ns);

};

/**
 * Hides the element, executes a callback function after a specified timeout, and then shows the element again.
 * @function hideShowProcess
 * @memberof Element.prototype
 * @param {Function} callback The callback function to execute after hiding the element.
 * @param {number} [timeout=30] The timeout duration in milliseconds before showing the element again.
 * @prototypeof Element
 * @method
 */
Element.prototype.hideShowProcess = function (callback, timeout = 30) {
    this.css('visibility', 'hidden');
    document.body.css('overflow', 'hidden');
    Colibri.Common.Delay(timeout).then(() => {
        if (!this || !this.isConnected) {
            document.body.css('overflow', null);
            return;
        }
        callback();
        this.css('visibility', null);
        document.body.css('overflow', null);
    });
};

/**
 * Emits a custom event from the element.
 * @function emitCustomEvent
 * @memberof Element.prototype
 * @param {string} eventName The name of the custom event.
 * @param {*} [args] Additional arguments to include in the event.
 * @prototypeof Element
 * @method
 */
Element.prototype.emitCustomEvent = function (eventName, args) {
    var event = new CustomEvent(eventName, { detail: args });
    this.dispatchEvent(event);
};

/**
 * Emits a mouse event from the element.
 * @function emitMouseEvent
 * @memberof Element.prototype
 * @param {string} eventType The type of mouse event to emit (e.g., 'click', 'mousedown', 'mouseup').
 * @prototypeof Element
 * @method
 */
Element.prototype.emitMouseEvent = function (eventType) {
    const event = document.createEvent('MouseEvents');
    event.initMouseEvent(eventType, true, true, window, 0, 0, 345, 7, 220, false, false, true, false, 0, null);
    this.dispatchEvent(event);
};

/**
 * Emits an HTML event from the element.
 * @function emitHtmlEvents
 * @memberof Element.prototype
 * @param {string} eventType The type of HTML event to emit (e.g., 'change', 'submit', 'focus').
 * @prototypeof Element
 * @method
 */
Element.prototype.emitHtmlEvents = function (eventType) {
    if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(eventType, false, true);
        this.dispatchEvent(evt);
    } else {
        this.fireEvent("on" + eventType);
    }
};

/**
 * Emits a custom event from the window object.
 * @memberof Window.prototype
 * @param {string} eventType The type of event to emit.
 * @prototypeof Window
 * @method
 */
Window.prototype.emitEvent = function (eventType) {
    window.dispatchEvent(new Event(eventType));
};

/**
 * Checks if the value or content of the element exceeds its width.
 * @function isValueExceeded
 * @memberof Element.prototype
 * @returns {boolean} true if the value or content exceeds the element's width, otherwise false.
 * @prototypeof Element
 * @method
 */
Element.prototype.isValueExceeded = function () {
    const width = this.bounds().outerWidth;
    if (width === undefined) {
        return false;
    }
    var s = Element.create('span');
    s.css({
        position: 'absolute',
        left: -9999,
        top: -9999,
        // ensure that the span has same font properties as the element
        'font-family': this.css('font-family'),
        'font-size': this.css('font-size'),
        'font-weight': this.css('font-weight'),
        'font-style': this.css('font-style'),
        'padding': this.css('padding')
    });
    s.html(this.value || this.html());
    document.body.append(s);
    var result = s.bounds().outerWidth > width;
    s.remove();
    return result;
};

Element.prototype.getRealWidth = function () {
    const width = this.bounds().outerWidth;
    if (width === undefined) {
        return false;
    }
    var s = Element.create('span');
    s.css({
        position: 'absolute',
        left: -9999,
        top: -9999,
        // ensure that the span has same font properties as the element
        'font-family': this.css('font-family'),
        'font-size': this.css('font-size'),
        'font-weight': this.css('font-weight'),
        'font-style': this.css('font-style'),
        'padding': this.css('padding')
    });
    s.html(this.value || this.html());
    document.body.append(s);
    const w = s.bounds().outerWidth;
    if (w === 177) {
        debugger;
    }
    s.remove();
    return w;
};

/**
 * Selects the content of the HTMLDivElement.
 * @memberof HTMLDivElement.prototype
 * @prototypeof HTMLDivElement
 * @method
 */
HTMLDivElement.prototype.select = function () {
    var sel, range;
    if (window.getSelection && document.createRange) {
        range = document.createRange();
        range.selectNodeContents(this);
        sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(this);
        range.select();
    }
}

/**
 * Inserts text at the current cursor position within the element.
 * @param {string} text The text to insert.
 * @prototypeof Element
 * @method
 */
Element.prototype.insertText = function (text) {
    if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
    } else {
        var sel, range;
        if (window.getSelection && document.createRange) {
            sel = window.getSelection();
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        } else if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.text = text;
        }
    }
}

/**
 * Inserts an element at the current cursor position within the element.
 * @param {HTMLElement} element The element to insert.
 * @prototypeof Element
 * @method
 */
Element.prototype.insertElement = function (element) {
    this.preventFocusEvent = true;

    if ((App.Device.isWeb || App.Device.isElectron) && document.queryCommandSupported('insertHTML')) {
        document.execCommand('insertHTML', false, element?.outerHtml ? element?.outerHtml() : element.textContent);
    } else {


        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        const el = element.cloneNode(true);

        range.deleteContents();
        range.insertNode(el);

        const newRange = document.createRange();
        newRange.setStartAfter(el);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

    }
    this.blur();
}

/**
 * Clears all tokens from the DOMTokenList.
 * @prototypeof DOMTokenList
 * @method
 */
DOMTokenList.prototype.clear = function () {
    for (let i = 0; i < this.length; i++) {
        this.remove(this.item(i));
    }
};

/**
 * Converts base64 data to a File object.
 * @param {string} data The base64 data.
 * @param {string} filename The filename.
 * @param {string} mime The MIME type.
 * @param {boolean} isBase Indicates if the data is base64 encoded.
 * @returns {File} The created File object.
 * @global
 */
function Base2File(data, filename, mime, isBase) {
    var bstr = isBase ? atob(data) : data,
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};
/**
 * Downloads a file using provided data.
 * @param {string} data The file data.
 * @param {string} filename The filename.
 * @param {string} mime The MIME type.
 * @param {boolean} [isBase=true] Indicates if the data is base64 encoded.
 * @global
 * @example
 * ```
 * DownloadFile('SGVsbG8sIFdvcmxkIQ==', 'hello.txt', 'text/plain');
 * ```
 */
function DownloadFile(data, filename, mime, isBase = true) {
    var a = Element.create('a', { href: window.URL.createObjectURL(Base2File(data, filename, mime, isBase), { type: mime }), download: filename });
    document.body.append(a);
    a.click();
    document.body.removeChild(a);
};
/**
 * Print a file using provided data.
 * @param {string} data The file data.
 * @param {string} filename The filename.
 * @param {string} mime The MIME type.
 * @param {boolean} [isBase=true] Indicates if the data is base64 encoded.
 * @global
 * @example
 * ```
 * PrintFile('SGVsbG8sIFdvcmxkIQ==', 'hello.txt', 'text/plain');
 * ```
 */
function PrintFile(data, filename, mime, isBase = true) {
    window.open(window.URL.createObjectURL(Base2File(data, filename, mime, isBase), { type: mime })).print();
    // var a = Element.create('a', { href: window.URL.createObjectURL(Base2File(data, filename, mime, isBase), { type: mime }), download: filename });
    // document.body.append(a);
    // a.click();
    // document.body.removeChild(a);
};
/**
 * Downloads a file from a URL.
 * @param {string} url The URL of the file.
 * @param {string} [filename=null] The filename.
 * @param {string} [target='_self'] The target window.
 * @global
 * @example
 * ```
 * DownloadUrl('https://example.com/file.txt', 'file.txt');
 * ```
 */
function DownloadUrl(url, filename = null, target = '_self') {
    if (!filename) {
        const pi = url.pathinfo();
        filename = pi.basename;
    }
    var a = Element.create('a', { href: url, download: filename, target: target });
    document.body.append(a);
    a.click();
    document.body.removeChild(a);
};
/**
 * Downloads a file by its path.
 * @param {string} path The path of the file.
 * @param {string} filename The filename.
 * @global
 * @example
 * ```
 * DownloadFileByPath('/path/to/file.txt', 'file.txt');
 * ```
 */
function DownloadFileByPath(path, filename) {
    if (!DownloadOnDevice(path, filename)) {
        const pi = path.pathinfo();
        var a = Element.create('a', { href: path, download: filename ?? pi.filename });
        document.body.append(a);
        a.click();
        document.body.removeChild(a);
    }
};
/**
 * Downloads a Blob object as a file.
 * @param {Blob} blob The Blob object to download.
 * @param {string} filename The filename.
 * @global
 * @example
 * ```
 * DownloadBlob(new Blob(['Hello, World!'], { type: 'text/plain' }), 'hello.txt');
 * ```
 */
function DownloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
}
/**
 * Downloads a file to the device's storage.
 * @param {string} path The path of the file.
 * @param {string} filename The filename.
 * @returns {boolean} Indicates if the download was successful.
 * @global
 * @example
 * ```
 * DownloadOnDevice('/path/to/file.txt', 'file.txt');
 * ```
 */
function DownloadOnDevice(path, filename) {

    try {
        if (!window.hasOwnProperty("cordova")) {
            return false;
        }

        let storage = '';
        if (cordova.platformId === 'android') {
            storage = cordova.file.externalRootDirectory;
        }
        else if (cordova.platformId === 'electron') {
            return false;
        }

        const fileTransfer = new FileTransfer();
        fileTransfer.download(path, storage + 'Download/' + filename, function (entry) {

            const mime = Colibri.Common.MimeType.ext2type(entry.name.pathinfo().ext);

            cordova.plugins.fileOpener2.open(
                cordova.file.externalRootDirectory + 'Download/' + filename,
                mime,
                {
                    error: function (e) {
                        console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                    },
                    success: function () {
                        console.log('file opened successfully');
                    }
                }
            );

        }, function (err) {
            console.log("Error");
            console.dir(err);
        });

        return true;

    }
    catch (e) {
        return false;
    }


};
/**
 * Downloads the file.
 * @global
 * @example
 * ```
 * const file = new File(['Hello, World!'], 'hello.txt', { type: 'text/plain' });
 * file.download();
 * ```
 */
File.prototype.download = function () {
    var a = Element.create('a', { href: window.URL.createObjectURL(this, { type: this.type }), download: this.name });
    document.body.append(a);
    a.click();
    document.body.removeChild(a);
};

/**
 * Emulate resized event, 1 time when resize is complete
 */
window.resizeEndTimeout = -1;
window.addEventListener('resize', (e) => {

    if (window.resizeEndTimeout != -1) {
        clearTimeout(window.resizeEndTimeout);
    }

    window.resizeEndTimeout = setTimeout(() => {
        window.dispatchEvent(new Event('resized'));
    }, 100);

});

/**
 * Checks if the object is a Promise.
 * @param {*} p The object to check.
 * @returns {boolean} Indicates if the object is a Promise.
 * @prototypeof Function
 * @static
 * @method
 */
Function.isPromise = function (p) {
    return (typeof p === 'object' && typeof p.then === 'function');
};

/**
 * Eases animation using the ease-in-out quadratic function.
 * @param {number} t The current time.
 * @param {number} b The beginning value.
 * @param {number} c The change in value.
 * @param {number} d The duration.
 * @returns {number} The eased value.
 * @prototypeof Math
 * @method
 * @static
 */
Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) {
        return c / 2 * t * t + b;
    }
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};

/**
 * Replaces URLs in the string using a callback function.
 * @param {Function} callback The callback function to process each URL.
 * @returns {Promise<string>} A promise that resolves with the modified string.
 * @prototypeof String
 * @method
 */
String.prototype.replaceUrls = function (callback) {
    return new Promise((resolve, reject) => {
        const regex = /https?:\/\/[^\s\"\\<\>']+/g;
        const urls = [...new Set(this.match(regex) || [])];
        let text = this + '';

        const promises = [];
        for (const url of urls) {
            promises.push(callback(url));
        }

        Promise.all(promises).then(responses => {
            for (const urlInfo of responses) {
                text = text.replace(urlInfo.url, urlInfo.converted);
            }
            resolve(text);
        });
    });
}

/**
 * Converts the string to an ArrayBuffer.
 * @returns {ArrayBuffer} The ArrayBuffer representation of the string.
 * @prototypeof String
 * @method
 */
String.prototype.toArrayBuffer = function () {
    const buf = new ArrayBuffer(this.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = this.length; i < strLen; i++) {
        bufView[i] = this.charCodeAt(i);
    }
    return buf;
}

/**
 * Converts the ArrayBuffer to a string.
 * @returns {string} The string representation of the ArrayBuffer.
 * @prototypeof ArrayBuffer
 * @method
 */
ArrayBuffer.prototype.toString = function () {
    return String.fromCharCode.apply(null, new Uint8Array(this));
}

/**
 * Converts a PEM-encoded SPKI public key to DER format.
 * @returns {ArrayBuffer} The DER representation of the SPKI public key.
 * @prototypeof String
 * @method
 */
String.prototype.spkiPem2spkiDer = function () {
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    var pemContents = this.substring(pemHeader.length, this.length - pemFooter.length);
    var binaryDerString = window.atob(pemContents);
    return binaryDerString.toArrayBuffer();
}

/**
 * Checks if the string can be evaluated as a function. 
 * @prototypeof String
 * @method
 */
String.prototype.isFunction = function () {
    let test = null;
    try {
        eval('test = ' + (this + '') + ';');
    } catch (e) {
        test = null;
    }
    return typeof test === 'function';
}

/**
 * Converts the string to a function if possible. 
 * @prototypeof String
 * @method
 */
String.prototype.convertToFunction = function () {
    let test = null;
    try {
        eval('test = ' + (this + '') + ';');
    } catch (e) {
        test = null;
    }
    return typeof test === 'function' ? test : null;
}

/**
 * Checks if the function is an async function.
 * @returns {boolean} Indicates if the function is an async function.
 * @prototypeof Function
 * @method
 */
Function.prototype.isAsync = function () {
    return this.constructor.name === 'AsyncFunction';
};

/**
 * Converts a filter object to a string representation.
 * @param {Object|Array} filter The filter object or array.
 * @returns {string} The string representation of the filter.
 * @global
 */
window.convertFilterToString = function (filter) {

    if (Array.isArray(filter) && filter.length > 0) {
        // or
        const orArray = [];
        for (const f of filter) {
            orArray.push(window.convertFilterToString(f));
        }
        return '((' + orArray.join(') || (') + '))';
    } else if (Object.isObject(filter) && Object.countKeys(filter) > 0) {

        let andConditions = [];
        Object.forEach(filter, (key, value) => {

            let condition = '==';
            if (Array.isArray(value)) {
                condition = value[0];
                value = value[1];
                if ((value + '').isDate()) {
                    andConditions.push('(new Date(row[\'' + key + '\']) ' + condition + ' new Date(\'' + value + '\'))');
                } else if (typeof value === 'boolean') {
                    andConditions.push('(row[\'' + key + '\'] ' + condition + ' ' + value + ')');
                } else if (Array.isArray(value)) {
                    andConditions.push('([\'' + value.join('\',\'') + '\'].indexOf(row[\'' + key + '\'] + \'\') !== -1)');
                } else {
                    andConditions.push('(row[\'' + key + '\'] ' + condition + ' \'' + value + '\')');
                }
            } else {
                if ((value + '').isDate()) {
                    andConditions.push('(new Date(row[\'' + key + '\']) ' + condition + ' new Date(\'' + value + '\'))');
                } else if (typeof value === 'boolean') {
                    andConditions.push('(row[\'' + key + '\'] ' + condition + ' ' + value + ')');
                } else if (Array.isArray(value)) {
                    andConditions.push('([\'' + value.join('\',\'') + '\'].indexOf(row[\'' + key + '\'] + \'\') !== -1)');
                } else {
                    andConditions.push('(row[\'' + key + '\'] ' + condition + ' \'' + value + '\')');
                }
            }


        });
        return '(' + andConditions.join(') && (') + ')';

    } else {
        return '';
    }

}

/**
 * Converts a filter object to a string representation suitable for SQL queries.
 * @param {Object|Array} filter The filter object or array.
 * @returns {string} The string representation of the filter for SQL.
 * @global
 */
window.convertFilterToStringForSql = function (filter) {

    if (Array.isArray(filter) && filter.length > 0) {
        // or
        const orArray = [];
        for (const f of filter) {
            orArray.push(window.convertFilterToStringForSql(f));
        }
        return '((' + orArray.join(') or (') + '))';

    } else if (Object.isObject(filter) && Object.countKeys(filter) > 0) {

        let andConditions = [];
        Object.forEach(filter, (key, value) => {

            let condition = '=';
            if (Array.isArray(value)) {
                condition = value[0];
                value = value[1];
                if ((value + '').isDate()) {
                    andConditions.push('("' + key + '" ' + condition + ' ' + value.toDate().toUnixTime() + ')');
                } else if (typeof value === 'boolean') {
                    andConditions.push('("' + key + '" ' + condition + ' ' + value + ')');
                } else if (Array.isArray(value)) {
                    andConditions.push('("' + key + '" ' + condition + ' (\'' + value.join('\',\'') + '\'))');
                } else {
                    andConditions.push('("' + key + '" ' + condition + ' \'' + value + '\')');
                }
            } else {
                if ((value + '').isDate()) {
                    andConditions.push('("' + key + '" ' + condition + ' ' + value.toDate().toUnixTime() + ')');
                } else if (typeof value === 'boolean') {
                    andConditions.push('("' + key + '" ' + condition + ' ' + value + ')');
                } else if (Array.isArray(value)) {
                    andConditions.push('("' + key + '" ' + condition + ' (\'' + value.join('\',\'') + '\'))');
                } else {
                    andConditions.push('("' + key + '" ' + condition + ' \'' + value + '\')');
                }
            }


        });
        return andConditions.length > 0 ? '(' + andConditions.join(') and (') + ')' : '';

    } else {
        return '';
    }

}

/**
 * Checks if the current device is a pure touch device (no mouse).
 * @returns {boolean} true if the device is a pure touch device, otherwise false.
 * @global
 */
window.isPureTouchDevice = function () {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Try to detect mouse presence via media query
    const hasMouse = matchMedia('(pointer: fine)').matches;

    return hasTouch && !hasMouse;
}

window.__originalAdd = EventTarget.prototype.addEventListener;
window.__originalRemove = EventTarget.prototype.removeEventListener;
window.__listenersMap = new WeakMap();
window.__delayMap = new WeakMap();
window.__elToInstance = new WeakMap();

/**
 * Overrides the addEventListener method to handle touch and mouse events based on device type.
 * @param {string} type The type of event to listen for.
 * @param {Function} listener The event listener function.
 * @param {Object|boolean} [options] Options for the event listener.    
 * @param {number|null} [delay=null] Optional delay for the event listener.
 * @returns {void}
 * @prototypeof EventTarget
 * @method
 */
EventTarget.prototype.addEventListener = function (type, listener, options, delay = null) {

    if (window.isPureTouchDevice() && ['mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'mousemove'].includes(type)) {
        // nothing to do
        return;
    } else if (!window.isPureTouchDevice() && ['touchstart', 'touchend', 'touchmove'].includes(type)) {
        // nothing to do
        return;
    }

    if (!__listenersMap.has(this)) {
        __listenersMap.set(this, []);
    }

    __listenersMap.get(this).push({ type, listener, options });
    if (delay) {
        window.__delayMap.set(this, delay);
    }

    return window.__originalAdd.call(this, type, listener, options);

};

/**
 * Overrides the removeEventListener method to handle touch and mouse events based on device type.
 * @param {string} type The type of event to remove.
 * @param {Function} listener The event listener function to remove.
 * @param {Object|boolean} [options] Options for the event listener.
 * @returns {void}
 * @prototypeof EventTarget
 * @method
 */
EventTarget.prototype.removeEventListener = function (type, listener, options) {
    if (__listenersMap.has(this)) {
        const arr = __listenersMap.get(this);
        for (let i = 0; i < arr.length; i++) {
            const l = arr[i];
            if (l.type === type && l.listener === listener) {
                arr.splice(i, 1);
                if (arr.length > 0) {
                    __listenersMap.set(this, arr);
                } else {
                    __listenersMap.delete(this);
                }
                break;
            }
        }
    }

    return window.__originalRemove.call(this, type, listener, options);
};

/**
 * Retrieves the event listeners for a given element.
 * @param {Element} el The element to retrieve event listeners for.
 * @returns {Array} An array of event listener objects for the specified element.
 * @prototypeof Window
 * @static
 * @method
 */
window.getEventListenersFor = function (el) {
    return __listenersMap.get(el) || [];
};

/**
 * Maps a UI component instance to the current element, window, or document.
 * @param {Object} instance The UI component instance to map.
 * @returns {void}
 * @prototypeof Document
 * @static
 * @method
 */
document.mapToUIComponent = Window.prototype.mapToUIComponent = Element.prototype.mapToUIComponent = function (instance) {
    if (__elToInstance.has(this)) {
        let exists = __elToInstance.get(this);
        if (!Array.isArray(exists)) {
            exists = [exists];
        }
        if (!exists.includes(instance)) {
            exists.push(instance);
        }
        __elToInstance.set(this, exists);
    } else {
        __elToInstance.set(this, instance);
    }
};

/**
 * Retrieves the UI component instance mapped to the current element, window, or document.
 * @returns {Object|Array|null} The UI component instance(s) mapped to the element, or null if none exist.
 * @prototypeof Document
 * @static
 * @method
 */
document.getUIComponent = Window.prototype.getUIComponent = Element.prototype.getUIComponent = function () {
    const exists = __elToInstance.get(this);
    if (!Array.isArray(exists)) {
        return exists;
    } else if (exists.length === 1) {
        return exists[0];
    }
    return exists;
};

/**
 * Deletes the current element, removing it from the DOM and cleaning up associated event listeners and data.
 * @returns {void}
 * @prototypeof Element
 * @method
 */
Element.prototype.delete = function () {

    __elToInstance.delete(this);

    try {
        this.remove();
    } catch (e) { }

    const events = getEventListenersFor(this);
    if (events) {
        for (const { type, listener, options } of events) {
            this.removeEventListener(type, listener, options);
        }
        __listenersMap.delete(this);
    }

    if (Object.isObject(this._tag)) {
        for (const key of Object.keys(this._tag)) {
            delete this._tag[key];
        }
        this._tag = null;
    }

};

if (!XMLHttpRequest.prototype.sendAsBinary) {
    /**
     * Sends data as binary data 
     * Defines the object for making requests.
     * If the XMLHttpRequest object doesn't have the sendAsBinary method, it adds it.
     * @param {string} sData data to send
     * @prototypeof XMLHttpRequest
     * @method
     * @public
     */
    XMLHttpRequest.prototype.sendAsBinary = function (sData) {
        var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
        for (var nIdx = 0; nIdx < nBytes; nIdx++) {
            ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
        }
        this.send(ui8Data);
    };
}

const oldStringifyMethod = JSON.stringify;
JSON.stringify = function (value, replacer, space, escapeUnicode = false) {
    let v = oldStringifyMethod(value, replacer, space);
    if (!escapeUnicode) {
        return v;
    }
    return (v + '').replace(/[\u007F-\uFFFF]/g, function (ch) {
        return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
    });
};

document.keysPressed = {
    ctrl: false,
    alt: false,
    shift: false
};

document.addEventListener('keydown', (e) => {
    document.keysPressed.ctrl = e.ctrlKey;
    document.keysPressed.alt = e.altKey;
    document.keysPressed.shift = e.shiftKey;
    App.Dispatch('KeyDown', { domEvent: e });
});
document.addEventListener('keyup', (e) => {
    document.keysPressed.ctrl = e.ctrlKey;
    document.keysPressed.alt = e.altKey;
    document.keysPressed.shift = e.shiftKey;
    App.Dispatch('KeyUp', { domEvent: e });
});
