/**
 * Created by sabir on 03.06.14.
 */

CardioMoodUserSettings = function(){
    var self = this;
    this.email = undefined;
    this.token = undefined;
    this.userId = undefined;
    this.firstName = undefined;
    this.lastName = undefined;
    this.registrationTimestamp = undefined;
    this.base = "http://data.cardiomood.com";
    this.weight = undefined;
    this.height = undefined;
    this.aerobicBorder = undefined;
    this.anaerobicBorder = undefined;



    this.init = function(){
        self.loadUserParametersFromLocalStorage();

        self.loadUserProfile();
        self.initSaveButton();
    }

    this.loadUserParametersFromLocalStorage = function(){
        self.token = getStringFromLocalStorage('token');
        self.userId = getStringFromLocalStorage('userId');
        self.email = getStringFromLocalStorage('email');
    }

    this.loadUserProfile = function(){
        if (self.userId == undefined || self.token == undefined){
            window.location.href="login.html";
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
                        window.location.href="login.html";
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
            var aerobic = $('#aerobic').val();
            var anaerobic = $('#anaerobic').val();
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

    this.updateSingleMeasurement = function(name, value, callback){
        $.ajax({
            url: self.base + '/CardioDataWeb/resources/v2/SingleMeasurement/rewriteSingleMeasurement',
            type: 'POST',
            data:{
                token: self.token,
                userId: self.userId,
                serializedData: JSON.stringify({

                })

            }
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