
/**
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.YearPicker = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);
        this.AddClass('app-month-picker-component');
        this.Render();
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

        const format = { "year": "numeric" };
        let dateformat = App.DateFormat || 'ru-RU';
        const formatter = new Intl.DateTimeFormat(dateformat, format);

        const table = this._element.append(Element.fromHtml('<table cellspacing="2"><tbody></tbody><tfoot></tfoot></table>'));
        const tbody = table.querySelector('tbody');
        const tfoot = table.querySelector('tfoot');

        let dt = this.parent.value.copy();
        let checkedDate = dt.copy();
        let today = new Date();

        let currentYear = checkedDate.getFullYear();
        let todayYear = today.getFullYear();
        let yearStart = parseInt(currentYear / 10) * 10;

        for (let i = 0; i < 5; i++) {
            let tr = tbody.append(Element.fromHtml('<tr></tr>'));
            for (let year = yearStart + i * 2; year < yearStart + i * 2 + 2; year++) {

                dt.setFullYear(year);

                let className = '';
                if (year == todayYear) {
                    className = ' today';
                }
                if (year == currentYear) {
                    className = ' current';
                }

                tr.append(Element.fromHtml('<td class="' + className + '" data-value="' + (dt.getTime()) + '">' + formatter.format(dt) + '</td>'));
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
        })
    }

    /**
     * Start year
     * @type {number}
     * @readonly
     */
    get startYear() {
        let dt = this.parent.value.copy()
        let currentYear = dt.getFullYear();
        return parseInt(currentYear / 10) * 10;
    }

}