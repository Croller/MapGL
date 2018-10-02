var Service;

(function() {
    Service = function() {
        this.host = window.location.origin;
    }
    
    Object.assign(Service.prototype, {
        load(method, url, onProgress, onLoad, onError) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    onLoad(this.responseText);
                }
                if (this.status == 429) {
                    onError(this.statusText);
                }
            };
            xhttp.onerror = onError;
            xhttp.onprogress = onProgress;
            xhttp.open(method, url, true);
            xhttp.send();
        }
    })
})();
