var EarthControls = function (object, domElement, render, updateScene, coord, onSelectObject) {
        var self = this;

        var is3denabled = true;

        var eventDispatcher = new THREE.EventDispatcher();
        self.dispatchEvent = eventDispatcher.dispatchEvent;
        
        self.object = object;
        self.render = render;
        self.updateScene = updateScene;
        self.domElement = domElement !== undefined ? domElement : document;
        self.onSelectObject = onSelectObject;
        // self.selection = null;
        // Set to false to disable self control
        self.enabled = true;
        // "target" sets the location of focus, where the object orbits around
        self.target = new THREE.Vector3();
        // How far you can dolly in and out ( PerspectiveCamera only )
        // self.minDistance = 10;
        self.minDistance = 1;
        self.maxDistance = 20000000;
        // How far you can zoom in and out ( OrthographicCamera only )
        self.minZoom = 0;
        self.maxZoom = Infinity;
        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        self.minPolarAngle = 0; // radians
        self.maxPolarAngle = 1.5; // radians
        // self.maxPolarAngle = 1.7; // radians

        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        self.minAzimuthAngle = -Infinity; // radians
        self.maxAzimuthAngle = Infinity; // radians
        // self.minAzimuthAngle = -Math.PI/20; // radians
        // self.maxAzimuthAngle = +Math.PI/20; // radians

        // Set to true to enable damping (inertia)
        // If damping is enabled, you must call controls.update() in your animation loop
        self.enableDamping = false;
        self.dampingFactor = 0.25;
        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
        // Set to false to disable zooming
        self.enableZoom = true;
        self.zoomSpeed = 1.0;
        // Set to false to disable rotating
        self.enableRotate = true;
        self.rotateSpeed = 1.0;
        // Set to false to disable panning
        self.enablePan = true;
        self.keyPanSpeed = 7.0; // pixels moved per arrow key push

        // // Le louvre
        self.LONGITUDE_ORI = 2.33517;
        self.LATITUDE_ORI = 48.86148;

        // Set to true to automatically rotate around the target
        // If auto-rotate is enabled, you must call controls.update() in your animation loop
        self.autoRotate = false;
        self.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
        // Set to false to disable use of the keys
        self.enableKeys = true;
        // The four arrow keys
        self.keys = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            BOTTOM: 40
        };
        // Mouse buttons
        // self.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
        self.mouseButtons = {
            PAN: THREE.MOUSE.LEFT,
            ZOOM: THREE.MOUSE.MIDDLE,
            ORBIT: THREE.MOUSE.RIGHT
        };
        // for reset
        self.target0 = self.target.clone();
        self.position0 = self.object.position.clone();
        self.zoom0 = self.object.zoom;

        //
        // internals
        //

        // self.timer = setTimeout(function() {
        // 	self.render();
        // }, 0);
        self.startEvent = {
            type: 'start'
        };
        self.endEvent = {
            type: 'end'
        };

        self.state = EarthControls.STATE.NONE;

        // current position in spherical coordinates
        self.spherical = new THREE.Spherical();
        self.sphericalDelta = new THREE.Spherical();

        self.scale = 1;
        // var panOffset = new THREE.Vector3();
        self.longitude = self.LONGITUDE_ORI;
        self.latitude = self.LATITUDE_ORI;
        if (coord !== null) {
            self.longitude = coord.hasOwnProperty('longitude') ? coord.longitude : self.longitude;
            self.latitude = coord.hasOwnProperty('latitude') ? coord.latitude : self.latitude;
        }

        self.zoomChanged = false;

        self.rotateStart = new THREE.Vector2();
        self.rotateEnd = new THREE.Vector2();
        self.rotateDelta = new THREE.Vector2();

        self.panStart = new THREE.Vector2();
        self.panEnd = new THREE.Vector2();
        self.panDelta = new THREE.Vector2();

        self.dollyStart = new THREE.Vector2();
        self.dollyEnd = new THREE.Vector2();
        self.dollyDelta = new THREE.Vector2();

        self.domElement.addEventListener('contextmenu', onContextMenu, false);
        self.domElement.addEventListener('mousedown', onMouseDown, false);
        self.domElement.addEventListener('mousewheel', onMouseWheel, false);
        self.domElement.addEventListener('MozMousePixelScroll', onMouseWheel, false); // firefox

        self.domElement.addEventListener('touchstart', onTouchStart, false);
        self.domElement.addEventListener('touchend', onTouchEnd, false);
        self.domElement.addEventListener('touchmove', onTouchMove, false);

        self.domElement.addEventListener('dblclick', onDblClick, false);
        self.domElement.addEventListener('click', onClick, false);

        window.addEventListener('keydown', onKeyDown, false);

        // force an update at start

    //
    // public methods
    //

        self.setCenter = function(lon, lat) {
            self.longitude = lon;
            self.latitude = lat;
            self.update();
            self.render();
        }
        
        self.setPolarAngle = function(phi) {
            self.spherical.phi = phi;
            self.update();
            self.render();
            delayUpdateScene();
        }
        
        self.setAzimuthalAngle = function(theta) {
            self.spherical.theta = theta;
            self.update();
            self.render();
            delayUpdateScene();
        }
        
        self.setPosition = function(lon, lat, alti, phi, theta) {
            self.longitude = lon;
            self.latitude = lat;
            self.object.position.z = alti;
            // self.camera.position.z = alti;
            self.sphericalDelta.phi = phi;
            self.sphericalDelta.theta = theta;
            self.update();
            self.updateScene();
        }
        
        self.getPolarAngle = function() {
            return self.spherical.phi;
        }
        
        self.getAzimuthalAngle = function() {
            return self.spherical.theta;
        }
        
        self.reset = function() {
            self.target.copy(self.target0);
            self.object.position.copy(self.position0);
            self.object.zoom = self.zoom0;
            self.object.updateProjectionMatrix();
            self.dispatchEvent({
                type: 'change'
            });
            self.update();
            self.render();
            delayUpdateScene();
            self.state = EarthControls.STATE.NONE;
        }
        
        self.update = function() {
            
            var offset = new THREE.Vector3();
            // so camera.up is the orbit axis
            var quat = new THREE.Quaternion().setFromUnitVectors(self.object.up, new THREE.Vector3(0, 1, 0));
            var quatInverse = quat.clone().inverse();
            var lastPosition = new THREE.Vector3();
            var lastQuaternion = new THREE.Quaternion();

            var position = self.object.position;
            
            // console.log('setPosition', self.longitude, self.latitude);
            
            offset.copy(position).sub(self.target);
            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);
            // angle from z-axis around y-axis
            self.spherical.setFromVector3(offset);
            if (self.autoRotate && self.state === EarthControls.STATE.NONE) {
                self.rotateLeft(self.getAutoRotationAngle());
            }
            self.spherical.theta += self.sphericalDelta.theta;
            self.spherical.phi += self.sphericalDelta.phi;
            // restrict theta to be between desired limits
            self.spherical.theta = Math.max(self.minAzimuthAngle, Math.min(self.maxAzimuthAngle, self.spherical.theta));
            // restrict phi to be between desired limits
            self.spherical.phi = Math.max(self.minPolarAngle, Math.min(self.maxPolarAngle, self.spherical.phi));
            self.spherical.makeSafe();
            self.spherical.radius *= self.scale;
            // restrict radius to be between desired limits
            self.spherical.radius = Math.max(self.minDistance, Math.min(self.maxDistance, self.spherical.radius));
            // move target to panned location
            // scope.target.add(panOffset);
            offset.setFromSpherical(self.spherical);
            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);
            position.copy(self.target).add(offset);
            self.object.lookAt(self.target);
            if (self.enableDamping === true) {
                self.sphericalDelta.theta *= 1 - self.dampingFactor;
                self.sphericalDelta.phi *= 1 - self.dampingFactor;
            }
            else {
                self.sphericalDelta.set(0, 0, 0);
            }
            self.scale = 1;

            // panOffset.set(0, 0, 0);
            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8
            if (self.zoomChanged || lastPosition.distanceToSquared(self.object.position) > EarthControls.EPS || 8 * (1 - lastQuaternion.dot(self.object.quaternion)) > EarthControls.EPS) {
                self.dispatchEvent({
                    type: 'change'
                });
                
                lastPosition.copy(self.object.position);
                lastQuaternion.copy(self.object.quaternion);
                self.zoomChanged = false;
                return true;
            }
            return false;
        }
        
        self.dispose = function() {
            self.domElement.removeEventListener('contextmenu', self.onContextMenu, false);
            self.domElement.removeEventListener('mousedown', self.onMouseDown, false);
            self.domElement.removeEventListener('mousewheel', self.onMouseWheel, false);
            self.domElement.removeEventListener('MozMousePixelScroll', self.onMouseWheel, false); // firefox
            self.domElement.removeEventListener('touchstart', self.onTouchStart, false);
            self.domElement.removeEventListener('touchend', self.onTouchEnd, false);
            self.domElement.removeEventListener('touchmove', self.onTouchMove, false);
            document.removeEventListener('mousemove', self.onMouseMove, false);
            document.removeEventListener('mouseup', self.onMouseUp, false);
            document.removeEventListener('mouseout', self.onMouseUp, false);
            document.removeEventListener('dblclick', self.onDblClick, false);
            
            document.removeEventListener('click', self.onClick, false);
            window.removeEventListener('keydown', self.onKeyDown, false);

            //scope.dispatchEvent( { type: 'dispose' } ); // should self be added here?
        }
        
        self.getAutoRotationAngle = function() {
            return 2 * Math.PI / 60 / 60 * self.autoRotateSpeed;
        }
        
        self.getZoomScale = function() {
            return Math.pow(0.95, self.zoomSpeed);
        }
        
        self.rotateLeft = function(angle) {
            self.sphericalDelta.theta -= angle;
        }
        
        self.rotateUp = function(angle) {
            self.sphericalDelta.phi -= angle;
        }
        
        self.panLeft = function(distance) {
            var R = EarthControls.R;
            var lonDelta = Math.cos(self.spherical.theta) * (distance / (1000 * R * Math.cos(self.latitude * Math.PI / 180))) * 180 / Math.PI;
            self.longitude -= lonDelta;
            var latDelta = -Math.sin(self.spherical.theta) * (distance / (R * 1000)) * 180 / Math.PI;
            if (self.latitude + latDelta < 80 && self.latitude + latDelta > -80) {
                self.latitude += latDelta;
                // console.log('latitude:', latitude)
            }
            // latitude = (latitude + 90) % 180 - 90;
            self.longitude = (self.longitude + 540) % 360 - 180;
            // console.log('lon:', self.longitude);
            // console.log('lat:', self.latitude);
        }
        
        self.getLongitude = function() {
            return self.longitude;
        }
        
        self.panUp = function(distance) {
            var R = EarthControls.R;
            var lonDelta = Math.sin(self.spherical.theta) * (distance / (1000 * R * Math.cos(self.latitude * Math.PI / 180))) * 180 / Math.PI;
            self.longitude -= lonDelta;
            var latDelta = Math.cos(self.spherical.theta) * (distance / (1000 * R)) * 180 / Math.PI;
            if (self.latitude + latDelta < 80 && self.latitude + latDelta > -80) {
                self.latitude += latDelta;
            }
            // latitude = (latitude + 90) % 180 - 90;
            self.longitude = (self.longitude + 360) % 360;
            // console.log('lon:', self.longitude);
            // console.log('lat:', self.latitude);
        }
        
        self.getLatitude = function() {
            return self.latitude;
        }
        
        self.pan = function(deltaX, deltaY) {
            var offset = new THREE.Vector3();
            var element = self.domElement === document ? self.domElement.body : self.domElement;
            if (self.object instanceof THREE.PerspectiveCamera) {
                // perspective
                var position = self.object.position;
                offset.copy(position).sub(self.target);
                var targetDistance = offset.length();
                // half of the fov is center to top of screen
                targetDistance *= Math.tan(self.object.fov / 2 * Math.PI / 180.0);
                // we actually don't use screenWidth, since perspective camera is fixed to screen height
                self.panLeft(2 * deltaX * targetDistance / element.clientHeight);
                self.panUp(2 * deltaY * targetDistance / element.clientHeight);
            }
            else if (self.object instanceof THREE.OrthographicCamera) {
                // orthographic
                self.panLeft(deltaX * (self.object.right - self.object.left) / self.object.zoom / element.clientWidth, self.object.matrix);
                self.panUp(deltaY * (self.object.top - self.object.bottom) / self.object.zoom / element.clientHeight, self.object.matrix);
            }
            else {
                // camera neither orthographic nor perspective
                console.warn('WARNING: EarthControls.js encountered an unknown camera type - pan disabled.');
                self.enablePan = false;
            }
        }
        
        self.dollyIn = function(dollyScale) {
            if (self.object instanceof THREE.PerspectiveCamera) {
                self.scale /= dollyScale;
            }
            else if (self.object instanceof THREE.OrthographicCamera) {
                self.object.zoom = Math.max(self.minZoom, Math.min(self.maxZoom, self.object.zoom * dollyScale));
                self.object.updateProjectionMatrix();
                self.zoomChanged = true;
            }
            else {
                console.warn('WARNING: EarthControls.js encountered an unknown camera type - dolly/zoom disabled.');
                self.enableZoom = false;
            }
        }
        
        self.dollyOut = function(dollyScale) {
            if (self.object instanceof THREE.PerspectiveCamera) {
                self.scale *= dollyScale;
            }
            else if (self.object instanceof THREE.OrthographicCamera) {
                self.object.zoom = Math.max(self.minZoom, Math.min(self.maxZoom, self.object.zoom / dollyScale));
                self.object.updateProjectionMatrix();
                self.zoomChanged = true;
            }
            else {
                console.warn('WARNING: EarthControls.js encountered an unknown camera type - dolly/zoom disabled.');
                self.enableZoom = false;
            }
        }

        //
        // event callbacks - update the object state
        //
        
        function handleMouseDownRotate(event) {
            // console.log('handleMouseDownRotate');
            self.rotateStart.set(event.clientX, event.clientY);
        }
        
        function handleMouseDownDolly(event) {
            // console.log('handleMouseDownDolly');
            self.dollyStart.set(event.clientX, event.clientY);
        }
        
        function handleMouseDownPan(event) {
            // console.log('handleMouseDownPan');
            self.panStart.set(event.clientX, event.clientY);
        }
        
        function handleMouseMoveRotate(event) {
            // console.log('handleMouseMoveRotate');
            self.rotateEnd.set(event.clientX, event.clientY);
            self.rotateDelta.subVectors(self.rotateEnd, self.rotateStart);
            var element = self.domElement === document ? self.domElement.body : self.domElement;
            // rotating across whole screen goes 360 degrees around
            self.rotateLeft(2 * Math.PI * self.rotateDelta.x / element.clientWidth * self.rotateSpeed);
            // rotating up and down along whole screen attempts to go 360, but limited to 180
            self.rotateUp(2 * Math.PI * self.rotateDelta.y / element.clientHeight * self.rotateSpeed);
            self.rotateStart.copy(self.rotateEnd);
            self.update();
            self.render();
            // delayUpdateScene();
        }
        
        function delayUpdateScene() {
            // console.log('Reset timer.');
            clearTimeout(self.timer);
            self.timer = setTimeout(function() {
                // console.log('Render after delay.');
                self.updateScene();
            }, EarthControls.RENDER_DELAY);
        }
        
        function handleMouseMoveDolly(event) {
            //console.log( 'handleMouseMoveDolly' );
            self.dollyEnd.set(event.clientX, event.clientY);
            self.dollyDelta.subVectors(self.dollyEnd, self.dollyStart);
            if (self.dollyDelta.y > 0) {
                self.dollyIn(self.getZoomScale());
            }
            else if (self.dollyDelta.y < 0) {
                self.dollyOut(self.getZoomScale());
            }
            self.dollyStart.copy(self.dollyEnd);
            self.update();
            self.render();
            delayUpdateScene();
        }
        
        function handleMouseMovePan(event) {
            //console.log( 'handleMouseMovePan' );
            self.panEnd.set(event.clientX, event.clientY);
            self.panDelta.subVectors(self.panEnd, self.panStart);
            self.pan(self.panDelta.x, self.panDelta.y);
            self.panStart.copy(self.panEnd);
            
            self.update();
            self.render();
            delayUpdateScene();
        }
        
        function handleMouseUp(event) {
            //console.log( 'handleMouseUp' );
        }
        
        function handleClick(event) {
            // console.log( 'click' );
            self.onSelectObject(event);
        }
        
        function handleDblClick(event) {
        // self.onSelectObject(event);

        }
        
        function handleMouseWheel(event) {
            //console.log( 'handleMouseWheel' );
            var delta = 0;
            if (event.wheelDelta !== undefined) {
                // WebKit / Opera / Explorer 9
                delta = event.wheelDelta;
            }
            else if (event.detail !== undefined) {
                // Firefox
                delta = -event.detail;
            }

            if (delta > 0) {
                self.dollyOut(self.getZoomScale());
            }
            else if (delta < 0) {
                self.dollyIn(self.getZoomScale());
            }
            self.update();
            self.render();
            delayUpdateScene();
        }

        document.getElementById("cam-up").onclick = function(){
            
        	world.camera.position.z += 20;
        	self.update();
        	self.render();


            // var cpA = { camZ: world.camera.position.z };
            // var tpA = { camZ: world.camera.position.z+20};

            // var tweenA = new TWEEN.Tween(cpA).to(tpA, 500);
            // // tweenA.easing(TWEEN.Easing.Quartic.Out); // no easing effect needed. Better use linear animation
            // tweenA.onUpdate(function(){
            //     world.camera.position.z = cpA.camZ;
            //     self.update();
            //     self.render();
            //     TWEEN.update();
            // });
            // tweenA.start();
        };

        document.getElementById("cam-down").onclick = function(){
        	world.camera.position.z -= 20;
        	self.update();
        	self.render();
        	delayUpdateScene();
        };

        document.getElementById("zoom-in").onclick = function(){
        	self.dollyOut(self.getZoomScale());
        	self.update();
        	self.render();
        	delayUpdateScene();
        };

        document.getElementById("zoom-out").onclick = function(){
        	self.dollyIn(self.getZoomScale());
        	self.update();
        	self.render();
        	delayUpdateScene();
        };
        // document.getElementById("reset").onclick = function(){

        //     // self.sphericalDelta.theta = 0;


        //     var angleAzimuthal = self.getAzimuthalAngle();
        //     self.rotateLeft(angleAzimuthal);

        //     var anglePolar = 1 - self.getPolarAngle();
        //     self.rotateUp(-anglePolar);

        //     self.update();
        //     self.render();
        //     delayUpdateScene();

        //     console.log('reset pressed',anglePolar);

        // };

        document.getElementById("reset-azimuthal").onclick = function(){

            var angleAzimuthal = self.getAzimuthalAngle();
            self.rotateLeft(angleAzimuthal);

            self.update();
            self.render();
            delayUpdateScene();

        };
        document.getElementById("rotate-left").onclick = function(){

            var angleAzimuthal = self.getAzimuthalAngle();
            self.rotateLeft(angleAzimuthal);

            self.rotateLeft(Math.PI/2);

            self.update();
            self.render();
            delayUpdateScene();

        };
        document.getElementById("rotate-right").onclick = function(){

            var angleAzimuthal = self.getAzimuthalAngle();
            self.rotateLeft(angleAzimuthal);

            self.rotateLeft(-Math.PI/2);

            self.update();
            self.render();
            delayUpdateScene();

        };
        document.getElementById("rotate-up").onclick = function(){

            var angleAzimuthal = self.getAzimuthalAngle();
            self.rotateLeft(angleAzimuthal);

            self.update();
            self.render();
            delayUpdateScene();

        };
        document.getElementById("rotate-down").onclick = function(){

            var angleAzimuthal = self.getAzimuthalAngle();
            self.rotateLeft(angleAzimuthal);

            self.rotateLeft(Math.PI);

            self.update();
            self.render();
            delayUpdateScene();

        };

        document.getElementById("dimension").onclick = function(){

            if (is3denabled) {
               is3denabled = false;
        	   self.rotateUp(2);
                
            } else {
                is3denabled = true;
                var anglePolar = 1 - self.getPolarAngle();
                self.rotateUp(-anglePolar);
            }

            self.update();
            self.render();
            delayUpdateScene();

        };

        self.rotate = function(degrees) {
            rotateLeft(degrees);
            self.update();
        }
        
        function handleKeyDown(event) {
            //console.log( 'handleKeyDown' );
            switch (event.keyCode) {
                case self.keys.UP:
                    self.pan(0, self.keyPanSpeed);
                    self.update();
                    self.render();
                    delayUpdateScene();
                    break;
                case self.keys.BOTTOM:
                    self.pan(0, -self.keyPanSpeed);
                    self.update();
                    self.render();
                    delayUpdateScene();
                    break;
                case self.keys.LEFT:
                    self.pan(self.keyPanSpeed, 0);
                    self.update();
                    self.render();
                    delayUpdateScene();
                    break;
                case self.keys.RIGHT:
                    self.pan(-self.keyPanSpeed, 0);
                    self.update();
                    self.render();
                    delayUpdateScene();
                    break;
            }
        }
        
        function handleTouchStartRotate(event) {
            //console.log( 'handleTouchStartRotate' );
            self.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
        }
        
        function handleTouchStartDolly(event) {
            //console.log( 'handleTouchStartDolly' );
            var dx = event.touches[0].pageX - event.touches[1].pageX;
            var dy = event.touches[0].pageY - event.touches[1].pageY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            self.dollyStart.set(0, distance);
        }
        
        function handleTouchStartPan(event) {
            //console.log( 'handleTouchStartPan' );
            self.panStart.set(event.touches[0].pageX, event.touches[0].pageY);
        }
        
        function handleTouchMoveRotate(event) {
            //console.log( 'handleTouchMoveRotate' );
            self.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
            self.rotateDelta.subVectors(self.rotateEnd, self.rotateStart);
            var element = self.domElement === document ? self.domElement.body : self.domElement;
            // rotating across whole screen goes 360 degrees around
            self.rotateLeft(2 * Math.PI * self.rotateDelta.x / element.clientWidth * self.rotateSpeed);
            // rotating up and down along whole screen attempts to go 360, but limited to 180
            self.rotateUp(2 * Math.PI * self.rotateDelta.y / element.clientHeight * self.rotateSpeed);
            self.rotateStart.copy(self.rotateEnd);
            self.update();
            self.render();
            delayUpdateScene();
        }
        
        function handleTouchMoveDolly(event) {
            //console.log( 'handleTouchMoveDolly' );
            var dx = event.touches[0].pageX - event.touches[1].pageX;
            var dy = event.touches[0].pageY - event.touches[1].pageY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            self.dollyEnd.set(0, distance);
            self.dollyDelta.subVectors(self.dollyEnd, self.dollyStart);
            if (self.dollyDelta.y > 0) {
                self.dollyOut(self.getZoomScale());
            }
            else if (self.dollyDelta.y < 0) {
                self.dollyIn(self.getZoomScale());
            }

            self.dollyStart.copy(self.dollyEnd);
            self.update();
            self.render();
            delayUpdateScene();
        }
        
        function handleTouchMovePan(event) {
            //console.log( 'handleTouchMovePan' );
            self.panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
            self.panDelta.subVectors(self.panEnd, self.panStart);
            self.pan(self.panDelta.x, self.panDelta.y);
            self.panStart.copy(self.panEnd);
            self.update();
            self.render();
            delayUpdateScene();
        }
        
        function handleTouchEnd(event) {
        
        //console.log( 'handleTouchEnd' );


        //
        // event handlers - FSM: listen for events and reset state
        //
        }
        
        function onMouseDown(event) {
            
            if (self.enabled === false) return;
            event.preventDefault();
            if (event.button === self.mouseButtons.ORBIT) {
                if (self.enableRotate === false) return;
                handleMouseDownRotate(event);
                self.state = EarthControls.STATE.ROTATE;
            }
            else if (event.button === self.mouseButtons.ZOOM) {
                if (self.enableZoom === false) return;
                handleMouseDownDolly(event);
                self.state = EarthControls.STATE.DOLLY;
            }
            else if (event.button === self.mouseButtons.PAN) {
                if (self.enablePan === false) return;
                handleMouseDownPan(event);
                self.state = EarthControls.STATE.PAN;
            }
            if (self.state !== EarthControls.STATE.NONE) {
                document.addEventListener('mousemove', onMouseMove, false);
                document.addEventListener('mouseup', onMouseUp, false);
                document.addEventListener('mouseout', onMouseUp, false);
                document.addEventListener('dblClick', onDblClick, false);
                document.addEventListener('click', onClick, false);
                self.dispatchEvent(self.startEvent);
            }
        }
        
        function onMouseMove(event) {
            if (self.enabled === false) return;
            event.preventDefault();
            if (self.state === EarthControls.STATE.ROTATE) {
                if (self.enableRotate === false) return;
                handleMouseMoveRotate(event);
            }
            else if (self.state === EarthControls.STATE.DOLLY) {
                if (self.enableZoom === false) return;
                handleMouseMoveDolly(event);
            }
            else if (self.state === EarthControls.STATE.PAN) {
                if (self.enablePan === false) return;
                handleMouseMovePan(event);
            }
        }
        
        function onMouseUp(event) {
            if (self.enabled === false) return;
            handleMouseUp(event);
            document.removeEventListener('mousemove', self.onMouseMove, false);
            document.removeEventListener('mouseup', self.onMouseUp, false);
            document.removeEventListener('mouseout', self.onMouseUp, false);
            document.removeEventListener('dblClick', self.onDblClick, false);
            document.removeEventListener('click', self.onClick, false);
            self.dispatchEvent(self.endEvent);
            self.state = EarthControls.STATE.NONE;
        }
        
        function onDblClick(event) {
            if (self.enabled === false) return;
            handleDblClick(event);
            document.removeEventListener('mousemove', self.onMouseMove, false);
            document.removeEventListener('mouseup', self.onMouseUp, false);
            document.removeEventListener('mouseout', self.onMouseUp, false);
            document.removeEventListener('dblClick', self.onDblClick, false);
            document.removeEventListener('click', self.onClick, false);
            self.dispatchEvent(self.endEvent);
            self.state = EarthControls.STATE.NONE;
        }
        
        function onClick(event) {
            
            if (self.enabled === false) return;
            handleClick(event);
            document.removeEventListener('mousemove', self.onMouseMove, false);
            document.removeEventListener('mouseup', self.onMouseUp, false);
            document.removeEventListener('mouseout', self.onMouseUp, false);
            document.removeEventListener('dblClick', self.onDblClick, false);
            document.removeEventListener('click', self.onClick, false);
            self.dispatchEvent(self.endEvent);
            self.state = EarthControls.STATE.NONE;
        }
        
        function onMouseWheel(event) {
            if (self.enabled === false || self.enableZoom === false || self.state !== EarthControls.STATE.NONE && self.state !== EarthControls.STATE.ROTATE) return;
            event.preventDefault();
            event.stopPropagation();
            handleMouseWheel(event);
            self.dispatchEvent(self.startEvent); // not sure why these are here...
            self.dispatchEvent(self.endEvent);
        }
        
        function onKeyDown(event) {
            if (self.enabled === false || self.enableKeys === false || self.enablePan === false) return;
            handleKeyDown(event);
        }
        
        function onTouchStart(event) {
            if (self.enabled === false) return;
            switch (event.touches.length) {
                case 3:
                    // one-fingered touch: rotate
                    if (self.enableRotate === false) return;
                    handleTouchStartRotate(event);
                    self.state = EarthControls.STATE.TOUCH_ROTATE;
                    break;
                case 2:
                    // two-fingered touch: dolly
                    if (self.enableZoom === false) return;
                    handleTouchStartDolly(event);
                    self.state = EarthControls.STATE.TOUCH_DOLLY;
                    break;
                case 1:
                    // three-fingered touch: pan
                    if (self.enablePan === false) return;
                    handleTouchStartPan(event);
                    self.state = EarthControls.STATE.TOUCH_PAN;
                    break;
                default:
                    self.state = EarthControls.STATE.NONE;
            }
            if (self.state !== EarthControls.STATE.NONE) {
                self.dispatchEvent(self.startEvent);
            }
        }
        
        function onTouchMove(event) {
            if (self.enabled === false) return;
            event.preventDefault();
            event.stopPropagation();
            switch (event.touches.length) {
                case 3:
                    // one-fingered touch: rotate
                    if (self.enableRotate === false) return;
                    if (self.state !== EarthControls.STATE.TOUCH_ROTATE) return; // is self needed?...
                    handleTouchMoveRotate(event);
                    break;
                case 2:
                    // two-fingered touch: dolly
                    if (self.enableZoom === false) return;
                    if (self.state !== EarthControls.STATE.TOUCH_DOLLY) return; // is self needed?...
                    handleTouchMoveDolly(event);
                    break;
                case 1:
                    // three-fingered touch: pan
                    if (self.enablePan === false) return;
                    if (self.state !== EarthControls.STATE.TOUCH_PAN) return; // is self needed?...
                    handleTouchMovePan(event);
                    break;
                default:
                    self.state = EarthControls.STATE.NONE;
            }
        }
        
        function onTouchEnd(event) {
            if (self.enabled === false) return;
            handleTouchEnd(event);
            self.dispatchEvent(self.endEvent);
            self.state = EarthControls.STATE.NONE;
        }
        
        function onContextMenu(event) {
            event.preventDefault();
        }
    
        self.update();

    // return EarthControls;
    
};


EarthControls.STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_DOLLY: 4,
    TOUCH_PAN: 5
};
EarthControls.EPS = 0.000001;
EarthControls.R = 6378.137;
EarthControls.changeEvent = {
    type: 'change'
};

EarthControls.prototype = Object.create( THREE.EventDispatcher.prototype );
EarthControls.prototype.constructor = EarthControls;
// THREE.EarthControls.prototype = Object.create(THREE.EventDispatcher.prototype);
// THREE.EarthControls.prototype.constructor = THREE.EarthControls;

Object.defineProperties(EarthControls.prototype, {
    center: {
        get: function get() {
            console.warn('THREE.EarthControls: .center has been renamed to .target');
            return self.target;
        }
    },
    // backward compatibility
    noZoom: {
        get: function get() {
            console.warn('THREE.EarthControls: .noZoom has been deprecated. Use .enableZoom instead.');
            return !self.enableZoom;
        },
        set: function set(value) {
            console.warn('THREE.EarthControls: .noZoom has been deprecated. Use .enableZoom instead.');
            self.enableZoom = !value;
        }
    },
    noRotate: {
        get: function get() {
            console.warn('THREE.EarthControls: .noRotate has been deprecated. Use .enableRotate instead.');
            return !self.enableRotate;
        },
        set: function set(value) {
            console.warn('THREE.EarthControls: .noRotate has been deprecated. Use .enableRotate instead.');
            self.enableRotate = !value;
        }
    },
    noPan: {
        get: function get() {
            console.warn('THREE.EarthControls: .noPan has been deprecated. Use .enablePan instead.');
            return !self.enablePan;
        },
        set: function set(value) {
            console.warn('THREE.EarthControls: .noPan has been deprecated. Use .enablePan instead.');
            self.enablePan = !value;
        }
    },
    noKeys: {
        get: function get() {
            console.warn('THREE.EarthControls: .noKeys has been deprecated. Use .enableKeys instead.');
            return !self.enableKeys;
        },
        set: function set(value) {
            console.warn('THREE.EarthControls: .noKeys has been deprecated. Use .enableKeys instead.');
            self.enableKeys = !value;
        }
    },
    staticMoving: {
        get: function get() {
            console.warn('THREE.EarthControls: .staticMoving has been deprecated. Use .enableDamping instead.');
            return !self.constraint.enableDamping;
        },
        set: function set(value) {
            console.warn('THREE.EarthControls: .staticMoving has been deprecated. Use .enableDamping instead.');
            self.constraint.enableDamping = !value;
        }
    },
    dynamicDampingFactor: {
        get: function get() {
            console.warn('THREE.EarthControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
            return self.constraint.dampingFactor;
        },
        set: function set(value) {
            console.warn('THREE.EarthControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
            self.constraint.dampingFactor = value;
        }
    }
});
EarthControls.RENDER_DELAY = 0;
