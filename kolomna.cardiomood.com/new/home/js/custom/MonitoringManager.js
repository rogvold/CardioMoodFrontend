/**
 * Created by sabir on 30.10.14.
 */

var MonitoringManager = function(){
    var self = this;
    this.currentUserManager = new CurrentUserManager();
    this.trainees = [];
    this.RTM = new RealTimeManager();
    this.offlineTimeout = 3;
    this.pointsMap = {};
    this.maxRealTimePlotSize = 30;

    this.initParse = function(){
        var appId = '8BiAfjRaj4S9AvHHKKXWOHX40PnEkDdgBEZlp4VY';
        var jsKey = 'tOTGTLVattftp8O8jYwwNOK8WapZdVVKfDue3Lr2';
        Parse.initialize(appId, jsKey);
    }

    this.init = function(){
        self.initParse();
        enablePreloader();
        self.currentUserManager.init(function(){
            if (self.currentUserManager.currentUser.get('userRole') != 'Trainer'){
                self.currentUserManager.logout();
            }
            self.loadTrainees(function(){
                console.log(self.trainees);
                self.drawTraineesPanels();
                self.RTM.init(self.onPubNubDataReceived);
                //self.launchSimulation();
                self.initAgoTimer();
                disablePreloader();
            });

        });
    }

    this.drawTraineesPanels = function(){
        var s = '';
        var list  = self.trainees;
        for (var i in list){
            s+= self.getTraineeCardHtml(list[i]);
            console.log('pointsMap = ', self.pointsMap);
            self.pointsMap[list[i].id] = {points: []};
        }
        $('#traineesCards').html(s);
        $('.traineesName').bind('click', function(){
            var uId = $(this).attr('data-id');

        });
    }

    this.getTraineeCardHtml = function(u){
        var s = '';
        s+= '<div class="col-md-3 col-sm-6 col-xs-12">'
            +'<section class="panel panel-primary traineePanel " onclick=" window.location.href=\'monitor.html?id=' + u.id + '\'" >'
                +'<header class="panel-heading">'
                    +'<div class="h5">'
                        +'<i class=" mr5"></i>'
                        +'<b><span data-id="' + u.id + '" class="traineesName" >'+ u.get('firstName') + ' ' + u.get('lastName') +'</span></b>'
                    +'</div>'
                +'</header>'
                +'<footer class="panel-footer text-center">'
                    +'<div class="row">'
                        +'<div class="col-xs-4">'
                            +'<div class="small show text-uppercase text-muted">Пульс</div>'
                            +'<div class="h4 no-m heartrate" data-id="' + u.id +'"  ><b>N/A</b>'
                            +'</div>'
                        +'</div>'
                        +'<div class="col-xs-4">'
                            +'<div class="small show text-uppercase text-muted">Стресс</div>'
                            +'<div class="h4 no-m stress " data-id="' + u.id + '" ><b>N/A</b>'
                            +'</div>'
                        +'</div>'
                        +'<div class="col-xs-4">'
                            +'<div class="small show text-uppercase text-muted">Закисл.</div>'
                            +'<div class="h4 no-m energy" data-id="' + u.id + '" ><b>N/A</b>'
                            +'</div>'
                        +'</div>'
                    +'</div>'
                +'</footer>'
                +'<div class="panel-footer">'
                +'<span class="updatingTimeAgo" data-lastTime="' + (new Date()).getTime() + '" data-id="' + u.id +'"  ></span>'
                +'<span data-id="' + u.id +'" class="updatingStatus badge bg-danger pull-right"></span>' +
                 '<div class="tile-chart tile-line" id="chart' + u.id +'" >' +
                  '</div>' +
            '   </div>'
            +'</section>'
        +'</div>';
        return s;
    }

    this.loadTrainees = function(callback){
        var q= self.currentUserManager.currentUser.relation('selectedUser').query();
        q.ascending('createdAt');
        q.find(function(list){
            self.trainees = list;
            if (list.length == 0){
                window.location.href = 'index.html';
                return;
            }
            callback();
        });
    }

    this.onPubNubDataReceived = function(message){
        console.log('onPubNubDataReceived: message = ');
        console.log(message);
        if (message == undefined){
            console.log('message is undefined');
            return;
        }
        if (message.SDNN != undefined){
            message.SDNN = Math.floor(message.SDNN * 100.0) / 100.0;
        }
        self.pointsMap[message.userId].points.push(message);
        if (self.pointsMap[message.userId].points.length > self.maxRealTimePlotSize){
            self.pointsMap[message.userId].points.shift();
        }
        self.updateRealtimePlot();

        $('.heartrate[data-id="' + message.userId + '"]').html(message.HR);
        $('.energy[data-id="' + message.userId + '"]').html(message.SDNN);
        $('.stress[data-id="' + message.userId + '"]').html(message.stress);
//        var t = message.t;
        var t = (new Date()).getTime();
        console.log('received t = ', t);
        $('.updatingTimeAgo[data-id="' + message.userId + '"]').attr('data-lastTime', t);
    }



    this.launchSimulation = function(){
        var list = self.trainees;
        setInterval(function(){
            var n = Math.floor(Math.random() * list.length);
            self.RTM.simulationPublishing(list[n].id, (new Date()).getTime(), Math.floor(50 + 100*Math.random()), Math.floor(Math.random() * 30 + 200), Math.floor(5 + 30 * Math.random()));
        }, 500);
    }

    this.initAgoTimer = function(){
        setInterval(function(){
            $('.updatingTimeAgo').each(function(){
                var uId = $(this).attr('data-id');
//                console.log('uId = ', uId);
                var t1 = $(this).attr('data-lastTime');
//                console.log('t1=', t1);
                var dt = Math.floor((new Date()).getTime() - t1);
//                console.log(dt);
                var s = moment.duration(dt).asSeconds();
                var s = Math.floor(s * 10.0) / 10.0;
                $(this).html(s + ' s.');
                $('.updatingStatus[data-id="' + uId + '"]').removeClass('bg-danger');
                $('.updatingStatus[data-id="' + uId + '"]').removeClass('bg-success');
                if (s >= self.offlineTimeout){
                    $('.updatingStatus[data-id="' + uId + '"]').addClass('bg-danger');
                    $('.updatingStatus[data-id="' + uId + '"]').text('offline');
                }else{
                    $('.updatingStatus[data-id="' + uId + '"]').addClass('bg-success');
                    $('.updatingStatus[data-id="' + uId + '"]').text('online');
                }
            });
        }, 100);
    }



    this.updateRealtimePlot = function(){
        var map = self.pointsMap;
        for (var uId in map){
            var points = map[uId].points.map(function(p){ return p.HR});
            $("#chart" + uId).sparkline(points, {
                type: 'line',
                width: '100%',
                height: '40',
                lineWidth: 3,
                lineColor: '#fff',
                chartRangeMin: 0 });
        }
    }


}