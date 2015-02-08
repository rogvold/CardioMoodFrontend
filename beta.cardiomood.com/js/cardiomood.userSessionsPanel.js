/**
 * Created by sabir on 06.06.14.
 */

CardioMoodUserSessionPanel = function(){
    var self = this;
    this.currentUserId = undefined;
    this.userId = undefined;
    this.token = undefined;
    this.currentUser = undefined;
    this.serverId = 51;
    GlobalPlotRegistry = undefined;
    this.base = "http://data.cardiomood.com/CardioDataWeb/resources";

    this.init = function(){
        self.loadTrainerParametersFromLocalStorage();
        self.currentUserId = gup('userId');
        if (self.currentUserId == undefined){
            console.log('userId is undefined');
            return;
        }
        GlobalPlotRegistry = new CardioMoodPlotRegistry();
        GlobalPlotRegistry.init();
        self.currentUser = new CardioMoodPanelUser(self.currentUserId, self.token);
        self.currentUser.init();
        self.initUpdateSessionNameButton();
    }

    this.loadTrainerParametersFromLocalStorage = function(){
        self.token = getStringFromLocalStorage('token');
        self.userId = getStringFromLocalStorage('userId');
    }

    this.initUpdateSessionNameButton = function(){
        $('#currentSessionRenameButton').click(function(){
            var newName = $('#currentSessionTextarea').val();
            if (newName == undefined || newName == ''){
                showMessage('Empty name. Please try again');
                return;
            }
            $.ajax({
                url: self.base + '/v2/CardioMoodSession/renameCardioMoodSession',
                type: 'POST',
                data: {
                    token: self.token,
                    userId: self.userId,
                    sessionId: self.currentUser.currentSessionId,
                    name: newName
                },
                success: function(data){
                    if (data.responseCode == 0){
                        console.log(data.error);
                        return;
                    }

                    $('#currentSessionName').text(newName);
                    $('#currentSessionRenameBlock').hide();
                    $('#currentNameBlock').show();
                    showMessage("successfully renamed");
                }

            });
        });
    }


}

CardioMoodPanelUser = function(id, token){
    var self = this;
    this.id = id;
    this.parentToken = token;
    this.serverId = 51;
    this.sessionsList = [];
    this.currentSessionId = undefined;
    this.currentSession = undefined;
    this.base = "http://data.cardiomood.com/CardioDataWeb/resources";
    this.firstName = undefined;
    this.lastName = undefined;
    this.intervalId = undefined;
    this.intervalTime = 3 * 1000;

    this.init = function(){
        self.id = gup('userId');
        if (self.id == undefined || self.id == ''){
            alert('userId is not defined');
            return;
        }
        self.loadSessionsList();
    }

    this.initUserSessionUpdatingIntervalId = function(){
        self.intervalId = setInterval(function(){
            if (self.currentSession == undefined){
                return;
            }
            if (self.currentSession.onlineMode == false){
                return;
            }
            self.currentSession.loadSession();
        }, self.intervalTime);
    }

    this.loadSessionsList = function(){
        if (self.id == undefined){
            return;
        }
        $.ajax({
            url: self.base + "/v2/CardioMoodSession/getCardioMoodSessionsOfUser",
            type: 'POST',
            data:{
                userId: self.id,
                token: self.parentToken,
                serverId: self.serverId,
                className: 'JsonRRInterval'
            },
            success: function(data){
                console.log(data);
                if (data.error != undefined){
                    console.log(data.error.message);
                    return;
                }
                self.sessionsList = data.data;
                self.initSessionsList();
                self.drawSessionsList(self.sessionsList);
                self.initUserSessionUpdatingIntervalId();
            }
        });
    }

    this.drawSessionsList = function(list){
        if (list == undefined){
            return '';
        }
        var s = '';
        for (var i in list){
            s+= self.getSessionsListItemHtml(list[i], i);
        }
        $('#main-menu').html(s);
        $('.sessionsListItem').bind('click', function(){
            self.currentSessionId = $(this).attr('data-sessionId').trim();
            console.log(self.currentSessionId);

//            $('#mainPanel').fadeOut();
//            $('#splashPanel').fadeIn();

            $('.sessionsListItem').removeClass('active');
            $(this).addClass('active');
            self.currentSession = self.getSessionById(self.currentSessionId);
            self.currentSession.select();
        });
        $('li.sessionsListItem:first').click();
    }

    this.initSessionsList = function(){
        var list = [];
        for (var i in self.sessionsList){
            var cs = new CardioMoodRRSession(self.sessionsList[i].id, self.id, self.parentToken);
            cs.name = self.sessionsList[i].name;
            cs.creationTimestamp = self.sessionsList[i].creationTimestamp;
            cs.endTimestamp = self.sessionsList[i].endTimestamp;
            cs.lastModificationTimestamp = self.sessionsList[i].lastModificationTimestamp;
            list.push(cs);
        }
        self.sessionsList = list;
    }

    this.getSessionById = function(sessionId){
        if (sessionId == undefined){
            console.log('sesssionId is null and void');
        }
        for (var i in self.sessionsList){
            if (self.sessionsList[i].id == sessionId){
                console.log('session with id=' + sessionId + ' is found');
                return self.sessionsList[i];
            }
        }
        console.log('cannot find session with id = ' + sessionId);
        return undefined;
    }

    this.getSessionsListItemHtml = function(item, num){
        var firstClass = (num == 0) ? 'freshSession' : '';
        var s2 = '<li class="sessionsListItem '+ firstClass +'" data-sessionId="' + item.id +'" ><a href="javascript: void(0);">';
        var name = (item.name == undefined) ? ('session #' + item.id ): item.name;
        s2+= '<span class="sessionName" >' + name + '</span>';
        console.log(item.creationTimestamp);
        console.log(moment(item.creationTimestamp).format('DD.MM.YYYY HH:mm:ss'));
        s2+='<span class="badge badge-success badge-roundless userTab selectedUserLabel" >' + moment(item.creationTimestamp).format('DD.MM.YYYY HH:mm:ss') +'</span>';
        s2+= '</a></li>';
        return s2;
    }

}

CardioMoodRRSession = function(sessionId, userId, token){
    var self = this;
    this.id = sessionId;
    this.token = token;
    this.userId = userId;
    this.calculatedParametersMap = undefined;
    this.lastModificationTimestamp = undefined;
    this.base = "http://data.cardiomood.com/CardioDataWeb/resources";
    this.creationTimestamp = undefined;
    this.endTimestamp = undefined;
    this.freshTimestamp = undefined;
    this.onlineMode = false;
    this.isSelected = false;
    this.name = undefined;
    this.gpsData = undefined;
    this.sessionUpdatingRequestIsLoaded = true;


    this.select = function(){
        showWaitingPanel();
        $('.onlineSessionIndicator').hide();
        if (self.endTimestamp == undefined){
            self.onlineMode = true;
            $('.onlineSessionIndicator').show();
        }
        self.initGPS();
        self.loadSession();
    }

    this.initGPS = function(){
        if (self.gpsData == undefined){
            self.gpsData = new CardioMoodGPSData(self.userId, self.token);
        }

    }

    this.loadSession = function(){
        if (self.onlineMode == false){
            if (self.calculatedParametersMap != undefined){
                console.log('this session has already been loaded (sessionId = ' + self.id +')');
                self.drawSession();
                return;
            }
        }
        if (self.sessionUpdatingRequestIsLoaded == false){
            return;
        }
        self.sessionUpdatingRequestIsLoaded = false;
        $.ajax({
            url: self.base + "/calc/getCalculatedSession",
            type: 'POST',
            data: {
                sessionId: self.id
            },
            success: function(data){
                if (data.error != undefined){
                    alert(data.error.message);
                    return;
                }
                self.creationTimestamp = data.data.creationTimestamp;
                self.endTimestamp = data.data.endTimestamp;
                self.userId = data.data.userId;
                self.calculatedParametersMap = data.data.calculatedParameters;
                self.name = data.data.name;
                self.lastModificationTimestamp = self.getLastTimestamp();
                self.drawSession();


                if (self.gpsData.fromTimestamp == undefined){
                    self.gpsData.fromTimestamp = self.creationTimestamp;
                }

                self.gpsData.toTimestamp = (self.endTimestamp == undefined) ? self.lastModificationTimestamp : self.endTimestamp;
                self.gpsData.currentBpm = self.getLastBpm();
                self.gpsData.currentSI = self.getLastSI();
                self.gpsData.loadPoints();

                self.sessionUpdatingRequestIsLoaded = true;

            }
        });
    }


    this.drawSession = function(){

        $('.currentSessionStartDateSpan').text(moment(self.creationTimestamp).format('LLLL'));

        var dur = self.getSessionDuration();
        var hs = moment.duration(dur).hours() > 0 ? (moment.duration(dur).hours() + ' h. ') : '';
        $('.currentSessionDurationSpan').text(' ' + hs  +moment.duration(dur).minutes() + ' m. ' + moment.duration(dur).seconds() + ' s.');

        var sName = (self.name == undefined) ? ('session #' + self.id) : self.name;
        $('.currentSessionName').text(sName);

        if (self.calculatedParametersMap == undefined){
            console.log('parametersMap is undefined');
            return;
        }
        for (var key in self.calculatedParametersMap){
            var time = self.calculatedParametersMap[key][0];
            var values = self.calculatedParametersMap[key][1];
            GlobalPlotRegistry.drawPlot(key, time, values);
        }
        hideWaitingPanel();
    }

    self.getSessionDuration = function(){
//        if (self.endTimestamp == undefined){
            if (self.calculatedParametersMap["RR"] != undefined){
                var list = self.calculatedParametersMap["RR"][0];
                var endTime = list[list.length - 1];
                return endTime - self.creationTimestamp;
            }
//        }
//        return self.endTimestamp - self.creationTimestamp;
        return undefined;
    }


    self.getLastBpm = function(){
        if (self.calculatedParametersMap == undefined){
            return undefined;
        }
        if (self.calculatedParametersMap['RR'] == undefined || self.calculatedParametersMap['RR'][0].length == 0){
            return;
        }
        return Math.floor(60000.0 / self.calculatedParametersMap['RR'][1][self.calculatedParametersMap['RR'][1].length - 1]);
    }

    self.getLastSI = function(){
        if (self.calculatedParametersMap == undefined){
            return undefined;
        }
        if (self.calculatedParametersMap['SI'] == undefined || self.calculatedParametersMap['SI'][0].length == 0){
            return;
        }
        return Math.floor(self.calculatedParametersMap['SI'][1][self.calculatedParametersMap['SI'][1].length - 1]);
    }

    self.getLastTimestamp = function(){
        if (self.calculatedParametersMap == undefined){
            return undefined;
        }
        if (self.calculatedParametersMap['RR'] == undefined || self.calculatedParametersMap['RR'][0].length == 0){
            return;
        }
        var arr = self.calculatedParametersMap['RR'][0];
        return arr[arr.length - 1];
    }

}


CardioMoodGPSData = function(userId, token){
    var self = this;
    this.token = token;
    this.userId = userId;
    this.base = "http://data.cardiomood.com/CardioDataWeb/resources";
    this.fromTimestamp = undefined;
    this.toTimestamp = undefined;
    this.points = [];
    this.currentBpm = undefined;
    this.currentSI = undefined;
    this.updatingRequestSended = false;

    this.init = function(){
        //console.log(self);
        //self.loadPoints();
    }

    this.loadPoints = function(){
        //console.log('loadPoints occured');
        if (self.fromTimestamp == undefined || self.toTimestamp == undefined){
            if (self.fromTimestamp == undefined) {console.log('fromTimestamp is undefined');}
            if (self.toTimestamp == undefined) {console.log('toTimestamp is undefined');}
            return;
        }

        if (self.updatingRequestSended == true){
            return;
        }

        $.ajax({
            url: self.base + '/v2/CardioMoodSession/getFilteredCardioDataItems',
            type: 'POST',
            data:{
                token: self.token,
                userId: self.userId,
                fromTimestamp: self.fromTimestamp,
                toTimestamp: self.toTimestamp,
                className: 'JsonGPS'
            },
            success: function(data){
                //console.log(data);
                if (data.error != undefined){
                    console.log(data.error);
                    return;
                }
                var list = data.data;
                var points = [];
                for (var i in list){
                    var t = list[i].creationTimestamp;
                    var q = JSON.parse(list[i].dataItem);
                    var p = {
                        t: t,
                        lon: q.lon,
                        lat: q.lat,
                        accuracy: q.accuracy,
                        speed: q.speed
                    }
                    points.push(p);
                }
                self.points = points;
                console.log(points.length  + ' GPS points loaded')
                self.drawMap();
                self.updatingRequestSended = false;
                self.fromTimestamp = self.toTimestamp - 1;
            }
        });
    }

    this.drawMap = function(){
        GlobalMap.drawRoute(self.points);
        var html = '';
        if (self.currentBpm != undefined){
            html = '<b>BPM: <span style="color: red;">' + self.currentBpm +'</span></b>';
        }
        if (self.currentSI != undefined){
            html+= '<br/><b>STRESS: <span style="color: red;">' + self.currentSI +'</span></b>';
        }

        GlobalMap.showInfoWindow(html, self.points[self.points.length - 1].lat, self.points[self.points.length - 1].lon);
    }

}

function gup(name){
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )    return "";
    else    return results[1];
}
