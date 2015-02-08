/**
 * Created by sabir on 22.12.14.
 */

var UserDashboardManager = function(){
    var self = this;
    this.currentUserManager = new CurrentUserManager();
    this.userLinks = [];
    this.doctors = [];
    this.allDoctors = [];
    this.allGroups = [];
    this.sessions = [];
    this.chartManager = new CmChartManager();
    this.commentsManager = new SessionCommentsManager();

    this.init = function(){
        initParse();
        self.initDeleteDoctorLink();
        self.initAddGroupButton();
        self.initSessionItem();
        self.initSessionSettings();
        self.initDeleteSessionLink();

        self.initFilterButton();

        console.log('try to init chartManager');
        self.chartManager.init();
        self.initStressChart();

        self.currentUserManager.init(function(){
            if (self.currentUserManager.currentUser.get('userRole') != 'user'){
                self.currentUserManager.logout();
            }
            self.loadUserLinks(function(){
                self.loadAllGroups(function(){
                    self.loadDoctors(function(){
                        self.loadSessions(function(){
                            self.drawDoctorsList();
                            self.drawSessionsList();
                            self.commentsManager.init(self.currentUserManager.currentUser, 'commentsBlock');
                        });

                    });
                });
            });
        });
    }

    this.initAddGroupButton = function(){
        $('#addGroupButton').bind('click', function(){
            var code = $('#code').val().trim();
            if (code == '' || code == undefined){
                toastr.error('code is empty');
                return;
            }
            var g = undefined;
            code = code.toLowerCase();
            for (var i in self.allGroups){
                if (self.allGroups[i].get('invitationCode').toLowerCase() == code){
                    g = self.allGroups[i];
                    break;
                }
            }
            if (g == undefined){
                toastr.error('invalid code');
                return;
            }

            if (self.getLinkByGroupIdAndUserId(g.id, self.currentUserManager.currentUser.id) != undefined){
                toastr.error('You have already added this doctor.');
                return;
            }

            var UserLink = Parse.Object.extend('UserLink');
            var l = new UserLink();
            l.set('userId', self.currentUserManager.currentUser.id);
            l.set('groupId', g.id);
            enablePreloader();
            l.save().then(function(){
                disablePreloader();
                window.location.href = window.location.href;
            });

        });
    }

    this.getLinkByGroupIdAndUserId = function(groupId, userId){
        var list = self.userLinks;
        var arr = [];
        for (var i in list){
            if (list[i].get('userId') == userId && list[i].get('groupId') == groupId){
                return list[i];
            }
        }
        return undefined;
    }

    this.loadDoctors = function(callback){
        var q = new Parse.Query(Parse.User);
        q.limit(1000);
        q.equalTo('userRole', 'doctor');
        enablePreloader();
        q.find(function(results){
            self.allDoctors = results;
            var arr = [];
            var ids = self.userLinks.map(function(w){return self.getGroupById(w.get('groupId')).get('ownerId')});
            console.log('ids', ids);
            for (var i in results){
                if ($.inArray(results[i].id, ids) > -1){
                    arr.push(results[i]);
                }
            }
            self.doctors = arr;
            console.log('doctors', arr);
            disablePreloader();
            callback();
        });
    }

    this.getGroupById = function(id){
        var list = self.allGroups;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
    }

    this.loadAllGroups = function(callback){
        var q = new Parse.Query(Parse.Object.extend('UserGroup'));
        q.limit(1000);
        enablePreloader();
        q.find(function(results){
            self.allGroups = results;
            disablePreloader();
            callback();
        });
    }

    this.loadUserLinks = function(callback){
        var q = new Parse.Query(Parse.Object.extend('UserLink'));
        q.limit(1000);
        q.equalTo('userId', self.currentUserManager.currentUser.id);
        enablePreloader();
        q.find(function(results){
            self.userLinks = results;
            disablePreloader();
            callback();
        });
    }

    this.drawDoctorsList = function(){
        var list = self.doctors;
        var s = '';
        for (var i in list){
            var d = list[i];
            s+='<li class="doctorItem p10 bb" data-id="' + d.id +'" ><span class="doctorName" >' + d.get('firstName') + ' ' + d.get('lastName') + '</span>' +

            '<span class="doctorControls" ><i class="ti-trash deleteDoctorLink pull-right ' + (d.id == 'SSNDRbQUUS' ? 'hide' : '') + '" data-id="' + d.id + '" ></i></span>' +

            '</li>';
        }
        $('#doctorsList').html(s);
    }



    self.initDeleteDoctorLink = function(){
        $('body').on('click', '.deleteDoctorLink', function(){
            if (confirm('Do you really want to remove this doctor from the list?') == false){
                return;
            }
            var dId = $(this).attr('data-id');


            var links = self.getDoctorLinks(dId);
            console.log('doctors links = ', links);
            enablePreloader();
            Parse.Object.destroyAll(links, {
                success: function () {
                    disablePreloader();
                    window.location.href = window.location.href;
                }
            });
        });
    }

    this.getDoctorLinks = function(dId){
        var doctorGroups = [];
        var list = self.allGroups;
        for (var i in list){
            if (list[i].get('ownerId') == dId){
                doctorGroups.push(list[i]);
            }
        }
        console.log('doctor groups', doctorGroups);
        var links = [];
        for (var i in doctorGroups){
            var g = doctorGroups[i];
            for (var j in self.userLinks){
                if (self.userLinks[j].get('groupId') == g.id){
                    links.push(self.userLinks[j]);
                }
            }
        }
        return links;
    }

    this.loadSessions = function(callback){
        var q = new Parse.Query(Parse.Object.extend('CardioSession'));
        q.equalTo('userId', self.currentUserManager.currentUser.id);
        q.notEqualTo('deleted', true);
        q.limit(1000);
        q.addDescending('startTimestamp');
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
        if (list.length > 0){
            $('#lastOnline').html(moment(list[0].get('endTimestamp')).format('DD.MM.YYYY HH:mm:ss'));
        }
        $('a.sessionItem:first').click();
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
                    if (i == 0 && j == 0){
                        t0 = ts[j];
                    }
                    arr.push([ts[j] - t0, rrs[j]]);
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
            });
        });
    }

    self.drawPlots = function(){
        var points = self.selectedPointsArray;
        console.log('starting drawing points', points);
        //todo: implement plots drawing
        console.log('drawing', self.selectedPointsArray);
        self.chartManager.updateData(self.selectedPointsArray);
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

    this.initDeleteSessionLink = function(){
        $('.deleteSessionLink').bind('click', function(){
            var s = self.selectedSession;
            if (confirm('Are you sure') == false){
                return;
            }
            enablePreloader();
            s.set('deleted', true);
            s.save().then(function(){
                disablePreloader();
                window.location.href = window.location.href;
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
            });
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




}