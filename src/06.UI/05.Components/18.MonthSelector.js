
Colibri.UI.MonthSelector = class extends Colibri.UI.Selector {

    constructor(name, container) {
        super(name, container, false, true, [
            {title: '#{app-monthselector-yanuary;Январь}', value: '01'},
            {title: '#{app-monthselector-february;Февраль}', value: '02'},
            {title: '#{app-monthselector-march;Март}', value: '03'},
            {title: '#{app-monthselector-april;Апрель}', value: '04'},
            {title: '#{app-monthselector-may;Май}', value: '05'},
            {title: '#{app-monthselector-jun;Июнь}', value: '06'},
            {title: '#{app-monthselector-july;Июль}', value: '07'},
            {title: '#{app-monthselector-august;Август}', value: '08'},
            {title: '#{app-monthselector-september;Сентябрь}', value: '09'},
            {title: '#{app-monthselector-october;Октябрь}', value: '10'},
            {title: '#{app-monthselector-november;Ноябрь}', value: '11'},
            {title: '#{app-monthselector-december;Декабрь}', value: '12'},
        ], '01', 'title', 'value', null, itemData => itemData.title);

        this.width = 125;

    }


}

