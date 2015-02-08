/**
 * Created by sabir on 21.12.14.
 */

var SignupManager = function(){
    var self = this;
    this.user = undefined;


    this.init = function(){
        initParse();
        window.fbAsyncInit = function() {
            Parse.FacebookUtils.init({
                appId: '788471417852291',
                status: true,
                cookie: true,
                xfbml: true
            });
        }
        self.checkIfLoggedIn();
        self.initSignupButton();
    }


    this.initSignupButton = function(){
        self.initSignupFacebookButton();
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
            u.set('userRole', 'user');
            u.set('reg_via', 'website');
            u.set('realTimeMonitoring', false);
            //enablePreloader();
            $(this).attr('disabled', true);
            $(this).text('wait...');
            u.signUp(null, {
                success: function(user){
                    self.user = user;
                    disablePreloader();
                    window.location.href = 'index.html';
                    return;
                },
                error: function(user, error){
                    toastr.error(error.message);
                    //disablePreloader();
                    $('#signupButton').removeAttr('disabled');
                    $('#signupButton').text('Sign up');
                    return;
                }
            });

        });
    }

    this.initSignupFacebookButton = function(){
        $('#facebookSigninButton').bind('click', function(){
            $('#facebookSigninButton').attr('disabled', true);
            $('#facebookSigninButton').html('wait...');

            Parse.FacebookUtils.logIn("public_profile,email", {
                success: function(user) {
                    if (!user.existed()) {
                        FB.api('/me', function(me) {
                            user.set("displayName", me.name);
                            user.set("email", me.email);
                            user.set('reg_via', 'website');
                            user.set('firstName', me.first_name);
                            user.set('lastName', me.last_name);
                            user.set('userRole', 'user');
                            user.set('facebookId', me.id);
                            user.set('timezone', me.timezone);
                            user.set('locale', me.locale);
                            if (me.gender != undefined){
                                user.set('gender', me.gender.toUpperCase());
                            }
                            console.log("/me response", me);
                            user.save().then(function(){
                                toastr.info("User signed up and logged in through Facebook!");
                                window.location.href = 'index.html';
                            });
                        });
                    } else {
                        toastr.info("User logged in through Facebook!");
                        window.location.href = 'index.html';
                    }
                },
                error: function(user, error) {
                    $('#facebookSigninButton').removeAttr('disabled');
                    $('#facebookSigninButton').html('<i class="ti-facebook" ></i> Login with Facebook');
                    toastr.error("User cancelled the Facebook login or did not fully authorize.");
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