/**
 * Created by sabir on 16.10.14.
 */

var LoginManager = function(){
    var self = this;
    this.currentUser = undefined;


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
                yaCounter27895467.reachGoal('login');
                window.location.href = 'index.html';
            });
        });
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
                                yaCounter27895467.reachGoal('login');
                                toastr.info("User signed up and logged in through Facebook!");
                                window.location.href = 'index.html';
                            });
                        });
                    } else {
                        toastr.info("User logged in through Facebook!");
                        yaCounter27895467.reachGoal('login');
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

        $('#resetPasswordButton').bind('click', function(){
            var email = $('#resetPasswordEmail').val().trim();
            if (validateEmail(email) == false){
                toastr.error('invalid email');
                return;
            }
            $(this).attr('disabled', true);
            $(this).html('wait...');
            Parse.User.requestPasswordReset(email, {
                success:function() {
                    toastr.success("Reset instructions emailed to you.");
                },
                error:function(error) {
                    toastr.error(error.message);
                    $('#resetPasswordButton').removeAttr('disabled');
                    $('#resetPasswordButton').html('reset');
                }
            });
        });

    }

}