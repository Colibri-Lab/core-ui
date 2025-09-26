/**
 * Time line component
 * @class
 * @extends Colibri.UI.PaneGrid
 * @memberof Colibri.UI
 */
Colibri.UI.Timeline = class extends Colibri.UI.PaneGrid {

    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.component} container container of component
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['Colibri.UI.Timeline']);
        this.AddClass('colibri-ui-timeline');

        this.rows = '1fr';
        this.columns = 'min-content auto';

        this._form = this.Children('form');
        this._timelinePane = this.Children('timeline-pane');
        this._timelinePaneGrid = this.Children('timeline-pane/grid');

        this._timelinePaneStart = this.Children('timeline-pane/start');
        this._timelinePaneEnd = this.Children('timeline-pane/end');

        this._form.AddHandler('Changed', this.__formChanged, false, this);
        this.handlerResize = true;
        this.AddHandler('Resize', this.__thisResize);

        this._movingPoint = null;
        this._currentDate = null;

        this._timelinePaneStart.AddHandler(['MouseDown','TouchStart'], this.__timelinePaneStartMouseDown, false, this);
        this._timelinePaneEnd.AddHandler(['MouseDown', 'TouchStart'], this.__timelinePaneEndMouseDown, false, this);

    }

    _startMoving() {

        this.__documentMouseMove = this.__documentMouseMove || ((e) => {

            let posX;
            if (e.touches && e.touches.length) {
                posX = e.touches[0].clientX;
            } else {
                posX = e.clientX;
            }

            const rect = this._timelinePaneGrid.container.bounds();
            let relativeX = posX - rect.left;

            if (relativeX < 0) {
                relativeX = 0;
            }
            if (relativeX > rect.width) {
                relativeX = rect.width;
            }

            
            this._currentDate = this._getDateByPosition(relativeX);
            if (!this._currentDate) {
                return;
            }
            
            if (this._movingPoint === this._timelinePaneStart) {
                if (this._currentDate >= this._dte) {
                    return;
                }
                this._form.value = { dts: this._currentDate.toDbDate(), dte: this._form.value.dte };
            } else if (this._movingPoint === this._timelinePaneEnd) {
                if (this._currentDate <= this._dts) {
                    return;
                }
                this._form.value = { dts: this._form.value.dts, dte: this._currentDate.toDbDate() };
            }
            this._movingPoint.styles = { left: relativeX + "px" };
            

        });

        this.__documentMouseUp = this.__documentMouseUp || ((e) => {
            document.body.removeEventListener('mousemove', this.__documentMouseMove);
            document.body.removeEventListener('touchmove', this.__documentMouseMove);

            document.body.removeEventListener('mouseup', this.__documentMouseUp);
            document.body.removeEventListener('touchend', this.__documentMouseUp);

            this._currentDate = null;
            this._movingPoint = null;
            this.Dispatch('Changed', { value: this._form.value });

        });

        document.body.addEventListener('mousemove', this.__documentMouseMove);
        document.body.addEventListener('touchmove', this.__documentMouseMove);

        document.body.addEventListener('mouseup', this.__documentMouseUp);
        document.body.addEventListener('touchend', this.__documentMouseUp);


    }

    __timelinePaneEndMouseDown(event, args) {
        this._movingPoint = this._timelinePaneEnd;
        this._startMoving();
    }

    __timelinePaneStartMouseDown(event, args) {
        this._movingPoint = this._timelinePaneStart;
        this._startMoving();
    }

    __thisResize(event, args) {
        this._renderTimeline();
    }

    /**
     * Register events
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('Changed', false, 'When timeline is changed');
    }

    __formChanged(event, args) {
        if(!!this._movingPoint) {
            return;
        }

        if(this._form.value.dte.toDate() < this._form.value.dts.toDate() ) {
            this._form.value = { dts: this._form.value.dts, dte: this._form.value.dts.toDate().addHours(5).toDbDate() };
            return;
        }

        this._dts = this._form.value.dts;
        this._dte = this._form.value.dte;
        
        this._renderTimeline();
        this.Dispatch('Changed', { value: this._form.value });
    }

    _setMarkerPosition(pane, date) {
        const t = date.getTime();
        const start = this._dts instanceof Date ? this._dts : this._dts.toDate();
        const end = this._dte instanceof Date ? this._dte : this._dte.toDate();
        const width = this._timelinePaneGrid.width;
        const durationMs = end - start;
        const pos = ((t - start) / durationMs) * width;
        pane.styles = { left: pos + "px" };
    };

    _getDateByPosition(posPx) {
        if (!this._dts || !this._dte) {
            return null;
        }

        const start = this._dts instanceof Date ? this._dts : this._dts.toDate();
        const end = this._dte instanceof Date ? this._dte : this._dte.toDate();

        const width = this._timelinePaneGrid.width;
        const durationMs = end - start;

        // позиция → доля от ширины
        const fraction = posPx / width;

        // вычисляем дату
        const t = start.getTime() + durationMs * fraction;
        return new Date(t);
    }

    _renderTimeline() {

        if (!this._dts || !this._dte) {
            return;
        }


        this._timelinePaneGrid.Clear();

        const start = this._dts.toDate();
        const end = this._dte.toDate();

        this._timelinePaneGrid.container.hideShowProcess(() => {
            const width = this._timelinePaneGrid.width;
            const durationMs = end - start;

            // решаем: дни или часы?
            let step, major, format;
            if (durationMs > 24 * 60 * 60 * 1000) {
                // больше суток — рисуем дни и часы
                step = 2 * 60 * 60 * 1000;   // каждые 2 часа
                major = "day";
                format = d => d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
            } else {
                // в пределах суток — рисуем часы и минуты
                step = 2 * 60 * 1000;        // каждые 2 минуты
                major = "hour";
                format = d => d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
            }

            for (let t = start.getTime(); t <= end.getTime(); t += step) {
                const d = new Date(t);
                const pos = ((t - start) / durationMs) * width;

                const tick = new Colibri.UI.Pane('div' + pos, this._timelinePaneGrid);
                tick.shown = true;
                tick.AddClass('-tick');

                // длинные и короткие деления
                if (
                    (major === "day" && d.getHours() === 0) ||
                    (major === "hour" && d.getMinutes() === 0)
                ) {
                    tick.AddClass('-long');
                } else {
                    tick.AddClass('-short');
                }

                tick.styles = { left: pos + "px" };
            }

            this._setMarkerPosition(this._timelinePaneStart, start);
            this._setMarkerPosition(this._timelinePaneEnd, end);

        }, 100);

    }

    /**
     * Value Array
     * @type {Array}
     */
    get value() {
        return this._value;
    }
    /**
     * Value Array
     * @type {Array}
     */
    set value(value) {
        this._value = value;
        this._showValue();
    }
    _showValue() {
        this._renderTimeline();
    }

    /**
     * Date of the timeline start
     * @type {Date}
     */
    get dts() {
        return this._dts;
    }
    /**
     * Date of the timeline start
     * @type {Date}
     */
    set dts(value) {
        this._dts = value instanceof Date ? value.toDbDate() : value;
        this._showDts();
    }
    _showDts() {
        const v = this._form.value;
        v.dts = this._dts ?? Date.Now();
        this._form.value = v;
    }

    /**
     * Date of the timeline end
     * @type {Date}
     */
    get dte() {
        return this._dte;
    }
    /**
     * Date of the timeline end
     * @type {Date}
     */
    set dte(value) {
        this._dte = value instanceof Date ? value.toDbDate() : value;
        this._showdte();
    }
    _showdte() {
        const v = this._form.value;
        v.dte = this._dte ?? Date.Now();
        this._form.value = v;
    }

}