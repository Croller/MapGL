var RequestManager = function(localLoader, remoteLoader, maxRequest) {

    var scope = this;
    this.localLoader = localLoader;
    this.remoteLoader = remoteLoader;
    this.jsonResponse = {};
    this.requests = {};
    this.aliveRequests = {};
    this.aliveRequestsCount = 0;
    this.requestsCount = 0;
    this.maxRequest = maxRequest !== undefined ? maxRequest : RequestManager.DEFAULT_MAX_REQUEST;

    this.newRequest = function(tileId, localUrl, url, onLoad, parse) {
        console.log(url);
        var myUrl = new URL(url);
        var tilePath = myUrl.pathname + myUrl.search;

        if (this.jsonResponse.hasOwnProperty(tilePath)) {
            onLoad(parse(scope.jsonResponse[tilePath], tileId));
        }
        else if (!this.requests.hasOwnProperty(tilePath)) {
            this.requests[tilePath] = new Request(tileId, localUrl, this.localLoader, url, this.remoteLoader, parse, function(payload) {
                var myUrl = new URL(url);
                var tilePath = myUrl.pathname + myUrl.search;
                // console.log('myTile:', myTile);
                // console.log('tilePath:', tilePath);
                if (scope.aliveRequests.hasOwnProperty(tilePath)) {
                    delete scope.aliveRequests[tilePath];
                    scope.aliveRequestsCount--;
                    // console.log('aliveRequestsCount:', scope.aliveRequestsCount);
                    // console.log('payload:', payload);
                    scope.jsonResponse[tilePath] = payload === '' ? {} : JSON.parse(payload);
                    onLoad(parse(scope.jsonResponse[tilePath], tileId));
                }
                scope.loadNext();
            }, function() {}, function() {
                var myUrl = new URL(url);
                var tilePath = myUrl.pathname + myUrl.search;
                if (scope.aliveRequests.hasOwnProperty(tilePath)) {
                    delete scope.aliveRequests[tilePath];
                    scope.aliveRequestsCount--;
                    // console.log('aliveRequestsCount:', scope.aliveRequestsCount);
                }
                scope.loadNext();
            });
            this.requestsCount++;
            // console.log('requestsCount:', this.requestsCount);
            scope.loadNext();
        }
    }

    this.loadNext = function() {
        while (this.aliveRequestsCount < this.maxRequest && this.requestsCount > 0) {
            var tilePaths = Object.keys(this.requests);
            // console.log('tilePaths.length:', tilePaths.length);
            var tilePath = tilePaths[tilePaths.length - 1];
            // console.log('tilePath:', tilePath);
            if (this.aliveRequests.hasOwnProperty(tilePath)) {
                // Remove request from queue
                delete this.requests[tilePath];
                this.requestsCount--;
                // console.log('requestsCount:', this.requestsCount);
                continue;
            }
            this.aliveRequestsCount++;
            // console.log('aliveRequestsCount:', this.aliveRequestsCount);
            this.aliveRequests[tilePath] = this.requests[tilePath];
            // Remove request from queue
            var req = this.aliveRequests[tilePath];
            delete this.requests[tilePath];
            this.requestsCount--;
            // console.log('requestsCount:', this.requestsCount);
            req.load();
        }
    };
}
RequestManager.DEFAULT_MAX_REQUEST = 10;
// RequestManager.LOADING_MANAGER = THREE.DefaultLoadingManager;
// RequestManager.prototype = Object.create({});
RequestManager.prototype.constructor = RequestManager;

var Request = function(myTile, localUrl, localLoader, remoteUrl, remoteLoader, parse, onLoad, onProgress, onFailure) {
    var scope = this;
    this.tileCoord = myTile;
    this.localUrl = localUrl;
    this.localLoader = localLoader;
    this.remoteUrl = remoteUrl;
    // console.log('Request.remoteUrl:', remoteUrl);
    this.remoteLoader = remoteLoader;
    this.parse = parse;
    this.onFinish = onLoad;
    this.onProgress = onProgress;
    this.onFailure = onFailure;
    this.state = new Ready4LocalLoadState(this);


    this.setState = function(state) {
        // console.log('state:', state.constructor.name);
        scope.state = state;
    }

    this.load = function() {
        scope.state.load();
    }

    this.progress = function(event) {
        scope.state.progress(event);
    }

    this.success = function(response) {
        scope.state.success(response);
    }
    this.fail = function(event) {
        scope.state.fail(event);
    }
    this.getReady4LocalLoadState = function() {
        return new Ready4LocalLoadState(this);
    }
    this.getReady4RemoteLoadState = function() {
        return new Ready4RemoteLoadState(this);
    }
    this.getLocalLoadingState = function() {
        return new LocalLoadingState(this);
    }
    this.getRemoteLoadingState = function() {
        return new RemoteLoadingState(this);
    }

    this.getLoadedState = function() {
        return new LoadedState(this);
    }
    this.getLoadedFailedState = function() {
        return new LoadFailedState(this);
    }

};

var Ready4LocalLoadState = function(request) {

    this._request = request;
    var scope = this;

    this.load = function() {

        var url = void 0;
        var loader = void 0;
        if (scope._request.localUrl !== undefined) {
            // console.log('localUrl:', this._request.localUrl);
            url = scope._request.localUrl;
            loader = scope._request.localLoader;
            scope._request.setState(scope._request.getLocalLoadingState());
        }
        else {
            // console.log('localUrl undefined');
            url = this._request.url;
            loader = this._request.remoteLoader;
            this._request.setState(this._request.getRemoteLoadingState());
        }
        // load: function ( url, onLoad(response), onProgress(event), onError(event) ) {
        loader.load(url, function(response) {
            scope._request.state.success(response);
        }, function(event) {
            scope._request.state.progress(event);
        }, function(event) {
            scope._request.state.fail(event);
        });
    }

    this.progress = function(event) {
        throw new Error("You can't make progress a not started load!");
    }
    this.fail = function(event) {
        throw new Error("A load can't fail if is not started!");
    }
    this.success = function(response) {
        throw new Error("A load can't success if is not started!");
    }

};


var State = function() {

    this.load = function() {
        throw new Error('This method must be overwritten!');
    }
    this.progress = function(event) {
        throw new Error('This method must be overwritten!');
    }
    this.fail = function(event) {
        throw new Error('This method must be overwritten!');
    }
    this.success = function(payload) {
        throw new Error('This method must be overwritten!');
    }

};


var LocalLoadingState = function(request) {

    this._request = request;
    var scope = this;
    this.load = function() {
        throw new Error("You can't load a file that is being loaded already!");
    }
    this.progress = function(event) {
        // console.log('Getting local data in progress: ', this._request.localUrl);
        scope._request.onProgress();
    }
    this.fail = function(event) {
        // console.log('Fail to get local data at', scope._request.localUrl);
        var myTile = scope._request.tileCoord;
        // console.log('mkdir -p buildingData/' + myTile.z + '/' + myTile.x + '; wget' + ' \'' + scope._request.remoteUrl + '\' ' + '-O buildingData/' + myTile.z + '/' + myTile.x + '/' + myTile.y + '.json');
        scope._request.setState(scope._request.getReady4RemoteLoadState());
        scope._request.load();
    }
    this.success = function(response) {
        console.log('Success in getting local data at', scope._request.localUrl);
        scope._request.onFinish(response);
        scope._request.setState(scope._request.getLoadedState());
    }
}

var Ready4RemoteLoadState = function(request) {

    this._request = request;
    var scope = this;

    this.load = function() {

        // console.log('Start Load!');
        var url = scope._request.remoteUrl;
        var loader = scope._request.remoteLoader;
        scope._request.setState(scope._request.getRemoteLoadingState());
        // load: function ( url, onLoad(response), onProgress(event), onError(event) ) {
        loader.load(url, function(response) {
            scope._request.state.success(response);
        }, function(event) {
            scope._request.state.progress(event);
        }, function(event) {
            scope._request.state.fail(event);
        });
    }
    this.progress = function(event) {
        throw new Error("You can't make progress a failed load!");
    }
    this.fail = function(event) {
        throw new Error("A failed load can't fail itself!");
    }
    this.success = function(response) {
        console.log('Remote data loaded.');
        throw new Error('A failed load cannot success!');
    }
};


var RemoteLoadingState = function(request) {

    this._request = request;

    var scope = this;
    this.load = function() {
        throw new Error("You can't load a file that is being loaded already!");
    }
    this.progress = function(event) {
        scope._request.onProgress();
    }
    this.fail = function(event) {
        // console.log('remote tile load failed:', scope._request.tileCoord);
        // console.log('remote tile load failed - remoteUrl:', scope._request.remoteUrl);
        scope._request.onFailure();
        scope._request.setState(scope._request.getLoadedFailedState());
    }
    this.success = function(response) {
        // console.log('remote tile loaded:', scope._request.tileCoord);
        // console.log('response:', response);
        scope._request.onFinish(response);
        scope._request.setState(scope._request.getLoadedState());
    }
}

var LoadedState = function(request) {

    this._request = request;

    var scope = this;
    this.load = function() {
        throw new Error("You can't reload a loaded file!");
    }
    this.progress = function() {
        throw new Error("You can't make progress a loaded file!");
    }
    this.fail = function() {
        throw new Error("A loaded file can't fail!");
    }
    this.success = function(payload) {
        throw new Error("A loaded file can't success itself!");
    }

};

var LoadFailedState = function(request) {

    this._request = request;
    var scope = this;
    this.load = function() {
        throw new Error("You can't reload a failed load!");
    }
    this.progress = function(event) {
        throw new Error("You can't make progress a failed load!");
    }
    this.fail = function(event) {
        throw new Error("A failed load can't fail itself!");
    }
    this.success = function(response) {
        // console.log('payload:', response);
        throw new Error('A failed load cannot success!');
    }
};
