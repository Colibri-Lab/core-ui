
/**
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.DatePicker = class extends Colibri.UI.Pane {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */
    constructor(name, container) {
        super(name, container);

        this.AddClass('app-date-picker-component');

    }

    /**
     * Render the component
     * @protected
     */
    Render() {
        this._renderContent();
        this._bind();
    }

    /** @private */
    _renderContent() {

        const min = this.parent.parent.min;
        const max = this.parent.parent.max;

        this._element.html('');
        let dateformat = App.DateFormat || 'ru-RU';
        const formatter = new Intl.DateTimeFormat(dateformat, { day: '2-digit' });
        const weekformatter = new Intl.DateTimeFormat(dateformat, { weekday: 'narrow' });

        const table = this._element.append(Element.fromHtml('<table cellspacing="2"><thead></thead><tbody></tbody><tfoot></tfoot></table>'));

        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        const tfoot = table.querySelector('tfoot');

        let tr = thead.append(Element.fromHtml('<tr></tr>'));

        let dt = this.parent.value.copy();
        let checkedDate = dt.copy();

        let today = this.parent.parent.todayDate ? this.parent.parent.todayDate : new Date();

        let weekday = dt.getDay();
        if (weekday == 0) {
            weekday = 7;
        }

        dt.setTime(dt.getTime() - (weekday - 1) * 86400000);
        for (let i = 0; i < 7; i++) {
            tr.append(Element.fromHtml('<td>' + (weekformatter.format(dt)) + '</td>'));
            dt.setTime(dt.getTime() + 86400000);
        }

        dt = this.parent.value.copy();
        let day = dt.getDate();

        dt.setTime(dt.getTime() - day * 86400000);
        weekday = dt.getDay();

        // нашли начало календарика;
        dt.setTime(dt.getTime() - (weekday - 1) * 86400000);

        for (let i = 0; i < 6; i++) {
            // печатаем 6 строк
            tr = tbody.append(Element.fromHtml('<tr></tr>'));
            for (let i = 0; i < 7; i++) {
                // печатаем 7 дней
                let className = "";
                if (today.getDate() == dt.getDate() && today.getMonth() == dt.getMonth()) {
                    className += ' today';
                }
                if (checkedDate.getDate() == dt.getDate() && checkedDate.getMonth() == dt.getMonth()) {
                    className += ' current';
                }
                if (checkedDate.getMonth() != dt.getMonth()) {
                    className += ' ntm';
                }
                let cname = '';
                if (min && dt.toShortDateString() < min.toShortDateString() || max && dt.toShortDateString() > max.toShortDateString()) {
                    cname = 'disabled';
                }
                tr.append(Element.fromHtml('<td class="' + className + ' ' + cname + '" data-value="' + (dt.getTime()) + '">' + formatter.format(dt) + '</td>'));
                dt.setTime(dt.getTime() + 86400000);
            }
        }

        tfoot.append(Element.fromHtml('<td colspan="7" data-today="today" data-value="' + (today.getTime()) + '">' + (this.parent.parent.todayString || '#{ui-dateselector-today}') + '</td>'));
    }

    /** @private */
    _bind() {
        this._element.querySelectorAll('td').forEach((td) => {
            td.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('ntm') || e.target.classList.contains('disabled')) {
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
                this.parent.value = Date.from(e.target.dataset.value);
                this.parent.parent.Close();
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        })
    }


}
