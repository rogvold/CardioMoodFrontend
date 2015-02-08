/**
 * Created by sabir on 04.02.15.
 */

var DoctorUserCalculationManager = function(){
    var self = this;
    this.secondsSteps = [2 * 60 * 1000, 5 * 60 * 1000, 10 * 60 * 1000];
    this.generationParamsFactory = {"120000": [], "300000": [], "600000": []};
    this.generatingCursor = 5 * 1000;
    this.exportData = [];
    this.points = [];
    this.generatingCursor = 0;
    this.generatingStep = 5 * 1000;
    this.excelManager = new ExcelManager();
    this.generateReportLinkId = 'generateReportButton';
    this.generateReportMessageId = 'generateReportMessageId';
    this.generatingButtonsBlockId = 'generatingButtonsBlock';
    this.sessionName = '';
    this.dateString = '';

    this.init = function(){
        self.initReportLinks();
    }

    this.calcSelectedParams = function(callback){
        var series = self.selectedPoints.map(function(r){return r[1]});
        $.ajax({
            url: 'http://calc.cardiomood.com/CardioMoodCalc/webresources/calc/getParams',
            type: 'POST',
            data: {
                data: JSON.stringify({
                    series: series
                })
            },
            success: function(data){
                data = data.data;
                callback(data);

            }
        });
    }

    this.recurGenerating = function(window, finishCallback){
        if (self.generatingCursor > (self.points[self.points.length - 1][0] - window)){
            finishCallback();
            return;
        }
        var progress = Math.round(100 * self.generatingCursor / (self.points[self.points.length - 1][0] - window));
        var ep = window / 60000;
//        console.log(ep);
        $('.progress_placeholder[data-epoch="' + ep +'"] .progress-bar').css('width', progress + '%');
        $('.progress_placeholder[data-epoch="' + ep +'"] .progress-bar').attr('aria-valuenow', progress);
        var series = self.getRRsByStartAndWindow(self.generatingCursor, window);
        console.log('series = ', series);
        $.ajax({
            url: 'http://calc.cardiomood.com/CardioMoodCalc/webresources/calc/getParams',
            type: 'POST',
            data: {
                data: JSON.stringify({
                    series: series
                })
            },
            success: function(data){
                map = data.data;
                map["T"] = self.generatingCursor / 1000;
                var k = window + "";
                self.generationParamsFactory[k].push(map);
//                self.generatingCursor += window;
                self.generatingCursor += self.generatingStep;
                self.recurGenerating(window, finishCallback); //
//                self.recurGenerating(cur + window, window, finishCallback);
            }
        });
    }

    this.launchGenerating = function(points){
        console.log('launchGenerating: points = ', points);
        self.points = points;
        self.generatingWindow = 2 * 60 * 1000
        self.generatingCursor = 0;
        self.generatingStep = 5 * 1000;
        console.log('generating for 2 min.');
        self.recurGenerating(self.generatingWindow, function(){
            console.log('generating for 5 min.');
            self.generatingWindow = 5 * 60 * 1000;
            self.generatingCursor = 0;
            self.recurGenerating(self.generatingWindow, function(){
                console.log('generating for 10 min.');
                self.generatingWindow = 10 * 60 * 1000;
                self.generatingCursor = 0;
                self.recurGenerating(self.generatingWindow, function(){
                    console.log('finished generating');
                    console.log(self.generationParamsFactory);
                    $('#generatingButtonsBlock').show();
                    $('#generateReportMessageId').hide();
                });
            });
        });
    }

    this.getRRsByStartAndWindow = function(start, window){
        console.log('getRRsByStartAndWindow: start  = ' + start + ' ; window = ' + window);
        var arr = [];
        for (var i in self.points){
            if (self.points[i][0] >= start && self.points[i][0] < (start + window)){
                arr.push(self.points[i][1]);
            }
        }
        return arr;
    }

    this.initReportLinks = function(){
        $('.reportLink').bind('click', function(){
            var window = $(this).attr('data-window');
            var list = self.generationParamsFactory[window];
            console.log(list);
            if (list.length == 0){
                alert('nothing to export');
                return;
            }
            var header = [];
            header.push('T, sec');
            for (var key in list[0]){
                header.push(key);
            }
            var data  = [];
            for (var i in list){
                var arr = [];
                arr.push(list[i]['T']);
                for (var key in list[i]){
                    arr.push(list[i][key]);
                }
                data.push(arr);
            }
            self.excelManager.exportToExcel(self.sessionName, header, data, self.dateString)
        });
    }


}