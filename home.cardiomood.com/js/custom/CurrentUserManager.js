/**
 * Created by sabir on 16.10.14.
 */

var CurrentUserManager = function(){
    var self = this;
    this.currentUser = undefined;
    this.userName = '';
    this.avatarUrl = '';

    this.init = function(callback){
        initParse();
        self.prepareUserInfo(function(){
            if (callback != undefined){
                callback();
            }
        });
    }

    this.prepareUserInfo = function(callback){
        self.currentUser = Parse.User.current();
        console.log('current user is: ');
        console.log(self.currentUser);
        if (self.currentUser == undefined){
            window.location.href = 'signin.html';
            return;
        }
        self.userName = self.currentUser.get('firstName') + ' ' + self.currentUser.get('lastName');
        self.avatarUrl = (self.currentUser.get('avatar') != undefined) ? ( self.currentUser.get('avatar') + '?size=large') : 'http://home.cardiomood.com/img/anonym.png';
        $('.header-avatar, .avatar').attr('src', self.avatarUrl);
        $('.username').text(self.userName);
        self.initLogoutLink();
        callback();
    }


    this.initLogoutLink = function(){
        $('.logoutLink').bind('click', function(){
            self.logout();
        });;
    }

    this.logout = function(){
        Parse.User.logOut();
        window.location.href = 'signin.html';
    }

}