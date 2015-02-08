/**
 * Created by sabir on 11.10.14.
 */

var GroupManager = function(){
    var self = this;
    this.groupId = undefined;
    this.groupNumber = undefined;
    this.depId = undefined;
    this.depName = undefined;
    this.depLogo = undefined;
    this.depId = undefined;
    this.users = [];

    this.initParse = function(){
        var appId = 'KNYnAGgkTVXhSXGzccX33w7ayISaEZBTYd01Qr8X';
        var jsKey = 'TiXXLbopBebZXO7XHBVdJGNVlXpEVSHhLkmsaLOh';
        Parse.initialize(appId, jsKey);
    }

    this.init = function(){
        self.initParse();
        self.initCurrentGroup(function(){
            self.loadUsersTable();
        });
        prepareAvatarUploader('avatarInput', 'avatarImg', 'avatarMessage');
        self.initCreateButton();
    }


    this.initCreateButton = function(){
        $('#createButton').bind('click', function(){
            if (self.groupId == undefined){
                alert('groupId is not defined');
                return;
            }
            var firstName = $('#firstName').val().trim();
            var lastName = $('#lastName').val().trim();
            var avatarUrl = $('#avatarImg').attr('src').trim();
            var email = $('#email').val().trim();
            var phone = $('#phone').val().trim();
            var login = email;
            var password = $('#password').val().trim();

            var user = new Parse.User();
            user.set('firstName', firstName);
            user.set('lastName', lastName);
            user.set('depId', self.depId);
            user.set('depName', self.depName);
            user.set('depLogo', self.depLogo);
            user.set('groupId', self.groupId);
            user.set('groupNumber', self.groupNumber);
            user.set('avatarUrl', avatarUrl);
            user.set('phone', phone);

            user.set('username', login);
            user.set('email', email);
            user.set('password', password);
            user.set('userRole', 'Student');

            user.signUp(null, {
                success: function(user){
                    alert('registered');
                    window.location.href = window.location.href;
                },
                error: function(user, error){
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        });
    }

    this.loadUsersTable = function(){
        var s = '';
        var q = new Parse.Query(Parse.User);
        q.equalTo('groupId', self.groupId);
        q.descending('createdAt');
        q.find(function(users){
            for (var i in users){
                var u = users[i];
                s+= ('<tr><td>' + (parseInt(i) + 1) +'</td><td><a href="student.html?userId=' + u.id +'" >' + (u.get('firstName') + ' ' + u.get('lastName')) +'</a></td><td>' + u.get('phone') +'</td><td>' + u.get('email') +'</td><td><img class="ava" src="' + u.get('avatarUrl') +'?size=large" /></td><td><img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + u.id +'" /></td></tr>');
            }
            $('#studentsTable').append(s);
        });
    }

    this.initCurrentGroup = function(callback){
        self.groupId = gup('groupId');
        if (self.groupId == undefined){
            window.location.href = 'departments.html';
            return;
        }
        var q = new Parse.Query(Parse.Object.extend('StudentGroup'));
        q.get(self.groupId, {
            success: function(g){
                self.groupNumber = g.get('groupNumber');
                self.depId = g.get('depId');
                var query = new Parse.Query(Parse.Object.extend('Department'));
                query.get(self.depId, {
                    success: function(dep){
                        self.depName = dep.get('shortName');
                        self.depLogo = dep.get('logo');
                        $('#groupInfoBlock').html('<h1><img src="' + self.depLogo +'" /> <a href="groups.html?depId=' + self.depId +'" > ' + self.depName +'</a> - ' + self.groupNumber +'</h1>');
                        callback();
                    }
                });
            }
        });
    }

}


//http://qrickit.com/api/qr?d=sabir