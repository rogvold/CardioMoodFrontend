/**
 * Created by sabir on 23.12.14.
 */
/**
 * Created by sabir on 22.12.14.
 */

var ProfileManager = function(){
    var self = this;
    self.currentUserManager = new CurrentUserManager();

    this.init = function(){
        initParse();
        self.currentUserManager.init(function(){
            self.prepareForm();
            self.initUpdateProfileButton();
        });
    }

    this.initUpdateProfileButton = function(){
        $('#updateButton').bind('click', function(){
            var firstName = $('#firstName').val();
            var lastName = $('#lastName').val();
            var avatar = $('#avatar').val();
            if (validateUrl(avatar) == false){
                toastr.error('invalid avatar url');
                return;
            }
            var u = self.currentUserManager.currentUser;
            u.set('firstName', firstName);
            u.set('lastName', lastName);
            u.set('avatar', avatar);
            enablePreloader();
            self.currentUserManager.currentUser.save().then(function(){
                disablePreloader();
                window.location.href = window.location.href;
            });
        });
    }

    this.prepareForm = function(){
        var u = self.currentUserManager.currentUser;
        $('#firstName').val(u.get('firstName'));
        $('#lastName').val(u.get('lastName'));
        $('#avatar').val(u.get('avatar'));
    }
}