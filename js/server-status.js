/*

NEW FEATURES

1. allow checking mulitple servers at once

2. add the status to the UI

*/

function serverStatus() {
    var url, urlCors, interval, alertSound, templateParams, statusIsGood;
    
    url = document.getElementById('serverURL').value;
    urlCors = 'https://cors-anywhere.herokuapp.com/' + url;
    interval = document.getElementById('statusInterval').value * 60000;
    // backup local mp3 in case url dies
    //alertSound = new Audio('/audio/communication-channel.mp3');
    alertSound = new Audio('https://notificationsounds.com/soundfiles/63538fe6ef330c13a05a3ed7e599d5f7/file-sounds-917-communication-channel.mp3');
    templateParams = {
        server: url
    };
    statusIsGood = true;
    
    setInterval(function () {
        function checkTime(i) {
            return (i < 10) ? "0" + i : i;
        }

        var response = new XMLHttpRequest;
        var today = new Date(),
            h = checkTime(today.getHours()),
            m = checkTime(today.getMinutes());
        response.open('GET', urlCors);
        response.onerror = function() {
            console.log('** there was a error');
        };
        response.onload = function () {
            if (response.status === 200) {
                
                console.log('Status: ', response.status + ' @ ' + h + ':' + m);
                statusIsGood = true;
                
            } else {
                
                console.log('Status: ', response.status + ' @ ' + h + ':' + m);
                templateParams['status'] = response.status;
                
                if (statusIsGood === true && response.status !== 503) {
                    
                    emailjs.send('gmail', 'server_down', templateParams)
                        .then(function(emailResponse) {
                           console.log('Email Sent.', emailResponse.status, emailResponse.text);
                        }, function(error) {
                           console.log('Unable to send email.', error);
                        });
                    alertSound.play();
                    alert(url + ' is down');
                }
                statusIsGood = false;
            }
        };
        response.send();
    }, interval);
    
}