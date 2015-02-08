/**
 * Created by sabir on 16.10.14.
 */

var DoctorStudentPageManager = function(){
    var self = this;
    this.student = undefined;
    this.studentId = undefined;
    this.currentUserManager = new CurrentUserManager();
    this.commentsManager = new SessionCommentsManager();
    this.students = [];
    this.chartManager = new CmChartManager();
    this.userSessions = [];

    this.init = function(){
        self.currentUserManager.init(function(){
            if (self.currentUserManager.currentUser.get('userRole') != 'Doctor'){
                self.currentUserManager.logout();
            }
            self.chartManager.init();
            self.initStressChart();
            self.loadStudent(function(){
                console.log(self.student);
                self.generateStudentInfo();
                moment.locale('ru');
                self.commentsManager.init(self.currentUserManager.currentUser, 'commentsBlock');
            });
        });
    }


    this.loadStudent = function(callback){
        var id = gup('id');
        if (id == undefined){
            window.location.href = 'index.html';
            return;
        }
        self.studentId = id;
        self.loadUserSessions(function(){

        });
        var q = new Parse.Query(Parse.User);
        q.get(id, {
            success: function(user){
                self.student = user;
                callback();
            },
            error: function(){
                window.location.href = 'index.html';
                return;
            }
        });
    }

    this.generateStudentInfo = function(){
        var u = self.student;
        $('.studentName').html(u.get('firstName') + ' ' + u.get('lastName'));
        $('.studentEmail').html(u.get('email'));
        $('.studentPhone').html(u.get('phone'));
        $('.studentDepartment').html(u.get('depName'));
        $('.studentGroupNumber').html(u.get('groupNumber'));
        $('.studentAvatar').attr('src', u.get('avatarUrl') + '?size=large');
    }

    this.loadUserSessions = function(callback){
        var q = new Parse.Query(Parse.Object.extend('CardioSession'));
        q.equalTo('userId', self.studentId);
        q.limit(1000);
        q.descending('createdAt');
        q.find(function(list){
            self.userSessions = list;
            self.drawUserSessions();
            if (callback != undefined){
                callback();
            }
        });
    }

    //working with chunks
    this.loadSessionData = function(sessionId, callback){
        if (sessionId == undefined){
            return;
        }
        var q = new Parse.Query(Parse.Object.extend('CardioDataChunk'));
        q.limit(1000);
        q.ascending('number');
        q.equalTo('sessionId', sessionId);
        q.find(function(list){
            var rrs = [];
            var times = [];
            console.log(list);
            for (var i in list){
                var cdc = list[i];
                rrs = rrs.concat(cdc.get('rrs'));
                times = times.concat(cdc.get('times'));
            }
            callback([times, rrs]);
        });
    }

    this.getUserSessionHtml = function(session){
        var s = '';
        var name = session.get('name');
        var dt = moment(session.get('startTimestamp')).format('DD.MM.YYYY HH:mm:ss');
        if (name == undefined || name == "undefined"){
            name = dt;
        }
        s+= '<a data-id="' + session.id + '" href="javascript:void(0);" class="list-group-item sessionLi" title="' + dt + '" >' + name +'</a>';
        return s;
    }

    this.drawUserSessions = function(){
        var list = self.userSessions;
        var s = '';
        for (var i in list){
            s+= self.getUserSessionHtml(list[i]);
        }
        $('#sessionsListContainer').html(s);
        self.initSessionListItem();
    }

    this.initSessionListItem = function(){
        $('.sessionLi').bind('click', function(){
            $('.sessionLi').removeClass('active');
            $(this).addClass('active');
            self.flushSession();
            var id = $(this).attr('data-id');
            console.log(id);
            var session = self.getSessionById(id);
            console.log(session);


//            var data = [session.get('times'), session.get('rrs')];
//            var data2 = data[0].map(function(a, i){ return [data[0][i] - data[0][0], data[1][i]]});
//            console.log(data2);
//            self.chartManager.updateData(data2);
//            self.commentsManager.loadComments(id, function(){});

            enablePreloader();

            self.loadSessionData(id, function(data){
                if (data == undefined || data[0].length == 0){
                    console.log('no data for this session! no chunks or chunks are empty');
                    disablePreloader();
                    return;
                }
//                var data = [session.get('times'), session.get('rrs')];
                var data2 = data[0].map(function(a, i){ return [data[0][i] - data[0][0], data[1][i]]});
                console.log(data2);
                self.chartManager.updateData(data2);
                self.commentsManager.loadComments(id, function(){});
                disablePreloader();
            });

        });
        $('.sessionLi:first').click();
    }

    this.getSessionById = function(sId){
        var list = self.userSessions;
        for (var i in list){
            if (list[i].id == sId){
                return list[i];
            }
        }
        return undefined;
    }

    this.flushSession = function(){
        self.chartManager.flushParameters();
    }

    this.initStressChart = function(){
        self.chartManager.addCustomLineChart('stress_plot', 'stress');
    }

}