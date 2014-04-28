CardioDataLogin = function(){
    var self = this;
    this.email = undefined;
    this.password =undefined;
    this.token = undefined;
    this.expirationDate = undefined;
    this.userId = undefined;
    this.autologinMode = false;
    this.base = "http://data.cardiomood.com";
    
    this.init = function(){
        self.autologinMode = ( ( gup('autologin') != undefined ) && (gup('autologin') != ""));
        self.prepareLoginForm();
        self.loadDataFromStorage();
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
    
    this.saveLoginAjaxData = function(data){
        self.userId = data.userId;
        self.token = data.token;
        self.expirationDate = data.expirationDate;
        localStorage.setItem('token', self.token);
        localStorage.setItem('userId', self.userId);
        localStorage.setItem('expirationDate', self.expirationDate);
        localStorage.setItem('email', self.email);
        localStorage.setItem('password', self.password);
    }
    
    this.loginUser = function(email, password){
        $.ajax({
            url:  self.base + '/CardioDataWeb/resources/auth/loginByEmailAndPassword',
            type: 'POST',
            //            contentType: "application/json",
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
                    window.location.href = 'home.html';
                }else{
                    alert(data.error.message);
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
            $.ajax({
                type: 'POST',
                url: '/CardioDataWeb/resources/auth/registerUserByEmailAndPassword',
                contentType: "application/json",
                data: {
                    email: email,
                    password: password
                },
                success: function(data){
                    console.log(data);
                    if (data.responseCode == 1){
                        self.loginUser(self.email, self.password);
                    }else{
                        alert(data.error.message);
                    }
                }
            });
        });
    }
}


function getStringFromLocalStorage(name){
    var s = localStorage.getItem(name);
    if (s == undefined || s == ''){
        return undefined;
    }
    return s;
}
