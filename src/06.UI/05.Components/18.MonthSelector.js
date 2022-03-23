
Colibri.UI.MonthSelector = class extends Colibri.UI.Selector {

    constructor(name, container) {
        super(name, container, false, true, [
            {title: 'Январь', value: '01'},
            {title: 'Февраль', value: '02'},
            {title: 'Март', value: '03'},
            {title: 'Апрель', value: '04'},
            {title: 'Май', value: '05'},
            {title: 'Июнь', value: '06'},
            {title: 'Июль', value: '07'},
            {title: 'Август', value: '08'},
            {title: 'Сентябрь', value: '09'},
            {title: 'Октябрь', value: '10'},
            {title: 'Ноябрь', value: '11'},
            {title: 'Декабрь', value: '12'},
        ], '01', 'title', 'value', itemData => itemData.title);

        this.width = 125;

    }


}

