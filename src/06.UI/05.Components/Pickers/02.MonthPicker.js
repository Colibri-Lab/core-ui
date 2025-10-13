
/**
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.MonthPicker = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);

        this.AddClass('app-month-picker-component');

    }

    /**
     * Render the component
     */
    Render() {
        this._renderContent();
        this._bind();
    }

    /** @private */
    _renderContent() {

        this._element.html('');

        const format = { "month": "short" };
        let dateformat = App.DateFormat || 'ru-RU';
        const formatter = new Intl.DateTimeFormat(dateformat, format);

        const table = this._element.append(Element.fromHtml('<table cellspacing="2"><tbody></tbody><tfoot></tfoot></table>'));
        const tbody = table.querySelector('tbody');
        const tfoot = table.querySelector('tfoot');

        let dt = this.parent.value.copy();

        let checkedDate = dt.copy();
        let today = new Date();

        let currentMonth = today.getMonth() + 1;
        let checkedMonth = checkedDate.getMonth() + 1;

        for (let i = 0; i < 3; i++) {
            let tr = tbody.append(Element.fromHtml('<tr></tr>'));
            for (let month = i * 4 + 1; month <= i * 4 + 4; month++) {

                dt.setMonth(month - 1);

                let className = '';
                if (month == currentMonth) {
                    className = ' today';
                }
                if (month == checkedMonth) {
                    className = ' current';
                }

                tr.append(Element.fromHtml('<td class="' + className + '" data-value="' + (dt.getTime()) + '">' + formatter.format(dt).substring(0, 3) + '</td>'));
            }
        }

        tfoot.append(Element.fromHtml('<td colspan="7" data-today="today" data-value="' + (today.getTime()) + '">Сегодня</td>'));

    }

    /** @private */
    _bind() {
        this._element.querySelectorAll('td').forEach((td) => {
            td.addEventListener('mousedown', (e) => {
                this.parent.value = Date.from(e.target.dataset.value);
                this.parent.ToggleModeBack();
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        });
    }

}
