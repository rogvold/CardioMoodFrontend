/**
 * Created by sabir on 30.05.14.
 */

CardioMoodTrainerSettings = function(){
    var self = this;
    this.email = undefined;
    this.token = undefined;
    this.userId = undefined;
    this.firstName = undefined;
    this.lastName = undefined;
    this.registrationTimestamp = undefined;
    this.base = "http://data.cardiomood.com"

    this.init = function(){
        self.loadTrainerParametersFromLocalStorage();
        self.loadTrainerProfile();
        self.initSaveButton();
    }

    this.loadTrainerParametersFromLocalStorage = function(){
        self.token = getStringFromLocalStorage('token');
        self.userId = getStringFromLocalStorage('userId');
        self.email = getStringFromLocalStorage('email');
    }

    this.loadTrainerProfile = function(){
        if (self.userId == undefined || self.token == undefined){
            window.location.href="trainerLogin.html";
            return;
        }
        $.ajax({
            url: self.base + '/CardioDataWeb/resources/auth/getUserByToken',
            type: 'POST',
            data:{
              token: self.token
            },
            success: function(data){
                console.log(data);
                if (data.data == undefined){
                    if (data.error.code == 20){
                        window.location.href="trainerLogin.html";
                        return;
                    }
                }
                self.registrationTimestamp = data.registrationDate;
                self.firstName = data.data.firstName;
                self.lastName = data.data.lastName;
                $('#firstName').val(self.firstName);
                $('#lastName').val(self.lastName);
            }
        });
    }

    this.initSaveButton = function(){
        $('#saveButton').bind('click', function(){
            var firstName = $('#firstName').val().trim();
            var lastName = $('#lastName').val().trim();
            $.ajax({
                url: self.base + '/CardioDataWeb/resources/auth/updateUserInfo',
                type: 'POST',
                data:{
                    token: self.token,
                    userId: self.userId,
                    firstName: firstName,
                    lastName: lastName
                },
                success: function(data){
                    alert('Your profile has been updated!');
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