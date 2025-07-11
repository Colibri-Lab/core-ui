/**
 * @class
 * @extends Colibri.UI.Pane
 * @memberof Colibri.UI
 */
Colibri.UI.GoogleChart = class extends Colibri.UI.Pane {
    
    /**
     * @constructor
     * @param {string} name name of component
     * @param {Element|Colibri.UI.Component} container container of component
     */    
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
        this.AddHandler('VisibilityChanged', this.__thisVisibilityChanged);
        
        this.AddHandler('Shown', this.__thisShown);
        this.AddHandler('GoogleChartsLoaded', this.__thisGoogleChartsLoaded);

    }

    __thisShown(event, args) {
        this._generateChart();
    }

    __thisVisibilityChanged(event, args) {
        this._generateChart();
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __thisGoogleChartsLoaded(event, args) {

        if(!this._type) {
            this._type = 'PieChart';
        }

        if(!this._value) {
            return;
        }

        this._generateChart();

    }

    Clear() {
        this._element.html('');
        this._chart = null;
    }

    /** @private */
    _generateChart() {
        if(!this._chartsIsLoaded) {
            return;
        }

        if(!this._value) {
            this._value = [];
        }

        // this._element.html('');
        if(!this._chart) {
            this._chart = new google.visualization[this._type](this._element);
        }
        
        const options = Object.assign({
            title: this._title,
            legend: 'none'
        }, this._options);

        try {

            let data;
            if(this._drawDataHandle) {
                data = this._drawDataHandle(this._value, this);
            } else {
                data = google.visualization.arrayToDataTable(this._value);
            }


            this._chart.draw(data, options);
            google.visualization.events.addListener(this._chart, 'ready', () => {
                setTimeout(() => {
                    if(this._chartReadyHandler) {
                        this._chartReadyHandler(this._chart);
                    }
                }, 500);
            });
        } catch(e) {
            console.log(e);
        }

    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('GoogleChartsLoaded', false, 'When the download is complete');
    }

    /**
     * Google charts type
     * @type {PieChart,BarChart,ComboChart,ColumnChart,AreaChart,Scatter,GeoChart,Histogram,SteppedAreaChart,LineChart,BubbleChart,OrgChart,TreeMap,Table,Timeline,Gauge,CandlestickChart}
     */
    get type() {
        return this._type;
    }
    /**
     * Google charts type
     * @type {PieChart,BarChart,ComboChart,ColumnChart,AreaChart,Scatter,GeoChart,Histogram,SteppedAreaChart,LineChart,BubbleChart,OrgChart,TreeMap,Table,Timeline,Gauge,CandlestickChart}
     */
    set type(value) {
        this._type = value;
    }

    /**
     * Title of Chart
     * @type {String}
     */
    get title() {
        return this._title;
    }
    /**
     * Title of Chart
     * @type {String}
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
        value = this._convertProperty('Object', value);
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

    /**
     * Chart ready handler
     * @type {Function}
     */
    get chartReadyHandler() {
        return this._chartReadyHandler;
    }
    /**
     * Chart ready handler
     * @type {Function}
     */
    set chartReadyHandler(value) {
        this._chartReadyHandler = value;
    }

}