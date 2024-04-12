/**
 * @class
 * @memberof Colibri.UI.Utilities
 */
Colibri.UI.Utilities.Validator = class {

    /**
     * Validate UK post code
     * @param {string} string uk post code
     * @returns {boolean}
     */
    static IsUKPostCode(string) {
        var postcodeRegEx = /[A-Z]{1,2}[0-9A-Z]{1,2} ?[0-9][A-Z]{2}/i; 
        return postcodeRegEx.test(string); 
    }

    /**
     * Validate Russian tax code
     * @param {string} value russian tax code
     * @returns {boolean}
     */
    static IsValidRuINN(value){
        //первая цифра ИНН может быть нулём, поэтому он не может быть числом
        if(typeof value !== 'string'){
            console.error(`ИНН должен быть строкой. Получено: ${typeof value}`);
            return false;
        }
        
        //ИНН юрлиц - 10 символов, ИП - 12 символов
        if(value.length !== 10 && value.length !== 12){
            console.error(`Некорректная длинна ИНН: ${value.length}`);
            return false;
        }
        
        //преобразуем строку в массив цифр
        const arNumbers = value.split('');
        if(arNumbers.length === 0){
            console.error('Не удалось разобрать строку в массив символов');
            return false;
        }
        
        //проверим что у нас в массиве только цифры
        for(let symbol of arNumbers){
            if(isNaN(Number(symbol))){
                console.error(`Некорректный символ "${symbol}" в ИНН`);
                return false;
            }
        }
        
        //формула для юрлиц и ИП отличается
        if(arNumbers.length === 10){
            //переменная для итоговой суммы
            let checkSum;
            
            //каждую цифру мы умножаем на свой коэффициент
            //а потом получаем остаток от деления на 11 и на 10
            checkSum = ((
                2 * arNumbers[0] +
                4 * arNumbers[1] +
                10 * arNumbers[2] +
                3 * arNumbers[3] +
                5 * arNumbers[4] +
                9 * arNumbers[5] +
                4 * arNumbers[6] +
                6 * arNumbers[7] +
                8 * arNumbers[8]
            ) % 11 ) % 10;
            
            //проверяем что десятый символ ИНН совпадает с контрольной суммой
            if(checkSum === Number(arNumbers[9])){
                return true;
            }else{
                console.error(
                    `Контрольная сумма не совпала с десятым символом ${checkSum} != ${arNumbers[9]}`
                );
                return false;
            }
            
        //код для ИП
        }else if(arNumbers.length === 12){
            //в этом случае будет две контрольные суммы
            let checkSumOne, checkSumTwo;
            
            checkSumOne = ((
                7 * arNumbers[0] +
                2 * arNumbers[1] +
                4 * arNumbers[2] +
                10 * arNumbers[3] +
                3 * arNumbers[4] +
                5 * arNumbers[5] +
                9 * arNumbers[6] +
                4 * arNumbers[7] +
                6 * arNumbers[8] +
                8 * arNumbers[9]
            ) % 11 ) % 10;
            
            checkSumTwo = ((
                3 * arNumbers[0] +
                7 * arNumbers[1] +
                2 * arNumbers[2] +
                4 * arNumbers[3] +
                10 * arNumbers[4] +
                3 * arNumbers[5] +
                5 * arNumbers[6] +
                9 * arNumbers[7] +
                4 * arNumbers[8] +
                6 * arNumbers[9] +
                8 * arNumbers[10]
            ) % 11 ) % 10;
            
            //в этом случае мы проверяем 11 и 12 символы
            if(checkSumOne === Number(arNumbers[10]) &&
                checkSumTwo === Number(arNumbers[11]))
            {
                return true;
                
            }else if(checkSumOne !== Number(arNumbers[10])){
                console.error(
                    `Первая контрольная сумма не совпала с одиннадцатым символом ${checkSumOne} != ${arNumbers[10]}`
                );
                return false;
                
            }else if(checkSumTwo !== Number(arNumbers[11])){
                console.error(
                    `Вторая контрольная сумма не совпала с двенадцатым символом ${checkSumTwo} != ${arNumbers[11]}`
                );
                return false;
            }
        }
    }

}