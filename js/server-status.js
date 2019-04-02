function serverStatus() {
    var url, urlCors, interval, alertSound, templateParams, statusIsGood;
    
    url = document.getElementById('serverURL').value;
    urlCors = 'https://cors-anywhere.herokuapp.com/' + url;
    interval = document.getElementById('statusInterval').value * 60000;
    alertSound = new Audio('/audio/communication-channel.mp3');
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
                
                if (statusIsGood === true) {
                    
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