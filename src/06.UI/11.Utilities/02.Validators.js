Colibri.UI.Utilities.Validator = class {

    static IsUKPostCode(string) {
        var postcodeRegEx = /[A-Z]{1,2}[0-9A-Z]{1,2} ?[0-9][A-Z]{2}/i; 
        return postcodeRegEx.test(string); 
    }

}