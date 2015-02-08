/**
 * Created by sabir on 07.10.14.
 */

var ScatterChart = function(){
    var self = this;
    this.scatterPoints = [];
    this.data = undefined;
    this.bars = [];
    this.barWidth = 50;
    this.divId = '';
    this.placeholder = undefined;
    this.data = undefined;

    this.options = {
        series: {
            points: {
                radius: 3,
                show: true,
                fill: true,
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
        self.plot = $.plot(self.placeholder, [self.scatterPoints], self.options);
    }

    this.drawPoints = function(points){

        console.log('ScatterChart drawPoints occured: points = ');
        console.log(points);


        self.scatterPoints = self.convertPointsToScatterPoints(points);
        self.data = {
            data: self.scatterPoints
        };
        var p1 = self.getLeftBottomPoint();
        var p2 = self.getRightTopPoint();
        var dx = Math.floor((p2.xMax - p1.xMin) * 0.3);
        var dy = Math.floor((p2.yMax - p1.yMin)*0.3);
        var d = Math.max(dx, dy);
        var t1 = Math.min(p1.xMin, p1.yMin) - d;
        var t2 = Math.max(p2.xMax, p2.yMax) + d;
        var line = {
            data: [[t1, t1],[t2, t2]],
            lines: {show: true}
        }
//        console.log(line);
        self.plot = $.plot(self.placeholder, [self.data, line], self.options);
    }

    this.getLeftBottomPoint = function(){
        var list = self.scatterPoints;
        var xMin = list[0][0];
        var yMin = list[0][1];
        for (var i in list){
            if (list[i][0] < xMin){
                xMin = list[i][0];
            }
            if (list[i][1] < yMin){
                yMin = list[i][1];
            }
        }
        return {"xMin": xMin, "yMin": yMin};
    }

    this.getRightTopPoint = function(){
        var list = self.scatterPoints;
        var xMax = list[0][0];
        var yMax = list[0][1];
        for (var i in list){
            if (list[i][0] > xMax){
                xMax = list[i][0];
            }
            if (list[i][1] > yMax){
                yMax = list[i][1];
            }
        }
        return {"xMax": xMax, "yMax": yMax};
    }

    this.convertPointsToScatterPoints = function(points){
        var arr = [];
        for (var i = 1; i < points.length; i++){
            arr.push([points[i-1][1], points[i][1]]);
        }
        return arr;
    }
}