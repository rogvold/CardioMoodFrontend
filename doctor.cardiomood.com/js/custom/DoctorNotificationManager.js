/**
 * Created by sabir on 25.12.14.
 */

var DoctorNotificationManager = function(){
    var self = this;
    this.currentUserManager = new CurrentUserManager();
    this.notifications = [];
    this.users = [];

    this.init = function(){
        initParse();
        self.initNotificationCheck();
        self.currentUserManager.init(function(){
            self.loadNotifications(function(){
                self.loadNotificationUsers(function(){
                    self.drawNotifications();
                });
            });
        });
    }

    this.loadNotifications = function(callback){
        var q = new Parse.Query(Parse.Object.extend('Notification'));
        q.limit(1000);
        q.equalTo('toId', self.currentUserManager.currentUser.id);
        q.equalTo('status', 'NEW');
        q.addDescending('createdAt');
        enablePreloader('loading notifications');
        q.find(function(results){
            self.notifications = results;
            console.log('notifications', results);
            disablePreloader();
            callback();
        });
    }

    this.drawNotifications = function(){
        var list =self.notifications;
        var s = '';
        for (var i in list){
            s+=self.getNotificationItem(list[i]);
        }
        $('#notificationsList').html(s);
        $('#notificationsNumber').html(list.length);
        if (list.length == 0){
            $('#notificationCircle').hide();
        }
    }

    this.getNotificationItem = function(n){
        var u = self.getUserById(n.get('fromId'));
        if (u == undefined){
            return '';
        }
        var uName = (u.get('firstName') == undefined || u.get('lastName') == undefined) ? 'NOT DEFINED' : ( u.get('firstName').toUpperCase() + ' ' + u.get('lastName').toUpperCase() );
        var s = '';
        s+='<li class="list-group-item">' +
        '<a href="javascript:;">' +
        '<span class="pull-left mt5 mr15">' +
        '<img src="' + NOTIFICATIONS_IMAGE_MAP[n.get('type')] + '" class="avatar avatar-sm img-circle" alt="">' +
        '</span>'+
        '<div class="m-body">'+
        '<div class="">'+
        '<small><b><a href="user.html?id=' + u.id + '" >' +  uName +  '</a></b></small>'+
        '' +
        '<span class="label label-info pull-right">' +
        '<i class="ti-check notificationCheck" data-id="' + n.id +'" ></i>' +
        '</span>'+
        '</div>' +
        '<div class="user-email" >' + u.get('email') + '</div>'+
        '<span>' + n.get('content') + '</span>'+
        '<span class="time small">' + moment(n.createdAt).format('LLL') + '</span>'+
        '</div>'+
        '</a>'+
        '</li>';
        return s;
    }

    this.loadNotificationUsers = function(callback){
        var q = new Parse.Query(Parse.User);
        var usersIds = self.notifications.map(function(n){return n.get('fromId')});
        q.containedIn('objectId', usersIds);
        q.limit(1000);
        enablePreloader();
        q.find(function(results){
            self.users = results;
            console.log('users = ', results);
            disablePreloader();
            callback();
        });
    }

    this.getUserById = function(id){
        var list = self.users;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
    }

    this.initNotificationCheck = function(){
        $('body').on('click', '.notificationCheck', function(){
            var id = $(this).attr('data-id');
            var not = self.getNotificationById(id);
            if (not == undefined){
                return;
            }
            not.set('status', 'VIEWED');
            enablePreloader();
            not.save().then(function(){
                disablePreloader();
                toastr.info('saved');
                self.loadNotifications(function(){
                    self.drawNotifications();
                });
            });
        });
    }

    this.getNotificationById = function(id){
        var list = self.notifications;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
    }
}

NOTIFICATIONS_MAP = {
    "NEW_SESSION": "New session created"
}

NOTIFICATIONS_IMAGE_MAP = {
    "NEW_SESSION": "http://doctor.cardiomood.com/img/newRecord.png",
    "NEW_PATIENT": "http://doctor.cardiomood.com/img/newUser.png"
}