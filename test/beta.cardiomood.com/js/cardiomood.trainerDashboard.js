/**
 * Created by sabir on 30.05.14.
 */

CardioMoodTrainerDashboard = function(){
    var self = this;
    this.token = undefined;
    this.trainerId = undefined;
    this.email = undefined;
    this.trainees = [];
    this.base = "http://data.cardiomood.com/CardioDataWeb/resources";
    this.updateInterval = 2 * 1000;
    this.updatingEnabled = true;

    this.init = function(){
        self.loadTrainerParametersFromLocalStorage();
        self.initFreshUpdating();
//        self.test();
    }

    this.loadTrainerParametersFromLocalStorage = function(){
        self.token = getStringFromLocalStorage('token');
        self.trainerId = getStringFromLocalStorage('userId');
        self.email = getStringFromLocalStorage('email');
        if (self.token == undefined){
            window.location.href = "trainerLogin.html"
        }
    }

    this.initFreshUpdating = function(){
        self.loadFreshParameters();
        setInterval(function(){
            if (self.updatingEnabled == true){
                self.loadFreshParameters();
            }
        }, self.updateInterval);
    }

    this.loadFreshParameters = function(){
        $.ajax({
            url: self.base + '/group/traineesFreshParameters',
            type: 'POST',
            data:{
                token: self.token,
                trainerId: self.trainerId
            },
            success: function(data){
                console.log(data);
                self.updateTrainees(data.data);
            }
        });
    }

    this.updateTrainees = function(list){
        if (list == undefined || list.length == 0){
            return;
        }
        var map = {};
        for (var i in list){
            if (map[list[i].id] == undefined){
                map[list[i].id] = new CardioMoodTrainee(list[i].id);
                map[list[i].id].bpm = (list[i].bpm == undefined) ? 0 : Math.round(list[i].bpm);
                map[list[i].id].SDNN = Math.floor(list[i].SDNN * 10.0) / 10.0;
                map[list[i].id].firstName = list[i].firstName;
                map[list[i].id].lastName = list[i].lastName;
                map[list[i].id].lastIntervals = list[i].lastIntervals;
            }else{
                map[list[i].id].bpm = (list[i].bpm == undefined) ? 0 : Math.round(list[i].bpm);
                map[list[i].id].SDNN = Math.floor(list[i].SDNN * 10.0) / 10.0;
            }
        }
        var i = 0;
        if (self.trainees.length == 0){
            self.trainees = new Array(list.length);
        }
        for (var id in map){
            self.trainees[i] = map[id];
            i++;
        }
        var html = '';
        for (var i in self.trainees){
            html+=self.trainees[i].getMonitoringBlockHTML(i);
        }
        $('#traineesPanel').html(html);
        $(".peity").peity("line", { width: 120, height: 30 });

        $('.trainee-tier').bind('click', function(){
            var id = $(this).attr('data-id');
            window.location.href="userSession.html?userId=" + id;
        });
    }


}


CardioMoodTrainee = function(traineeId){
    var self = this;
    this.id = traineeId;
    this.bpm = undefined;
    this.SDNN = undefined;
    this.online = false;
    this.firstName = '';
    this.lastName = '';
    this.lastIntervals = [];

    this.getMonitoringBlockHTML = function(num){
        var s = "";
        var styles = [ 'tile-plum', 'tile-orange', 'tile-blue', 'tile-brown', 'tile-primary', 'tile-green', 'tile-cyan', 'tile-pink', 'tile-aqua', 'tile-red' ];

        s+= '<div class="col-sm-4">'+
            '<div data-id="' + self.id +'" class="trainee-tier tile-progress  ' + styles[num % styles.length] +'">' +

            '<div class="tile-header">' +
            '<h3>' +self.firstName + ' ' + self.lastName + '</h3>' +
            '<div class="num"><b style="display: inline-block; width: 40%;">' + self.bpm +'</b>' +
                '<span class="peity" style="width: 40%; display: inline-block; float: right;">' + self.convertLastIntervals().join(',') +'</span>' +
            '</div>' +
            '</div>' +

            '<div class="tile-progressbar">' +
            '<span data-fill="65.5%" style="width: ' + self.getPercentsOfSDNN(self.SDNN) +'%;"></span>' +
            '</div>' +

            '<div class="tile-footer">' +
            '<h4>' +
            '<span class="translatable" data-trRu="Закисление">SDNN</span> - <span class="pct-counter acid">'+ self.SDNN +'</span>' +
            '</h4>' +
            '</div>' +
            '</div>' +
            '</div>';
        return s;
    }

    self.getPercentsOfSDNN = function(d){
        if (d == undefined){
            return 0;
        }
        if (d <= 0) {
            d = 0.0;
        } else if (d < 15){
            d *= 6.0;
        } else {
            d = (100 - 50.0 / (16.6171 * Math.log(d) - 40));
        }
        return Math.floor(100.0 * d) / 100.0;
    }

    this.convertLastIntervals = function(){
        var list = [];
        if (self.lastIntervals == undefined){
            return list;
        }
        var min = 3000;
        for (var i in self.lastIntervals){
            var pret = Math.floor(60000.0 / self.lastIntervals[i]);
            if (pret < min){min = pret};
        }
        min-=10;
        for (var i in self.lastIntervals){
            var p = Math.floor(60000.0 / self.lastIntervals[i]) - min;
            list.push(p);
        }
        return list;
    }


}


function getStringFromLocalStorage(name){
    var s = localStorage.getItem(name);
    if (s == undefined || s == ''){
        return undefined;
    }
    return s;
}