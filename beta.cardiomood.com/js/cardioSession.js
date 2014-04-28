CardioSessionManager = function(){
    var self = this;
    this.token = undefined;
    this.userId = undefined;
    this.serverId = 51;
    this.email = undefined;
    this.currentSessionId = undefined;
    this.base = "http://data.cardiomood.com";
    
    this.init = function(){
        self.token = getStringFromLocalStorage('token');
        self.userId = getStringFromLocalStorage('userId');
        self.email = getStringFromLocalStorage('email');
        $('#email').text(self.email);
        $('#userId').text(self.userId);
        self.currentSessionId = gup('sessionId');
        $('#sessionId').text(self.currentSessionId);
    }
    
    this.loadSessionList = function(){
        $.ajax({
            url: self.base + '/CardioDataWeb/resources/cardioSession/getCardioSessionsOfUser',
            type: 'POST',
//            contentType: 'application/json',
            data: {
                token: self.token,
                userId: self.userId,
                serverId: self.serverId
            },
            success: function(data){
                if (data.responseCode == 20){
                    window.location.href = 'login.html?autologin=1';
                }
                if (data.responseCode == 0){
                    alert(data.error.message);
                    return;
                }
                console.log(data.data);
                self.prepareSessionsTable(data.data);
            },
            error: function(){
                alert('error');
            }
        });
    }
    
    this.prepareSessionsTable = function(list){
        var s = '<tr><th>session id</th> <th>creation date</th><tr/>';
        for (var i in list){
            var s2 = '<tr>'; 
            s2+= '<td><a target="_blank" href="session.html?sessionId=' + list[i].id + '" >' + list[i].id + '</a></td>';
            s2+= '<td> <a target="_blank" href="session.html?sessionId=' + list[i].id + '" >' + moment(list[i].creationTimestamp).format('LLLL') +'</a></td>';
            s2+= '</tr>';
            s+= s2;
        }
        console.log(s);
        $('#sessionsTable').html(s);
    }
    
    this.prepareCurrentSessionBlock = function(session){
        var dataItems = session.dataItems;
        var arr = self.getIntervalsFromDataItemsArray(dataItems);
        var arr2D = self.get2DArrayFromDataItemsList(dataItems);
        var s = arr.join('\n');
        $('#intervalsNumber').text(arr.length);
        var dur = arr2D[arr2D.length - 1][0] - arr2D[0][0];
        console.log('dur = ' + dur);
        $('#duration').text(moment.duration(dur).minutes() + ' m. ' + moment.duration(dur).seconds() + ' s.');
        $('#intervalsArea').val(s);
        $('#creationDate').text(moment(session.creationTimestamp).format('LLLL'));
        //        self.drawPlot('RRPlot', self.get2DPulseFromDataItemsList(dataItems));
        self.drawPlot('RRPlot', self.get2DNormalArrayFromDataItemsList(dataItems));
    }
    
    this.prepareCurrentSession = function(){
        $.ajax({
            url: self.base + '/CardioDataWeb/resources/cardioSession/getCardioSessionData',
            type: 'POST',
//            contentType: 'application/json',
            data: {
                token: self.token,
                userId: self.userId,
                sessionId: self.currentSessionId
            },
            success: function(data){
                if (data.responseCode == 20){
                    window.location.href = 'login.html?autologin=1';
                }
                if (data.responseCode == 0){
                    alert(data.error.message);
                    return;
                }
                console.log(data.data);
                self.prepareCurrentSessionBlock(data.data);
                
            //                self.prepareSessionsTable(data.data);
            },
            error: function(){
                alert('error');
            }
        });
    }
    
    this.get2DArrayFromDataItemsList = function(dataItems){
        if (dataItems == undefined){
            return [];
        }
        var arr = [];
        for (var i in dataItems){
            var rr = JSON.parse(dataItems[i].dataItem).r;
            var arr2 = [dataItems[i].creationTimestamp, rr];
            arr.push(arr2);
        }
        return arr;
    }
    
    this.get2DNormalArrayFromDataItemsList = function(dataItems){
        var arr = self.get2DArrayFromDataItemsList(dataItems);
        var arr2 = [];
        for (var i in arr){
            //            arr2.push([arr[i][0], 60000 / arr[i][1]]);
            arr2.push([i,arr[i][1]]);
        }
        return arr2;
    }
    
    this.get2DPulseFromDataItemsList = function(dataItems){
        var arr = self.get2DArrayFromDataItemsList(dataItems);
        var arr2 = [];
        for (var i in arr){
            //            arr2.push([arr[i][0], 60000 / arr[i][1]]);
            arr2.push([i, 60000 / arr[i][1]]);
        }
        return arr2;
    }
    
    this.getIntervalsFromDataItemsArray = function(dataItems){
        var arr = self.get2DArrayFromDataItemsList(dataItems);
        var res = [];
        for (var i = 0; i < arr.length; i++){
            res.push(arr[i][1]);
        }
        return res;
    }
    
    this.drawPlot = function(divId, intervals){
        var options = {
        //            xaxis: {
        //                mode: "time"
        //            }
        }
        $.plot('#' + divId, [intervals], options);
    }
    
    
}

function getStringFromLocalStorage(name){
    var s = localStorage.getItem(name);
    if (s == undefined || s == ''){
        return undefined;
    }
    return s;
}