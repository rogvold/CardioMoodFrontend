/**
 * Created by sabir on 21.12.14.
 */

/**
 * Created by sabir on 11.10.14.
 */


function initParse(){
    var appId = 'SSzU4YxI6Z6SwvfNc2vkZhYQYl86CvBpd3P2wHF1';
    var jsKey = '0ppjIVaWy3aqHyGEA95InejakxRELOMrePgRfREt';
    Parse.initialize(appId, jsKey);
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


function prepareAvatarUploader(inputId, imgId, logoMessageId){
    var client = new AvatarsIO('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwcml2YXRlX3Rva2VuIjoiOGMxZWZkZDlhNGRkYjg3ZmYxYjM4YjJiYzU0MTY0ZDgwYTM0MzIwYmM1YjJmOGY2MzhlMmQzYjMxNzUxMjFlNCJ9.QvQ6XUvHbbBU1iDL33kk-X6-0IEbKshTIF-vLmfp2ns');
    var uploader = client.create('#' + inputId); //type == file
    uploader.on('complete', function(url){
        $('#' + imgId).attr('src', url);
        $('#' + logoMessageId).text('загрузка завершена');
        console.log(url);
    });
    uploader.on('start', function(){
        $('#' + logoMessageId).text('идет загрузка...');
    });
}



function printContent(el){
    var restorepage = document.body.innerHTML;
    var printcontent = document.getElementById(el).innerHTML;
    document.body.innerHTML = printcontent;
    window.print();
    document.body.innerHTML = restorepage;
}

function getStudentQrCardHtml(id, name, groupNumber, email, phone){
    var s = '<div class="QR_card">'
        +'<div class="QR_img_placeholder" >'
        +'<img class="QR_img"  src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=' + id +'" />'
        +'</div>'
        +'<div class="QR_info_block" >'
        +'<div class="QR_header">Карточка студента</div>'
        +'<div class="QR_name" >' + name +'</div>'
        +'<div class="QR_groupNumber_placeholder" >Группа: <span class="QR_groupNumber">' + groupNumber +'</span></div>'
        +'<div class="QR_email" >' + email + '</div>'
        +'<div class="QR_phone" >' + phone + '</div>'
        +'<div class="QR_support"></div>'
        +'</div>'
        +'</div>';
    return s;
}

function getSensorQrCardHtml(sensorId, mac){
    mac = mac.replace(':', '%3A');
    var s = ' <span class="QR_sensor" > ' +
        '' + ' <img src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=' + mac +'" />'
        + '    <span class="QR_sensor_label" >ID: ' + sensorId +' </span> '
    '    </span> ';
    return s;
}

function enablePreloader(){
    console.log('enablePreloader');
    $('.gallery-loader').removeClass('hide');
}

function disablePreloader(){
    $('.gallery-loader').addClass('hide');
}



function post(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
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


function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateUrl(s) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
}



function randomString(len, charSet) {
    //charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}