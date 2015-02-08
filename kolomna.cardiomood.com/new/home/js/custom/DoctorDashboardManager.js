/**
 * Created by sabir on 16.10.14.
 */

var DoctorDashboardManager = function(){
    var self = this;
    this.currentUserManager = new CurrentUserManager();
    this.students = [];

    this.init = function(){
        self.currentUserManager.init(function(){
            if (self.currentUserManager.currentUser.get('userRole') != 'Doctor'){
                self.currentUserManager.logout();
            }
            self.loadStudents(function(){
                console.log(self.students);
                self.generateStudentCards();
            });
        });
    }

    this.loadStudents = function(callback){
        var q = new Parse.Query(Parse.User);
        q.equalTo('userRole', 'Student');
        q.ascending('depName');
        q.ascending('groupNumber');
//        q.descending('createdAt');
        q.limit(1000);
        q.find(function(users){
            console.log(users);
            self.students = users;
            callback();
        });
    }


    this.generateStudentCards = function(){
        var list = self.students;
        var s = '';
        var prevDepName = '';
        var currDepName = list[0].get('depName');
        for (var i in list){
            currDepName = list[i].get('depName');
            if (prevDepName != currDepName){
                s+='<div class="clearfix"></div>';
                s+='<h2 style="margin-left: 15px;">' + currDepName +'</h2>';
//                s+='<div class="clearfix"></div>';
            }
            prevDepName = currDepName;
            s += self.generateStudentCardHtml(list[i]);
        }
        console.log(s);
        $('#studentsCards').html(s);
    }

    this.generateStudentCardHtml = function(u){
        if (u == undefined){
            return '';
        }
        var s = '';


        s+=('<div class="col-md-4">'
            +'<div class="panel overflow-hidden no-b profile p15">'
            +'<div class="row">'
                +'<div class="col-sm-12">'
                    +'<div class="row">'
                        +'<div class="col-xs-12 col-sm-8">'
                            +'<h4 class="mb0 studentName">' + u.get('firstName')+ ' ' + u.get('lastName') +'</h4>'
                            +'<small><span class="studentDepartment">' + u.get('depName') +'</span> - <span class="studentGroupNumber" >' + u.get('groupNumber') + '</span></small>'
                            +'<ul class="user-meta">'
                                +'<li>'
                                    +'<i class="ti-email mr5"></i>'
                                    +'<span class="studentEmail">' + u.get('email') +'</span>'
                                +'</li>'
                                +'<li>'
                                    +'<i class="ti-mobile mr5"></i>'
                                    +'<span" class="studentPhone" >' + u.get('phone') + '</span>'
                                +'</li>'
//                                +'<li>'
//                                    +'<i class="ti-settings mr5"></i>'
//                                    +'<a href="javascript:void(0);" data-id="' + u.id + '" >view profile</a>'
//                                +'</li>'
                            +'</ul>'
                        +'</div>'
                        +'<div class="col-xs-12 col-sm-4 text-center">'
                            +'<figure>'
                                +'<img onclick="window.location.href=\'student.html?id=' + u.id +'\'" src="' + u.get('avatarUrl') + '?size=large" alt="" class="avatar avatar-lg studentAvatar img-circle avatar-bordered">'
//                                    +'<div class="small mt10">Stress</div>'
//                                    +'<div class="progress progress-xs mt5 mb5">'
//                                        +'<div class="progress-bar done" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 40%">'
//                                        +'</div>'
//                                    +'</div>'
//                                    +'<small>234 / 879</small>'
                                +'</figure>'
                            +'</div>'
                        +'</div>'
                    +'</div>'

                +'</div>'

            +'</div>'

            +'</div>');


        return s;
    }

}