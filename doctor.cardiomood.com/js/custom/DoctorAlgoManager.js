/**
 * Created by sabir on 09.01.15.
 */

var DoctorAlgoManager = function(){
    var self = this;
    this.selectedPointsArray = [];
    this.chartManager = new CmChartManager();

    this.init = function(){
        self.initAddButton();
        self.initFilterButton();
        self.chartManager.init();
    }


    this.initAddButton = function(){
        $('#addButton').bind('click', function(){
            var rrs = $('#importTextarea').val().replace(',', '').replace(' ', '').split('\n').map(function(s){return parseInt(s);});
            console.log(rrs);

            var arr = [];
            var t = 0;
            for (var i in rrs){
                arr.push([t, rrs[i]]);
                t+=rrs[i];
            }
            self.selectedPointsArray = arr;
            console.log('selectedPointsArray = ', self.selectedPointsArray);
            self.drawPlots();
        });
    }


    self.drawPlots = function(){
        var points = self.selectedPointsArray;
        console.log('starting drawing points', points);
        self.chartManager.updateData(self.selectedPointsArray);
    }



    this.initFilterButton = function(){
        $('#filterButton').bind('click', function(){
            self.filterSelectedPointsArray(function(){
                self.drawPlots();
            });
        });
    }

    this.filterSelectedPointsArray = function(callback){
        var series = self.selectedPointsArray.map(function(r){return r[1]});
        if (series.length == 0){
            return;
        }
        enablePreloader();
        $.ajax({
            url: 'http://calc.cardiomood.com/CardioMoodCalc/webresources/calc/filterRRs',
            type: 'POST',
            data: {
                data: JSON.stringify({
                    series: series
                })
            },
            success: function(data){
                disablePreloader();
                data = data.data;
                var list = data;
                for (var i in list){
                    self.selectedPointsArray[i][1] = list[i];
                }
                callback();
            }
        });
    }

}