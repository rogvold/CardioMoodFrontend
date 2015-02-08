/**
 * Created by sabir on 04.02.15.
 */

var ExcelManager = function(){
    var self = this;

    this.exportToExcel = function(name, header, data, dateString){
        var d = {
            name: name,
            data: data,
            date: dateString,
            header: header
        }
        var ds = JSON.stringify(d);
        console.log(ds);
        post('http://stopvk.com:5014/getXLS', {data: ds}, 'post');

    }

    this.exportListToExcel = function(list, name, dateString){
        var header = ['number', 'value'];
        var data = [];
        for (var i in list){
            var num = parseInt(i)+1;
            var val = list[i];
            data.push([num, list[i]]);
        }
        var d = {
            name: name,
            data: data,
            date: dateString,
            header: header
        }
        var ds = JSON.stringify(d);
        console.log(ds);
        post('http://stopvk.com:5014/getXLS', {data: ds}, 'post');
    }

}

function post(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);
            form.appendChild(hiddenField);
        }
    }
    document.body.appendChild(form);
    form.submit();
}