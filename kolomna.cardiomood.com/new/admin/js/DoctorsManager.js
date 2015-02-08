/**
 * Created by sabir on 16.10.14.
 */

var DoctorsManager = function(){
    var self = this;
    var self = this;
    this.users = [];

    this.initParse = function(){
        var appId = 'KNYnAGgkTVXhSXGzccX33w7ayISaEZBTYd01Qr8X';
        var jsKey = 'TiXXLbopBebZXO7XHBVdJGNVlXpEVSHhLkmsaLOh';
        Parse.initialize(appId, jsKey);
    }

    this.init = function(){
        self.initParse();
        prepareAvatarUploader('avatarInput', 'avatarImg', 'avatarMessage');
        self.initCreateButton();
        self.loadUsersTable();
    }


    this.initCreateButton = function(){
        $('#createButton').bind('click', function(){
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

            user.set('avatarUrl', avatarUrl);
            user.set('phone', phone);

            user.set('username', login);
            user.set('email', email);
            user.set('password', password);
            user.set('userRole', 'Doctor');

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
        q.equalTo('userRole', 'Doctor');
        q.descending('createdAt');
        q.find(function(users){
            for (var i in users){
                var u = users[i];
                s+= ('<tr><td>' + (parseInt(i) + 1) +'</td><td><a href="doctor.html?userId=' + u.id +'" >' + (u.get('firstName') + ' ' + u.get('lastName')) +'</a></td><td>' + u.get('phone') +'</td><td>' + u.get('email') +'</td><td><img class="ava" src="' + u.get('avatarUrl') +'?size=large" /></td>' +
                    '</tr>');
            }
            $('#doctorsTable').append(s);
        });
    }

}