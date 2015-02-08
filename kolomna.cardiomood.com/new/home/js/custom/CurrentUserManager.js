/**
 * Created by sabir on 16.10.14.
 */

var CurrentUserManager = function(){
    var self = this;
    this.currentUser = undefined;
    this.userName = '';
    this.avatarUrl = '';

    this.initParse = function(){
        var appId = '8BiAfjRaj4S9AvHHKKXWOHX40PnEkDdgBEZlp4VY';
        var jsKey = 'tOTGTLVattftp8O8jYwwNOK8WapZdVVKfDue3Lr2';
        Parse.initialize(appId, jsKey);
    }

    this.init = function(callback){
        self.initParse();
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
            window.location.href = '../signin.html';
            return;
        }
        self.userName = self.currentUser.get('firstName') + ' ' + self.currentUser.get('lastName');
        self.avatarUrl = self.currentUser.get('avatarUrl') + '?size=large';
        $('.header-avatar').attr('src', self.avatarUrl);
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
        window.location.href = '../signin.html';
    }

}