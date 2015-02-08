/**
 * Created by sabir on 12.10.14.
 */


var StudentsManager = function(){
    var self = this;
    this.users = [];
    this.filteredUsers = [];
    this.selectedUsers = [];

    this.initParse = function(){
        var appId = 'KNYnAGgkTVXhSXGzccX33w7ayISaEZBTYd01Qr8X';
        var jsKey = 'TiXXLbopBebZXO7XHBVdJGNVlXpEVSHhLkmsaLOh';
        Parse.initialize(appId, jsKey);
    }

    this.init = function(){
        self.initParse();
        self.loadUsers(function(){
            self.prepareTableByUsersList(self.users);
            self.initFilters();
            self.initPrinter();
        });
    }

    this.initFilters = function(){
        $('#nameFilter').bind('keyup', function(){
            self.selectedUsers = [];
            var s = $(this).val().trim();
            if (s == ''){
                self.filteredUsers = self.users;
            }
            self.filteredUsers = self.filterUsersByName(s);
            self.prepareTableByUsersList(self.filteredUsers);
        });
        $('#groupFilter').bind('keyup', function(){
            self.selectedUsers = [];
            var s = $(this).val().trim();
            if (s == ''){
                self.filteredUsers = self.users;
            }
            self.filteredUsers = self.filterUsersByGroup(s);
            self.prepareTableByUsersList(self.filteredUsers);
        });
        $('.userCheckbox').on('change', function(){
            self.prepareForPrinting(self.getSelectedUsers());
        });
    }

    this.initPrinter = function(){
        setInterval(function(){
            self.prepareForPrinting(self.getSelectedUsers());
        }, 300);
        $('#printerLink').click(function(){
            self.prepareForPrinting(self.getSelectedUsers());
            printContent('print_placeholder');
            self.selectedUsers = self.users;
        });
    }

    this.loadUsers = function(callback){
        var q = new Parse.Query(Parse.User);
        q.ascending('groupNumber');
        q.ascending('lastName');
        q.ascending('firstName');
        q.equalTo('userRole', 'Student');
        q.limit(1000);
        q.find(function(users){
            self.users = users;
            callback();
        });
    }

    this.getUserRowHtml = function(u){
        var s = '';
        s+='<tr>' +
            '<td><input type="checkbox" class="userCheckbox" data-id="' + u.id +'" /></td>' +
            '<td><span class="department" >' + u.get('depName') + '</span></td>' +
            '<td><span class="groupNumber" >' + u.get('groupNumber') + '</span></td>' +
            '<td><span class="userName" ><a target="_blank" href="student.html?userId=' + u.id + '" >' + u.get('firstName') + ' ' + u.get('lastName') + '</a></span></td>' +
            '<td><span class="userAvatar" ><img class="ava" src="' + u.get('avatarUrl') +'?size=large" /></span></td>' +
            '</tr>';
        return s;
    }

    this.prepareTableByUsersList = function(list){
        var s = '<tr><th><span style="cursor:pointer;" onclick="$(\'.userCheckbox\').prop(\'checked\',\'true\')" >выбрать</span></th><th>Факультет</th><th>Группа</th><th>Имя</th><th>Аватар</th></tr>';
        for (var i in list){
            s+=self.getUserRowHtml(list[i]);
        }
        self.prepareForPrinting(self.selectedUsers);
        $('#studentsTable').html(s);
    }

    this.getSelectedUsers = function(){
        var arr = [];
        $('input.userCheckbox:checked').each(function(){
            var uId = $(this).attr('data-id');
            arr.push(self.getUserById(uId));
        });
        console.log('selected: ');
        console.log(arr);
        return arr;
    }

    this.filterUsersByName = function(name){
        var arr = [];
        name = name.toLowerCase();
        var list = self.users;
        for (var i in list){
            var u = list[i];
            var s = u.get('firstName').toLowerCase() + ' ' + u.get('lastName').toLowerCase();
            if (s.indexOf(name) != -1){
                arr.push(u);
            }
        }
        return arr;
    }

    this.filterUsersByGroup = function(name){
        var arr = [];
        name = name.toLowerCase();
        var list = self.users;
        for (var i in list){
            var u = list[i];
            var s = u.get('groupNumber');
            if (s.indexOf(name) != -1){
                arr.push(u);
            }
        }
        return arr;
    }

    this.prepareForPrinting = function(list){
        console.log('trying to print');

        var s = '';
        console.log(list);
        for (var i in list){
            var u = list[i];
            s+= getStudentQrCardHtml(u.id, u.get('firstName') + ' ' + u.get('lastName'), u.get('groupNumber'), u.get('email'), u.get('phone'))
        }
        $('#print_placeholder').html(s);
    }

    this.getUserById = function(userId){
        var list = self.users;
        for (var i in list){
            if (list[i].id == userId){
                return list[i];
            }
        }
        console.log('user with id = ' + userId + ' is not found');
        return undefined;
    }

}