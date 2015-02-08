/**
 * Created by sabir on 21.12.14.
 */

var SignupManager = function(){
    var self = this;
    this.user = undefined;


    this.init = function(){
        initParse();
        self.checkIfLoggedIn();
        self.initSignupButton();
    }


    this.initSignupButton = function(){
        $('#signupButton').bind('click', function(){
            var firstName = $('#firstName').val();
            var lastName = $('#lastName').val();
            var email = $('#email').val();
            if (validateEmail(email) == false){
                toastr.error('invalid email');
                return;
            }
            var password = $('#password').val().trim();
            var confirmPassword = $('#confirmPassword').val().trim();
            if (password != confirmPassword){
                toastr.error('password and password confirmation are not equal');
                return;
            }
            var u = new Parse.User();
            u.set('username', email);
            u.set('email', email);
            u.set('password', password);
            u.set('userPassword', password);
            u.set('firstName', firstName);
            u.set('lastName', lastName);
            u.set('userRole', 'doctor');
            u.set('reg_via', 'website');
            u.set('realTimeMonitoring', false);
            enablePreloader();
            u.signUp(null, {
                success: function(user){
                    self.user = user;
                    disablePreloader();
                    window.location.href = 'index.html';
                    return;
                },
                error: function(user, error){
                    toastr.error(error.message);
                    disablePreloader();
                    return;
                }
            });

        });
    }

    this.checkIfLoggedIn = function(){
        if (Parse.User.current() != null){
            window.location.href = 'index.html';
        }

    }

}