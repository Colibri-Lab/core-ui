Colibri.Common.Validation = class {

    static ValidateBik(bik, error) {
        var result = false;
        if (typeof bik === 'number') {
            bik = bik.toString();
        } else if (typeof bik !== 'string') {
            bik = '';
        }
        if (!bik.length) {
            error.code = 1;
            error.message = 'БИК пуст';
        } else if (/[^0-9]/.test(bik)) {
            error.code = 2;
            error.message = '#{ui-validation-bik-error1}';
        } else if (bik.length !== 9) {
            error.code = 3;
            error.message = '#{ui-validation-bik-error2}';
        } else {
            result = true;
        }
        return result;
    }
    
    static ValidateInn(inn, error) {
        var result = false;
        if (typeof inn === 'number') {
            inn = inn.toString();
        } else if (typeof inn !== 'string') {
            inn = '';
        }
        if (!inn.length) {
            error.code = 1;
            error.message = '#{ui-validation-inn-error1}';
        } else if (/[^0-9]/.test(inn)) {
            error.code = 2;
            error.message = '#{ui-validation-inn-error2}';
        } else if ([10, 12].indexOf(inn.length) === -1) {
            error.code = 3;
            error.message = '#{ui-validation-inn-error3}';
        } else {
            var checkDigit = function (inn, coefficients) {
                var n = 0;
                for (let i = 0; i<coefficients.length; i++) {
                    n += coefficients[i] * parseInt(inn[i]);
                }
                return parseInt(n % 11 % 10);
            };
            switch (inn.length) {
                case 10:
                    var n10 = checkDigit(inn, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
                    if (n10 === parseInt(inn[9])) {
                        result = true;
                    }
                    break;
                case 12:
                    var n11 = checkDigit(inn, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
                    var n12 = checkDigit(inn, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
                    if ((n11 === parseInt(inn[10])) && (n12 === parseInt(inn[11]))) {
                        result = true;
                    }
                    break;
            }
            if (!result) {
                error.code = 4;
                error.message = '#{ui-validation-inn-error4}';
            }
        }
        return result;
    }
    
    static ValidateKpp(kpp, error) {
        var result = false;
        if (typeof kpp === 'number') {
            kpp = kpp.toString();
        } else if (typeof kpp !== 'string') {
            kpp = '';
        }
        if (!kpp.length) {
            error.code = 1;
            error.message = '#{ui-validation-kpp-error1}';
        } else if (kpp.length !== 9) {
            error.code = 2;
            error.message = '#{ui-validation-kpp-error2}';
        } else if (!/^[0-9]{4}[0-9A-Z]{2}[0-9]{3}$/.test(kpp)) {
            error.code = 3;
            error.message = '#{ui-validation-kpp-error3}';
        } else {
            result = true;
        }
        return result;
    }
    
    static ValidateKs(ks, bik, error) {
        var result = false;
        if (validateBik(bik, error)) {
            if (typeof ks === 'number') {
                ks = ks.toString();
            } else if (typeof ks !== 'string') {
                ks = '';
            }
            if (!ks.length) {
                error.code = 1;
                error.message = '#{ui-validation-ks-error0}';
            } else if (/[^0-9]/.test(ks)) {
                error.code = 2;
                error.message = '#{ui-validation-ks-error1}';
            } else if (ks.length !== 20) {
                error.code = 3;
                error.message = '#{ui-validation-ks-error2}';
            } else {
                var bikKs = '0' + bik.toString().slice(4, 6) + ks;
                var checksum = 0;
                var coefficients = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1];
                for (var i in coefficients) {
                    checksum += coefficients[i] * (bikKs[i] % 10);
                }
                if (checksum % 10 === 0) {
                    result = true;
                } else {
                    error.code = 4;
                    error.message = '#{ui-validation-ks-error3}';
                }
            }
        }
        return result;
    }
    
    static ValidateOgrn(ogrn, error) {
        var result = false;
        if (typeof ogrn === 'number') {
            ogrn = ogrn.toString();
        } else if (typeof ogrn !== 'string') {
            ogrn = '';
        }
        if (!ogrn.length) {
            error.code = 1;
            error.message = '#{ui-validation-ogrn-error1}';
        } else if (/[^0-9]/.test(ogrn)) {
            error.code = 2;
            error.message = '#{ui-validation-ogrn-error2}';
        } else if (ogrn.length !== 13) {
            error.code = 3;
            error.message = '#{ui-validation-ogrn-error3}';
        } else {
            var n13 = parseInt((parseInt(ogrn.slice(0, -1)) % 11).toString().slice(-1));
            if (n13 === parseInt(ogrn[12])) {
                result = true;
            } else {
                error.code = 4;
                error.message = '#{ui-validation-ogrn-error4}';
            }
        }
        return result;
    }
    
    static ValidateOgrnip(ogrnip, error) {
        var result = false;
        if (typeof ogrnip === 'number') {
            ogrnip = ogrnip.toString();
        } else if (typeof ogrnip !== 'string') {
            ogrnip = '';
        }
        if (!ogrnip.length) {
            error.code = 1;
            error.message = '#{ui-validation-ogrnip-error1}';
        } else if (/[^0-9]/.test(ogrnip)) {
            error.code = 2;
            error.message = '#{ui-validation-ogrnip-error2}';
        } else if (ogrnip.length !== 15) {
            error.code = 3;
            error.message = '#{ui-validation-ogrnip-error3}';
        } else {
            var n15 = parseInt((parseInt(ogrnip.slice(0, -1)) % 13).toString().slice(-1));
            if (n15 === parseInt(ogrnip[14])) {
                result = true;
            } else {
                error.code = 4;
                error.message = '#{ui-validation-ogrnip-error4}';
            }
        }
        return result;
    }
    
    static ValidateRs(rs, bik, error) {
        var result = false;
        if (validateBik(bik, error)) {
            if (typeof rs === 'number') {
                rs = rs.toString();
            } else if (typeof rs !== 'string') {
                rs = '';
            }
            if (!rs.length) {
                error.code = 1;
                error.message = '#{ui-validation-rs-error1}';
            } else if (/[^0-9]/.test(rs)) {
                error.code = 2;
                error.message = '#{ui-validation-rs-error2}';
            } else if (rs.length !== 20) {
                error.code = 3;
                error.message = '#{ui-validation-rs-error3}';
            } else {
                var bikRs = bik.toString().slice(-3) + rs;
                var checksum = 0;
                var coefficients = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1];
                for (var i in coefficients) {
                    checksum += coefficients[i] * (bikRs[i] % 10);
                }
                if (checksum % 10 === 0) {
                    result = true;
                } else {
                    error.code = 4;
                    error.message = '#{ui-validation-rs-error4}';
                }
            }
        }
        return result;
    }
    
    static ValidateSnils(snils, error) {
        var result = false;
        if (typeof snils === 'number') {
            snils = snils.toString();
        } else if (typeof snils !== 'string') {
            snils = '';
        }
        if (!snils.length) {
            error.code = 1;
            error.message = '#{ui-validation-snils-error1}';
        } else if (/[^0-9]/.test(snils)) {
            error.code = 2;
            error.message = '#{ui-validation-snils-error2}';
        } else if (snils.length !== 11) {
            error.code = 3;
            error.message = '#{ui-validation-snils-error3}';
        } else {
            var sum = 0;
            for (var i = 0; i < 9; i++) {
                sum += parseInt(snils[i]) * (9 - i);
            }
            var checkDigit = 0;
            if (sum < 100) {
                checkDigit = sum;
            } else if (sum > 101) {
                checkDigit = parseInt(sum % 101);
                if (checkDigit === 100) {
                    checkDigit = 0;
                }
            }
            if (checkDigit === parseInt(snils.slice(-2))) {
                result = true;
            } else {
                error.code = 4;
                error.message = '#{ui-validation-snils-error4}';
            }
        }
        return result;
    }

}