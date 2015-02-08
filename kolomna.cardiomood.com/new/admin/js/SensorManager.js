/**
 * Created by sabir on 28.10.14.
 */


var SensorManager = function() {
    var self = this;
    this.newSensor = undefined;
    this.sensors = [];

    this.initParse = function(){
        var appId = 'KNYnAGgkTVXhSXGzccX33w7ayISaEZBTYd01Qr8X';
        var jsKey = 'TiXXLbopBebZXO7XHBVdJGNVlXpEVSHhLkmsaLOh';
        Parse.initialize(appId, jsKey);
    }

    this.init = function(){
        self.initParse();
        self.loadSensors(function(){
            self.drawSensors();
        })
        self.initCreateButton();
    }


    this.drawSensors = function(){
        var list = self.sensors;
        var s = '<tr><th>polar ID</th><th>MAC</th><th>last used</th><th>battery</th><th>QR</th><th>Command</th></tr>';
        for (var i in list){
            s+='<tr>' +
                '<td>' + list[i].get('sensorId') +'</td>' +
                '<td>' + list[i].get('mac') +'</td>' +
                '<td>'+ moment(list[i].updatedAt).format('LLLL') +'</td>' +
                '<td>' + list[i].get('battery') +'</td>' +
                '<td>' + getSensorQrCardHtml(list[i].get('sensorId'), list[i].get('mac')) +'</td>' +
                '<td><a href="javascript: void(0);" class="printLink" data-mac="' + list[i].get('mac') +'" data-sensorId="' + list[i].get('sensorId') +'" onclick="" >print</a></td>' +
                '</tr>';
        }
        $('#sensorsTable').html(s);
        $('.printLink').bind('click', function(){
            var sId = $(this).attr('data-sensorId');
            var mac = $(this).attr('data-mac');

            $('#print_placeholder').html(getSensorQrCardHtml(sId, mac));
            printContent('print_placeholder');
        });
        $('#printAllQrsLink').bind('click', function(){
            var s = '';
            for (var i in list){
                s+= ( getSensorQrCardHtml(list[i].get('sensorId'), list[i].get('mac')) );
            }
            console.log(s);
            $('#print_placeholder').html(s);
            printContent('print_placeholder');
        });
    }

    this.initCreateButton = function(){
        $('#createButton').bind('click', function(){
            var sId = $('#sensorId').val().trim();
            var mac = $('#mac').val().trim();

            if (sId.length != 6){
                alert('Должно быть 6 символов');
                return;
            }
            var Sensor = Parse.Object.extend('Sensor');
            var q = new Parse.Query(Sensor);
            q.equalTo('sensorId', sId);
            q.find(function(list){
                if (list.length > 0){
                    alert('sensor with id = ' + sId + ' already exists in the system');
                    return;
                }
                var s = new Sensor();
                s.set('sensorId', sId);
                s.set('mac', mac);
                s.set('battery', 100.0);
                s.save().then(function(){
                    self.loadSensors(function(){self.drawSensors()});
                });
            });


        });
    };



    this.loadSensors = function(callback){
        var q = new Parse.Query(Parse.Object.extend('Sensor'));
        q.descending('createdAt');
        q.limit(1000);
        q.find(function(list){
            self.sensors = list;
            callback();
        });
    }





}