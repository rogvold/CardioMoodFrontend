/**
 * Created by sabir on 17.03.15.
 */

var DoctorTestManager = function(){
    var self = this;
    this.sessions = [];

    this.init = function(){
        initParse();
        self.loadSessions(0, new Date(0), function(){
            console.log('sessions loaded');
            console.log(self.sessions);
        });
    }

    this.loadSessions = function(page, createdAt, callback){
        var q = new Parse.Query(Parse.Object.extend('CardioSession'));
        q.addAscending('createdAt');
        q.limit(1000);
        q.skip(page * 1000);
        q.greaterThan('createdAt', createdAt);
        q.find(function(results){
            if (results.length ==0){
                callback();
                return;
            }
            if (page > 8){
                page = 0;
                createdAt = self.sessions[self.sessions.length - 1].createdAt;
            }else{
                page = page + 1;
            }
            console.log('page = ' + page);
            console.log(createdAt);
            self.sessions = self.sessions.concat(results);
            self.loadSessions(page, createdAt, callback);
        });
    }

}