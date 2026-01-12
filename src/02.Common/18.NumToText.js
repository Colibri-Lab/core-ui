Colibri.Common.NumToText = class {
    static units = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    static unitsFem = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    static teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать',
                    'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
    static tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят',
                   'семьдесят', 'восемьдесят', 'девяносто'];
    static hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот',
                       'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

    static numberToText(num) {
        if (num === 0) return 'ноль';
        if (num < 0) return 'минус ' + this.numberToText(-num);

        let result = '';

        if (Math.floor(num / 1000) > 0) {
            const thousands = Math.floor(num / 1000);
            result += this.convertHundreds(thousands, true) + ' ' + this.getThousandsWord(thousands) + ' ';
            num %= 1000;
        }

        if (num > 0) {
            result += this.convertHundreds(num);
        }

        return result.trim();
    }

    static convertHundreds(num, fem = false) {
        const unitsArray = fem ? this.unitsFem : this.units;
        let result = '';

        if (num >= 100) {
            result += this.hundreds[Math.floor(num / 100)] + ' ';
            num %= 100;
        }
        if (num >= 20) {
            result += this.tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        } else if (num >= 10) {
            result += this.teens[num - 10] + ' ';
            num = 0;
        }
        if (num > 0) {
            result += unitsArray[Math.round(num)] + ' ';
        }
        return result.trim();
    }

    static getThousandsWord(num) {
        num = num % 100;
        if (num >= 11 && num <= 19) return 'тысяч';
        const last = num % 10;
        if (last === 1) return 'тысяча';
        if (last >= 2 && last <= 4) return 'тысячи';
        return 'тысяч';
    }
}