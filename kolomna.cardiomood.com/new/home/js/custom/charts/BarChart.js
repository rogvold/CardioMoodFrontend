/**
 * Created by sabir on 07.10.14.
 */

var BarChart = function(){
    var self = this;
    this.bars = [];
    this.barWidth = 50;
    this.divId = '';
    this.placeholder = undefined;
    this.data = undefined;

    this.options = {
        series: {
            bars: {
                barWidth: self.barWidth,
                fillColor: "#FF604F",
                lineWidth: 1
            }
        },
        grid: {
            borderWidth: 1,
            borderColor: '#848ca1'
        }

    };

    this.init = function(divId){
        if (divId == undefined || divId == ""){
            alert('divId is not defined');
            return;
        }
        self.divId = divId;
        self.placeholder = $('#' + divId);
        self.plot = $.plot(self.placeholder, [self.bars], self.options);
    }

    this.drawBars = function(points){
        self.bars = self.convertPointsToBars(points);
//        console.log(self.bars);
        self.data = {
            bars: {show: true},
            data: self.bars
        };
        self.plot = $.plot(self.placeholder, [self.data], self.options);
    }


    this.convertPointsToBars = function(points){
        var arr = [];
        for (var i = 0; i < 100; i++){
            arr.push(0);
        }

        for (var i in points){
            var r = points[i][1];
            var k = Math.floor(r / self.barWidth);
//            console.log(k);
            arr[k] = arr[k] + 1;
        }
        var res = [];
        res.push([0, 0]);
        for (var i in arr){
            if (arr[i] == 0){ continue;}
            res.push([i * self.barWidth, arr[i]]);
        }
//        var w = res[res.length - 1][0] - res[0][0];
        res.push([2000, 0]);

        return res;
    }
}