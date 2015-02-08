/**
 * Created by sabir on 31.10.14.
 */

var RealTimeManager = function(){
    var self = this;
    this.subscribeChannelName = 'KolomnaRealTime';
    this.PUBNUB = undefined;
    this.onDataReceive = function(m){console.log(m);}

    this.initPubNub = function(){
        self.PUBNUB = PUBNUB.init({
            publish_key: 'pub-c-a86ef89b-7858-4b4c-8f89-c4348bfc4b79',
            subscribe_key: 'sub-c-e5ae235a-4c3e-11e4-9e3d-02ee2ddab7fe'
        });
    }

    this.init = function(dataReceivedCallback){
        self.initPubNub();
        if (dataReceivedCallback != undefined){
            self.onDataReceive = dataReceivedCallback;
        }
        self.subscribe();
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


pubNubDataExample = {
    t: 122323234, // timestamp
    userId: 'ParseUserId',
    HR: 73,
    stress: 327,
    SDNN: 2.54
}


