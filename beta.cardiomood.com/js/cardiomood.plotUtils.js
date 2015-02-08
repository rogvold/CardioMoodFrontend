/**
 * Created by sabir on 06.06.14.
 */

/**
 *
 * @description
 * class for drawing plots
 *
 *
 *
 * create an instance of this class, specify the plotDivId parameter and invoke method updatePlot(timestampArray, valueArray)
 *
 *
 */

CardioMoodPlot = function(){
    var self = this;
    this.plotDivId = undefined;
    this.parameterName = undefined;
    this.plotName = undefined;
    this.chart = undefined;
    this.maxNumberOfPoints = 1000;
    this.onlineMode = false;

    this.initPlot = function(){
        if (self.plotDivId == undefined || self.plotDivId == ''){
            alert('plot divId is not specified');
            return;
        }
        // SERIAL CHART
        //self.chart = new AmCharts.AmSerialChart();
        self.chart = AmCharts.makeChart(self.plotDivId, {"type": "serial"});


        self.chart.pathToImages = "http://www.amcharts.com/lib/images/";
        self.chart.marginTop = 0;
        self.chart.marginRight = 10;
        self.chart.autoMarginOffset = 5;
        self.chart.zoomOutButton = {
            backgroundColor: '#000000',
            backgroundAlpha: 0.15
        };
        self.chart.dataProvider = [];

        self.chart.categoryField = "date";

        // AXES
        // category
        var categoryAxis = self.chart.categoryAxis;
        categoryAxis.parseDates = true; // as our data is date-based, we set parseDates to true
        categoryAxis.minPeriod = "ss"; // our data is daily, so we set minPeriod to DD
        categoryAxis.dashLength = 1;
        categoryAxis.gridAlpha = 0.15;
        categoryAxis.axisColor = "#DADADA";

        // value
        var valueAxis = new AmCharts.ValueAxis();
        valueAxis.axisAlpha = 0.2;
        valueAxis.dashLength = 1;
        self.chart.addValueAxis(valueAxis);

        // GRAPH
        var graph = new AmCharts.AmGraph();
        graph.title = "red line";
        graph.valueField = "value";
        graph.lineThickness = 1;
        graph.lineColor = "#b5030d";
        graph.balloonText = "<b><span style='font-size:14px;'>[[value]]</span></b>";
        //graph.type = "smoothedLine";
        self.chart.addGraph(graph);

        // CURSOR
        var chartCursor = new AmCharts.ChartCursor();
        //chartCursor.cursorPosition = "mouse";
        self.chart.addChartCursor(chartCursor);

        // SCROLLBAR
        var chartScrollbar = new AmCharts.ChartScrollbar();
        chartScrollbar.graph = graph;
        chartScrollbar.scrollbarHeight = 40;
        chartScrollbar.color = "#FFFFFF";
        chartScrollbar.autoGridCount = true;
        self.chart.addChartScrollbar(chartScrollbar);

        // WRITE
        console.log('writing to ' + self.plotDivId);
        self.chart.write(self.plotDivId);
    }

    this.updatePlot = function(timeArray, valueArray){
        console.log('updating plot ');
        if (this.chart == undefined){
            self.initPlot();
            self.updatePlot();
        }
        var chartData = self.convertInputDataToAppropriateForm(timeArray, valueArray);
        self.chart.dataProvider = chartData;
        self.chart.validateData();
        //self.chart.validateNow();

        //$('#mainPanel').fadeIn();
        //$('#splashPanel').fadeOut();

        console.log('dataProvider of ' + self.parameterName);
        console.log(self.chart.dataProvider);
    }

    this.convertInputDataToAppropriateForm = function(timeArray, valueArray){
        if (timeArray == undefined || valueArray == undefined){
            return [];
        }
        if (timeArray.length != valueArray.length){
            console.log('arrays have not equal lengths');
            return [];
        }
        var arr = [];
        var skipStep = (self.onlineMode == true) ? Math.floor(timeArray.length / self.maxNumberOfPoints) + 1 : 1;
        for (var i = 0; i < timeArray.length; i+=skipStep){
            var v = Math.floor(10.0 * valueArray[i])/10.0;
            if (self.parameterName == 'RR'){
                v = Math.floor(10*60000.0 / v)/10.0;
            }
            arr.push({
                date: new Date(timeArray[i]),
                value: v
            });
        }
        return arr;
    }

}

CardioMoodPlotRegistry = function(){
    var self = this;
    this.plots = {};
//    this.disabl

    this.init = function(){
        var parameters = ['RR', 'SDNN', 'SI'];
        for (var i in parameters){
            self.plots[parameters[i]] = new CardioMoodPlot();
            self.plots[parameters[i]].plotDivId = self.getDivIdByParameterName(parameters[i]);
            self.plots[parameters[i]].parameterName = parameters[i];
            self.plots[parameters[i]].initPlot();
        }
    }

    this.drawPlot = function(parameterName, timeArray, valuesArray){
        console.log('drawing plot ' + parameterName);
        console.log('to ');
        console.log(self.plots[parameterName]);
        if (self.plots[parameterName] == undefined){
            alert('no such plot');
            return;
        }
        self.plots[parameterName].updatePlot(timeArray, valuesArray);
    }

    this.getDivIdByParameterName = function(name){
        return $("div.cardiomoodPlot[data-parameterName=" + name +"]").attr('id');
    }
}