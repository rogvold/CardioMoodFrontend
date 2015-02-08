/**
 * Created by sabir on 12.10.14.
 */

var StudentManager = function(){
    var self = this;
    this.user = undefined;
    this.userId = undefined;

    this.initParse = function(){
        var appId = 'KNYnAGgkTVXhSXGzccX33w7ayISaEZBTYd01Qr8X';
        var jsKey = 'TiXXLbopBebZXO7XHBVdJGNVlXpEVSHhLkmsaLOh';
        Parse.initialize(appId, jsKey);
    }

    this.init = function(){
        self.initParse();
        self.loadUser(function(){

        })
    }


    this.loadUser = function(callback){
        self.userId = gup('userId');
        if (self.userId == undefined){
            alert('userId is void');
            window.location.href = 'groups.html';
            return;
        }
        var q = new Parse.Query(Parse.User);
        q.get(self.userId, {
            success: function(user){
                self.user = user;
                self.prepareUserInfo();
                callback();
            }
        });
    }

    this.prepareUserInfo = function(){
        var u = self.user;
        $('#userAvatarImg').attr('src', u.get('avatarUrl') + '?size=large');
        $('.userName').html(u.get('firstName') + ' ' + u.get('lastName'));
        $('.depInfo').html('<a href="groups.html?depId=' + u.get('depId') +'" >' + u.get('depName') +'</a> - <a href="group.html?groupId=' + u.get('groupId') +'" >' + u.get('groupNumber') +'</a>');
        $('.userEmail').html(u.get('email'));
        $('.userPhone').html(u.get('phone'));
        $('#QR_card_placeholder').html(getStudentQrCardHtml(self.userId, u.get('firstName') + ' ' + u.get('lastName'), u.get('groupNumber'), u.get('email'), u.get('phone')));
    }

    this.generateQrCardHtml = function(){
        var s = '';
    }

}