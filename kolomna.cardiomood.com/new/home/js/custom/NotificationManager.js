/**
 * Created by sabir on 14.10.14.
 */

var NotificationManager = function(){
    var self = this;

    this.initParse = function(){
        var appId = 'KNYnAGgkTVXhSXGzccX33w7ayISaEZBTYd01Qr8X';
        var jsKey = 'TiXXLbopBebZXO7XHBVdJGNVlXpEVSHhLkmsaLOh';
        Parse.initialize(appId, jsKey);
    }


    this.init = function(){
        self.initParse();

    }



}