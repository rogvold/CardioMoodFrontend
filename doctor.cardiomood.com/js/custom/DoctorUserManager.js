/**
 * Created by sabir on 22.12.14.
 */

var
    DoctorUserManager = function(){
    var self = this;
    //current user is Doctor
    this.currentUserManager = new CurrentUserManager();
    this.currentUser = undefined;
    this.sessions = [];
    this.selectedSession = undefined;
    this.selectedDataChunks = [];
    this.selectedPointsArray = [];
    this.chartManager = new CmChartManager();
    this.commentsManager = new SessionCommentsManager();
    this.excelManager = new ExcelManager();
    this.doctorUserCalculationManager = new DoctorUserCalculationManager();

    this.init = function(){
        initParse();
        self.initSessionItem();
        self.chartManager.init();
        self.initStressChart();
        self.initSessionSettings();
        self.initFilterButton();
        self.prepareExportToExcelButton();
        self.initGenerateReportButton();
        self.doctorUserCalculationManager.init();
        self.currentUserManager.init(function(){
            self.loadCurrentUser(function(){
                self.loadUserSessions(function(){
                    self.drawSessionsList();
                    self.commentsManager.init(self.currentUserManager.currentUser, 'commentsBlock');
                });
            });
        });
    }

    this.loadCurrentUser = function(callback){
        var userId = gup('id');
        if (userId == undefined){
            toastr.error('Current user is undefined');
            window.location.href = 'index.html';
            return;
        }
        enablePreloader();
        var q = new Parse.Query(Parse.User);
        q.get(userId, {
            success: function(u){
                self.currentUser = u;
                self.prepareUserInfo();
                $('.userUsername').html(u.get('firstName') + ' ' + u.get('lastName'));
                $('.userAvatar').attr('src', ( u.get('avatar') == undefined ? 'http://home.cardiomood.com/img/anonym.png' : u.get('avatar') ) );
                disablePreloader();
                callback();
            }
        });
    }

    this.loadUserSessions = function(callback){
        var u = self.currentUser;
        var q = new Parse.Query(Parse.Object.extend('CardioSession'));
        q.limit(1000);
        //q.addDescending('createdAt');
        q.addDescending('startTimestamp');
        //q.equalTo('deleted', false);
        q.notEqualTo('deleted', true);
        q.equalTo('userId', self.currentUser.id);
        enablePreloader();
        q.find(function(results){
            self.sessions = results;
            disablePreloader();
            callback();
        });
    }

    this.drawSessionsList = function(){
        var s = '';
        var list = self.sessions;
        for (var i in list){
            s+=self.getSessionItemHtml(list[i]);
        }
        $('#sessionsList').html(s);
        if (gup('sessionId') == undefined){
            $('.sessionItem:first').click();
        }else{
            var sId = gup('sessionId');
            $('.sessionItem[data-id="' + sId + '"]').click();
        }
    }

    this.getSessionItemHtml = function(session){
        var s = '';
        s+='<a data-id="' + session.id + '" href="javascript:void(0);" class="list-group-item sessionLi sessionItem" title="' + moment(session.get('startTimestamp')).format('DD.MM.YYYY HH:mm:ss') + '">'
        + session.get('name')
        + '</a>';
        return s;
    }

    this.initSessionItem = function(){
        $('body').on('click', '.sessionItem', function(){
            var id = $(this).attr('data-id');
            self.selectedSession = self.getSessionById(id);
            $('.sessionItem').removeClass('active');
            $(this).addClass('active');
            self.prepareSelectedSession();
        });
    }

    this.loadSelectedSessionCardioDataChunks = function(callback){
        var q = new Parse.Query(Parse.Object.extend('CardioDataChunk'));
        q.equalTo('sessionId', self.selectedSession.id);
        q.addAscending('number');
        enablePreloader();
        q.find(function(results){
            self.selectedDataChunks = results;
            var arr = [];
            var t0 = 0;
            for (var i in results){
                var c = results[i];
                var ts = c.get('times');
                var rrs = c.get('rrs');
                for (var j in ts){
                    if (i ==0 && j == 0){
                        t0 = ts[j];
                    }
                    arr.push([parseInt(ts[j]) - t0, parseInt(rrs[j])]);
                }
            }
            self.selectedPointsArray = arr;
            disablePreloader();
            callback();
        });
    }

    this.prepareSelectedSession = function(){
        var s = self.selectedSession;
        $('.selectedSessionName').html(s.get('name'));
        $('.selectedSessionTimestamp').html( moment(s.get('startTimestamp')).format('LLLL') );
        self.loadSelectedSessionCardioDataChunks(function(){
            self.drawPlots();
            self.commentsManager.loadComments(s.id, function(){});
            self.chartManager.loadSportsParams(self.selectedPointsArray.map(function(w){return w[0]}), self.selectedPointsArray.map(function(w){return w[1]}), function(data){
                var si = data.SI;
                var arr = [];
                for (var i in si[0]){
                    arr.push([si[0][i], si[1][i]]);
                }
                console.log(arr);
                self.chartManager.drawPointsInCustomChart('stress', arr);
                $('#generateReportButton').removeAttr('disabled');
                $('#generatingButtonsBlock').hide();
            });
        });
    }

    self.drawPlots = function(){
        var points = self.selectedPointsArray;
        console.log('starting drawing points', points);
        self.prepareRRsTextarea();
        //self.chartManager.startTimestamp = self.selectedSession.get('startTimestamp')
        self.chartManager.updateData(self.selectedPointsArray);

    }

    this.prepareRRsTextarea = function(){
        var s = '';
        var list = self.selectedPointsArray.map(function(a){return a[1]});
        for (var i in list){
            s+= list[i];
            s+='\n';
        }
        $('#rrsTextarea').val(s);
    }

    this.prepareExportToExcelButton = function(){
        $('#excelExportButton').bind('click', function(){
            var list = self.selectedPointsArray.map(function(a){return a[1]});
            self.excelManager.exportListToExcel(list,
                    self.selectedSession.get('name'),
                    moment(self.selectedSession.get('startTimestamp')).format('LLL'));
        });
    }

    this.getSessionById = function(id){
        var list = self.sessions;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
    }

    this.initSessionSettings = function(){
        $('.sessionSettings').bind('click', function(){
            var s = self.selectedSession;
            $('#updateSessionName').val(s.get('name'));
            $('#updateSessionDescription').val(s.get('description'));
            $('#sessionSettingsModal').modal();
        });
        $('#updateSessionButton').bind('click', function(){
            var name = $('#updateSessionName').val().trim();
            var description = $('#updateSessionDescription').val().trim();
            self.selectedSession.set('name', name);
            self.selectedSession.set('description', description);
            enablePreloader();
            self.selectedSession.save().then(function(){
                disablePreloader();
                self.prepareSelectedSession();
                toastr.success('Updated');
            });
        });
    }

    this.initStressChart = function(){
        self.chartManager.addCustomLineChart('stress_plot', 'stress');
    }

    this.initFilterButton = function(){
        $('#filterButton').bind('click', function(){
            self.filterSelectedPointsArray(function(){
                self.drawPlots();
                $('#undoFilterButton').removeClass('hide');
            });
        });
        $('#undoFilterButton').bind('click', function(){
            $('.sessionItem.active').click();
            $(this).addClass('hide');
        });
    }

    this.filterSelectedPointsArray = function(callback){
        var series = self.selectedPointsArray.map(function(r){return r[1]});
        if (series.length == 0){
            return;
        }
        enablePreloader();
        $.ajax({
            url: 'http://calc.cardiomood.com/CardioMoodCalc/webresources/calc/filterRRs',
            type: 'POST',
            data: {
                data: JSON.stringify({
                    series: series
                })
            },
            success: function(data){
                disablePreloader();
                data = data.data;
                var list = data;
                for (var i in list){
                    self.selectedPointsArray[i][1] = list[i];
                }
                callback();
            }
        });
    }

    this.prepareUserInfo = function(){
        var u = self.currentUser;
        var s = '<li><i class="ti-email mr5"></i><span class="userEmail">' + u.get('email') +'</span></li>';
        if (u.get('phone') != undefined && u.get('phone').length > 2){
            s+= '<li><i class="ti-mobile mr5"></i><span class="userPhone">' + u.get('phone') +'</span></li>';
        }
        var birthDate = u.get('birthDate');
        if (birthDate != undefined){
            s+= '<li><i class="ti-calendar mr5"></i>Birth date: <span class="birthDate">' + moment(birthDate).format('LL') +'</span></li>';
        }
        var gender = u.get('gender');
        if (gender != undefined){
            s+= '<li><i class="ti-drupal mr5"></i>Gender: <span class="gender">' + gender +'</span></li>';
        }
        var regVia = u.get('reg_via');
        if (regVia != undefined){
            s+= '<li><i class="ti-plug mr5"></i>Registered via: <span class="gender">' + regVia.replace('_', ' ') +'</span></li>';
        }
        $('#userInfoList').html(s);
    }

    this.initGenerateReportButton = function(){
        $('#generateReportButton').bind('click', function(){
            console.log('generateReportButton clicked');
            $(this).attr('disabled', true);
            //var list = self.selectedPointsArray.map(function(a){return a[1]});
            self.doctorUserCalculationManager.sessionName = self.selectedSession.get('name');
            self.doctorUserCalculationManager.dateString = moment(self.selectedSession.get('startTimestamp')).format('LLL');
            self.doctorUserCalculationManager.launchGenerating(self.selectedPointsArray);
            $('#generateReportMessageId').show();
        });
    }

}