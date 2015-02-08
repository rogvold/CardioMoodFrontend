/**
 * Created by sabir on 11.10.14.
 */

var GroupsManager = function(){
    var self = this;
    this.depId = undefined;
    this.depName = undefined;
    this.depLogo = undefined;

    this.groupsList = [];
    this.currentGroup = undefined;

    this.initParse = function(){
        var appId = 'KNYnAGgkTVXhSXGzccX33w7ayISaEZBTYd01Qr8X';
        var jsKey = 'TiXXLbopBebZXO7XHBVdJGNVlXpEVSHhLkmsaLOh';
        Parse.initialize(appId, jsKey);
    }

    this.init = function(){
        self.initParse();
        self.initCreateButton();
        self.initCurrentDepartment(function(){
            self.loadGroupsList();
        });
    }

    this.initCreateButton = function(){
        $('#createButton').bind('click', function(){
            if (self.depId == undefined){
                alert('select department first');
                window.location.href = 'departments.html';
                return;
            }
            var groupNumber = $('#groupNumber').val().trim();
            var StudentGroup = new Parse.Object.extend('StudentGroup');
            var g = new StudentGroup();
            g.set('groupNumber', groupNumber);
            g.set('depId', self.depId);
            g.save().then(function(){
                window.location.href = window.location.href;
                return;
            });
        });
    }

    this.loadGroupsList = function(){
        var s = '';
        var q = new Parse.Query(Parse.Object.extend('StudentGroup'));
        q.ascending('groupNumber');
        if (self.depId != undefined){
            q.equalTo('depId', self.depId);
        }
        q.find(function(results){
            var s = '';
            for (var i in results){
                s+='<li><a href="group.html?groupId=' + results[i].id + '" >' + results[i].get('groupNumber') +'</a></li>';
            }
            $('#groupsList').html(s);
        });
    }

    this.initCurrentDepartment = function(callback){
        self.depId = gup('depId');
        console.log(self.depId);
        if (self.depId == undefined){
            callback();
            return;
        }
        var q = new Parse.Query(Parse.Object.extend('Department'));
        q.get(self.depId, {
            success: function(dep){
                console.log(dep);
                self.depName = dep.get('shortName');
                self.depLogo = dep.get('logo');
                self.prepareDepartmentInfo();
                callback();
            }
        });
    }

    this.prepareDepartmentInfo = function(){
        var s = '<h2><img src="' + self.depLogo +'" /> <b>' + self.depName +'</b></h2>';
        $('#depInfoBlock').html(s);
    }

}

function gup( name )
{
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )
        return null;
    else
        return results[1];
}