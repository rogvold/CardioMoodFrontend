CardioSpectrum = function(intervals){
    var self = this;
    this.series = intervals;
    
    this.getSpectrum = function(intervals){
        var d = {
            data: {
                series: intervals,
                method: 'spectrum'
            }
        }

        $.ajax({
            url: '/CardioDataWeb/resources/calc/getSpectrum',
            //            data: JSON.stringify(d),
            //            data: {
            //                data : d
            //            },
            //            data: JSON.stringify(d),
            data: {
                data: JSON.stringify({
                    series: intervals,
                    method: 'spectrum'
                })
                
            },
            type: 'POST',
            //            dataType: 'json',
            contentType: "application/json",
            success:function(data){
                console.log(data);
                //                alert(data);
                var sp = data.data;
                sp = self.cutSpectrum(sp, 0.5);
                self.drawSpectrum(sp);
            }
        });
    }
    
    this.drawSpectrum = function(sp){
        self.drawPlot('spectrumPlot', sp);
    }
    
    this.cutSpectrum = function(sp, maxFreq){
        var arr = new Array();
        for (var i in sp){
            if (sp[i][0] < maxFreq){
                console.log('adding ' + sp[i][0]);
                arr.push([sp[i][0], sp[i][1]]);
            }
        }
        return arr;
    }
    
    this.drawPlot = function(divId, intervals){
        var options = {
        //            xaxis: {
        //                mode: "time"
        //            }
        }
        $.plot('#' + divId, [intervals], options);
    }
    
}