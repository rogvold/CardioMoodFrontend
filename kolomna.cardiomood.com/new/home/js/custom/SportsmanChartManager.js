/**
 * Created by sabir on 13.11.14.
 */

var SportsmanChartManager = function(){
    var self = this;
    this.hrDivId = 'HeartRateDiv';
    this.sdnnDivId = 'SDNNDiv';
    this.stressDivId = 'StressDiv';

    this.heartRateChart = new LineChart();
    this.sdnnChart = new LineChart();
    this.stressChart = new LineChart();

    this.init = function(){
        self.heartRateChart = new LineChart();
        self.heartRateChart.init(self.hrDivId);
        self.sdnnChart = new LineChart();
        self.sdnnChart.init(self.sdnnDivId);
        self.stressChart = new LineChart();
        self.stressChart.init(self.stressDivId);
    }



}