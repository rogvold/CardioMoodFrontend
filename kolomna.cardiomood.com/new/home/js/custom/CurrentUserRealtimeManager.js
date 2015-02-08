/**
 * Created by sabir on 12.11.14.
 */

var CurrentUserRealTimeManager = function(){
    var self = this;
    this.subscribeChannelName = 'KolomnaRealTime';
    this.PUBNUB = undefined;
    this.PUBNUB_subscribeKey = 'sub-c-e5ae235a-4c3e-11e4-9e3d-02ee2ddab7fe';
    this.onDataReceive = function(m){console.log(m);} // specify before init
    this.onHistoryLoaded = function(data){ console.log(data); } // specify before init
    this.historyMessages = [];

    this.initPubNub = function(){
        self.PUBNUB = PUBNUB.init({
            publish_key: 'pub-c-a86ef89b-7858-4b4c-8f89-c4348bfc4b79',
            subscribe_key: 'sub-c-e5ae235a-4c3e-11e4-9e3d-02ee2ddab7fe'
        });
    }

    this.init = function(){
        moment.lang('ru');
        self.initPubNub();
    }

//    this.loadAllHistory = function(){
////        MTGOX.history.full({
////            limit   : 10000000,
////            channel : self.subscribeChannelName,
////            data    : function(messages) { self.onHistoryLoaded(messages)},
////            error   : function(e)        { console.log("NETWORK ERROR"); console.log(e); }
////        });
//    }

    this.loadAllHistory = function(timetoken, callback) {
        self.PUBNUB.history({
            start: timetoken,
            channel: self.subscribeChannelName,
            callback: function(payload) {
                var msgs = payload[0];
                var start = payload[1];
                var end = payload[2];
                // if msgs were retrieved, do something useful with them
                if (msgs != undefined && msgs.length > 0) {
//                    console.log(msgs.length);
//                    console.log("start: " + start);
//                    console.log("end: " + end);
                    self.historyLoadingCallback(start, end);
                }
                // if 100 msgs were retrieved, there might be more; call history again
                if (msgs.length == 100) {
                    self.historyMessages = msgs.concat(self.historyMessages);
                    self.loadAllHistory(start);
                }else{
                    self.onHistoryLoaded(self.historyMessages);
                }
            }
        });
    }

    this.historyLoadingCallback = function(start, end){
        console.log(moment(start / 10000).format('YYYY:MM:DD HH:mm:ss'));
    }

    this.subscribe = function(){
        self.PUBNUB.subscribe({
            channel: self.subscribeChannelName,
            message: function(m){console.log(m); self.onReceive(m);}
        });
    }

    this.onReceive = function(message){
        self.onDataReceive(message);
    }

    this.onHistoryLoaded = function(data){
        console.log(data);
    }

    this.publishTest = function(){
        self.PUBNUB.publish({
            channel: self.subscribeChannelName,
            message: pubNubDataExample
        });
    }

    this.simulationPublishing = function(userId, t, HR, stress, SDNN){
        self.PUBNUB.publish({
            channel: self.subscribeChannelName,
            message: {
                t: t,
                userId: userId,
                HR: HR,
                stress: stress,
                SDNN: SDNN
            }
        });
    }
}