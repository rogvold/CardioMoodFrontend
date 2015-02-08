/**
 * Created by sabir on 03.06.14.
 */
CardioMoodTrainersManagement = function(){
    var self = this;
    this.userId = undefined;
    this.token = undefined;
    this.email = undefined;
    this.trainers = [];
    this.userGroupRequests = [];
    this.base = "http://data.cardiomood.com/CardioDataWeb/resources";

    this.init = function(){
        self.loadUserParametersFromLocalStorage();
        self.loadTrainers();
        self.loadInvitors();
    }

    this.loadUserParametersFromLocalStorage = function(){
        self.token = getStringFromLocalStorage('token');
        self.userId = getStringFromLocalStorage('userId');
        self.email = getStringFromLocalStorage('email');
        if (self.token == undefined || self.token == undefined){
            window.location.href = "login.html";
            return;
        }
    }

    this.loadTrainers = function(){
        var list = [];
        $.ajax({
            url: self.base + '/group/getMyTrainers',
            type: 'POST',
            data:{
                token: self.token,
                userId: self.userId
            },
            success: function(data){
                if (data.error != undefined){
                    if (data.error.code == 20){
                        window.location.href="login.html";
                        return;
                    }
                    if (data.error.code == 21){
                        if (data.error.message == 'token is not valid'){
                            window.location.href="login.html";
                            return;
                        }
                    }
                    self.showMessage(data.error.message);
//                    alert(data.error.message);
                    return;
                }
                var list = data.data;
                if (list.length == 0){
                    $('#trainersTable').after('<p>You have no experts</p>');
                    $('#trainersTable').hide();
                }else{
                    self.generateTrainersTable(list);
                }

            }
        });
    }



    this.loadInvitors = function(){
        var list = [];
        $('#invitedTraineesTable').show();
        $.ajax({
            url: self.base + '/group/getUserInvitorsTrainers',
            type: 'POST',
            data:{
                token: self.token,
                userId: self.userId
            },
            success: function(data){
                if (data.error != undefined){
                    if (data.error.code == 20){
                        window.location.href="trainerLogin.html";
                        return;
                    }
                    if (data.error.code == 21){
                        if (data.error.message == 'token is not valid'){
                            window.location.href="login.html";
                            return;
                        }
                    }
                    self.showMessage(data.error.message);
//                    alert(data.error.message);
                    return;
                }
                var list = data.data;
                if (list.length == 0){
                    $('#invitationsTable').after('<p>You have no invitations</p>');
                    $('#invitationsTable').hide();
                }else{
                    self.generateInvitationsTable(list);
                }

            }
        });
    }

    this.generateTrainersTable = function(list){
        if (list == undefined || list.length == 0){
            return "";
        }
        var s= '<thead>' +
            '       <tr>' +
            '           <th>ID</th><th>Name</th>' +
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
            s+= '<tr><td>' + list[i].id +'</td><td>' + list[i].firstName + ' ' + list[i].lastName + '</td>' +
                ' </tr>';
        }
        s+='</tbody>';
        $('#trainersTable').html(s);
    }

    this.generateInvitationsTable = function(list){
        if (list == undefined || list.length == 0){
            return "";
        }
        var s= '<thead>' +
            '       <tr>' +
            '           <th>ID</th><th>Name</th><th>Command</th>' +
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
                '<td>' +
                '<button type="button" data-trainerId="' + list[i].id +'" class="btn btn-success btn-xs translatable acceptInvitationButton" data-trRu="принять" >accept</button>' +
                '<button type="button" data-trainerId="' + list[i].id +'" class="btn btn-danger btn-xs translatable deleteInvitationButton" data-trRu="отклонить" >reject</button>' +
                '</td> </tr>';
        }
        s+='</tbody>';
        $('#invitationsTable').html(s);
        self.initDeleteInvitationButton();
        self.initAcceptInvitationButton();
    }


    this.initDeleteInvitationButton = function(){
        $('.deleteInvitationButton').bind('click', function(){
            var trainerId = $(this).attr('data-trainerId');

            $.ajax({
                url: self.base + '/group/rejectToTrainer',
                type: 'POST',
                data: {
                    token: self.token,
                    userId: self.userId,
                    trainerId: trainerId
                },
                success: function(data){
                    console.log(data);
                    window.location.href=window.location.href;
                }
            });
        });
    }

    this.initAcceptInvitationButton = function(){
        $('.acceptInvitationButton').bind('click', function(){
            var trainerId = $(this).attr('data-trainerId');

            $.ajax({
                url: self.base + '/group/acceptToTrainer',
                type: 'POST',
                data: {
                    token: self.token,
                    userId: self.userId,
                    trainerId: trainerId
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


function getStringFromLocalStorage(name) {
    var s = localStorage.getItem(name);
    if (s == undefined || s == '') {
        return undefined;
    }
    return s;
}