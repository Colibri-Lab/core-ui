String.SpecialChars = '[!\"#\$%&\'\(\)\*\+,-\.\/:;<=>\?@\[\\\\^\\]_`{\|}~]';
RegExp.SpecialChars = /(?![a-zA-Z0-9!"#\$%&'\(\)\*\+,-\.\/:;<=>\?@\[\\^\]_`{\|}~])./;

/**
 * Prevents the default behavior of an event and stops its propagation.
 * @param {Event} e - The event object.
 * @returns {boolean} Returns false to indicate that the default action should be prevented.
 */
const nullhandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
};

/**
 * Parses a JSON string into a JavaScript object.
 * If the input string is null or undefined, it defaults to an empty object ({}).
 * @param {string} v - The JSON string to parse.
 * @returns {Object} Returns the parsed JavaScript object.
 */
const json_object = function (v) {
    return JSON.parse(v || '{}');
};

/**
 * Parses a JSON string into a JavaScript array.
 * If the input string is null or undefined, it defaults to an empty array ([]).
 * @param {string} v - The JSON string to parse.
 * @returns {Array} Returns the parsed JavaScript array.
 */
const json_array = function (v) {
    return JSON.parse(v || '[]');
};

/**
 * Evaluates a default value string.
 * If the default value is a string and contains 'json_object' or 'json_array',
 * it evaluates the string as JavaScript code.
 * Otherwise, it returns the default value as is.
 * @param {string} defaultAsString - The default value string to evaluate.
 * @returns {any} Returns the evaluated default value.
 */
const eval_default_values = function (defaultAsString) {
    if (typeof defaultAsString == 'string' && (defaultAsString.indexOf('json_object') !== -1 || defaultAsString.indexOf('json_array') !== -1)) {
        return eval(defaultAsString);
    }
    return defaultAsString;
};

/**
 * Checks whether a value is iterable.
 * @param {any} value - The value to check.
 * @returns {boolean} Returns true if the value is iterable, false otherwise.
 */
const isIterable = (value) => {
    return Symbol.iterator in Object(value);
};

/**
 * Extends the prototype of Intl.NumberFormat to provide a method for unformatting a formatted number string.
 * @param {string} stringNumber - The formatted number string to unformat.
 * @returns {number} Returns the unformatted number.
 */
Intl.NumberFormat.prototype.unformat = function (stringNumber) {
    const thousandSeparator = this.format(11111).replace(/\p{Number}/gu, '');
    const decimalSeparator = this.format(1.1).replace(/\p{Number}/gu, '');

    return parseFloat(stringNumber
        .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
        .replace(new RegExp('\\' + decimalSeparator), '.')
    );
}

Array.coalesce = (v) => Array.isArray(v) ? v : [v];

/**
 * Returns a new array containing only unique elements from the original array.
 * @param {Array} a - The original array.
 * @returns {Array} Returns a new array with unique elements.
 */
Array.unique = function (a) { return a.filter((v, i, ab) => { return a.indexOf(v) === i; }); }

/**
 * Merges another array into the current array.
 * @param {Array} a - The current array.
 * @param {Array} ar - The array to merge into the current array.
 * @returns {Array} Returns the merged array.
 */
Array.merge = function (a, ar) {
    ar.forEach((o) => a.push(o));
    return this;
};

/**
 * Returns a new array containing elements that meet a specified condition.
 * @param {Array} a - The array to filter.
 * @param {(Function|string)} e - The condition function or string to evaluate elements against.
 * @returns {Array} Returns a new array containing filtered elements.
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
 * @param {Array} a - The array to search.
 * @param {string} k - The key to search for.
 * @param {any} v - The value to search for.
 * @returns {any|null} Returns the found element or null if not found.
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
 * @param {Array} a - The array to search.
 * @param {Function} predicate - The function used to test each element of the array.
 * @returns {number} Returns the index of the found element or -1 if not found.
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
 * @param {number} start - The start index.
 * @param {number} end - The end index.
 * @param {Function} callback - The callback function to invoke for each index.
 * @returns {Array} Returns the generated array.
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
 * @param {number} start - The start index.
 * @param {number} end - The end index.
 * @param {Function} callback - The callback function to invoke for each index.
 * @returns {Array} Returns the generated array.
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
 * @param {Array} a - The array to convert.
 * @returns {Object} Returns the converted object.
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
 * @param {Array} arr - The array to search.
 * @param {(string|Function)} field - The field name or function used to extract field values.
 * @param {any} value - The value to search for.
 * @returns {Object|null} Returns the found object or null if not found.
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
 * @param {Array} arr - The array to modify.
 * @param {string} field - The field name to search for.
 * @param {any} value - The value to search for.
 * @param {Object|null} replace - The object to replace with (or null to remove).
 * @param {boolean} insertIfNotExists - Whether to insert the replace object if not found.
 * @returns {Array} Returns the modified array.
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
 * @returns {number} Returns the average value.
 */
Array.prototype.avg = function () {
    return this.reduce((a, b) => a + b, 0) / this.length;
}

/**
 * Returns a new array containing the first 'l' elements of the original array.
 * @param {number} l - The number of elements to include in the new array.
 * @returns {Array} Returns a new array containing the first 'l' elements.
 */
Array.prototype.part = function (l) {
    let ret = [];
    for (let i = 0; i < l; i++) {
        ret.push(this[i]);
    }
    return ret;
}

Array.prototype.toObjectFromKeys = function () {
    const ret = {};
    for (const k of this) {
        ret[k] = null;
    }
    return ret;
}

Array.prototype.indexOfCondition = function(value, condition = '==') {
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
 */
Array.prototype.last = function (n) {
    return this.splice(this.length - n, this.length);
}

/**
 * Compares the current array with another array to check for equality.
 * @param {Array} array - The array to compare with.
 * @returns {boolean} Returns true if the arrays are equal, false otherwise.
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
 */
Array.prototype.intersect = function (arr) {
    return this.filter(value => arr.includes(value));
};
/**
 * Returns an array containing elements that are not present in second arrays.
 * @param {Array} arr - The array to intersect with.
 * @returns {Array} Returns the intersected array.
 */
Array.prototype.diference = function (arr) {
    return this.filter(value => !arr.includes(value)).concat(arr.filter(value => !this.includes(value)));
};

/**
 * Converts the array elements into an object with each element as a key, and the value set to true.
 * @returns {Object} Returns the object with array elements as keys.
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
 * @param {(string|Function)} field - Optional field to specify which values to average.
 * @returns {number} Returns the average value.
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
 * @param {(string|Function)} field - Optional field to specify which values to average.
 * @returns {number} Returns the average value.
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
 */
Array.toObjectWithKeys = function (array, fieldKey, fieldValue) {
    let ret = {};
    array.forEach((item) => {
        ret[item[fieldKey]] = item[fieldValue];
    });
    return ret;
};

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
 */
Array.sum = function (ar) {
    return ar.reduce((partialSum, a) => partialSum + a, 0);
}

/**
 * Organizes objects by specifying keys array.
 * @param {Array} objects - The array of objects to organize.
 * @param {Array} keysArray - The array of keys to organize the objects.
 * @returns {Array} Returns the organized array of objects.
 */
Array.organizeObjectKeys = function (objects, keysArray) {
    let ret = [];
    for (const obj of objects) {
        ret.push(Object.organizeKeys(obj, keysArray));
    }
    return ret;
}

/**
 * Creates a new object containing specified keys and their corresponding values from the original object.
 * @param {Object} obj - The original object.
 * @param {Array} keysArray - An array of keys to include in the new object.
 * @returns {Object} Returns a new object with the specified keys.
 */
Object.organizeKeys = function (obj, keysArray) {
    let ret = {};
    for (const key of keysArray) {
        ret[key] = obj[key];
    }
    return ret;
}

/**
 * Creates an array of keys from an object where the corresponding values are truthy.
 * @param {Object} object - The object to extract keys from.
 * @returns {Array} Returns an array of keys with truthy values.
 */
Object.fromObjectAsTrue = function (object) {
    let ret = [];
    Object.forEach(object, (name, value) => {
        if (value) {
            ret.push(name);
        }
    });
    return ret;
}

/**
 * Checks if a value is an object (excluding arrays).
 * @param {*} o - The value to check.
 * @returns {boolean} Returns true if the value is an object (excluding arrays), false otherwise.
 */
Object.isObject = function (o) {
    return o instanceof Object && !Array.isArray(o);
}

Object.isEmpty = function (o) {
    return Object.values(o).filter(v => v !== '' && v !== null).length === 0;
};

/**
 * Converts an object to an extended object (not implemented).
 * @param {Object} object - The object to convert.
 * @returns {Object} Returns the extended object.
 */
Object.convertToExtended = function (object) {
    return object;
}

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
        if (object[key] instanceof Object && !Array.isArray(object[key])) {
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
 */
Object.defineProperty(Array.prototype, "equals", { enumerable: false });

/**
 * Iterates over the properties of an object in reverse order, invoking a callback function for each property.
 * @param {Object} o - The object to iterate over.
 * @param {Function} callback - The callback function to invoke for each property.
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
 */
Object.indexOf = function (o, name) {
    const keys = Object.keys(o);
    return keys.indexOf(name);
};

/**
 * Counts the number of keys in an object.
 * @param {Object} o - The object to count keys from.
 * @returns {number} Returns the number of keys in the object.
 */
Object.countKeys = function (o) { return o && o instanceof Object && !Array.isArray(o) ? Object.keys(o).length : 0; };

/**
 * Converts an object to a query string format.
 * @param {Object} o - The object to convert.
 * @param {Array} splittersArray - An array containing the separator strings.
 * @returns {string} Returns the query string.
 */
Object.toQueryString = function (o, splittersArray) {
    let ret = [];
    Object.keys(o).forEach((key) => {
        ret.push(key + splittersArray[1] + encodeURI(o[key]));
    });
    return ret.join(splittersArray[0]);
};

/**
 * Converts an object to a CSS styles string.
 * @param {Object} o - The object to convert.
 * @returns {string} Returns the CSS styles string.
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
 */
Object.lastKey = function (o) {
    const keys = Object.keys(o);
    return keys[keys.length - 1];
}

/**
 * Find last value of object
 * @param {Object} o object to find last value
 * @returns {*}
 */
Object.lastValue = function (o) {
    return o[Object.lastKey(o)];
}

/**
 * Enum internal objects and sum specific property within
 * @param {Object} o object fo enumerate
 * @param {string} field field within value of object properties
 * @returns {Number}
 */
Object.sumInternal = function (o, field) {
    let s = 0;
    Object.forEach(o, (key, value) => {
        s += parseFloat(value[field]);
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
 * @returns {Object} Returns the plain object with flattened keys.
 */
Object.toPlain = function (object, prefix) {
    let ret = {};
    Object.forEach(object, (k, v) => {
        if (v instanceof Object) {
            ret = Object.assign(ret, Object.toPlain(v, k + '-'));
        }
        else {
            ret[((prefix || '') + k).toCamelCase('-', false)] = v;
        }
    });
    return ret;
};

/**
 * Creates a deep clone of an object, optionally excluding specified keys.
 * @param {Object|string} object - The object to clone, or a JSON string representation of the object.
 * @param {Function|null} [callback=null] - Optional callback function to apply to the cloned object.
 * @param {Array} [excludeKeys=[]] - Optional array of keys to exclude from the cloned object.
 * @returns {Object} Returns the cloned object.
 */
Object.cloneRecursive = function (object, callback = null, excludeKeys = []) {
    if (typeof object == 'string') {
        object = JSON.parse(object);
    }

    if (Array.isArray(object)) {
        let ret = [];
        for (const o of object) {
            if (o instanceof Object && !(o instanceof Date) && !(o instanceof File)) {
                ret.push(Object.cloneRecursive(o, callback, excludeKeys));
            } else {
                ret.push(o);
            }
        }
        return ret;
    }

    let ret = {};
    Object.forEach(object, (prop, value) => {
        if (excludeKeys.indexOf(prop) !== -1) {
            return true;
        }

        if (value instanceof Function) {
            ret[prop] = value;
        }
        else if (Array.isArray(value)) {
            ret[prop] = value.map((v) => {
                return v instanceof Object && !(v instanceof Date) && !(v instanceof File) ? Object.cloneRecursive(v) : v;
            });
        }
        else if (value instanceof Object && !(value instanceof Date) && !(value instanceof File)) {
            ret[prop] = Object.cloneRecursive(value, callback, excludeKeys);
        }
        else {
            ret[prop] = value;
        }
    });
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
 */
Object.shallowEqual = function (object1, object2) {
    if (!object1 || !object2) {
        return object1 == object2;
    }
    if (typeof object1 !== 'object' || typeof object2 !== 'object') {
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
            if (!object1[key].equals(object2[key])) {
                return false;
            }
        }
        else if (object1[key] instanceof Object) {
            if (!Object.shallowEqual(object1[key], object2[key])) {
                return false;
            }
        }
        else if (object1[key] !== object2[key]) {
            return false;
        }
    }
    return true;
};

/**
 * Sets the value of a property in an object using dot notation.
 * @param {Object} obj - The object to set the value in.
 * @param {string|Array} path - The path to the property, either as a dot-separated string or as an array of keys.
 * @param {*} value - The value to set.
 * @returns {boolean} Returns true if the value was successfully set, false otherwise.
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
 */
Object.map = function (obj, func) {
    let newObject = {};
    Object.forEach(obj, (key, value) => {
        const newval = func(key, value);
        if (newval) {
            newObject[key] = newval;
        }
    });
    return newObject;
};

/**
 * Filters over the properties of an object, applying a function to each key-value pair.
 * @param {Object} obj - The object to map over.
 * @param {Function} func - The mapping function to apply to each key-value pair.
 * @returns {Object} Returns a new object with the mapped key-value pairs.
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

Object.pluck = function (obj, keys) {
    const nobj = {};
    for (const key of keys) {
        nobj[key] = obj[key];
    }
    return nobj;
}

Object.isClass = function (fn) {
  return typeof fn === 'function' &&
         /^class\s/.test(Function.prototype.toString.call(fn));
}

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
 * 
 * @param {object} textAsObject object to render
 * @param {boolean} showLineBrakes show line breaks
 * @param {string} itemsTag item tag
 * @param {boolean} isPrintVersion is printable version
 * @returns 
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
 * Returns an array of all captured groups in a string that match the regular expression.
 * @param {string} str - The string to search for matches.
 * @returns {Array} Returns an array containing all captured groups.
 */
RegExp.prototype.all = function (str) {
    let ret = [];
    const matches = str.match(this);
    if (matches) {
        for (let index = 1; index < matches.length; index++) {
            ret.push(matches[index]);
        }
    }
    return ret;
}

/**
 * Escapes special characters in a string to create a valid regular expression pattern.
 * @param {string} string - The string to escape.
 * @returns {string} Returns the escaped string.
 */
RegExp.quote = function (string) {
    if (typeof string === 'string') {
        return string.replace(/[.,*+?^${}()|[\]\\]/g, "\\$&");
    }
    return string;
}

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
 */
String.prototype.unformatCurrent = function () {
    return (this + '') === '' ? '' : new Intl.NumberFormat(App.NumberFormat).unformat(this);
}
/**
 * Formats the string as a number using the current locale settings.
 * @returns {string} Returns the formatted string representation of the number if successful, otherwise an empty string.
 */
String.prototype.formatCurrent = function () {
    return (this + '') === '' || isNaN(this) ? '' : new Intl.NumberFormat(App.NumberFormat).format(this);
}
/**
 * Removes HTML tags and entities from the string.
 * @returns {string} Returns the string with HTML tags removed.
 */
String.prototype.stripHtml = function () { return this.replace(/<[^>]+>/gim, "").replace(/<\/[^>]+>/gim, "").replace(/&nbsp;/gim, ""); }
/**
 * Removes leading whitespace or specified characters from the string.
 * @param {string} [c] - Optional characters to trim from the beginning of the string.
 * @returns {string} Returns the string with leading whitespace or specified characters removed.
 */
String.prototype.ltrim = function (c) { return this.replace(new RegExp('^' + (c != undefined ? c : '\\s') + '+'), ""); }
/**
 * Removes trailing whitespace or specified characters from the string.
 * @param {string} [c] - Optional characters to trim from the end of the string.
 * @returns {string} Returns the string with trailing whitespace or specified characters removed.
 */
String.prototype.rtrim = function (c) { return this.replace(new RegExp((c != undefined ? c : '\\s') + '+$'), ""); }
/**
 * Removes leading and trailing whitespace or specified characters from the string.
 * @param {string} [c] - Optional characters to trim from the beginning and end of the string.
 * @returns {string} Returns the string with leading and trailing whitespace or specified characters removed.
 */
String.prototype.trimString = function (c) {
    return this.replace(new RegExp('^' + (c != undefined ? RegExp.quote(c) : '\\s') + '*(.*?)' + (c != undefined ? RegExp.quote(c) : '\\s') + '*$'), '$1');
}
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
 */
String.prototype.trim = function (c) { return this.trimString(c); }
/**
 * Attempts to convert the string to an integer.
 * @returns {number} Returns the integer value if successful, otherwise NaN.
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
 */
String.prototype.toInt = function () {
    return this / 1;
};
/**
 * Attempts to convert the string to a floating-point number.
 * @returns {number} Returns the floating-point value if successful, otherwise NaN.
 */
String.prototype.toFloat = function () {
    return this / 1.0;
};
/**
 * Checks if the string represents a finite number.
 * @returns {boolean} Returns true if the string represents a finite number, otherwise false.
 */
String.prototype.isFinite = function () { return isFinite(this); }
/**
 * Checks if the string represents a numeric value.
 * @returns {boolean} Returns true if the string represents a numeric value, otherwise false.
 */
String.prototype.isNumeric = function () { return this ? this.isFinite(this * 1.0) : false; }

/**
 * Checks if the string represents a valid email address.
 * @returns {boolean} Returns true if the string represents a valid email address, otherwise false.
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
 * Repeats the string a specified number of times.
 * @param {number} n - The number of times to repeat the string.
 * @returns {string} Returns the repeated string.
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
 */
String.prototype.toDate = function () {

    if (this.isNumeric()) {
        return parseInt(this).toDateFromUnixTime();
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
    return new Date((dateParts[0] + '').toInt(), (dateParts[1] + '').toInt() - 1, (dateParts[2] + '').toInt(), (timeParts[0] + '').toInt(), (timeParts[1] + '').toInt(), (timeParts[2] + '').toInt());
};
/**
 * Converts the string from DDMMYYYY format to a Date object.
 * @returns {Date} Returns the Date object representing the date parsed from the string in DDMMYYYY format.
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
 */
String.prototype.toShortDate = function () {
    var parts = this.split(/\/|\.|\-/);
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parts[0]);

};
/**
 * Truncates the string to a specified number of words followed by an ellipsis.
 * @param {number} l - The maximum number of words to include.
 * @returns {string} Returns the truncated string with an ellipsis.
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
 * Replaces all occurrences of a substring with another substring in the string.
 * @param {string} from - The substring to replace.
 * @param {string} to - The substring to replace with.
 * @returns {string} Returns the string with all occurrences of 'from' replaced by 'to'.
 */
String.prototype.replaceAll = function (from, to) {
    let s = this;
    let s1 = s.replace(from, to);
    while (s != s1) {
        s = s1;
        s1 = s.replace(from, to);
    }
    return s1;
};
/**
 * Replaces placeholders in the string with values from an object using template syntax.
 * @param {Object} values - The object containing values to substitute into the template.
 * @returns {string} Returns the string with placeholders replaced by corresponding values from the object.
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
 */
String.prototype.fromMoney = function () {
    return parseInt(val.replace(/\s*/g, ''));
};
/**
 * Converts the string representing a time in HH:MM:SS format to seconds.
 * @returns {number} Returns the time in seconds parsed from the string.
 */
String.prototype.fromTimeString = function () {
    let parts = this.split(':');
    return parseInt(parseInt(parts[2]) + parseInt(parts[1]) * 60 + parseInt(parts[0]) * 60 * 60);
};
/**
 * Capitalizes the first character of the string.
 * @returns {string} Returns the string with the first character capitalized.
 */
String.prototype.capitalize = function () {
    return this.substring(0, 1).toUpperCase() + this.substring(1);
};
/**
 * Transliterates the string, converting characters from one script to another.
 * This method aims to convert characters from one writing system to another.
 * Specific rules for transliteration should be implemented separately.
 * @returns {string} The transliterated string.
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
 */
String.prototype.CyrToUrl = function (words) {
    if (words == undefined) words = 3;

    let val = this.Transliterate()
        .trimString()
        .replaceArray([" ", "|", ".", ",", "(", ")", "[", "]", "!", "@", ":", ";", "*", "#", "$", "%", "^"], "-")
        .replaceArray(["'", "?", '"', '…', '&quot;', "\\", "/", '«', '»', /[0-9]/i], "")
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
 */
String.prototype.reverse = function () { return this.split("").reverse().join(""); }
/**
 * Converts a hexadecimal string to its equivalent ASCII string.
 * @returns {string} The ASCII string.
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
 */
String.prototype.replaceLastPart = function (splitter, newPart) {
    let parts = this.split(splitter);
    parts.splice(-1);
    return parts.join(splitter) + splitter + newPart;
}
/**
 * Converts an object to a string representation using specified delimiters.
 * @param {object} object - The object to convert.
 * @param {string[]} delimiters - Array containing two delimiters for key-value pairs and items separation.
 * @param {Function} [callback] - Function to process each value in the object.
 * @returns {string} The string representation of the object.
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
 */
String.prototype.toObject = function (delimiters, callback, keyCallback) {

    let ret = {};
    if (!(this + '')) {
        return ret;
    }

    let parts = this.split(delimiters[0]).filter(v => v != '').map(v => v.trimString());
    if (parts.length == 0) {
        return ret;
    }

    parts.forEach((part) => {
        part = part.split(delimiters[1]);
        part[0] = part[0].trimString();
        part[1] = part[1].trimString();
        ret[keyCallback ? keyCallback(part[0]) : part[0]] = callback ? callback(part[1]) : part[1];
    });

    return ret;
};
/**
 * Replaces month names in the string with the specified months.
 * @param {string[]} months - Array containing month names.
 * @returns {string} The string with replaced month names.
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
 */
String.prototype.fromCamelCase = function (splitter) {
    splitter = splitter || '-';
    if (this.trimString().indexOf('--') === 0) { return this; }

    return this.replaceAll(new RegExp('([A-Z])'), (v) => { return splitter + v.toLowerCase(); }).rtrim('-').ltrim('-');

};
String.prototype.countCharIn = function (c) {
    return (this.match(new RegExp(c, "g")) || []).length;
};
/**
 * Retrieves the first character of each word in the string.
 * @returns {string} The concatenated first characters of words.
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
 */
String.prototype.isInt = function () {
    return Number.isInteger(Number(this));
};
/**
 * Checks if the string represents a floating-point number.
 * @returns {boolean} true if the string represents a float, otherwise false.
 */
String.prototype.isFloat = function () {
    return this.isNumeric() && !Number.isInteger(this);
};
/**
 * Checks if the string represents a valid date.
 * @returns {boolean} true if the string represents a valid date, otherwise false.
 */
String.prototype.isDate = function () {
    return (new Date(this) !== "Invalid Date") && !isNaN(new Date(this));
};

/**
 * Converts a string containing a full name to abbreviated form (e.g., John D.).
 * @returns {string} The abbreviated full name.
 */
String.prototype.makeFio = function () {
    const parts = this.split(' ');
    return (parts[0].capitalize() + ' ' + (parts.length > 1 ? (parts[1].substring(0, 1) + '. ' + (parts.length > 2 ? parts[2].substring(0, 1) + '.' : '')) : '')).trimString();
};
/**
 * Extracts the file extension from the string.
 * @returns {string} The extracted file extension.
 */
String.prototype.extractExt = function () {
    const parts = this.split('.');
    return parts[parts.length - 1].toLowerCase();
};
/**
 * Extracts information about the file path.
 * @returns {object} An object containing information about the file path (basename, extension, filename, dirname).
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
    return s;
};

/**
 * Sets the base URL for relative URLs in the string.
 * @param {string} baseUrl - The base URL to prepend to relative URLs.
 * @returns {string} The modified string with the base URL set.
 */
String.prototype.setBaseUrl = function (baseUrl) {
    return this.replaceAll('src="/', 'src="' + baseUrl + '/');
};
/**
 * Copies the string to the clipboard.
 * @returns {Promise} A promise that resolves when the string is successfully copied to the clipboard.
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
 */
String.GUID = function () {
    return (Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4() + Number.Rnd4());
};
/**
 * Generates a random password of the specified length.
 * @param {number} l - The length of the password to generate.
 * @returns {string} The generated password.
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
 */
String.EscapeRegExp = function (string) {
    return string ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : string;
};


/**
 * Pluralizes a string based on the count.
 * @param {string} template - The template string containing plural forms separated by '|'. Use '{n}' as a placeholder for the count.
 * @param {number} count - The count used to determine which plural form to use.
 * @returns {string} The pluralized string.
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
 * Formats the number according to the current locale.
 * @returns {string} The formatted number string.
 */
Number.prototype.formatCurrent = function () { return isNaN(this) ? '' : new Intl.NumberFormat(App.NumberFormat).format(this); }
/**
 * Converts the Unix timestamp to a JavaScript Date object.
 * @returns {Date} The Date object corresponding to the Unix timestamp.
 */
Number.prototype.toDateFromUnixTime = function () { let d = new Date(); d.setTime(this * 1000); return d; };
/**
 * Formats the number as a sequence with different labels depending on its last digit.
 * @param {string[]} labels - Array of labels for different sequences.
 * @param {boolean} [viewnumber=true] - Whether to include the number in the output.
 * @returns {string} The formatted sequence.
 */
Number.prototype.formatSequence = function (labels, viewnumber) {
    let s = this + " ";
    if (!viewnumber) { s = ""; }

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
};
/**
 * Returns the number of decimal places.
 * @returns {number} The number of decimal places.
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
 * Formats the number as a money string.
 * @param {number} [digits=2] - The number of digits after the decimal point.
 * @param {boolean} [force=true] - Whether to force displaying the decimal part.
 * @param {string} [space=' '] - The character used to separate thousands.
 * @param {boolean} [useNulls=true] - Whether to remove '.00' from the result.
 * @returns {string} The formatted money string.
 */
Number.prototype.toMoney = function (digits, force = true, space = ' ', useNulls = true) {
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
        result = (!(i == (count - 1) && len % 3 == 0) ? space : '') + price.substring(len - (i + 1) * 3, len - (i + 1) * 3 + 3) + result;
    }

    result = price.substring(0, len - count * 3) + result;
    let ret = (result + (dec ? ',' + dec : (force ? ',' + '0'.repeat(digits) : ''))).trimString('.').trimString(',');
    if (!useNulls) {
        ret = ret.replaceAll('.00', '');
        ret = ret.replaceAll(',00', '');
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
 * Converts the number to a time string.
 * @param {string} [daySplitter] - The character used to separate days from hours.
 * @param {boolean} [trim00=true] - Whether to trim leading '00' and ':' characters.
 * @returns {string} The formatted time string.
 */
Number.prototype.toTimeString = function (daySplitter, trim00 = true) {
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

    return txt;
};
/**
 * Converts the number to a size string.
 * @param {string[]} postfixes - Array of postfixes for different size units.
 * @param {number} range - The range used to determine the size unit.
 * @param {boolean} [remove0s=false] - Whether to remove '.00' from the result.
 * @param {boolean} [approximate=false] - Whether to round the number to the nearest integer.
 * @param {boolean} [shownumber=true] - Whether to include the number in the output.
 * @returns {string} The formatted size string.
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
        number = Math.round(number);
    }
    return (shownumber ? (isMinus ? '-' : '') + number + ' ' : '') + postfixes[j];
};
/**
 * Calculates the percentage of the current number relative to a maximum value.
 * @param {number} max - The maximum value.
 * @returns {number} The percentage.
 */
Number.prototype.percentOf = function (max) { return (this * 100) / max; };
/**
 * Checks if the number is an integer.
 * @returns {boolean} True if the number is an integer, false otherwise.
 */
Number.prototype.isInt = function () { return Number.isInteger(this); };
/**
 * Checks if the number is a float.
 * @returns {boolean} True if the number is a float, false otherwise.
 */
Number.prototype.isFloat = function () { return Number.isFloat(this); };
/**
 * Checks if the number is numeric.
 * @returns {boolean} Always returns true.
 */
Number.prototype.isNumeric = function () { return true; };
/**
 * Generates a random number between the specified range.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The random number.
 */
Number.random = function (min, max) { return Math.floor(min + Math.random() * (max + 1)); };
/**
 * Generates a random hexadecimal string of length 4.
 * @returns {string} The random hexadecimal string.
 */
Number.Rnd4 = function () { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); };
/**
 * Generates a unique number based on the current timestamp, performance data, and randomness.
 * @returns {number} The unique number.
 */
Number.unique = function () { return (window.performance.getEntries()[0].duration + window.performance.now() + Math.random()) * 1e13; };

/**
 * Formats the date as a string in the 'YYYY-MM-DD HH:mm:ss' format.
 * @returns {string} The formatted date string.
 */
Date.prototype.toDbDate = function () { if (this.toString() === 'Invalid Date') { return null; } return this.getFullYear() + '-' + ((this.getMonth() + 1) + '').expand('0', 2) + '-' + (this.getDate() + '').expand('0', 2) + ' ' + (this.getHours() + '').expand('0', 2) + ':' + (this.getMinutes() + '').expand('0', 2) + ':' + (this.getSeconds() + '').expand('0', 2); };
/**
 * Converts the date to Unix timestamp (seconds since January 1, 1970).
 * @returns {number} The Unix timestamp.
 */
Date.prototype.toUnixTime = function () { return this.getTime() / 1000; };
/**
 * Formats the date as a short date string in the 'YYYY-MM-DD' format.
 * @returns {string} The formatted short date string.
 */
Date.prototype.toShortDateString = function () { return this.getFullYear() + '-' + ((this.getMonth() + 1) + '').expand('0', 2) + '-' + (this.getDate() + '').expand('0', 2); };
Date.prototype.toDatePeriodString = function () { return this.getFullYear() + '-' + ((this.getMonth() + 1) + '').expand('0', 2); };
/**
 * Formats the time part of the date as a string in the 'HH:mm:ss' format.
 * @param {boolean} [hasSeconds=true] - Whether to include seconds in the output.
 * @returns {string} The formatted time string.
 */
Date.prototype.toTimeString = function (hasSeconds = true) { if (this == 'Invalid Date') { return '00:00:00'; }; return (this.getHours() + '').expand('0', 2) + ':' + (this.getMinutes() + '').expand('0', 2) + (hasSeconds ? ':' + (this.getSeconds() + '').expand('0', 2) : ''); };
/**
 * Checks if the given year is a leap year.
 * @param {number} year - The year to check.
 * @returns {boolean} True if the year is a leap year, false otherwise.
 */
Date.isLeapYear = function (year) { return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); };
/**
 * Returns the number of days in the given month and year.
 * @param {number} year - The year.
 * @param {number} month - The month (0-based index).
 * @returns {number} The number of days in the month.
 */
Date.daysInMonth = function (year, month) { return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]; };

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
 */
Date.prototype.daysInMonth = function () { return Date.daysInMonth(this.getFullYear(), this.getMonth()); };
/**
 * Represents the timezone offset of the current date in hours.
 */
Date.prototype.timezoneoffset = (new Date()).getTimezoneOffset() / 60;
/**
 * Converts the current date to the local time based on the timezone offset.
 * @returns {Date} The date converted to local time.
 */
Date.prototype.toLocalTime = function () { this.setTime(this.getTime() - this.timezoneoffset * 60 * 60 * 1000); return this; };
/**
 * Adds the specified number of minutes to the current date.
 * @param {number} min - The number of minutes to add.
 * @returns {Date} The updated date.
 */
Date.prototype.addMinute = function (min) { this.setTime(this.getTime() + min * 60 * 1000); return this; };
/**
 * Adds the specified number of seconds to the current date.
 * @param {number} sec - The number of seconds to add.
 * @returns {Date} The updated date.
 */
Date.prototype.addSeconds = function (sec) { this.setTime(this.getTime() + sec * 1000); return this; };
/**
 * Adds the specified number of hours to the current date.
 * @param {number} hours - The number of hours to add.
 * @returns {Date} The updated date.
 */
Date.prototype.addHours = function (hours) { this.setTime(this.getTime() + hours * 60 * 60 * 1000); return this; };
/**
 * Adds the specified number of days to the current date.
 * @param {number} days - The number of days to add.
 * @returns {Date} The updated date.
 */
Date.prototype.addDays = function (days) { this.setTime(this.getTime() + days * 24 * 60 * 60 * 1000); return this; };
/**
 * Adds the specified number of years to the current date.
 * @param {number} years - The number of years to add.
 * @returns {Date} The updated date.
 */
Date.prototype.addYears = function (years) { this.setFullYear(this.getFullYear() + years); return this; };
/**
 * Adds the specified number of months to the current date.
 * @param {number} months - The number of months to add.
 * @param {boolean} [setDay=true] - Whether to adjust the day to be within the new month's range.
 * @returns {Date} The updated date.
 */
Date.prototype.addMonths = function (months, setDay = true) { let n = this.getDate(); this.setMonth(this.getMonth() + months); if (setDay) { this.setDate(Math.min(n, this.daysInMonth())); } return this; };
/**
 * Checks if the current date is a working day (not a weekend or holiday).
 * @param {string[]} holidays - An array of holiday dates in 'YYYY-MM-DD' format.
 * @returns {boolean} True if it's a working day, false otherwise.
 */
Date.prototype.isWorkingDay = function (holidays) { return !([0, 6].indexOf(this.getDay()) !== -1 || holidays.indexOf(this.toShortDateString()) !== -1); };
/**
 * Checks if the current date is a holiday.
 * @param {string[]} holidays - An array of holiday dates in 'YYYY-MM-DD' format.
 * @returns {boolean} True if it's a holiday, false otherwise.
 */
Date.prototype.isHoliday = function (holidays) { return !(holidays.indexOf(this.toShortDateString()) !== -1); };
/**
 * Adds the specified number of working days to the current date, considering holidays.
 * @param {number} days - The number of working days to add. Positive values for future dates, negative values for past dates.
 * @param {string[]} holidays - An array of holiday dates in 'YYYY-MM-DD' format.
 * @param {boolean} [holidaysOnly=false] - If true, only holidays will be considered as working days.
 * @returns {Date} The updated date.
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
 */
Date.prototype.Copy = function () { let d = new Date(); d.setTime(this.getTime()); return d; };
/**
 * Calculates the difference in seconds between the current date and the specified date.
 * @param {Date} dt - The date to compare with.
 * @returns {number} The difference in seconds.
 */
Date.prototype.Diff = function (dt) { return parseInt((dt.getTime() - this.getTime()) / 1000); };

/**
 * Calculates the difference in months between the current date and the specified date.
 * @param {Date} dateTo - The date to compare with.
 * @returns {number} The difference in months.
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
 */
Date.prototype.DiffInDays = function (dateTo) {
    return Math.ceil(this.Diff(dateTo) / 86400);
};
/**
 * Calculates holidays count within two dates
 * @param {Date} dateTo date to
 * @param {Array} holidays holidays with holidays mark
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
 */
Date.prototype.format = function (formatString) { return this.toString(formatString); };
/**
 * Formats the date according to the locale, optionally including time and excluding day.
 * @param {boolean} [withTime=false] - Whether to include time.
 * @param {boolean} [withoutDay=false] - Whether to exclude day.
 * @returns {string} The formatted date string.
 */
Date.prototype.intlFormat = function (withTime = false, withoutDay = false) {
    let dateformat = App.DateFormat || 'ru-RU';
    const params = { day: '2-digit', month: 'short', year: 'numeric' };
    if (withTime) {
        params.hour = '2-digit';
        params.minute = '2-digit';
    }
    if (withoutDay) {
        delete params.day;
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
 */
Date.prototype.toShortRUString = function (showYear, showDay) {
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return (showDay === undefined || showDay === true ? this.getDate() + ' ' : '') + months[this.getMonth()] + (showYear === undefined || showYear === true ? ' ' + this.getFullYear() : '');
};
/**
 * Creates a copy of the current date object.
 * @returns {Date} The copied date object.
 */
Date.prototype.copy = function () {
    let dt = new Date();
    dt.setTime(this.getTime());
    return dt;
};
/**
 * Sets the date to the start of the current year.
 * @returns {Date} The updated date object.
 */
Date.prototype.setAsStartOfYear = function () {
    this.setDate(1);
    this.setMonth(0);
    return this;
};
/**
 * Sets the date to the end of the current year.
 * @returns {Date} The updated date object.
 */
Date.prototype.setAsEndOfYear = function () {
    this.setMonth(11);
    this.setDate(31);
    return this;
};
/**
 * Gets the quarter of the year.
 * @returns {number} The quarter number.
 */
Date.prototype.getQuarter = function () {
    return Math.floor((this.getMonth() + 3) / 3);
};
/**
 * Converts the date to a quarter string.
 * @param {string} [quarterName='квартал'] - The name of the quarter.
 * @param {boolean} [numberOnly=false] - Whether to return only the quarter number.
 * @returns {string} The quarter string.
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
 */
Date.Now = function () { return new Date(); };
/**
 * Gets the current time in milliseconds.
 * @returns {number} The current time in milliseconds.
 */
Date.Ms = function () { return Date.Now().getTime(); };
/**
 * Gets a unique timestamp.
 * @returns {number} The unique timestamp.
 */
Date.Mc = function () { return (window.performance.getEntries()[0].duration + window.performance.now()) * 1e13; };
/**
 * Creates a date object from the specified timestamp.
 * @param {number} from - The timestamp.
 * @returns {Date} The date object.
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
 */
Element.prototype.animateScrollTop = function (to, duration) {
    let start = this.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;

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
            if(callback) {
                callback();
            }
        }
    }

    this.style.height = '0px';
    requestAnimationFrame(tick);

}

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
            if(callback) {
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
 */
Element.prototype.inInViewport = function (container) {

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
};

/**
 * Returns the index of the element within its parent's list of children.
 * @returns {number|null} The index of the element, or null if it has no parent.
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
 */
Element.prototype.appendTo = function (parent) {
    parent.appendChild(this);
    return this;
};

/**
 * Appends the specified child element(s) to the end of the current element's list of children.
 * @param {HTMLElement|NodeList} child The child element or list of child elements to append.
 * @returns {HTMLElement} The last appended child element.
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
 */
Element.prototype.before = function (element) {
    this.parentElement.insertBefore(element, this);
    return this;
};

/**
 * Wraps the current element with the specified wrapper element.
 * @param {HTMLElement} element The wrapper element.
 * @returns {HTMLElement} The current element.
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
 */
Element.prototype.hideElement = function () {
    this.dataset.shown = this.css('display');
    this.css('display', 'none');
    return this;
};

/**
 * Shows the current element by setting its display property to its previous value stored in the 'shown' dataset attribute.
 * If the 'shown' attribute is not set or is 'none', sets the display property to 'block'.
 * @returns {HTMLElement} The current element.
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
 */
Element.prototype.next = function () {
    return this.nextElementSibling;
};

/**
 * Returns the previous sibling element.
 * @returns {HTMLElement|null} The previous sibling element, or null if there is none.
 */
Element.prototype.prev = function () {
    return this.previousElementSibling;
};

/**
 * Returns the parent element.
 * @returns {HTMLElement|null} The parent element, or null if there is none.
 */
Element.prototype.parent = function () {
    return this.parentElement;
};


/**
 * Finds the closest ancestor of the current element (or the element itself) that matches the specified selector.
 * @param {string} selector A CSS selector string to match the ancestor element against.
 * @returns {HTMLElement|null} The closest ancestor element that matches the selector, or null if none is found.
 */
(!Element.prototype.closest && (Element.prototype.closest = function (selector) {
    let elem = this;

    while (elem !== document.body) {
        elem = elem.parentElement;
        if (elem.matches(selector)) return elem;
    }

    return null;
}));

/**
 * Returns closest component object
 * @returns Colibri.UI.Component|null
 */
Element.prototype.closestComponent = function () {
    // return this.closest('[data-object-name]')?.getUIComponent() ?? null;
    return this.closest('[data-object-name]')?.getUIComponent() ?? null;
}

/**
 * Retrieves the computed style value of the specified CSS property for the element.
 * @param {string} name The name of the CSS property.
 * @returns {string} The computed style value of the specified CSS property.
 */
Element.prototype.computedCss = function (name) {
    return getComputedStyle(this)[name];
}

/**
 * Sets or retrieves styles for the element.
 * @param {(string|Object)} [name] The name of the style or an object containing all styles.
 * @param {string} [value] The value of the style.
 * @returns {Element|string|Object} The element itself, computed style value, or styles object.
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
 */
Element.prototype.bounds = function (includeBorders = false, includeMargin = false, parent = null) {

    const rect = this.getBoundingClientRect();
    const win = this.ownerDocument.defaultView;

    const offsetX = parent ? parent.scrollLet : win.scrollX;
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

    return position;

};

/**
 * Returns the offset of the element.
 * @returns {Object} An object containing the offset of the element.
 */
Element.prototype.offset = function () { return this.bounds(); };
/**
 * Returns the position of the element.
 * @returns {Object} An object containing the position of the element.
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
 */
Element.prototype.outerHtml = function () {
    return this.outerHTML;
};

/**
 * Sets or retrieves the text content of the element.
 * @param {string} [value] The text content to set.
 * @returns {Element|string} The element itself or the text content.
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
     */
    Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.oMatchesSelector;
};

/**
 * Checks if the element matches the specified selector.
 * @param {string} selector The CSS selector to match against.
 * @returns {boolean} true if the element matches the selector, otherwise false.
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
 */
Element.prototype.hideShowProcess = function (callback, timeout = 30) {
    this.css('visibility', 'hidden');
    document.body.css('overflow', 'hidden');
    Colibri.Common.Delay(timeout).then(() => {
        if(!this || !this.isConnected) {
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
 * Checks if the value or content of the element exceeds its width.
 * @function isValueExceeded
 * @memberof Element.prototype
 * @returns {boolean} true if the value or content exceeds the element's width, otherwise false.
 */
Element.prototype.isValueExceeded = function () {
    const width = this.bounds().outerWidth;
    if (!width) {
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
        'font-style': this.css('font-style')
    });
    s.html(this.value || this.html());
    document.body.append(s);
    var result = s.bounds().outerWidth > width;
    s.remove();
    return result;
}

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

Element.prototype.insertElement = function (element) {
    this.preventFocusEvent = true;
    
    if ((App.Device.isWeb || App.Device.isWindows) && document.queryCommandSupported('insertHTML')) {
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
 * Downloads a file to the device's storage.
 * @param {string} path The path of the file.
 * @param {string} filename The filename.
 * @returns {boolean} Indicates if the download was successful.
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

// document.scrollEndTimeout = -1;
// document.addEventListener('scroll', (e) => {

//     if (document.scrollEndTimeout != -1) {
//         clearTimeout(document.scrollEndTimeout);
//     }

//     document.scrollEndTimeout = setTimeout(() => {
//         document.dispatchEvent(new Event('scrolled'));
//     }, 100);

// });

/**
 * Checks if the object is a Promise.
 * @param {*} p The object to check.
 * @returns {boolean} Indicates if the object is a Promise.
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
 */
Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) {
        return c / 2 * t * t + b;
    }
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};



//
// Helper
//

String.prototype.replaceUrls = function(callback) {
    return new Promise((resolve, reject) => {
        const regex = /https?:\/\/[^\s\"\\<\>']+/g;
        const urls = [...new Set(this.match(regex) || [])];
        let text = this + '';

        const promises = [];
        for(const url of urls) {
            promises.push(callback(url));
        }

        Promise.all(promises).then(responses => {
            for(const urlInfo of responses) {
                text = text.replace(urlInfo.url, urlInfo.converted);
            }
            resolve(text);
        });
    });
}

// https://stackoverflow.com/a/11058858
String.prototype.toArrayBuffer = function () {
    const buf = new ArrayBuffer(this.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = this.length; i < strLen; i++) {
        bufView[i] = this.charCodeAt(i);
    }
    return buf;
}

ArrayBuffer.prototype.toString = function () {
    return String.fromCharCode.apply(null, new Uint8Array(this));
}

String.prototype.spkiPem2spkiDer = function () {
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    var pemContents = this.substring(pemHeader.length, this.length - pemFooter.length);
    var binaryDerString = window.atob(pemContents);
    return binaryDerString.toArrayBuffer();
}

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

window.isPureTouchDevice = function() {
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

EventTarget.prototype.addEventListener = function (type, listener, options, delay = null) {
    
    if(window.isPureTouchDevice() && ['mouseenter','mouseleave','mouseover','mouseout','mousemove'].includes(type)) {
        // nothing to do
        return;
    } else if( !window.isPureTouchDevice() && ['touchstart','touchend','touchmove'].includes(type)) {
        // nothing to do
        return;
    }
    
    if (!__listenersMap.has(this)) {
        __listenersMap.set(this, []);
    }

    __listenersMap.get(this).push({ type, listener, options });
    if(delay) {
        window.__delayMap.set(this, delay);
    }

    return window.__originalAdd.call(this, type, listener, options);

};

EventTarget.prototype.removeEventListener = function (type, listener, options) {
    if (__listenersMap.has(this)) {
        const arr = __listenersMap.get(this);
        for (let i = 0; i < arr.length; i++) {
            const l = arr[i];
            if (l.type === type && l.listener === listener) {
                arr.splice(i, 1);
                if(arr.length > 0) {
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

// Вспомогательная функция: получить список событий
window.getEventListenersFor = function (el) {
    return __listenersMap.get(el) || [];
};

Window.prototype.mapToUIComponent = Element.prototype.mapToUIComponent = function (instance) {
    if(__elToInstance.has(this)) {
        let exists = __elToInstance.get(this);
        if(!Array.isArray(exists)) {
            exists = [exists];
        }
        if(!exists.includes(instance)) {
            exists.push(instance);
        }
        __elToInstance.set(this, exists);
    } else {
        __elToInstance.set(this, instance);
    }
};

Window.prototype.getUIComponent = Element.prototype.getUIComponent = function() {
    const exists = __elToInstance.get(this);
    if(!Array.isArray(exists)) {
        return exists;
    } else if(exists.length === 1) {
        return exists[0];
    }
    return exists;
};

Element.prototype.delete = function () {

   __elToInstance.delete(this);

    try {
        this.remove();
    } catch(e) { }

    const events = getEventListenersFor(this);
    if (events) {
        for (const { type, listener, options } of events) {
            this.removeEventListener(type, listener, options);
        }
        __listenersMap.delete(this);
    }

    if(Object.isObject(this._tag)) {
        for(const key of Object.keys(this._tag)) {
            delete this._tag[key];
        }
        this._tag = null;
    }

};

const oldStringifyMethod = JSON.stringify;
JSON.stringify = function(value, replacer, space, escapeUnicode = false) {
    let v = oldStringifyMethod(value, replacer, space);
    if(!escapeUnicode) {
        return v;
    }
    return (v + '').replace(/[\u007F-\uFFFF]/g, function(ch) {
        return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
    });
};

document.keysPressed = {
    ctrl: false,
    alg: false,
    shift: false
};

document.addEventListener('keydown', (e) => {
    document.keysPressed.ctrl = e.ctrlKey;
    document.keysPressed.alt = e.altKey;
    document.keysPressed.shift = e.shiftKey;
});
document.addEventListener('keyup', (e) => {
    document.keysPressed.ctrl = e.ctrlKey;
    document.keysPressed.alt = e.altKey;
    document.keysPressed.shift = e.shiftKey;
});
