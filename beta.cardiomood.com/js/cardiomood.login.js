/**
 *
 * @description
 * use this class for authorization in cardiomood services
 *
 * @author
 * Sabir Shaykhlislamov
 *
 * @copyright
 * CardioMood 2014
 *
 *
 *
 * @example
 * cdl = new CardioDataLogin();
 * cdl.registerMode = "trainer"; or cdl.registerMode = "user"; ("user" is default value)
 * cdl.init();
 *
 * @requires
 * on the webpage should be the following inputs:
 *                                        #email,
 *                                        #password,
 *                                        #registerEmail,
 *                                        #registerPassword,
 *                                        #registerPasswordConfirmation
 *
 */

CardioDataLogin = function(){
    var self = this;
    this.email = undefined;
    this.password =undefined;
    this.token = undefined;
    this.expirationDate = undefined;
    this.userId = undefined;
    this.userRole = undefined;
    this.autologinMode = false;
    this.base = "http://data.cardiomood.com";
    this.registerMode = "user"; // can be 'user' or 'trainer'
    this.redirectUri = "home.html";
    this.logoutUri = "login.html";


    this.init = function(){
        self.autologinMode = ( ( gup('autologin') != undefined ) && (gup('autologin') != ""));
        self.prepareLoginForm();
        self.loadDataFromStorage();
        self.prepareRegisterForm();
        self.prepareLogoutButton();
        self.checkAuthorization();
        self.prepareCurrentUserInterface();
    }
    
    this.loadDataFromStorage = function(){
        self.email = getStringFromLocalStorage('email');
        self.password = getStringFromLocalStorage('password');
        self.token = getStringFromLocalStorage('token');
        self.expirationDate = getStringFromLocalStorage('expirationDate');
        self.userId = getStringFromLocalStorage('userId');
        $('input[name="email"]').val(self.email);
        $('input[name="password"]').val(self.password);
        if (self.autologinMode == true){
            $('#loginButton').click();
        }
    }

    this.checkAuthorization = function(){
        if (window.location.href.toLowerCase().indexOf('login') != -1){
            return;
        }
        if (self.token == undefined || self.email == undefined){
            window.location.href = self.logoutUri;
            return;
        }
    }
    
    this.saveLoginAjaxData = function(data){
        self.userId = data.userId;
        self.token = data.token;
        self.expirationDate = data.expirationDate;
        self.userRole = data.userRole;
        localStorage.setItem('token', self.token);
        localStorage.setItem('userId', self.userId);
        localStorage.setItem('expirationDate', self.expirationDate);
        localStorage.setItem('email', self.email);
        localStorage.setItem('password', self.password);
        localStorage.setItem('role', self.userRole);
    }
    
    this.loginUser = function(email, password){
        $.ajax({
            url:  self.base + '/CardioDataWeb/resources/auth/loginByEmailAndPassword',
            type: 'POST',
            data: {
                email: email,
                password: password
            },
            success: function(data){
                console.log(data);
                if (data.responseCode == 1){
                    self.email = email;
                    self.password = password;
                    self.saveLoginAjaxData(data.data);

                    window.location.href = self.redirectUri;
                }else{
                    alert(data.error.message);
                    console.log(data.error.message);
                }
            }
        });
        
    }
    
    this.prepareLoginForm = function(){
        $('#loginButton').bind('click', function(){
            
            var email = $('#email').val();
            var password = $('#password').val();
            if (validateEmail(email) == false){
                alert('E-mail is empty. Please try again.');
                return;
            }
            if (password == undefined || password == ''){
                alert('Password is empty. Please try again.');
                return;
            }
            self.loginUser(email, password);
        });
        
    }
    
    this.prepareRegisterForm = function(){
        $('#registerButton').bind('click', function(){
            
            var email = $('#registerEmail').val();
            var password = $('#registerPassword').val();
            var passwordConfirmation = $('#registerPasswordConfirmation').val();
            if (validateEmail(email) == false){
                alert('E-mail is empty. Please try again.');
                return;
            }
            if (password == undefined || password == ''){
                alert('Password is empty. Please try again.');
                return;
            }
            if (password != passwordConfirmation){
                alert('password confirmation is not equal to password');
                return;
            }

            var sUrl = '/CardioDataWeb/resources/auth/registerUserByEmailAndPassword';
            if (self.registerMode == "trainer"){
                sUrl = '/CardioDataWeb/resources/auth/registerTrainerByEmailAndPassword';
            }

            $.ajax({
                type: 'POST',
                url: self.base + sUrl,
                data: {
                    email: email,
                    password: password
                },
                success: function(data){
                    console.log(data);
                    self.email = email;
                    self.password = password;
                    localStorage.setItem("email", email);
                    localStorage.setItem("password", password);
                    if (data.responseCode == 1){
                        self.loginUser(self.email, self.password);
                    }else{
                        alert(data.error.message);
                    }
                }
            });
        });
    }

    this.prepareLogoutButton = function(){
        $('.logoutButton').bind('click', function(){
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("email");
            localStorage.removeItem("password");
            window.location.href = self.logoutUri;
        });
    }

    this.prepareCurrentUserInterface = function(){
        var email = getStringFromLocalStorage("email");
        var userId = getStringFromLocalStorage("userId");
        $('.currentUserEmail').text(email);
    }

}


function getStringFromLocalStorage(name){
    var s = localStorage.getItem(name);
    if (s == undefined || s == ''){
        return undefined;
    }
    return s;
}
