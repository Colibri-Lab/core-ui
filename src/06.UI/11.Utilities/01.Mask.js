/**
 * @class
 * @extends Destructable
 * @memberof Colibri.UI.Utilities
 */
Colibri.UI.Utilities.Mask = class extends Destructable {

    static DIGIT = "9";
    static ALPHA = "A";
    static ALPHANUM = "S";
    static BY_PASS_KEYS = [9, 16, 17, 18, 36, 37, 38, 39, 40, 91, 92, 93];


    constructor(elements) {
        super();
        this.elements = elements;
    }

    _isAllowedKeyCode(keyCode) {
        for (var i = 0, len = Colibri.UI.Utilities.Mask.BY_PASS_KEYS.length; i < len; i++) {
            if (keyCode == Colibri.UI.Utilities.Mask.BY_PASS_KEYS[i]) {
                return false;
            }
        }
        return true;
    }

    _mergeMoneyOptions(opts) {
        opts = opts || {};
        opts = {
            delimiter: opts.delimiter || ".",
            lastOutput: opts.lastOutput,
            precision: opts.hasOwnProperty("precision") ? opts.precision : 2,
            separator: opts.separator || ",",
            showSignal: opts.showSignal,
            suffixUnit: opts.suffixUnit && (" " + opts.suffixUnit.replace(/[\s]/g, '')) || "",
            unit: opts.unit && (opts.unit.replace(/[\s]/g, '') + " ") || "",
            zeroCents: opts.zeroCents
        };
        opts.moneyPrecision = opts.zeroCents ? 0 : opts.precision;
        return opts;
    }

    _unbindElementToMask() {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            this.elements[i].lastOutput = "";
            this.elements[i].onkeyup = false;
            this.elements[i].onkeydown = false;

            if (this.elements[i].value.length) {
                this.elements[i].value = this.elements[i].value.replace(/\D/g, '');
            }
        }
    }

    _bindElementToMask(maskFunction) {
        const onType = (e) => {
            e = e || window.event;
            var source = e.target || e.srcElement;

            if (this._isAllowedKeyCode(e.keyCode)) {
                setTimeout(() => {
                    this.opts.lastOutput = source.lastOutput;
                    source.value = Colibri.UI.Utilities.Mask[maskFunction](source.value, this.opts);
                    source.lastOutput = source.value;
                    if (source.setSelectionRange && this.opts.suffixUnit) {
                        source.setSelectionRange(source.value.length, (source.value.length - this.opts.suffixUnit.length));
                    }
                }, 0);
            }
        };
        for (var i = 0, len = this.elements.length; i < len; i++) {
            this.elements[i].lastOutput = "";
            this.elements[i].onkeyup = onType;
            if (this.elements[i].value.length) {
                this.elements[i].value = Colibri.UI.Utilities.Mask[maskFunction](this.elements[i].value, this.opts);
            }
        }
    }

    maskMoney(opts) {
        this.opts = this._mergeMoneyOptions(opts);
        this._bindElementToMask("toMoney");
    }

    maskNumber() {
        this.opts = {};
        this._bindElementToMask("toNumber");
    }

    maskAlphaNum() {
        this.opts = {};
        this._bindElementToMask("toAlphaNumeric");
    }

    maskPattern(pattern) {
        this.opts = { pattern: pattern };
        this._bindElementToMask("toPattern");
    }

    unMask() {
        this._unbindElementToMask();
    }

    // Fill wildcards past index in output with placeholder
    static _addPlaceholdersToOutput(output, index, placeholder) {
        for (; index < output.length; index++) {
            if (output[index] === Colibri.UI.Utilities.Mask.DIGIT || output[index] === Colibri.UI.Utilities.Mask.ALPHA || output[index] === Colibri.UI.Utilities.Mask.ALPHANUM) {
                output[index] = placeholder;
            }
        }
        return output;
    }


    static toMoney(value, opts) {
        opts = this._mergeMoneyOptions(opts);
        if (opts.zeroCents) {
            opts.lastOutput = opts.lastOutput || "";
            var zeroMatcher = ("(" + opts.separator + "[0]{0," + opts.precision + "})"),
                zeroRegExp = new RegExp(zeroMatcher, "g"),
                digitsLength = value.toString().replace(/[\D]/g, "").length || 0,
                lastDigitLength = opts.lastOutput.toString().replace(/[\D]/g, "").length || 0
                ;
            value = value.toString().replace(zeroRegExp, "");
            if (digitsLength < lastDigitLength) {
                value = value.slice(0, value.length - 1);
            }
        }

        var number = value.toString();
        // if separator is in string, make sure we zero-pad to respect it
        var separatorIndex = number.indexOf(opts.separator),
            missingZeros = (opts.precision - (number.length - separatorIndex - 1));

        if (separatorIndex !== -1 && (missingZeros > 0)) {
            number = number + ('0' * missingZeros);
        }

        number = number.replace(/[\D]/g, "");

        var clearDelimiter = new RegExp("^(0|\\" + opts.delimiter + ")"),
            clearSeparator = new RegExp("(\\" + opts.separator + ")$"),
            money = number.substr(0, number.length - opts.moneyPrecision),
            masked = money.substr(0, money.length % 3),
            cents = new Array(opts.precision + 1).join("0")
            ;

        money = money.substr(money.length % 3, money.length);
        for (var i = 0, len = money.length; i < len; i++) {
            if (i % 3 === 0) {
                masked += opts.delimiter;
            }
            masked += money[i];
        }
        masked = masked.replace(clearDelimiter, "");
        masked = masked.length ? masked : "0";
        var signal = "";
        if (opts.showSignal === true) {
            signal = value < 0 || (value.startsWith && value.startsWith('-')) ? "-" : "";
        }
        if (!opts.zeroCents) {
            var beginCents = Math.max(0, number.length - opts.precision),
                centsValue = number.substr(beginCents, opts.precision),
                centsLength = centsValue.length,
                centsSliced = (opts.precision > centsLength) ? opts.precision : centsLength
                ;
            cents = (cents + centsValue).slice(-centsSliced);
        }
        var output = opts.unit + signal + masked + opts.separator + cents;
        return output.replace(clearSeparator, "") + opts.suffixUnit;
    };

    static toPattern(value, opts) {

        var pattern = (typeof opts === 'object' ? opts.pattern : opts),
            patternChars = pattern.replace(/\W/g, ''),
            output = pattern.split(""),
            values = value.toString().replace(/\W/g, ""),
            charsValues = values.replace(/\W/g, ''),
            index = 0,
            i,
            outputLength = output.length,
            placeholder = (typeof opts === 'object' ? opts.placeholder : undefined)
            ;


        for (i = 0; i < outputLength; i++) {
            // Reached the end of input
            if (index >= values.length) {
                if (patternChars.length == charsValues.length) {
                    return output.join("");
                }
                else if ((placeholder !== undefined) && (patternChars.length > charsValues.length)) {
                    return Colibri.UI.Utilities.Mask._addPlaceholdersToOutput(output, i, placeholder).join("");
                }
                else {
                    break;
                }
            }
            // Remaining chars in input
            else {
                if ((output[i] === Colibri.UI.Utilities.Mask.DIGIT && values[index].match(/[0-9]/)) ||
                    (output[i] === Colibri.UI.Utilities.Mask.ALPHA && values[index].match(/[a-zA-Z]/)) ||
                    (output[i] === Colibri.UI.Utilities.Mask.ALPHANUM && values[index].match(/[0-9a-zA-Z]/))) {
                    output[i] = values[index++];
                } else if (output[i] === Colibri.UI.Utilities.Mask.DIGIT || output[i] === Colibri.UI.Utilities.Mask.ALPHA || output[i] === Colibri.UI.Utilities.Mask.ALPHANUM) {
                    if (placeholder !== undefined) {
                        return Colibri.UI.Utilities.Mask._addPlaceholdersToOutput(output, i, placeholder).join("");
                    }
                    else {
                        return output.slice(0, i).join("");
                    }
                    // exact match for a non-magic character
                } else if (output[i] === values[index]) {
                    index++;
                }

            }
        }
        return output.join("").substr(0, i);
    };

    static toNumber(value) {
        return value.toString().replace(/(?!^-)[^0-9]/g, "");
    }

    static toAlphaNumeric(value) {
        return value.toString().replace(/[^a-z0-9 ]+/i, "");
    }

    static Check(value, pattern) {
        const v = Colibri.UI.Utilities.Mask.toPattern(value, {pattern: pattern, placeholder: "_"});
        return v === value;
    }


}


