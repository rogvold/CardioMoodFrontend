/**
 * Created by sabir on 31.05.14.
 */
CardioMoodTraineesManagement = function(){
    var self = this;
    this.trainerId = undefined;
    this.trainerToken = undefined;
    this.trainerEmail = undefined;
    this.trainees = [];
    this.invitedTrainees = [];
    this.base = "http://data.cardiomood.com/CardioDataWeb/resources";

    this.init = function(){
        self.loadTrainerParametersFromLocalStorage();
        self.loadTrainees();
        self.loadInvitedTrainees();
        self.initInvitationButton();
    }

    this.loadTrainerParametersFromLocalStorage = function(){
        self.trainerToken = getStringFromLocalStorage('token');
        self.trainerId = getStringFromLocalStorage('userId');
        self.trainerEmail = getStringFromLocalStorage('email');
        if (self.trainerToken == undefined || self.trainerEmail == undefined){
            window.location.href = "trainerLogin.html";
            return;
        }
    }

    this.loadTrainees = function(){
        var list = [];
        $.ajax({
            url: self.base + '/group/getDashboardTrainees',
            type: 'POST',
            data:{
                token: self.trainerToken,
                trainerId: self.trainerId
            },
            success: function(data){
                if (data.error != undefined){
                    if (data.error.code == 20){
                        window.location.href="trainerLogin.html";
                        return;
                    }
                    if (data.error.code == 21){
                        if (data.error.message == 'token is not valid'){
                            window.location.href="trainerLogin.html";
                            return;
                        }
                    }
                    self.showMessage(data.error.message);
//                    alert(data.error.message);
                    return;
                }
                var list = data.data;
                if (list.length == 0){
                    $('#traineesTable').after('<p>You have no trainees</p>');
                    $('#traineesTable').hide();
                }else{
                    self.generateTraineesTable(list);
                }

            }
        });
    }

    this.loadInvitedTrainees = function(){
        var list = [];
        $('#invitedTraineesTable').show();
        $.ajax({
            url: self.base + '/group/getInvitedTrainees',
            type: 'POST',
            data:{
                token: self.trainerToken,
                trainerId: self.trainerId
            },
            success: function(data){
                if (data.error != undefined){
                    if (data.error.code == 20){
                        window.location.href="trainerLogin.html";
                        return;
                    }
                    if ((data.error != undefined) && (data.error.code == 21)){
                        if (data.error.message == 'token is not valid'){
                            window.location.href="trainerLogin.html";
                            return;
                        }
                    }
                    self.showMessage(data.error.message);
//                    alert(data.error.message);
                    return;
                }
                var list = data.data;
                if (list.length == 0){
                    $('#invitedTraineesTable').after('<p>You have no invitations</p>');
                    $('#invitedTraineesTable').hide();
                }else{
                    self.generateInvitedTraineesTable(list);
                }

            }
        });
    }

    this.generateTraineesTable = function(list){
        if (list == undefined || list.length == 0){
            return "";
        }
        var s= '<thead>' +
            '       <tr>' +
            '           <th>ID</th><th>Name</th><th>Delete</th>' +
            '       </tr>' +
            '   </thead>' +
            '   <tbody>';
        for (var i in list){
            s+= '<tr><td>' + list[i].id +'</td><td>' + list[i].firstName + ' ' + list[i].lastName + '</td>' +
                '<td><button data-traineeId="' + list[i].id +'" class="translatable btn btn-danger deleteTraineeButton" data-trRu="Удалить" >Delete</button></td> </tr>';
        }
        s+='</tbody>';
        $('#traineesTable').html(s);
        self.initDeleteTraineeButton();
    }

    this.generateInvitedTraineesTable = function(list){
        if (list == undefined || list.length == 0){
            return "";
        }
        var s= '<thead>' +
            '       <tr>' +
            '           <th>ID</th><th>Name</th><th>Delete</th>' +
            '       </tr>' +
            '   </thead>' +
            '   <tbody>';
        for (var i in list){
            var name = '';
            if (list[i].firstName != undefined){
                name+= list[i].firstName;
            }
            if (list[i].lastName != undefined){
                name+= ' ' + list[i].lastName;
            }
            name = (name == '') ? 'not specified' : name;
            s+= '<tr><td>' + list[i].id +'</td><td>' + name + '</td>' +
                '<td><button type="button" data-traineeId="' + list[i].id +'" class="btn btn-red btn-xs translatable deleteTraineeInvitationButton" data-trRu="удалить приглашение" >delete invitation</button></td> </tr>';
        }
        s+='</tbody>';
        $('#invitedTraineesTable').html(s);
        self.initDeleteInvitationButton();
    }

    this.initInvitationButton = function(){
        $('#inviteButton').bind('click', function(){
            var email = $('#invitationInput').val().trim();
            if (validateEmail(email) == false){
                self.showMessage('Specified email is not valid. Please try again later.');
//                alert('Specified email is not valid. Please try again later.');
                return;
            }
            $.ajax({
                url: self.base + '/group/inviteTraineeByEmail',
                type: 'POST',
                data:{
                    token: self.trainerToken,
                    trainerId: self.trainerId,
                    traineeEmail: email
                },
                success: function(data){
                    console.log(data);
                    if ((data.error != undefined) && (data.error.code == 21)){
                        if (data.error.message == 'token is not valid'){
                            window.location.href="trainerLogin.html";
                            return;
                        }
                    }
                    if (data.error != undefined){
                        self.showMessage(data.error.message);
//                        alert(data.error.message);
                        return;
                    }
                    window.location.href = window.location.href;
                }
            });
        });
    }

    this.initDeleteInvitationButton = function(){
        $('.deleteTraineeInvitationButton').bind('click', function(){
            var traineeId = $(this).attr('data-traineeId');

            $.ajax({
                url: self.base + '/group/removeTraineeInvitation',
                type: 'POST',
                data: {
                    token: self.trainerToken,
                    trainerId: self.trainerId,
                    traineeId: traineeId
                },
                success: function(data){
                    console.log(data);
                    window.location.href=window.location.href;
                }
            });
        });
    }

    this.initDeleteTraineeButton = function(){
        $('.deleteTraineeButton').bind('click', function(){
            var traineeId = $(this).attr('data-traineeId');

            $.ajax({
                url: self.base + '/group/removeTraineeFromDashboard',
                type: 'POST',
                data: {
                    token: self.trainerToken,
                    trainerId: self.trainerId,
                    traineeId: traineeId
                },
                success: function(data){
                    console.log(data);
                    window.location.href=window.location.href;
                }
            });
        });
    }

    this.showMessage = function(message){
        $('#modalMessage').text(message);
        $('#modal-alert').modal('show');
    }

}



function getStringFromLocalStorage(name){
    var s = localStorage.getItem(name);
    if (s == undefined || s == ''){
        return undefined;
    }
    return s;
}