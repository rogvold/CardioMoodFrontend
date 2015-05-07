/**
 * Created by sabir on 16.10.14.
 */

var DoctorDashboardManager = function(){
    var self = this;
    this.currentUserManager = new CurrentUserManager();
    this.users = [];
    this.groups = [];
    self.allSystemGroups = [];
    this.userLinks = [];
    this.selectedGroup = undefined;
    this.selectedUsers = [];
    this.notMan = new DoctorNotificationManager();

    this.init = function(){
        self.initCreateButton();
        self.initShowUsersButton();
        self.initUserLinkControls();
        self.currentUserManager.init(function(){
            if (self.currentUserManager.currentUser.get('userRole') != 'doctor'){
                toastr.error('you are not a doctor!');
                self.currentUserManager.logout();
            }
            self.loadUsersRecursively(0, function(){
                    self.loadGroups(function(){
                        self.loadUserLinks(function() {
                            self.drawGroups();
                            disablePreloader();
                        });
                    });
            });
        });
        self.notMan.init();
    }

    this.loadGroups = function(callback){
        var q = new Parse.Query(Parse.Object.extend('UserGroup'));
        q.limit(1000);
        q.equalTo('ownerId', self.currentUserManager.currentUser.id);
        q.addDescending('createdAt');
        enablePreloader();
        q.find(function(results){
            console.log('groups = ', results);
            self.groups = results;
            self.loadAllSystemGroups(function(){
                disablePreloader();
                callback();
            });
        });
    }

    this.loadUsers = function(callback){
        var q = new Parse.Query(Parse.User);
        q.equalTo('userRole', 'user');
        q.addAscending('lastName');
        q.addAscending('firstName');
        q.limit(1000);
        q.find(function(users){
            self.users = users;
            console.log('users = ', users);
            callback();
        });
    }

    this.initShowUsersButton = function(){
        $('body').on('click', '.showUsersLink', function(){
            var gId = $(this).attr('data-id');
            self.selectedGroup = self.getGroupById(gId);
            console.log('selected group = ', self.selectedGroup);
            self.selectedUsers = self.getUsersInGroup(gId);
            var list = self.selectedUsers;
            console.log('selectedUsers = ', list);
            var s = '';
            for (var i in list){
                console.log('list[' + i + '] = ', list[i]);
                var u = list[i];
                if (u == undefined){
                    continue;
                }
                s+='<li class="userItem bb" >' +
                '<span class="userItemName" ><span class="user-name" >' + u.get('firstName') + ' ' + u.get('lastName') + ' </span> <span class="ml10" >(' + u.get('email') + ')</span>' + '</span>' +
                '<span class="userItemControls pull-right" ><i class="ti-trash deleteUserItem ml10 mr10" data-id="' + u.id +'" ></i> <i class="ti-link userLink ml10 mr10" data-id="' + u.id + '" ></i> </span></li>'
            }
            $('#usersModalList').html(s);
            $('#usersModalName').html(self.selectedGroup.get('name'));
            $('#usersModal').modal();
        });
        $('body').on('click', '.editGroupLink', function(){
            var gId = $(this).attr('data-id');
            var g = self.getGroupById(gId);
            self.selectedGroup = g;
            $('#selectedGroupNameInput').val(g.get('name'));
            $('#selectedGroupDescriptionInput').val(g.get('description'));
            $('#selectedGroupName').html(g.get('name'));
            $('#groupSettingsModal').modal();
        });
        $('#updateSelectedGroupButton').bind('click', function(){
            var name = $('#selectedGroupNameInput').val();
            var description = $('#selectedGroupDescriptionInput').val();
            self.selectedGroup.set('name', name);
            self.selectedGroup.set('description', description);
            enablePreloader();
            self.selectedGroup.save().then(function(){
                disablePreloader();
                window.location.href = window.location.href;
            });
        });
    }

    this.initUserLinkControls = function(){
        $('body').on('click', '.deleteUserItem', function(){
            if (confirm('Are you sure?') == false){
                return;
            }
            var userId = $(this).attr('data-id');
            var l = self.getUserLinkByUserId(userId);
            enablePreloader();
            l.destroy({
                success: function(){
                    window.location.href = window.location.href;
                }
            });
        });
        $('body').on('click', '.userLink', function(){
            var userId = $(this).attr('data-id');
            window.location.href = 'user.html?id=' + userId;
        });

    }

    this.getUserLinkByUserId = function(userId){
        var list = self.userLinks;
        for (var i in list){
            if (list[i].get('userId') == userId){
                return list[i];
            }
        }
    }

    this.getUsersInGroup = function(gId){
        var arr = [];

        var list = self.userLinks;
        console.log('userLinks = ', list);
        for (var i in list){
            if (list[i].get('groupId') != gId){
                console.log(list[i].get('groupId') + ' != ' + gId);
                continue;
            }
            console.log('____>>>>>_---->>> found! userId=' + list[i].get('userId'));
            arr.push(self.getUserById(list[i].get('userId')));
        }
        console.log('--->>> users in group ' + gId + ': ', arr);
        return arr;
    }

    this.getGroupById = function(id){
        var list = self.groups;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
    }


    this.getUserById = function(id){
        console.log('getUserById: id = ', id);
        var list = self.users;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
        console.log('user with id = ' + id + ' is not found');
    }

    this.loadUserLinks = function(callback){
        if (self.groups.length == 0){
            self.userLinks = [];
            console.log('no groups!!!');
            callback();
            return;
        }
        var ids = self.groups.map(function(w){return w.id});
        var q = new Parse.Query(Parse.Object.extend('UserLink'));
        q.containedIn('groupId', ids);
        q.limit(1000);
        enablePreloader();
        q.find(function(results){
            self.userLinks = results;
            disablePreloader();
            callback();
        });
    }

    this.getGroupItemHtml = function(g){
        var s = '';
        s+='<div class="col-xs-4 groupItem " data-id="' + g.id + '" >'
        +'<section class="panel position-relative">'
        +'<div class="panel-body">'
        +'<div class="overflow-hidden bb">'
        +'<p class="no-m">'
        +'<b>' + g.get('name') + '</b>'
        +'</p>'
        + '<small>Invitation code: <b>' + g.get('invitationCode') + '</b></small>'
        +'</div>'
        +'<p class="small">'
        +'' + g.get('description') + '' +
        '<i class="ti-eye pull-right showUsersLink" data-id="' + g.id + '" ></i>' +
        '<i class="ti-pencil editGroupLink pull-right mr5 ml5" data-id="' + g.id + '" ></i>'
        +'</p>'

        +'</div>'
        + '</section>'
        +'</div>';
        return s;
    }

    this.initGroupItem = function(){
        $('body').on('click', '.groupItem', function(){
            var id = $(this).attr('data-id');

        });
    }

    this.drawGroups = function(){
        var list = self.groups;
        var s = '';
        for (var i in list){
            s+= self.getGroupItemHtml(list[i]);
        }
        $('#groupsList').html(s);
    }

    this.initCreateButton = function(){
        $('#createButton').bind('click', function(){
            var name = $('#createName').val().trim();
            if (name == '' || name == undefined){
                toastr.error('Name is empty');
                return;
            }
            var description = $('#createDescription').val().trim();
            var code = self.getUniqueCode();
            var UserGroup = Parse.Object.extend('UserGroup');
            var q = new Parse.Query(UserGroup);
            q.equalTo('name', name);
            q.equalTo('ownerId', self.currentUserManager.currentUser.id);
            enablePreloader();
            q.find(function(results){
                if (results.length > 0){
                    toastr.error('name "' + name + '" has already been taken ');
                    disablePreloader();
                    return;
                }
                var g = new UserGroup();
                g.set('ownerId', self.currentUserManager.currentUser.id);
                g.set('name', name);
                g.set('description', description);
                g.set('invitationCode', code);
                g.save().then(function(){
                    disablePreloader();
                    window.location.href = window.location.href;
                });
            });
        });
    }



    this.codeIsUsed = function(code){
        var list = self.allSystemGroups;
        for (var i in list){
            if (list[i].get('invitationCode') == code){
                return true;
            }
        }
        return false;
    }

    this.getUniqueCode = function(){
        var code = randomString(4);
        while (self.codeIsUsed(code) == true){
            code = randomString(4);
        }
        return code;
    }

    this.loadAllSystemGroups = function(callback){
        var q = new Parse.Query(Parse.Object.extend('UserGroup'));
        q.limit(1000);
        enablePreloader();
        q.find(function(results){
            self.allSystemGroups = results;
            disablePreloader();
            callback();
        });
    }

    this.loadUsersRecursively = function(page, callback){
        enablePreloader();
        var q = new Parse.Query(Parse.User);
        q.limit(1000);
        q.equalTo('userRole', 'user');
        q.addAscending('lastName');
        q.addAscending('firstName');
        q.skip(1000 * page);
        q.find(function(results){
            if (results.length == 0){
                callback();
                return;
            }
            console.log('rec: page = ' + page);
            self.users = self.users.concat(results);
            page = page + 1;
            self.loadUsersRecursively(page, callback);
        });
    }

    this.testLoadingAlgo = function(){
        loadAllDataFromParse('CardioSession', undefined, function(results){
            var map = {};
            var list = results;
            console.log('loaded ' + results.length);
            for (var i in list){
                if (map[list[i].id] == undefined){
                    map[list[i].id] = {
                        numbers: [],
                        k: 0
                    }
                }
                map[list[i].id].numbers.push(i);
                map[list[i].id].k++;
            }
            for (var key in map){
                var o = map[key];
                var k = map[key].k;
                var numbers = map[key].numbers;
                if (k > 1){
                    console.log(numbers.join(', '));
                }
            }
        });
    }

}