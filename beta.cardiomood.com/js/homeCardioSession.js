CardioSessionManager = function(){
    var self = this;
    this.token = undefined;
    this.userId = undefined;
    this.serverId = 51;
    this.email = undefined;
    this.currentSessionId = undefined;
    this.base = "http://data.cardiomood.com";
    this.currentSession = undefined;
    this.updatingEnabled = true;
    //    this.stressGauge = undefined;
    
    this.pulseChart = undefined;
    this.stressChart = undefined;
    this.sigmaChart = undefined;
    
    this.gaugeStressChart = undefined;
    this.gaugeSigmaChart = undefined;
    
    
    this.currentSessionStressData = undefined;
    this.currentSessionSigmaData = undefined;
    this.currentSessionPulsePlotData = undefined;
    
    this.updatingInterval = undefined;
    
    this.currentSessionStartDate = undefined;
    this.currentSessionEndDate = undefined;
    
//    this.optimalPointsNumber = 1000;
    this.optimalPointsNumber = 1000;

    this.init = function(){
        self.token = getStringFromLocalStorage('token');
        self.userId = getStringFromLocalStorage('userId');
        self.email = getStringFromLocalStorage('email');
        $('#email').text(self.email);
        $('#userId').text(self.userId);
        $('#userNameSpan').html(self.email);
        self.currentSessionId = gup('sessionId');
        $('#sessionId').text(self.currentSessionId);
        moment.lang('ru');
        
        
        
        $('#energyTab').click(function(){
            setTimeout(function(){
                self.prepareSigmaPlot();
            }, 500);
        });
        $('#stressTab').click(function(){
            setTimeout(function(){
                self.prepareTensionPlot();
            }, 500);
        });
        $('#pulseTab').click(function(){
            setTimeout(function(){
                self.preparePulsePlot();
            }, 500);
        });
        
        self.initUpdateNameButton();
    }


    this.decimatePlotData = function(data){
        console.log('decimatePlotData occured');
        if (data == undefined){
            return undefined;
        }
        var len = data.length;
        if (len < self.optimalPointsNumber * 2){
            return data;
        }
        var k = Math.floor(len / self.optimalPointsNumber);
        
        console.log('k = ' + k);
        
        var data2 = [];
        for (var i =0; i < len; i+=k){
            var a2 = {
                date: data[i].date,
                rr: data[i].rr,
                lineColor: data[i].lineColor
            }
            data2.push(a2);
        }
        return data2;
    }
    
    this.loadSessionList = function(){
        $.ajax({
            url: self.base + '/CardioDataWeb/resources/cardioSession/getCardioSessionsOfUser',
            type: 'POST',
            //            contentType: 'application/json',
            data: {
                token: self.token,
                userId: self.userId,
                serverId: self.serverId
            },
            success: function(data){
                if (data.responseCode == 20){
                    window.location.href = 'login.html?autologin=1';
                }
                if (data.responseCode == 0){
                    alert(data.error.message);
                    return;
                }
                //                console.log(data.data);
                var list = data.data;
                list.sort(function(a,b) {
                    if (a.creationTimestamp > b.creationTimestamp ) return -1;
                    if (a.creationTimestamp < b.creationTimestamp ) return 1;
                    return 0;
                } );
                self.prepareSessionsTable(list);
            //                self.initStressGauge();
            //                self.setStress(120);
            },
            error: function(){
            //                alert('error');
            }
        });
    }

    this.loadCurrentSession = function(){
        $.ajax({
            url: self.base + '/CardioDataWeb/resources/cardioSession/getCardioSessionData',
            type: 'POST',
            data: {
                token: self.token,
                userId: self.userId,
                sessionId: self.currentSessionId
            },
            success: function(data){
                if (data.responseCode == 20){
                    window.location.href = 'login.html?autologin=1';
                }
                if (data.responseCode == 0){
                    alert(data.error.message);
                    if (data.error.message == 'token is not valid'){
                        window.location.href="login.html?autologin=1";
                    }
                    return;
                }
                //                console.log(data.data);
                self.currentSession = data.data;
                self.prepareCurrentSessionBlock(data.data);
                $('#mainPanel').fadeIn();
                $('#splashPanel').fadeOut();
            },
            error: function(){
                alert('error');
            }
        });
    }
    
    

    this.loadTensionPoints = function(intervals, timestamps, callback){
        $.ajax({
            url: self.base + '/CardioDataWeb/resources/calc/getTension',
            data: {
                data: JSON.stringify({
                    series: intervals,
                    //                    time: timestamps,
                    method: 'tension'
                })
            },
            type: 'POST',
            success:function(data){
                //                console.log(data);
                self.currentSessionStressData = data.data;
                callback(data.data);
            }
        });
    }
    
    this.loadSigmaPoints = function(intervals, timestamps, callback){
        $.ajax({
            url: self.base + '/CardioDataWeb/resources/calc/getSDNN',
            data: {
                data: JSON.stringify({
                    series: intervals,
                    //                    time: timestamps,
                    method: 'tension'
                })
                
            },
            type: 'POST',
            success:function(data){
                //                console.log(data);
                self.currentSessionSigmaData = data.data;
                callback(data.data);
            }
        });
    }
    
    this.clearAllGraphs = function(){
        if (self.pulseChart != undefined){
            self.pulseChart.dataProvider = [];
            self.pulseChart.validateData();
        }
        if (self.stressChart != undefined){
            self.stressChart.dataProvider = [];
            self.stressChart.validateData();
        }
        if (self.sigmaChart != undefined){
            self.sigmaChart.dataProvider = [];
            self.sigmaChart.validateData();
        }
    }
    
    this.initUpdatingInterval = function(){
        setInterval(function(){
            console.log('initUpdatingInterval');
            if (($('.sessionsListItem.active').hasClass('freshSession') == false) || (self.updatingEnabled == false)){
                console.log('not active...');
                return;
            }
            console.log('active');
            
            //            self.currentSessionPulsePlotData = pulsePlotData;
            //            self.preparePulsePlot(pulsePlotData);
            //        
            //            self.loadTensionPoints(intervals, self.prepareTensionPlot);
            //        
            //            self.loadSigmaPoints(intervals, self.prepareSigmaPlot);
            self.loadCurrentSession();
            
        //            self.prepareSigmaPlot();
        //            self.prepareTensionPlot();
        //            self.preparePulsePlot();
        }, 5000);
    }

    this.prepareSessionsTable = function(list){
        var s = '';
        for (var i in list){
            var firstClass = (i == 0) ? 'freshSession' : '';
            var s2 = '<li class="sessionsListItem '+ firstClass +'" data-sessionId="' + list[i].id +'" ><a href="javascript: void(0);">';
            var name = (list[i].name == undefined) ? 'session ' : list[i].name;
            s2+= '<span class="sessionName" >' + name + '</span>';
            s2+='<span class="badge badge-success badge-roundless userTab selectedUserLabel" >' + moment(list[i].creationTimestamp).format('DD.MM.YYYY HH:mm:ss') +'</span>';
            s2+= '</a></li>';
            s+=s2;
        }
        $('#main-menu').append(s);
        $('.sessionsListItem').bind('click', function(){
            self.currentSessionId = $(this).attr('data-sessionId').trim();
            //            console.log(self.currentSessionId);
            self.clearAllGraphs();
            $('#mainPanel').fadeOut();
            $('#splashPanel').fadeIn();
            $('.sessionsListItem').removeClass('active');
            $(this).addClass('active');
            self.loadCurrentSession();
        });
        $('li.sessionsListItem:first').click();
        self.initUpdatingInterval();
    }
    
    this.initRRIntervalsPlot = function(intervals){
        console.log('initRRIntervalsPlot occured');
        if (intervals == undefined || intervals.length == 0){
            return;
        }
        var arr = [];
        //        var set = {}; // added
        for (var i in intervals){
            //            if (set[d.creationTimestamp] != undefined){
            //                console.log('skipping......');
            //                continue;
            //            }
            var d = intervals[i].dataItem;
            var p = Math.floor(600000 / JSON.parse(d.dataItem).r) / 10.0;
            //            set[d.creationTimestamp] = 1;
            arr.push([d.number, p]);
        }
        console.log(set);
    }
    

    
    this.setStress = function(v){
        console.log('setting stress');
        if (v == NaN){
            console.log('skipping...');
            return;
        }
        var t = v;
        t = Math.floor(t);
        $('#stressVal').text(t);
        //        self.stressGauge.set(t);
        var rainbow = new Rainbow();
        //                            rainbow.setSpectrum('#f56954', '#00a65a');
        rainbow.setSpectrum('#00a65a', '#f56954');
        rainbow.setNumberRange(0, 401); 
        //        console.log(t);
        var col = rainbow.colourAt(Math.floor(t));
        col = '#'+col;
        $('div.tile-stats.tile-aqua').css('background-color', col);
        
        if ($('#stressGauge').is(':visible') == false){
            return;
        }
        
        if (self.gaugeStressChart == undefined){
            console.log('gaugeStressChart initing');
            self.gaugeStressChart = AmCharts.makeChart("stressGauge", {
                "type": "gauge",
                "fontSize": 9,
                "theme": "none",    
                "axes": [{
                    "axisThickness":1,
                    "bands": [{
                        "color": "#84b761",
                        "endValue": 150,
                        "startValue": 0
                    }, {
                        "color": "#fdd400",
                        "endValue": 200,
                        "startValue": 150
                    }, {
                        "color": "#cc4748",
                        "endValue": 300,
                        "startValue": 200
                    }],
                    "endValue": 300
                }],
                "arrows": [{
                    value: Math.min(300, v)
                }]
            });
        }else{
            //            self.gaugeStressChart.arrows[0].setValue(v);
            self.gaugeStressChart.arrows[0].setValue(Math.min(300, v));
        //            self.gaugeStressChart.validateData();
        }
        
        
    }
    
    this.initStressGauge = function(){
        if (self.gaugeStressChart == undefined){
            console.log('');
            self.gaugeStressChart = AmCharts.makeChart("stressGauge", {
                "type": "gauge",
                "theme": "none",    
                "axes": [{
                    "axisThickness":1,
                    "bands": [{
                        "color": "#84b761",
                        "endValue": 150,
                        "startValue": 0
                    }, {
                        "color": "#fdd400",
                        "endValue": 200,
                        "startValue": 150
                    }, {
                        "color": "#cc4748",
                        "endValue": 300,
                        "startValue": 200
                    }],
                    "endValue": 300
                }],
                "arrows": [{}]
            });
        }
        
    }
    
        
    this.setPulse = function(v){
        $('#pulseVal').text(Math.floor(v));
    }
    
    this.getSigmaPercents = function(x){
        if (x == undefined){
            return undefined;
        }
        if (x < 15){
            return 6.0*x;
        }
        return (100 - 50.0/(14.85*Math.log(x) - 40));
    }
    
    this.setEnergyPercents = function(v){
        
        //        $('#energyVal').text(Math.floor(v) + '%');
        $('#energyVal').text(Math.floor(v * 100.0)/ 100.0);
        
        //        v = Math.min(v * 100.0 / 40.0, 100.0)
        v = self.getSigmaPercents(v);
        //        console.log(v);
        var t = self.getSigmaPercents(v) + '%';
        
        var rainbow = new Rainbow();
        rainbow.setSpectrum('#f56954', '#00a65a');
        rainbow.setNumberRange(0, 101); 
        var col = rainbow.colourAt(Math.floor(v));
        col = '#'+col;
        
        $('.tile-stats.tile-green').css('background-color', col);
        
        v = 100.0 - v;
        
        if (self.gaugeSigmaChart == undefined){
            console.log('gaugeStressChart initing');
            self.gaugeSigmaChart = AmCharts.makeChart("sigmaGauge", {
                "type": "gauge",
                //                "adjustSize": true,
                "fontSize": 0,
                "theme": "none",
                
                "axes": [{
                    "axisThickness":1,
                    "bands": [{
                        "color": "#84b761",
                        "startValue": 0,
                        "endValue": 10
                    }, {
                        "color": "#fdd400",
                        "startValue": 10,
                        "endValue": 76
                    }, {
                        "color": "#cc4748",
                        "startValue": 76,
                        "endValue": 100
                    }],
                    "endValue": 100
                }],
                "arrows": [{
                    value: v
                }]
            });
        }else{
            //            self.gaugeStressChart.arrows[0].setValue(v);
            self.gaugeSigmaChart.arrows[0].setValue(v);
        //            self.gaugeStressChart.validateData();
        }
        
    //        setTimeout(function(){
    //            $('.innerEnergy').css('background-color', col);
    //        }, 100);
    //        $('.innerEnergy').animate({
    //            height: t
    //        }, 100);
    }

    this.initUpdateNameButton = function(){
        $('#currentSessionRenameButton').click(function(){
            var newName = $('#currentSessionTextarea').val();
            if (newName == undefined || newName == ''){
                alert('Пустое название. Введите, пожалуйста, название сессии.');
                return;
            }
            $.ajax({
                url: self.base + '/CardioDataWeb/resources/cardioSession/renameCardioSession',
                type: 'POST',
                data: {
                    token: self.token,
                    userId: self.userId,
                    sessionId: self.currentSessionId,
                    name: newName
                },
                success: function(data){
                    if (data.responseCode == 20){
                        window.location.href = 'login.html?autologin=1';
                    }
                    if (data.responseCode == 0){
                        alert(data.error.message);
                        if (data.error.message == 'token is not valid'){
                            window.location.href="login.html?autologin=1";
                        }
                        return;
                    }
                    self.updatingEnabled = true;
                    //                console.log(data.data);
                    $('#currentSessionName').text(newName);
                    $('#currentSessionRenameBlock').hide();
                    $('#currentNameBlock').show();
                    alert('название успешно обновлено');
                }
                
            });
        });
    }

    this.prepareCurrentSessionBlock = function(session){
        console.log('prepareCurrentSessionBlock occured');
        //        console.log(session);
        var dataItems = session.dataItems;
        var sName = (session.name == undefined) ? ('session #' + session.id) : session.name;
        $('.currentSessionName').text(sName);
        $('#currentSessionTextarea').val(sName);
        
        //        $('.currentSessionStartDateSpan').text(moment(session.creationTimestamp).format('DD.MM.YYYY HH:mm:ss'));
        $('.currentSessionStartDateSpan').text(moment(session.creationTimestamp).format('LLLL'));
        
        //        var arr = self.getIntervalsFromDataItemsArray(dataItems);
        var arr2D = self.get2DArrayFromDataItemsList(dataItems);
        //        var s = arr.join('\n');
        //        $('#intervalsNumber').text(arr.length);
        var dur = arr2D[arr2D.length - 1][0] - arr2D[0][0];
        console.log('dur = ' + dur);
        //        $().text(moment(session.creationTimestamp).format('DD.MM.YYYY HH:mm:ss'));
        var hs = moment.duration(dur).hours() > 0 ? (moment.duration(dur).hours() + ' h. ') : '';
        $('.currentSessionDurationSpan').text(' ' + hs  +moment.duration(dur).minutes() + ' m. ' + moment.duration(dur).seconds() + ' s.');
        //        $('#intervalsArea').val(s);
        
        var lastInterval = JSON.parse(dataItems[dataItems.length - 1].dataItem).r;
        
        //        self.initRRIntervalsPlot(session.dataItems);
        self.setPulse(Math.floor(60000/lastInterval));
        var pulsePlotData = self.getPulseArrayFromDataItems(dataItems);
        
        var intervals = self.getIntervalsFromDataItemsList(dataItems);
        var timestamps = self.getTimestampsFromDataItemsList(dataItems);
        self.currentSessionStartDate = new Date(dataItems[0].creationTimestamp); // ololo
        self.currentSessionEndDate = new Date(dataItems[dataItems.length - 1].creationTimestamp); // ololo
        
        //        console.log(pulsePlotData);
        setTimeout(function(){
            self.currentSessionPulsePlotData = pulsePlotData;
            self.preparePulsePlot(pulsePlotData);
        }, 250);
        
        setTimeout(function(){
            self.loadTensionPoints(intervals, timestamps, self.prepareTensionPlot);
        }, 1000);
        
        setTimeout(function(){
            self.loadSigmaPoints(intervals, timestamps, self.prepareSigmaPlot);
        }, 1500);
        
    }
    
    this.prepareTensionPlot = function(intervals){
        
        if (intervals == undefined && self.currentSessionStressData == undefined){
            return;
        }
        if (intervals == undefined){
            intervals = self.currentSessionStressData;
        }
        var arr = [];
        
        //        intervals[1].unshift(intervals[1][0]);
        //        intervals[0].unshift(self.currentSessionStartDate);
        //        
        //        intervals[1].push(intervals[1][intervals[1].length - 1]);
        //        intervals[0].push(self.currentSessionEndDate);
        
        var t0 = self.currentSession.creationTimestamp;
        var lineColor = "#D2691E";
        
        for (var i in intervals[0]){
            lineColor = "#D2691E";
            if (intervals[1][i] < 200){
                lineColor = "#fdd400";
            }
            if (intervals[1][i] < 150){
                lineColor = "#84b761";
            }
            arr.push({
                //                date: new Date(intervals[0][i]),
                //                date: moment(intervals[0][i]).format('h:m:s'),
                //                dateVal: intervals[0][i],
                date: new Date(intervals[0][i] + t0),
                rr: intervals[1][i],
                lineColor: lineColor
            });
        }
        //        console.log(arr);
        
        var lastTension = intervals[1][intervals[1].length - 1];
        //        var firstTension = intervals[1][0];
        self.setStress(lastTension);
       
        //        intervals[1].unshift(firstTension);
        //        intervals[0].unshift(self.currentSession.creationTimestamp);
       
        if ($('#stressChart').is(':visible') == false){
            return;
        }
        console.log('drawing stress');
        //        console.log(intervals);
       
       
        if (self.stressChart == undefined){
            console.log('preparing tension plot....');
            var decimatedArr = self.decimatePlotData(arr);
            self.stressChart = AmCharts.makeChart("stressChart", {
                type: "serial",
                "dataProvider": decimatedArr,
                //                "dataProvider": arr,
                
                "pathToImages": "http://www.amcharts.com/lib/3/images/",
                
                "categoryField": "date",
                "categoryAxis": {
                    "minPeriod": "ss",
                    "parseDates": true,
                    "minimum": self.currentSessionStartDate,
                    "maximum": self.currentSessionEndDate
                //                    "minimum": new Date(self.currentSession.creationTimestamp)
                },
                "valueAxes": [{
                    "axisAlpha": 0.2,
                    "dashLength": 1,
                    "position": "left"
                }],
                "graphs": [{
                    "id":"g1",
                    "balloonText": "[[category]]<br /><b><span style='font-size:14px;'>value: [[value]]</span></b>",
                    "bullet": "round",
                    "bulletBorderAlpha": 1,
                    "bulletColor":"#FFFFFF",
                    "hideBulletsCount": 50,
                    "title": "red line",
                    "valueField": "rr",
                    
                    //                    "lineColorField": "lineColor",
                    //                    "fillColorsField": "lineColor",
                    //                    "fillAlphas": 0.8,
                    
                    "useLineColorForBulletBorder":true
                }],
            
                "chartScrollbar": {
                    "autoGridCount": true,
                    "graph": "g1",
                    "scrollbarHeight": 40
                }
            });
        }else{
            setTimeout(function(){
                self.stressChart.dataProvider = self.decimatePlotData(arr);
                self.stressChart.validateData();
            }, 300);
            
        }
    }
    
    
    this.prepareSigmaPlot = function(intervals){
        console.log('preparing sigma plot');

        if (intervals == undefined && self.currentSessionSigmaData == undefined){
            return;
        }
        if (intervals == undefined){
            intervals = self.currentSessionSigmaData;
        }
        
        var lastSigma = intervals[1][intervals[1].length - 1];
        if (lastSigma != NaN){
            self.setEnergyPercents(lastSigma);
        }
        
        //        self.setEnergyPercents(Math.min(lastSigma * 100.0 / 40.0, 100.0));
        
        var arr = [];
        var t0 = self.currentSession.creationTimestamp;
        
        //        intervals[1].unshift(intervals[1][0]);
        //        intervals[0].unshift(self.currentSessionStartDate);
        //        
        //        intervals[1].push(intervals[1][intervals[1].length - 1]);
        //        intervals[0].push(self.currentSessionEndDate);
        var lineColor = "";
        for (var i in intervals[0]){
            lineColor = "#84b761";
            if (intervals[1][i] < 15){
                lineColor = "#fdd400";
            }
            if (intervals[1][i] < 4){
                lineColor = "#D2691E";
            }
            arr.push({
                //                date: new Date(intervals[0][i]),
                //                dateVal: intervals[0][i],
                date: new Date(intervals[0][i] + t0),
                //                dateVal: moment(intervals[0][i]).format('h:m:s'),
                rr: intervals[1][i],
                lineColor: lineColor
            });
        }
        //        console.log(arr);
        
        //        var firstSigma = intervals[1][0];
        //        

        
        console.log('preparing sigma plot ');
        //        console.log(intervals);
        
        if ($('#sigmaChart').is(':visible') == false){
            return;
        }
        var decimatedArr = self.decimatePlotData(arr);
        
        if (self.sigmaChart == undefined){
            console.log('preparing sigma plot....');
            self.sigmaChart = AmCharts.makeChart("sigmaChart", {
                type: "serial",
                //                "dataProvider": arr,
                //                "dataProvider": arr,
                "dataProvider": decimatedArr,
                
                "pathToImages": "http://www.amcharts.com/lib/3/images/",
                
                "categoryField": "date",
                "categoryAxis": {
                    "minPeriod": "ss",
                    "parseDates": true,
                    "minimum": self.currentSessionStartDate,
                    "maximum": self.currentSessionEndDate
                //                    "minimum": new Date(self.currentSession.creationTimestamp)
                },
                "valueAxes": [{
                    "axisAlpha": 0.2,
                    "dashLength": 1,
                    "position": "left"
                }],
                "graphs": [{
                    "id":"g1",
                    "balloonText": "[[category]]<br /><b><span style='font-size:14px;'>value: [[value]]</span></b>",
                    "bullet": "round",
                    "bulletBorderAlpha": 1,
                    "bulletColor":"#FFFFFF",
                    "hideBulletsCount": 50,
                    "title": "red line",
                    "valueField": "rr",
                    
                    //                    "lineColorField": "lineColor",
                    //                    "fillColorsField": "lineColor",
                    //                    "fillAlphas": 0.8,
                    
                    
                    "useLineColorForBulletBorder":true
                }],
            
                "chartScrollbar": {
                    "autoGridCount": true,
                    "graph": "g1",
                    "scrollbarHeight": 40
                }
            });
        }else{
            self.sigmaChart.dataProvider = self.decimatePlotData(arr);
            self.sigmaChart.validateData();
        }
    }
    
    
     
    //                "axes": [{
    //                    "axisThickness":1,
    //                    "bands": [{
    //                        "color": "#84b761",
    //                        "startValue": 0,
    //                        "endValue": 10
    //                    }, {
    //                        "color": "#fdd400",
    //                        "startValue": 10,
    //                        "endValue": 76
    //                    }, {
    //                        "color": "#cc4748",
    //                        "startValue": 76,
    //                        "endValue": 100
    //                    }],
    //                    "endValue": 100
    
    
    this.getIntervalsFromDataItemsList = function(dataItems){
        if (dataItems == undefined){
            return [];
        }
        var arr = [];
        for (var i in dataItems){
            var rr = JSON.parse(dataItems[i].dataItem).r;
            arr.push(rr);
        }
        return arr;
    }
    
    this.getTimestampsFromDataItemsList = function(dataItems){
        if (dataItems == undefined){
            return [];
        }
        var arr = [];
        for (var i in dataItems){
            var tt = dataItems[i].creationTimestamp;
            arr.push(tt);
        }
        return arr;
    }
    
    this.preparePulsePlot = function(intervalsObjectArray){
        //        console.log(intervalsObjectArray);
        if (intervalsObjectArray == undefined){
            intervalsObjectArray = self.currentSessionPulsePlotData;
        }
        var chartData = (intervalsObjectArray == undefined) ? [] : intervalsObjectArray;
        //        var chartData = [];
        if (self.pulseChart == undefined){
            console.log('preparing pulse plot....');
            var decimatedArr = self.decimatePlotData(chartData)
            //            console.log(intervalsObjectArray);
            self.pulseChart = AmCharts.makeChart("pulseChart", {
                type: "serial",
                //                "dataProvider": chartData,
                "dataProvider": decimatedArr,
                //                "dataDateFormat": "mm:ss",
                "categoryAxis": {
                    "minPeriod": "ss",
                    "parseDates": true,
                    "minimum": self.currentSessionStartDate,
                    "maximum": self.currentSessionEndDate
                //                    "minimum": new Date(self.currentSession.creationTimestamp)
                },
                
                "pathToImages": "http://www.amcharts.com/lib/3/images/",
                
                "categoryField": "date",
                "valueAxes": [{
//                    "axisAlpha": 0.2,
                    "axisAlpha": 0,
                    "dashLength": 1,
                    "position": "left",
                    "minimum": 40,
                    "maximum": 210
                }],
                "graphs": [{
                    "id":"g1",
                    "balloonText": "[[category]]<br /><b><span style='font-size:14px;'>value: [[value]]</span></b>",
                    "bullet": "round",
                    "bulletBorderAlpha": 1,
                    "bulletColor":"#FFFFFF",
                    "hideBulletsCount": 50,
                    "title": "red line",
                    "valueField": "rr",
                    "dataDateFormat": "mm:ss",
                    "useLineColorForBulletBorder":true,
                    "lineColorField": "lineColor"
                }],
            
                "chartScrollbar": {
                    "autoGridCount": true,
                    "graph": "g1",
                    "scrollbarHeight": 40
                }
            });
        }else{
            self.pulseChart.dataProvider = self.decimatePlotData(intervalsObjectArray);
            self.pulseChart.validateData();
        }
        
        
        
    }

    this.getPulseArrayFromDataItems = function(dataItems){
        if (dataItems == undefined){
            return [];
        }
        var arr = [];
        var set = {};
        for (var i in dataItems){
            var d = dataItems[i];
            if (set[d.creationTimestamp] != undefined){
                console.log('skipping......');
                continue;
            }
            var rr = JSON.parse(dataItems[i].dataItem).r;
            //            var lineColor
            var a2 = {
                //                number: dataItems[i].number,
                date: new Date(dataItems[i].creationTimestamp),
                rr: Math.floor(600000 / rr) / 10.0
            //                lineColor: "#2498d2"
            }
            set[d.creationTimestamp] = 1;
            arr.push(a2);
        }
        
        return arr;
    }


    

    this.get2DArrayFromDataItemsList = function(dataItems){
        if (dataItems == undefined){
            return [];
        }
        var arr = [];
        for (var i in dataItems){
            var rr = JSON.parse(dataItems[i].dataItem).r;
            var arr2 = [dataItems[i].creationTimestamp, rr];
            arr.push(arr2);
        }
        return arr;
    }

    this.get2DNormalArrayFromDataItemsList = function(dataItems){
        var arr = self.get2DArrayFromDataItemsList(dataItems);
        var arr2 = [];
        for (var i in arr){
            //            arr2.push([arr[i][0], 60000 / arr[i][1]]);
            arr2.push([i,arr[i][1]]);
        }
        return arr2;
    }

    this.get2DPulseFromDataItemsList = function(dataItems){
        var arr = self.get2DArrayFromDataItemsList(dataItems);
        var arr2 = [];
        for (var i in arr){
            //            arr2.push([arr[i][0], 60000 / arr[i][1]]);
            arr2.push([i, 60000 / arr[i][1]]);
        }
        return arr2;
    }

    this.getIntervalsFromDataItemsArray = function(dataItems){
        var arr = self.get2DArrayFromDataItemsList(dataItems);
        var res = [];
        for (var i = 0; i < arr.length; i++){
            res.push(arr[i][1]);
        }
        return res;
    }


}

function getStringFromLocalStorage(name){
    var s = localStorage.getItem(name);
    if (s == undefined || s == ''){
        return undefined;
    }
    return s;
}

// generate some random data, quite different range
function generateChartData() {
    var chartData = [];
    var firstDate = new Date();
    firstDate.setDate(firstDate.getDate() - 5);

    for (var i = 0; i < 1000; i++) {
        // we create date objects here. In your data, you can have date strings
        // and then set format of your dates using chart.dataDateFormat property,
        // however when possible, use date objects, as this will speed up chart rendering.
        var newDate = new Date(firstDate);
        newDate.setDate(newDate.getDate() + i);

        var visits = Math.round(Math.random() * (40 + i / 5)) + 20 + i;

        chartData.push({
            date: newDate,
            visits: visits
        });
    }
    return chartData;
}