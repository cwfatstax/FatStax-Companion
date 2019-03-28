function serverStatus() {
    var url = document.getElementById('serverURL').value;
    var urlCors = 'https://cors-anywhere.herokuapp.com/' + url;
    var interval = document.getElementById('statusInterval').value * 60000;
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
            } else {
                console.log('Status: ', response.status + ' @ ' + h + ':' + m);
                alert(url + ' is down');
            }
        };
        response.send();
}, interval);
}