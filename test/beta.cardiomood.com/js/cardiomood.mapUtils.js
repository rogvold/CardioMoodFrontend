/**
 * Created by sabir on 07.06.14.
 */

CardioMoodMap = function(){
    var self = this;
    this.points = [];
    this.divId = undefined;
    this.map = undefined;
    this.infoWindow = undefined;

    this.initMap = function(){
        if (self.divId == undefined){
            console.log('maps divId is not specified');
            return;
        }
        var mapOptions = {
            zoom: 15,
            center: new google.maps.LatLng(-34.397, 150.644),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        self.map = new google.maps.Map(document.getElementById(self.divId),
            mapOptions);

        self.infoWindow = new google.maps.InfoWindow({
            position: self.map.getCenter(),
            content: 'Hello World'
        });
        self.infoWindow.open(self.map);
    }

    self.findCenterCoord = function(points){
        var minLat = points[0].lat;
        var maxLat = points[0].lat;
        var minLon = points[0].lon;
        var maxLon = points[0].lon;
        for (var i in points){
            if (points[i].lat < minLat){minLat = points[i].lat}
            if (points[i].lat > maxLat){maxLat = points[i].lat}
            if (points[i].lon < minLon){minLon = points[i].lon}
            if (points[i].lon > maxLon){maxLon = points[i].lon}
        }
        return new google.maps.LatLng((maxLat + minLat) / 2.0, (maxLon + minLon) / 2.0)
    }

    this.drawRoute = function(points){
        console.log('CardioMoodMap: drawRoute occured');
        if (self.map == undefined){
            self.initMap();
            self.drawRoute(points);
            return;
        }
        if (points == undefined){
            return;
        }
        var path = [];
        for (var i in points){
//            points (points[i].accuracy > 6){
//                continue;
//            }
            path.push(new google.maps.LatLng(points[i].lat, points[i].lon));
        }
        console.log('path initialized ');
        //console.log(path);
        var line = new google.maps.Polyline({
            path: path,
            strokeColor: '#ff0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        console.log('line = ');
        console.log(line);
        if (path.length > 0){
            //self.map.panTo(self.findCenterCoord(points));
            self.map.panTo(path[path.length - 1]);
        }

        line.setMap(self.map);
    }

    this.showInfoWindow = function(html, centerLat, centerLon){
        if (self.infoWindow == undefined){
            self.initMap();
            self.showInfoWindow(html, centerLat, centerLon);
            return;
        }
        self.infoWindow.content = html;
        self.infoWindow.position = new google.maps.LatLng(centerLat, centerLon);
        self.infoWindow.open(self.map);
    }


}