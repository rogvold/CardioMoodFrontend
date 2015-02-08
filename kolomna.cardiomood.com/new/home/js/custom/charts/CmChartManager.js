/**
 * Created by sabir on 07.10.14.
 */

var CmChartManager = function(){
    var self = this;
    this.points = [];
    this.selectedPoints = [];
    this.mainRRChart = undefined;
    this.scatterChart = undefined;
    this.spectrumChart = undefined;
    this.selectedRRChart = undefined;
    this.selectedRRHistogram = undefined;
    this.modalChart = undefined;
    this.mainRRChartDivId = 'RR_main_plot';
    this.modalPlotDivId = 'modal_plot';
    this.scatterRRChartDivId = 'RR_scatter_plot';
    this.spectrumChartDivId = 'RR_spectrum_plot';
    this.selectedRRChartDivId = 'RR_selected_plot';
    this.selectedRRHistogramDivId = 'histogram';
    this.selectedTextareaPointsDivId = 'selected_data_textarea';
    this.textareaPointsDivId = 'RR_data_textarea';
    this.selectionCursor = 0;
    this.selectionWindow = 2 * 60 * 1000;
    this.stepSize = 10 * 1000;
    this.shouldGenerateReport = false;
    this.customCharts = {};



    //generating params

    this.generatingStep = 5 * 1000;
    this.generatingWindow = 2 * 60 * 1000;
    this.generatingCursor = 0;
    this.generationParamsFactory = {"120000": [], "300000": [], "600000": []};
//    this.generationParamsStep = {"120000": 120000, "300000": [], "600000": []};

    this.paramsTablesHtmlFactory = {"120000": "wait please", "300000": "", "600000": ""};

    this.leftButtonDivId = 'leftButton';
    this.rightButtonDivId = 'rightButton';


    this.flushParameters = function(){
        console.log('flushParameters occured');
        self.selectionCursor = 0;
        self.generatingCursor = 0;
        self.generationParamsFactory = {"120000": [], "300000": [], "600000": []};
        self.shouldGenerateReport = false;
        self.flushDom();
    }

    this.flushDom = function(){
//        $('.params_table_placeholder').hide();
        $('.progress_placeholder').show();
        $('.progress_placeholder .progress-bar').css('width', '0%');
        $('.params_table_placeholder').html('');
    }

    this.init = function(){
        self.initRRPlots();
        self.initRadios();
        self.initNavButtons();
        self.initTableHead();
    }

    this.initRRPlots = function(){
        self.mainRRChart = new LineChart();
        self.mainRRChart.selectionCallback = self.selectedPointsCallback;
        self.mainRRChart.init(self.mainRRChartDivId);

        self.selectedRRChart = new LineChart();
        self.selectedRRChart.init(self.selectedRRChartDivId);

        self.selectedRRHistogram = new BarChart();
        self.selectedRRHistogram.init(self.selectedRRHistogramDivId);

        self.spectrumChart = new LineChart();
        self.spectrumChart.chartMode = "xy";
        self.spectrumChart.init(self.spectrumChartDivId);

        self.scatterChart = new ScatterChart();
        self.scatterChart.init(self.scatterRRChartDivId);

        self.modalChart = new LineChart();
        self.modalChart.init(self.modalPlotDivId);
    }

    this.selectedPointsCallback = function(selectedPoints){
        self.selectedPoints = selectedPoints;
        $('#' + self.selectedTextareaPointsDivId).val(self.selectedPoints.map(function(r){return r[1]}).join('\n'));
    }



    this.updateData = function(points){
        console.log('updateData occured: points = ');
        console.log(points);

//        console.log('updateData occured: ');
//        console.log(points);
        self.mainRRChart.drawPoints(points);
        self.points = points;
        self.generateInputTable();
        $('#' + self.textareaPointsDivId).val(self.points.map(function(r){return (r[0] + ', ' + r[1])}).join('\n'));
        self.selectWindow(self.selectionCursor, self.selectionWindow);
        setTimeout(function(){
            self.launchGenerating();
        }, 1000);

    }

    this.initRadios = function(){
        $('.windowRadio').bind('click', function(){
            $('.windowRadio').prop('checked', false);
            $(this).prop('checked', true);
            var m = $(this).attr('data-min');
            self.selectionWindow = m * 60 * 1000;
            self.selectWindow(self.selectionCursor, self.selectionWindow);
        });
        $('.stepRadio').bind('click', function(){
            $('.stepRadio').prop('checked', false);
            $(this).prop('checked', true);
            var s = $(this).attr('data-sec');
            self.stepSize = s * 1000;
            self.selectWindow(self.selectionCursor, self.selectionWindow);
        });
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

    this.calculateSpectrum = function(){
        var series = self.selectedPoints.map(function(r){return r[1]});
        $.ajax({
            url: 'http://calc.cardiomood.com/CardioMoodCalc/webresources/calc/getSpectrum',
            type: 'POST',
            data: {
                data: JSON.stringify({
                    series: series
                })
            },
            success: function(data){
                data = data.data;
                var arr = getSubArray(data, 200);
                self.spectrumChart.drawPoints(arr, 0.4);
            }
        });
    }

    this.fillParams = function(map){
        var s = '';
//        console.log(map);
        for (var key in map){
            $(".paramsVal[data-name=" + key +"]").html(map[key]);
        }
        $('.paramsVal').each(function(){
            var v = $(this).html();
            v = v * 1.0;
            var d = Math.pow(10, $(this).attr('data-floor'));
            $(this).html(Math.floor(v * d)*1.0 / d);
        });
//        $('#params_block').html(s);
    }

    this.initNavButtons = function(){
        $('#' + self.leftButtonDivId).bind('click', function(){
            self.selectionCursor = Math.max(self.selectionCursor - self.stepSize, 0);
            self.selectionCursor = Math.min(self.selectionCursor, Math.max(self.points[self.points.length - 1][0] - self.selectionWindow, 0));
            self.selectWindow(self.selectionCursor, self.selectionWindow);
        });
        $('#' + self.rightButtonDivId).bind('click', function(){
            self.selectionCursor = Math.min(self.selectionCursor + self.stepSize, self.points[self.points.length - 1][0]);
            self.selectionCursor = Math.min(self.selectionCursor, self.points[self.points.length - 1][0] - self.selectionWindow);
            self.selectWindow(self.selectionCursor, self.selectionWindow);
        });
    }

    this.selectWindow = function(from, duration){
        self.mainRRChart.selectRange(from, duration);
        self.selectedRRChart.drawPoints(self.selectedPoints);
        self.selectedRRHistogram.drawBars(self.selectedPoints);
        self.scatterChart.drawPoints(self.selectedPoints);
        self.updateParams();
        self.calculateSpectrum();
    }

    this.updateParams = function(){
        var points = self.selectedPoints;
        $('.paramsVal').html('wait...');
        $('#selectedNumber').html(points.length);
        self.calcSelectedParams(function(data){
            self.fillParams(data);
        });
    }

    this.generateInputTable = function(){
        var list = self.points;
        var s = '<table class="table table-bordered table-striped" id="input_rrs_table" ><tr><th>№</th><th>RR (ms)</th></tr>';
        for (var i in list){
            s+='<tr><td>' + (parseInt(i) + 1) + '</td><td>' + list[i][1] +'</td></tr>';
        }
        s+='</table>';
        $('#input_rr_placeholder').html(s);
    }

    this.launchGenerating = function(){
        console.log('launchGenerating occured');
        var headHtml = self.generateParamsTableHead();
//        var s = '<table class="table table-striped table-bordered" id="paramsTable" >' + headHtml + '</table>';
//        $('#calc_params_placeholder').html(s);
        self.shouldGenerateReport = true;
        self.generatingWindow = 2 * 60 * 1000
        self.generatingCursor = 0;
        $('#stress_plot').hide();
        self.recurGenerating(self.generatingWindow, function(){
            console.log('finished generating for window = 120sec');
            console.log(self.generationParamsFactory["120000"]);
            $('#stress_plot').show();
            self.updateStressChart();


            $('.progress_placeholder[data-epoch="2"]').hide();
            $('.params_table_placeholder[data-epoch="2"]').html(self.getParamsTableHtml(self.generationParamsFactory["120000"]));
            self.generatingWindow = 5 * 60 * 1000;
            self.generatingCursor = 0;
            self.recurGenerating(self.generatingWindow, function(){
                console.log('finished generating for window = 300sec');
                console.log(self.generationParamsFactory["300000"]);

                $('.progress_placeholder[data-epoch="5"]').hide();
                $('.params_table_placeholder[data-epoch="5"]').html(self.getParamsTableHtml(self.generationParamsFactory["300000"]));
                self.generatingWindow = 10 * 60 * 1000;
                self.generatingCursor = 0;
                self.recurGenerating(self.generatingWindow, function(){
                    console.log('finished generating for window = 600sec');
                    console.log(self.generationParamsFactory["600000"]);

                    $('.progress_placeholder[data-epoch="10"]').hide();
                    $('.params_table_placeholder[data-epoch="10"]').html(self.getParamsTableHtml(self.generationParamsFactory["600000"]));
                    console.log('finished generating');
                })
            });
        });
    }

    this.getParamsTableHtml = function(list){
        var s = '<table class="table table-striped table-bordered" >' + self.generateParamsTableHead();
        for (var i in list){
            var map = list[i];
            s+=self.getParamsRowHtml(parseInt(i) + 1,map["T"], map);
        }
        s+='</table>';
        return s;
    }

    this.recurGenerating = function(window, finishCallback){
        if (self.shouldGenerateReport == false){
            console.log('ABORTING GENERATION !!!');
            return;
        }
        if (self.generatingCursor > (self.points[self.points.length - 1][0] - window)){
            finishCallback();
            return;
        }
        var progress = Math.round(100 * self.generatingCursor / (self.points[self.points.length - 1][0] - window));
        var ep = window / 60000;
//        console.log(ep);
        $('.progress_placeholder[data-epoch="' + ep +'"] .progress-bar').css('width', progress + '%');
        $('.progress_placeholder[data-epoch="' + ep +'"] .progress-bar').attr('aria-valuenow', progress);
//        console.log(progress);
        var series = self.getRRsByStartAndWindow(self.generatingCursor, window);
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

    this.getRRsByStartAndWindow = function(start, window){
        var arr = [];
        for (var i in self.points){
            if (self.points[i][0] >= start && self.points[i][0] < (start + window)){
                arr.push(self.points[i][1]);
            }
        }
        return arr;
    }

    this.generateParamsTableHead = function(){
        var s = '<tr>';
        s+='<th>№</th><th class="paramsHeadItem" data-name="T" >T(sec.)</th>';
        for (var key in ParamsNameMap){
            s+='<th class="paramsHeadItem" data-name="' + key +'" >' + ParamsNameMap[key] +'</th>';
        }
        s+='</tr>';
        return s;
    }

    this.getParamsRowHtml = function(num, T, map){
        var s = '<tr>';
        s+='<td>' + num + '</td><td data-name="T" data-val="' + T +'" data-num="' + num + '" class="paramsTableItem" >' + T + '</td>';
        for (var key in ParamsNameMap){
            var v = map[key];
            var d = Math.pow(10, ParamsFloorMap[key]);
            v = Math.floor(v * d) * 1.0 / d;
            s+='<td data-val="' + v + '" data-num=' + num +' class="paramsTableItem" data-name="' + key +'" >' + v +'</td>';
        }
        s+='</tr>';
        return s;
    }

    this.initTableHead = function(){
        $('body').on('click', '.paramsHeadItem, .paramsTableItem', function (){
            var name = $(this).attr('data-name');
            var num = $(this).attr('data-num');
            var epoch = $(this).parents().find('.params_table_placeholder').attr('data-epoch');
            console.log('epoch='+epoch);
            $('.paramsHeadItem').removeClass('selected');
            $('.paramsHeadItem[data-name="' + name +'"]').addClass('selected');
            $('.paramsTableItem').removeClass('selected');
            $('.paramsTableItem[data-name="' + name +'"]').addClass('selected');
            $('.paramsTableItem[data-num="' + num +'"]').addClass('selected');
            var selectedData = {
                name: name
            }
            var arr = [];
            $('.params_table_placeholder[data-epoch="' + epoch + '"] .paramsTableItem[data-name="' + name +'"]').each(function(){
                var n = $(this).attr('data-num');
                var t = $('.paramsTableItem[data-name="T"][data-num="' + n +'"]').attr('data-val');
                arr.push([t * 1000, $(this).attr('data-val')]);
            });
            selectedData['data'] = arr;
            console.log(selectedData);
            $('#chartModal').modal();
            $('.modalName').text(ParamsNameMap[name] + ' (t)');
            self.modalChart.drawPoints(selectedData["data"]);
        });
    }

    this.addCustomLineChart = function(divId, name){
        var c = new LineChart();
        c.init(divId);
        self.customCharts[name] = c;
    }

    this.drawPointsInCustomChart = function(name, points){
        var c = self.customCharts[name];
        c.drawPoints(points);
        console.log('draw to ' + name);
        console.log(points);
    }

    this.extractPointsFromTable = function(epoch, paramName){
        var arr = [];
        var list = self.generationParamsFactory[(epoch * 60000) + ""];
        for (var i in list){
            arr.push([list[i]["T"]*1000, list[i][paramName]]);
        }
        return arr;
    }

    this.updateStressChart = function(){
        var points = self.extractPointsFromTable(2, 'SI');
        console.log('stress points: ');
        console.log(points);
        self.drawPointsInCustomChart('stress', points);
    }

}

function getSubArray(arr, len){
    var arr2 = [];
    for (var i in arr){
        if (i < len){
            arr2.push(arr[i]);
        }
    }
    return arr2;
}

var ParamsNameMap = {
    "count": "n",
    "artifactsCount":"artif. count",
    "mRR":"mRR",
    "SDNN":"SDNN",
    "RMSSD":"RMSSD",
    "pNN50":"pNN50",
    "TP":"TP",
    "ln_TP":"ln(TP)",
    "VLF":"VLF",
    "VLF_percent":"VLF%",
    "ln_VLF":"ln(VLF)",
    "LF":"LF",
    "LF_percent":"LF%",
    "ln_LF":"ln(lF)",
    "HF":"HF",
    "HF_percent":"HF%",
    "ln_HF":"ln(HF)",
    "LF_over_HF":"LF/HF",
    "LF_norm":"LF norm",
    "HF_norm":"HF norm",
    "VLF_over_HF":"VLF/HF",
    "IC":"IC",
    "Mo":"Mo",
    "Amo":"Amo",
    "SI":"SI",
    "MxDMn":"MxDMn",
    "WN5":"WN5",
    "WN4":"WN4",
    "WN1":"WN1",
    "HRVTi":"HRVTi"
}

var ParamsFloorMap = {
    "count": 0,
    "artifactsCount": 2,
    "mRR": 2,
    "SDNN": 2,
    "RMSSD": 2,
    "pNN50": 2,
    "TP": 2,
    "ln_TP": 2,
    "VLF": 2,
    "VLF_percent": 2,
    "ln_VLF": 2,
    "LF": 2,
    "LF_percent": 2,
    "ln_LF": 2,
    "HF": 2,
    "HF_percent": 2,
    "ln_HF": 2,
    "LF_over_HF": 4,
    "LF_norm": 2,
    "HF_norm": 2,
    "VLF_over_HF": 2,
    "IC": 4,
    "Mo": 2,
    "Amo": 2,
    "SI": 2,
    "MxDMn": 2,
    "WN5": 2,
    "WN4": 2,
    "WN1": 2,
    "HRVTi": 2
}