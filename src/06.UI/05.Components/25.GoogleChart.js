Colibri.UI.GoogleChart = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container);
        this.AddClass('colibri-ui-googlechart');

        this.elementID = 'google-chart-' + Date.Mc();

        this._chartsIsLoaded = false;
        Colibri.UI.Require([], ['https://www.gstatic.com/charts/loader.js']).then(() => {
            Colibri.Common.Wait(() => {
                try {
                    return !!google;
                } catch(e) {
                    return false;
                }
            }).then(() => {
                google.charts.load('current', {'packages': ['corechart']});
                google.charts.setOnLoadCallback(() => {
                    this._chartsIsLoaded = true;
                    this.Dispatch('GoogleChartsLoaded');
                });    
            });
        });

        this.handleVisibilityChange = true;
        this.AddHandler('VisibilityChanged', (event, args) => {
            this._generateChart();
        });

        this.AddHandler('Shown', (event, args) => {
            console.log('shown event');
            this._generateChart();
        });

        this.AddHandler('GoogleChartsLoaded', (event, args) => this.__thisGoogleChartsLoaded(event, args));

    }

    __thisGoogleChartsLoaded(event, args) {

        if(!this._type) {
            this._type = 'PieChart';
        }

        if(!this._value) {
            return;
        }

        this._generateChart();

    }

    _generateChart() {
        if(!this._chartsIsLoaded) {
            return;
        }

        // this._element.html('');
        if(!this._chart) {
            this._chart = new google.visualization[this._type](this._element);
        }
        
        const options = Object.assign({
            title: this._title,
            legend: 'none'
        }, this._options);

        let data;
        if(this._drawDataHandle) {
            data = this._drawDataHandle(this._value, this);
        } else {
            data = google.visualization.arrayToDataTable(this._value);
        }


        this._chart.draw(data, options);
    }

    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('GoogleChartsLoaded', false, 'Когда загрузка завершена');
    }

    /**
     * Google charts type
     * @type {string}
     */
    get type() {
        return this._type;
    }
    /**
     * Google charts type
     * @type {string}
     */
    set type(value) {
        this._type = value;
    }

    /**
     * Title of Chart
     * @type {string}
     */
    get title() {
        return this._title;
    }
    /**
     * Title of Chart
     * @type {string}
     */
    set title(value) {
        this._title = value;
    }

    /**
     * Value array
     * @type {Array}
     */
    get value() {
        return this._value;
    }
    /**
     * Value array
     * @type {Array}
     */
    set value(value) {
        this._value = value;
        this._generateChart();
    }
    
    /**
     * OPtions object
     * @type {Object}
     */
    get options() {
        return this._options;
    }
    /**
     * OPtions object
     * @type {Object}
     */
    set options(value) {
        this._options = value;
    }

    /**
     * Draw data handle
     * @type {Function}
     */
    get drawDataHandle() {
        return this._drawDataHandle;
    }
    /**
     * Draw data handle
     * @type {Function}
     */
    set drawDataHandle(value) {
        this._drawDataHandle = value;
    }

}