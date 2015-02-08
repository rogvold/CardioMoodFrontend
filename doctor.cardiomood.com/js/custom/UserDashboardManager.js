/**
 * Created by sabir on 22.12.14.
 */

var UserDashboardManager = function(){
    var self = this;
    this.currentUserManager = new CurrentUserManager();

    this.init = function(){
        initParse();
        self.currentUserManager.init(function(){

        });
    }





}