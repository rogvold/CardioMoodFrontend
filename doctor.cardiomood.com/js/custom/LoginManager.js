/**
 * Created by sabir on 16.10.14.
 */

var LoginManager = function(){
    var self = this;
    this.currentUser = undefined;


    this.init = function(){
        initParse();
        self.checkCurrentUser(function(){
            self.initLoginButton();
        });
    }

    this.checkCurrentUser = function(callback){
        if (Parse.User.current() != undefined){
            window.location.href = 'index.html';
            return;
        }
        callback();
    }


    this.login = function(username, password, callback){
        console.log('trying to logIn: username = ' + username + ' ; password = ' + password);
        Parse.User.logIn(username, password, {
            success: function(user){
                self.currentUser = Parse.User.current();
                callback();
            },
            error: function(user, error){
                //alert(error.message);
                toastr.error(error.message);
            }
        });
    }

    this.initLoginButton = function(){
        $('#loginButton').bind('click', function(){
            var username = $('#email').val().trim();
            var pass = $('#password').val().trim();
            enablePreloader();

            self.login(username, pass, function(){
                disablePreloader();
                window.location.href = 'index.html';
            });
        });
    }

}