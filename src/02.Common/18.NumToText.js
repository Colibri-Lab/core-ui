Colibri.Common.NumToText = class {
    /**
     * Convert number to Russian words
     * Supports integers up to billions
     * Author: ChatGPT
     */
    static numberToText(num) {
        if (typeof num !== "number" || !Number.isFinite(num)) {
            throw new Error("Input must be a finite number");
        }
        if (!Number.isInteger(num)) {
            throw new Error("Only integers are supported");
        }

        const units = [
            ["ноль"],
            ["один", "одна"],
            ["два", "две"],
            ["три"],
            ["четыре"],
            ["пять"],
            ["шесть"],
            ["семь"],
            ["восемь"],
            ["девять"]
        ];

        const teens = [
            "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать",
            "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"
        ];

        const tens = [
            "", "десять", "двадцать", "тридцать", "сорок",
            "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"
        ];

        const hundreds = [
            "", "сто", "двести", "триста", "четыреста",
            "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"
        ];

        // Forms: singular, genitive singular, genitive plural
        const thousandsForms = ["тысяча", "тысячи", "тысяч"];
        const millionsForms = ["миллион", "миллиона", "миллионов"];
        const billionsForms = ["миллиард", "миллиарда", "миллиардов"];

        function getForm(n, forms) {
            n = Math.abs(n) % 100;
            if (n >= 11 && n <= 19) return forms[2];
            const lastDigit = n % 10;
            if (lastDigit === 1) return forms[0];
            if (lastDigit >= 2 && lastDigit <= 4) return forms[1];
            return forms[2];
        }

        function tripletToWords(num, female) {
            let words = [];
            const h = Math.floor(num / 100);
            const t = Math.floor((num % 100) / 10);
            const u = num % 10;

            if (h > 0) words.push(hundreds[h]);
            if (t > 1) {
                words.push(tens[t]);
                if (u > 0) words.push(units[u][female && u <= 2 ? 1 : 0] || units[u][0]);
            } else if (t === 1) {
                words.push(teens[u]);
            } else if (u > 0 || words.length === 0) {
                words.push(units[u][female && u <= 2 ? 1 : 0] || units[u][0]);
            }
            return words.join(" ");
        }

        if (num === 0) return units[0][0];

        let result = [];
        let absNum = Math.abs(num);

        const billions = Math.floor(absNum / 1_000_000_000);
        const millions = Math.floor((absNum % 1_000_000_000) / 1_000_000);
        const thousands = Math.floor((absNum % 1_000_000) / 1000);
        const remainder = absNum % 1000;

        if (billions > 0) {
            result.push(tripletToWords(billions, false), getForm(billions, billionsForms));
        }
        if (millions > 0) {
            result.push(tripletToWords(millions, false), getForm(millions, millionsForms));
        }
        if (thousands > 0) {
            result.push(tripletToWords(thousands, true), getForm(thousands, thousandsForms));
        }
        if (remainder > 0) {
            result.push(tripletToWords(remainder, false));
        }

        let final = result.join(" ").replace(/\s+/g, " ").trim();
        if (num < 0) final = "минус " + final;
        return final;
    }

}