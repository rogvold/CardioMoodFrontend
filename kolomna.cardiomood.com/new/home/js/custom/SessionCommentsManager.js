/**
 * Created by sabir on 18.10.14.
 */

var SessionCommentsManager = function(){
    var self = this;
    self.sessionId = undefined;
    this.commentsDivId = 'comments_block';
    this.comments = [];
//    this.userId = undefined;
    this.user = undefined;

    this.init = function(user, divId){
        if (user == undefined){
            alert('user is undefined');
            return;
        }
        self.user = user;
        self.commentsDivId = ( (divId == undefined) ? self.commentsDivId : divId);
//        if (userId == undefined){
//            alert('userId is undefined');
//            return;
//        }
//        self.userId = userId;
        self.initSubmitButton();

    }

    this.loadComments = function(sessionId, callback){
        console.log('loadComments occured: sessionId = ' + sessionId);
        if (sessionId == null){
            alert('sessionId is undefined');
            return;
        }
        self.sessionId = sessionId;
        var q = new Parse.Query(Parse.Object.extend('SessionComment'));
        q.equalTo('sessionId', self.sessionId);
        q.ascending('updatedAt');
        q.limit(1000);
        q.find(function(list){
            self.comments = list;
            self.drawComments();
            callback();
        });
    }

    this.drawComments = function(){
        console.log('drawing comments');
        var s = '';
        var list = self.comments;
        for (var i in list){
            s+= self.getCommentItemHtml(list[i]);
        }
        $('#commentsBlock').html(s);
    }

    this.getCommentItemHtml = function(comment){
        var s = '';
        s+='<div class="media p15">'
            +'<div class="media">'
            +'<a class="pull-left" href="javascript:;">'
            +'<img class="media-object avatar avatar-sm userAvatar" src="' + comment.get('avatarUrl') +'" alt="">'
            +'  </a>'
            +'  <div class="comment">'
            +'      <div class="comment-author h6 no-m">'
            +'          <a href="javascript:;"><b><span class="userName">' + comment.get('userName') + '</span></b></a>'
            +'      </div>'
            +'      <div class="comment-meta small"></div>'
            +'      <p class="commentText" >' + comment.get('message')
            +'      </p>'
            +'    </div>'
            +'</div>'
            +'</div>'
            +'<hr/>';
        return s;
    }

    this.createComment = function(message, callback){
        var user = self.user;
        var Comment = Parse.Object.extend('SessionComment');
        var c = new Comment();
        c.set('userId', user.id);
        c.set('sessionId', self.sessionId);
        c.set('userName', user.get('firstName') + ' ' + user.get('lastName'));
        c.set('avatarUrl', user.get('avatarUrl'));
        c.set('message', message);
        c.set('creationTimestamp', (new Date()).getTime());
        c.save().then(function(comment){
            $('#commentMessage').val('');
            if (callback != undefined){
                callback();
            }
        });
    }

    this.initSubmitButton = function(){
        $('#submitCommentButton').bind('click', function(){
            var message = $('#commentMessage').val().trim();
            if (message == ''){
                alert('Пустое сообщение');
                return;
            }
            self.createComment(message, function(){
                self.loadComments(self.sessionId, function(){});
            });
        });
    }

    this.updateCommentsBlock = function(){


    }

}