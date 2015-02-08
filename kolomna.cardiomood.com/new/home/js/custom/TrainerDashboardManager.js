/**
 * Created by sabir on 29.10.14.
 */

var TrainerDashboardManager = function(){
    var self = this;
    this.trainees = [];
    this.currentUserManager = new CurrentUserManager();
    this.interfaceDisabled = false;

    this.initParse = function(){
        var appId = '8BiAfjRaj4S9AvHHKKXWOHX40PnEkDdgBEZlp4VY';
        var jsKey = 'tOTGTLVattftp8O8jYwwNOK8WapZdVVKfDue3Lr2';
        Parse.initialize(appId, jsKey);
    }


    this.init = function(){
        self.initParse();
        self.currentUserManager.init(function(){
            if (self.currentUserManager.currentUser.get('userRole') != 'Trainer'){
                self.currentUserManager.logout();
            }
            self.loadTrainees(function(){
                console.log(self.students);
                self.generateTraineesCards();
            });
        });
        self.initCreateButton();
    }

    this.loadTrainees = function(callback){
        var q = new Parse.Query(Parse.User);
        q.equalTo('userRole', 'Trainee');
        q.addAscending('firstName');
        q.addAscending('lastName');
        q.limit(1000);
        q.find(function(users){
            console.log(users);
            self.trainees = users;
            callback();
        });
    }

    this.generateTraineesCards = function(){
        var list = self.trainees;

        var s = '';
        for (var i in list){
            s += self.generateTraineeCardHtml(list[i]);
        }
        console.log(s);
        $('#traineesCards').html(s);
        $(".icheck").iCheck();
        $('.traineeCheckbox').on('ifChanged', function(event){
            var checked = event.target.checked;
            var userId = $(this).attr('data-id');
            console.log(userId, checked);
            self.checkboxChanged(userId, checked, function(){
//                alert('saved');
            });
        });
        if (self.getSelectedUsers().length > 0){
            self.enableMonitoringLink();
        }else{
            self.disableMonitoringLink();
        }

    }


    this.generateTraineeCardHtml = function(u){
        if (u == undefined){
            return '';
        }
        var s = '';
        var checkedS = (self.isSelectedUser(u.id)) ? ' checked ' : '';

        s+=('<div class="col-md-4">'
            +'<div class="panel overflow-hidden no-b profile p15 icheck">'
            +'<div class="row">'
            +'<div class="col-sm-12">'
            +'<div class="row">'
            +'<div class="col-xs-12 col-sm-10">'
            +'<h4 class="mb0 studentName">' + u.get('firstName')+ ' ' + u.get('lastName') +'</h4>'
            +'<ul class="user-meta">'
            +'<li>'
            +'<i class="ti-email mr5"></i>'
            +'<span class="studentEmail">' + u.get('email') +'</span>'
            +'</li>'
            +'<li>'
            +'<i class="ti-mobile mr5"></i>'
            +'<span" class="studentPhone" >' + u.get('phone') + '</span>'
            +'</li>'
            +'</ul>'
            +'</div>'
            +'<div class="col-xs-12 col-sm-2 text-center">'
            +'<figure>'
            +'<div class="mb5 mt10">' +
            '   <input type="checkbox" data-id="'+ u.id +'" ' + checkedS + ' class="traineeCheckbox" id="minimal-checkbox-1">' +
            '</div>'
            +'</figure>'
            +'</div>'
            +'</div>'
            +'</div>'

            +'</div>'

            +'</div>'

            +'</div>');

        return s;
    }


    this.initCreateButton = function(){
        $('#createNewUserButton').bind('click', function(){
            var firstName = $('#newUserFirstName').val().trim();
            var lastName = $('#newUserLastName').val().trim();
            var email = $('#newUserEmail').val().trim();
            var password = $('#newUserPassword').val().trim();
            var phone = $('#newUserPhone').val().trim();
            var u = new Parse.User();
            u.set('userRole', 'Trainee');
            u.set('firstName', firstName);
            u.set('lastName', lastName);
            u.set('phone', phone);
            u.set('userPassword', password);
            u.set('email', email);
            u.set('username', email);
            u.set('password', password);
            u.signUp(null, {
                success: function(user, error){
                    Parse.User.become(self.currentUserManager.currentUser._sessionToken);
                    self.loadTrainees(function(){self.generateTraineesCards()});
                },
                error: function(user, error){
                    alert(error.message);
                }
            });
        });
    }

    this.getTraineeById = function(traineeId){
        var list = self.trainees;
        for (var i in list){
            if (list[i].id == traineeId){
                return list[i];
            }
        }
        return undefined;
    }

    this.checkboxChanged = function(userId, checked, callback){
        self.disableMonitoringLink();
        var relation = self.currentUserManager.currentUser.relation('selectedUser');
        var tr = self.getTraineeById(userId);
        var arr = self.currentUserManager.currentUser.get('selectedTrainees');
        if (checked == true){
            relation.add(tr);
            arr.push(userId);
        }else{
            relation.remove(tr);
            arr = self.removeFromArray(arr, userId);
        }
        self.currentUserManager.currentUser.set('selectedTrainees', arr);
        self.currentUserManager.currentUser.save().then(function(){
            if (self.getSelectedUsers().length > 0){
                self.enableMonitoringLink();
            }

            callback();
        });
    }

    this.removeFromArray = function(arr, uId){
        var index = arr.indexOf(uId);
        if (index > -1) {
            arr.splice(index, 1);
        }
        return arr;
    }

    this.isSelectedUser = function(userId){
        var arr = self.currentUserManager.currentUser.get('selectedTrainees');
        if (arr.indexOf(userId) > -1){
            return true;
        }
        return false;
    }

    this.enableMonitoringLink = function(){
//        $('#monitoringLink').css('opacity', '1');
        $('#monitoringLink').show();
        $('.selectedCount').html(self.getSelectedUsers().length);
    }

    this.disableMonitoringLink = function(){
        console.log('disableMonitoringLink');
//        $('#monitoringLink').css('opacity', '0.01');
        $('#monitoringLink').hide();
    }

    this.getSelectedUsers = function(){
        var arr = [];
        $('input.traineeCheckbox:checked').each(function(){
            var userId = $(this).attr('data-id');
            arr.push(self.getTraineeById(userId));
        });
        return arr;
    }

}
