/**
 * Created by sabir on 12.11.14.
 */

var CurrentSportsmanMonitorManager = function(){
    var self = this;
    this.currentUserManager = new CurrentUserManager();
    this.currentSportsmanId = undefined;
    this.currentSportsman = undefined;
    this.sportsmanSessions = [];
    this.sessions = [];
    this.currentSession = undefined;
    this.currentSessionRrs = [];
    this.currentSessionTimes = [];

    this.realTimeManager = new CurrentUserRealTimeManager();
    this.realtimeMessages = [];
    this.time = 0;
    this.timerInterval = 100;
    this.updatedTime = (new Date()).getTime();
    this.chartManager = new SportsmanChartManager();

    this.heartRatePlotData = [];
    this.sdnnPlotData = [];
    this.stressPlotData = [];

    this.realTimeHeartRatePlotData = [];
    this.realTimeSdnnPlotData = [];
    this.realTimeStressPlotData = [];

    this.maxDt = 1000 * 10;

    this.cartManager = new SportsmanChartManager();

    this.mode = 'pending';

    this.initParse = function(){
        var appId = '8BiAfjRaj4S9AvHHKKXWOHX40PnEkDdgBEZlp4VY';
        var jsKey = 'tOTGTLVattftp8O8jYwwNOK8WapZdVVKfDue3Lr2';
        Parse.initialize(appId, jsKey);
    }

    this.initRealTime = function(){
        self.realTimeManager.onHistoryLoaded = function(messages){
            disablePreloader();
            var arr = [];
            for (var i in messages){
                if (messages[i].userId == self.currentSportsman.id){
                    messages[i].t = +messages[i].t;
                    arr.push(messages[i]);
                }
            }
            console.log(arr);
            arr = arr.sort(function(a, b){
                return (+a.t - +b.t);
            });
            console.log('sorted arr = ');
            console.log(arr);

            console.log('history loaded: last point is ' + moment(arr[arr.length - 1].t).format('DD hh:mm:ss'));

            for (var i in arr){
                console.log(arr[i].t, moment(arr[i].t).format('DD HH:mm:ss'));
            }

            self.realtimeMessages = arr.concat(self.realtimeMessages);

            console.log('self.realtimeMessages = ', self.realtimeMessages);


//            for (var i in arr){
//                if (i > 0){
//                    var dt = arr[i].t - arr[i-1].t;
//                    console.log('dt = ', dt);
//                    if (dt > self.maxDt){
//                        console.log(arr[i], arr[i-1]);
//                    }
//                }
//            }

            $('.loaderText').html('');
            self.initTimer();
        }
        self.realTimeManager.onDataReceive = function(d){
            if (d.userId == self.currentSportsman.id){
                d.t = +d.t;
                self.realtimeMessages.push(d);
                self.updatedTime = (new Date()).getTime();
                console.log('incoming ' + moment(d.t).format('hh:mm:ss'));
                self.prepareRealtime();
            }
        }
        self.realTimeManager.historyLoadingCallback = function(start, end){
            $('.loaderText').html('Загрузка истории... <br/> ' + moment(end / 10000).fromNow());
        }
        self.realTimeManager.init();
    }

    this.init = function(){
        self.initParse();
        self.chartManager.init();
        enablePreloader();
        self.initRealtimeLink();
        self.currentUserManager.init(function(){
            if (self.currentUserManager.currentUser.get('userRole') != 'Trainer'){
                self.currentUserManager.logout();
            }
            self.loadCurrentSportsman(function(){
                self.loadSessions(function(){
                    self.drawSessions();
                    disablePreloader();
                    self.initRealTime();
                    enablePreloader();
                    self.realTimeManager.subscribe();
                    self.realTimeManager.loadAllHistory(0);

                });
            });
        });
    }

    this.loadCurrentSportsman = function(callback){
        self.currentSportsmanId = gup('id');
        if (self.currentSportsmanId == undefined){
            window.location.href = 'monitoring.html';
            return;
        }
        var q = new Parse.Query(Parse.User);
        q.get(self.currentSportsmanId,{
            success: function(u){
                self.currentSportsman = u;
                $('.currentSportsmanName').html(u.get('firstName') + ' ' + u.get('lastName'));
                callback();
            }
        });
    }

    this.loadSessions = function(callback){
        var q = new Parse.Query(Parse.Object.extend('CardioSession'));
        q.descending('createdAt');
        q.limit(1000);
        q.find(function(list){
            self.sessions = list;
            callback();
        });
    }

    this.loadSessionData = function(callback){
        var se = self.currentSession;
        var q = new Parse.Query(Parse.Object.extend('CardioDataChunk'));
        q.ascending('number');
        q.find(function(list){
            var rrs = [];
            var times = [];
            for (var i in list){
                rrs = rrs.concat(list[i].get('rrs'));
                times = times.concat(list[i].get('times'));
            }
            self.currentSessionRrs = rrs;
            self.currentSessionTimes = times;
            callback();
        });
    }

    this.getSessionItemHtml = function(item){
        var s = '';
        var name = item.get('name');
        var sDate = moment(item.createdAt).format('DD.MM.YYYY HH:mm');
        if (name == undefined || name == 'undefined'){
            name = sDate;
        }
        s+='<li data-id="'+ item.id +'" class="p10 bb sessionItem " title="' + sDate + '" >' +
            '<span class="aImagePlaceholder mr5">' +
            '<span class="aName bolder mr5">' + name + '</span>' +
            '</li>';
        return s;
    }

    this.initSessionItems = function(){
        $('body').on('click', '.sessionItem', function(){
            $('.sessionItem').removeClass('selected');
            $(this).addClass('selected');
            $('.realtime').removeClass('selected');
            self.mode = 'session';
            var id = $(this).attr('data-id');
            self.currentSession = self.getSessionById(id);
            self.prepareCurrentSession();
        });
    }

    this.prepareCurrentSession = function(){
        var se = self.currentSession;
        enablePreloader();
        self.prepareCurrentSessionInfo();
        self.loadSessionData(function(){
            disablePreloader();
            console.log(self.currentSessionTimes);
            console.log(self.currentSessionRrs);
        });

        //todo: prepare current session

    }

    this.prepareCurrentSessionInfo = function(){
        var se = self.currentSession;
        var name = se.get('name');
        var sDate = moment(se.createdAt).format('DD.MM.YYYY HH:mm');
        if (name == undefined || name == 'undefined'){
            name = sDate;
        }
        $('.currentSessionName').text(name);
    }

    this.drawSessions = function(){
        var s = '';
        var list = self.sessions;
        for (var i in list){
            s+=self.getSessionItemHtml(list[i]);
        }
        $('#sessionsList').append(s);
        self.initSessionItems();
    }

    this.getSessionById = function(id){
        var list = self.sessions;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
        return undefined;
    }

    this.initRenameSessionButton = function(){
        $('#renameSessionButton').bind('click', function(){
            var se = self.currentSession;
            var name = $('#sessionNewName').val();
            if (name == '' || name == undefined){
                toastr.error('Пустое название сессии');
                return;
            }
            se.set('name', name);
            se.save().then(function(){
                toastr.success('Название сессии успешно обновлено');
                self.prepareCurrentSession();
            });

        });
    }

    this.onTimerTick = function(){
        var dt = (new Date()).getTime() - self.updatedTime;
        var s = dt / 100;
        var s = Math.floor(s) / 10.0;
        $('.updatedTime').html(s + ' s.');
    }

    this.initTimer = function(){
        setInterval(function(){
            self.onTimerTick();
            self.time+=self.timerInterval;
        }, self.timerInterval);
    }

    this.prepareRealtime = function(){
        $('.realtime').addClass('selected');
        var list = self.realtimeMessages;
        var arr = [];
        console.log('list.length = ', list.length);

        for (var i = list.length - 1; i > 0; i--){
//            console.log(list[i].localId);
            var dt = Math.abs(+list[i].t - +list[i-1].t );
            console.log('dt = ', dt);
            if (dt < self.maxDt){
                arr.push(list[i]);
            }else{
                console.log('---- >>>>>  breaking!!!');
                console.log(moment(list[i].t).format('YYYY MM DD - hh:mm:ss'));
                console.log(moment(list[i-1].t).format('YYYY MM DD - hh:mm:ss'));
//                continue;
                break;
            }
        }
        var arr2 = [];
        for (var i in arr){
            arr2.push(arr[arr.length - i - 1]);
        }
        list = arr2;


        self.realTimeHeartRatePlotData = list.map(function(a){return [a.t, a.HR]});
        self.realTimeSdnnPlotData = list.map(function(a){return [a.t, (a.SDNN == undefined ? -1 : a.SDNN)]});
        self.realTimeStressPlotData = list.map(function(a){return [a.t, (a.stress == undefined ? -1 : a.stress)]});


        self.chartManager.heartRateChart.drawPoints(self.realTimeHeartRatePlotData);
        self.chartManager.sdnnChart.drawPoints(self.realTimeSdnnPlotData);
        self.chartManager.stressChart.drawPoints(self.realTimeStressPlotData);
    }

    this.initRealtimeLink = function(){
        $('li.realtime').click(function(){
            $('.sessionItem').removeClass('selected');
            $(this).addClass('selected');
            self.mode = 'realtime';
            self.prepareRealtime();
        });
    }



}