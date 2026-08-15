/**
 * Floating point date class that represents a date with millisecond and nanosecond precision.
 * @class
 * @memberof Colibri.Common
 */
Colibri.Common.FDate = class {

    /**
     * Creates an instance of the FDate class.
     * This constructor initializes a new instance of the FDate class with the specified milliseconds and nanoseconds.
     * It provides high precision date representation by allowing nanosecond-level granularity in addition to milliseconds.
     * The class can be used for applications that require precise time measurements, such as logging, profiling, or scientific computations.
     * The FDate class also provides methods for converting to and from standard JavaScript Date objects, as well as string representations.
     * @constructor
     * @param {number|null|Colibri.Common.FDate} [ms=null] - The number of milliseconds since the Unix epoch, or an instance of FDate to clone.
     * @param {number} [ns=0] - The number of nanoseconds (0-999999) to add to the milliseconds.
     * If ms is null, the current date and time will be used.
     * If ms is an instance of FDate, it will clone the values from that instance.
     * If ms is a number, it will be treated as milliseconds since the Unix epoch, and ns will be added to it.
     * @throws {TypeError} - Throws an error if ms is not a number, null, or an instance of FDate.
     * @throws {RangeError} - Throws an error if ns is not in the range 0-999999.
     * @constructor
     * @public
     */
    constructor(ms = null, ns = 0) {

        if(ms === null) {
            this._setNow();
        } else if(ms instanceof Colibri.Common.FDate) {
            this._ms = ms._ms;
            this._ns = ms._ns;
        } else {
            this._ms = Number(ms);
            this._ns = Number(ns);
        }
    }

    /**
     * Sets the current date and time with millisecond and nanosecond precision.
     * @private
     * @returns {void}
     */
    _setNow() {
        const now = performance.timeOrigin + performance.now();
        this._ms = Math.floor(now);
        this._ns = Math.round((now - this._ms) * 1e6);
    }

    /**
     * Creates a new FDate instance representing the current date and time.
     * This static method provides a convenient way to create a new FDate instance initialized to the current date and time.
     * It uses the performance API to obtain high-resolution timestamps, ensuring accurate representation of the current moment.
     * The returned FDate instance can be used for various purposes, such as logging, profiling, or measuring elapsed time with nanosecond precision.
     * @static
     * @returns {Colibri.Common.FDate} A new instance of Colibri.Common.FDate representing the current date and time.
     * @example
     * ```
     * const currentDate = Colibri.Common.FDate.now();
     * console.log(currentDate.toString()); // Outputs the current date and time with millisecond and nanosecond precision
     * ```
     */
    static now() {
        return new Colibri.Common.FDate();
    }

    /**
     * Parses a string representation of a date with millisecond and nanosecond precision and returns a new FDate instance.
     * This static method allows parsing a string representation of a date with millisecond and nanosecond precision.
     * The expected format is "YYYY-MM-DDTHH:mm:ss.sssnnnnnn", where "sss" represents milliseconds and "nnnnnn" represents nanoseconds.
     * The method splits the string into its components, converts them to numbers, and creates a new FDate instance with the corresponding values.
     * It provides a convenient way to convert string representations of dates into FDate instances for further processing or calculations.
     * @static
     * @public
     * @param {string} s - The string representation of the date in the format "YYYY-MM-DDTHH:mm:ss.sssnnnnnn".
     * @returns {Colibri.Common.FDate} A new instance of Colibri.Common.FDate representing the parsed date and time.
     * @throws {Error} - Throws an error if the provided string is not in the expected format.
     * @example
     * ```
     * const parsedDate = Colibri.Common.FDate.parse("2024-06-05T12:34:56.789123456/123456");
     * console.log(parsedDate.toString()); // Outputs the parsed date and time with millisecond and nanosecond precision
     * ```
     */
    static parse(s) {
        const [date, ns] = s.split("/");

        const ms = Date.parse(date.slice(0, 23) + "Z");

        return new Colibri.Common.FDate(ms, Number(ns));
    }

    /**
     * Returns the primitive value of the FDate instance, which is the number of milliseconds since the Unix epoch.
     * This method allows the FDate instance to be used in contexts where a primitive value is expected, such as comparisons or arithmetic operations.
     * It returns the number of milliseconds since the Unix epoch, which can be used for calculations or comparisons with other date values.
     * The nanosecond component is not included in the returned value, as it is not part of the standard JavaScript Date representation.
     * @returns {number} The number of milliseconds since the Unix epoch.
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.valueOf()); // Outputs the number of milliseconds since the Unix epoch
     * ```
     */
    valueOf() {
        return this._ms;
    }

    /**
     * Returns a JavaScript Date object representing the same point in time as the FDate instance.  
     * This method provides a way to convert the FDate instance into a standard JavaScript Date object.
     * It creates a new Date object using the millisecond component of the FDate instance, allowing interoperability with existing JavaScript code that expects Date objects.
     * The nanosecond component is not included in the returned Date object, as it is not part of the standard JavaScript Date representation.
     * @returns {Date} A JavaScript Date object representing the same point in time as the FDate instance.
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.toDate()); // Outputs a JavaScript Date object representing the same point in time
     * ```
     */
    toDate() {
        return new Date(this._ms);
    }

    /**
     * Returns the number of milliseconds since the Unix epoch represented by the FDate instance.
     * This method provides access to the millisecond component of the FDate instance, allowing retrieval of the time value in milliseconds.
     * It can be used for calculations, comparisons, or conversions to other time representations.
     * The nanosecond component is not included in the returned value, as it is not part of the standard JavaScript Date representation.
     * @returns {number} The number of milliseconds since the Unix epoch.
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.getTime()); // Outputs the number of milliseconds since the Unix epoch
     * ```
     */
    getTime() {
        return this._ms;
    }

    /**
     * Sets the time of the FDate instance to the specified number of milliseconds since the Unix epoch, resetting the nanosecond component to zero.
     * This method allows updating the time of the FDate instance by specifying a new value in milliseconds.
     * It resets the nanosecond component to zero, ensuring that the FDate instance represents an exact millisecond value.
     * The method returns the updated number of milliseconds since the Unix epoch, which can be used for further calculations or comparisons.
     * @param {number} ms - The number of milliseconds since the Unix epoch to set as the time.
     * @returns {number} The updated number of milliseconds since the Unix epoch.
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now(); 
     * date.setTime(1620000000000); // Sets the time to a specific millisecond value
     * console.log(date.getTime()); // Outputs: 1620000000000
     * ```
     */
    setTime(ms) {
        this._ms = Number(ms);
        this._ns = 0;
        return this._ms;
    }

    /**
     * Returns the ISO 8601 string representation of the FDate instance, including milliseconds and nanoseconds.
     * This method provides a standardized string representation of the FDate instance, suitable for serialization or display.
     * The format includes the date and time components, as well as the millisecond and nanosecond precision, allowing for accurate representation of the point in time.
     * The returned string can be used for logging, data storage, or communication between systems that require precise time information.
     * @returns {string} The ISO 8601 string representation of the FDate instance in the format "YYYY-MM-DDTHH:mm:ss.sssnnnnnn".
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.toISOString()); // Outputs the ISO 8601 string representation of the current date and time
     * ```
     */
    toISOString() {
        return new Date(this._ms).toISOString();
    }

    /**
     * Returns the UTC string representation of the FDate instance, including milliseconds and nanoseconds.
     * This method provides a human-readable string representation of the FDate instance in Coordinated Universal Time (UTC).
     * It uses the standard JavaScript Date to generate the string, which includes the day of the week, date, month, year, time, and the "GMT" designation.
     * The returned string can be used for display purposes or for communication with systems that expect UTC-formatted date strings.
     * @returns {string} The UTC string representation of the FDate instance in the format "Day, DD Mon YYYY HH:mm:ss GMT".
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.toUTCString()); // Outputs the UTC string representation of the current date and time
     * ```
     */
    toUTCString() {
        return new Date(this._ms).toUTCString();
    }

    /**
     * Returns the string representation of the FDate instance, including milliseconds and nanoseconds.
     * This method provides a human-readable string representation of the FDate instance, suitable for display or logging.
     * The format includes the date and time components, as well as the millisecond and nanosecond precision, allowing for accurate representation of the point in time.
     * The returned string can be used for debugging, logging, or any context where a textual representation of the date and time is needed.
     * @returns {string} The string representation of the FDate instance in the format "YYYY-MM-DDTHH:mm:ss.sssnnnnnn".
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.toString()); // Outputs the string representation of the current date and time
     * ```
     */
    toString() {
        return this.__toString();
    }

    /**
     * Returns the string representation of the FDate instance, including milliseconds and nanoseconds.
     * This method provides a human-readable string representation of the FDate instance, suitable for display or logging.
     * The format includes the date and time components, as well as the millisecond and nanosecond precision, allowing for accurate representation of the point in time.
     * The returned string can be used for debugging, logging, or any context where a textual representation of the date and time is needed.
     * @returns {string} The string representation of the FDate instance in the format "YYYY-MM-DDTHH:mm:ss.sssnnnnnn".
     */
    __toString() {

        const d = new Date(this._ms);

        const yyyy = d.getUTCFullYear();
        const MM = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');

        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mm = String(d.getUTCMinutes()).padStart(2, '0');
        const ss = String(d.getUTCSeconds()).padStart(2, '0');

        const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
        const ns = String(this._ns).padStart(6, '0');

        return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.${ms}${ns}`;
    }

    /** 
     * Returns the full year of the FDate instance in UTC. 
     * @returns {number} The full year of the FDate instance in UTC.
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.getFullYear()); // Outputs the full year of the current date in UTC
     * ```
     */
    getFullYear() { return new Date(this._ms).getUTCFullYear(); }
    /** 
     * Returns the month of the FDate instance in UTC.
     * @returns {number} The month of the FDate instance in UTC.
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.getMonth()); // Outputs the month of the current date in UTC (0-11)
     * ```
     */
    getMonth() { return new Date(this._ms).getUTCMonth(); }
    /** 
     * Returns the day of the month of the FDate instance in UTC.
     * @returns {number} The day of the month of the FDate instance in UTC.
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.getDate()); // Outputs the day of the month of the current date in UTC (1-31)
     * ```
     */
    getDate() { return new Date(this._ms).getUTCDate(); }
    /** 
     * Returns the hours of the FDate instance in UTC.
     * @returns {number} The hours of the FDate instance in UTC.
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.getHours()); // Outputs the hours of the current date in UTC (0-23)
     * ```
     */
    getHours() { return new Date(this._ms).getUTCHours(); }
    /** 
     * Returns the minutes of the FDate instance in UTC.
     * @returns {number} The minutes of the FDate instance in UTC.
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.getMinutes()); // Outputs the minutes of the current date in UTC (0-59)
     * ```
     */
    getMinutes() { return new Date(this._ms).getUTCMinutes(); }
    /** 
     * Returns the seconds of the FDate instance in UTC.
     * @returns {number} The seconds of the FDate instance in UTC.
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.getSeconds()); // Outputs the seconds of the current date in UTC (0-59)
     * ```
     */
    getSeconds() { return new Date(this._ms).getUTCSeconds(); }
    /** 
     * Returns the milliseconds of the FDate instance in UTC.
     * @returns {number} The milliseconds of the FDate instance in UTC.
     * @public
     * @example
     * ```
     * const date = Colibri.Common.FDate.now();
     * console.log(date.getMilliseconds()); // Outputs the milliseconds of the current date in UTC (0-999)
     * ```
     */
    getMilliseconds() { return new Date(this._ms).getUTCMilliseconds(); }

    /**
     * Returns the nanoseconds of the FDate instance.
     * @type {number}
     */
    get nanoseconds() {
        return this._ns;
    }

    /**
     * Sets the nanoseconds of the FDate instance.
     * @type {number}
     */
    set nanoseconds(value) {
        this._ns = Number(value);
    }

    /**
     * Returns the milliseconds of the FDate instance.
     * @type {number}
     */
    get milliseconds() {
        return this._ms;
    }

    /** 
     * Sets the milliseconds of the FDate instance.
     * @type {number}
     */
    set milliseconds(value) {
        this._ms = Number(value);
    }

    /**
     * Creates a clone of the current FDate instance.
     * @returns {Colibri.Common.FDate}
     * @public
     * @example
     * ```
     * const originalDate = new Colibri.Common.FDate();
     * const clonedDate = originalDate.clone();
     * console.log(clonedDate); // Outputs: A clone of the original FDate instance
     * ```
     */
    clone() {
        return new Colibri.Common.FDate(this);
    }

    /**
     * Compares the current FDate instance with another FDate instance.
     * This method allows for comparison between two FDate instances, taking into account both milliseconds and nanoseconds.
     * It returns a negative value if the current instance represents an earlier point in time, a positive value if it represents a later point in time, and zero if both instances represent the same point in time.
     * This can be useful for sorting or ordering FDate instances based on their temporal values.
     * @param {Colibri.Common.FDate} other - The other FDate instance to compare with.
     * @returns {number} A negative number if the current instance is earlier than the other, a positive number if it is later, or zero if they are equal.
     * @example
     * ```
     * const date1 = new Colibri.Common.FDate(1620000000000, 500000);
     * const date2 = new Colibri.Common.FDate(1620000000000, 600000);
     * console.log(date1.compare(date2)); // Outputs: -100000 (date1 is earlier than date2)
     * ```
     */
    compare(other) {
        if(this._ms !== other._ms)
            return this._ms - other._ms;

        return this._ns - other._ns;
    }

    /**
     * Returns the total time represented by the FDate instance as a BigInt in nanoseconds.
     * This method provides a way to obtain the total time represented by the FDate instance in nanoseconds, using BigInt for high precision.
     * It combines the millisecond and nanosecond components into a single BigInt value, allowing for accurate representation of time intervals or durations.
     * The returned BigInt can be used for calculations, comparisons, or conversions to other time representations that require nanosecond precision.
     * @returns {BigInt} The total time in nanoseconds as a BigInt.
     * @public
     * @example
     * ```
     * const date = new Colibri.Common.FDate(1620000000000, 500000);
     * console.log(date.toBigIntNanoseconds()); // Outputs: 1620000000500000000n (total time in nanoseconds)
     * ```
     */
    toBigIntNanoseconds() {
        return BigInt(this._ms) * 1000000n + BigInt(this._ns);
    }

    /**
     * Creates a new FDate instance from a BigInt representing nanoseconds.
     * This static method allows for the creation of a new FDate instance from a BigInt value representing nanoseconds.
     * It converts the BigInt into milliseconds and nanoseconds, initializing a new FDate instance with the corresponding values.
     * This can be useful for applications that require high-precision time representation or for converting between different time formats.
     * @param {BigInt} ns - The total time in nanoseconds as a BigInt.
     * @returns {Colibri.Common.FDate} A new instance of Colibri.Common.FDate representing the specified time in nanoseconds.
     * @static
     * @public
     * @example
     * ```
     * const ns = 1620000000500000000n; // Total time in nanoseconds
     * const date = Colibri.Common.FDate.fromBigIntNanoseconds(ns);
     * console.log(date.toString()); // Outputs: The corresponding date and time for the given nanoseconds
     * ```
     */
    static fromBigIntNanoseconds(ns) {
        const ms = Number(ns / 1000000n);
        const nano = Number(ns % 1_000_000n);
        return new Colibri.Common.FDate(ms, nano);
    }

    /**
     * Adds the specified number of nanoseconds to the current FDate instance and returns a new FDate instance with the updated time.
     * This method allows for precise time manipulation by adding a specified number of nanoseconds to the current FDate instance.
     * It calculates the total time in nanoseconds, adds the specified value, and creates a new FDate instance with the resulting time.
     * The original FDate instance remains unchanged, and a new instance is returned to represent the updated time.
     * This can be useful for applications that require high-precision time calculations or for adjusting timestamps with nanosecond-level granularity.
     * @param {number} ns - The number of nanoseconds to add to the current FDate instance.
     * @returns {Colibri.Common.FDate} A new instance of Colibri.Common.FDate representing the updated time after adding the specified nanoseconds.
     * @public
     * @example
     * ```
     * const date = new Colibri.Common.FDate(1620000000000, 500000);
     * const updatedDate = date.addNanoseconds(100000);
     * console.log(updatedDate.toString()); // Outputs: The updated date and time after adding 100000 nanoseconds
     * ```
     */
    addNanoseconds(ns) {
        const totalNs = this.toBigIntNanoseconds() + BigInt(ns);
        return Colibri.Common.FDate.fromBigIntNanoseconds(totalNs);
    }

}