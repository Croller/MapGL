var OpenEarthView =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// export default class OpenEarthView {
	//     constructor() {
	//         this._name = 'OpenEarthView';
	//     }
	//     get name() {
	//         return this._name;
	//     }
	// }
	
	var THREE = __webpack_require__(1);
	THREE.EarthControls = __webpack_require__(2);
	
	exports.default = {
	    World: __webpack_require__(3),
	    toolbox: __webpack_require__(5),
	    RequestManager: __webpack_require__(7),
	    Layer: {
	        // OverpassBuilding: require('./layers/OverpassBuildingLayer.js'),
	        OSM: __webpack_require__(16)
	    }
	    // EarthControls: require('./controls/EarthControls_function.js')
	    // EarthControls: require('./controls/EarthControls.js')
	};
	// OpenEarthView.TileLoader = require("./loaders/TileLoader.js");
	
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = THREE;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	/**
	Open Earth View - viewer-threejs
	The MIT License (MIT)
	Copyright (c) 2016 ClÃ©ment Igonet
	
	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the "Software"),
	to deal in the Software without restriction, including without limitation
	the rights to use, copy, modify, merge, publish, distribute, sublicense,
	and/or sell copies of the Software, and to permit persons to whom the Software
	is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
	OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	* @author Clement Igonet
	*/
	
	// This set of controls performs orbiting, dollying (zooming), and panning.
	// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
	//
	//    Orbit - left mouse / touch: one finger move
	//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
	//    Pan - right mouse, or arrow keys / touch: three finter swipe
	var THREE = __webpack_require__(1);
	var instance = null;
	
	// class Wall extends THREE.Object3D {
	//
	//   constructor(params) {
	//     super();
	//     this.add(this.drawMesh(params));
	//     this.add(this.drawCollisionMesh(params));
	//   }
	//
	//   // method
	//   drawMesh(params) {
	//     return new THREE.Mesh(geometry, material);
	//   }
	//
	//   // getter
	//   get material() {
	//     return this.children[1].material;
	//   }
	//
	//   ...
	// }
	var self = void 0;
	
	var EarthControls = function (_THREE$EventDispatche) {
	    _inherits(EarthControls, _THREE$EventDispatche);
	
	    // var scope = this;
	    function EarthControls(object, domElement, render, updateScene, coord, onSelectObject) {
	        _classCallCheck(this, EarthControls);
	
	        var _this = _possibleConstructorReturn(this, (EarthControls.__proto__ || Object.getPrototypeOf(EarthControls)).call(this));
	
	        self = _this;
	        if (!instance) {
	            instance = _this;
	        } else {
	            var _ret;
	
	            return _ret = instance, _possibleConstructorReturn(_this, _ret);
	        }
	        _this.object = object;
	        _this.render = render;
	        _this.updateScene = updateScene;
	        _this.domElement = domElement !== undefined ? domElement : document;
	        _this.onSelectObject = onSelectObject;
	        // this.selection = null;
	        // Set to false to disable this control
	        _this.enabled = true;
	        // "target" sets the location of focus, where the object orbits around
	        _this.target = new THREE.Vector3();
	        // How far you can dolly in and out ( PerspectiveCamera only )
	        // this.minDistance = 10;
	        _this.minDistance = 1;
	        _this.maxDistance = 20000000;
	        // How far you can zoom in and out ( OrthographicCamera only )
	        _this.minZoom = 0;
	        _this.maxZoom = Infinity;
	        // How far you can orbit vertically, upper and lower limits.
	        // Range is 0 to Math.PI radians.
	        _this.minPolarAngle = 0; // radians
	        _this.maxPolarAngle = 1.5; // radians
	        // this.maxPolarAngle = 1.7; // radians
	
	        // How far you can orbit horizontally, upper and lower limits.
	        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	        _this.minAzimuthAngle = -Infinity; // radians
	        _this.maxAzimuthAngle = Infinity; // radians
	        // this.minAzimuthAngle = -Math.PI/20; // radians
	        // this.maxAzimuthAngle = +Math.PI/20; // radians
	
	        // Set to true to enable damping (inertia)
	        // If damping is enabled, you must call controls.update() in your animation loop
	        _this.enableDamping = false;
	        _this.dampingFactor = 0.25;
	        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	        // Set to false to disable zooming
	        _this.enableZoom = true;
	        _this.zoomSpeed = 1.0;
	        // Set to false to disable rotating
	        _this.enableRotate = true;
	        _this.rotateSpeed = 1.0;
	        // Set to false to disable panning
	        _this.enablePan = true;
	        _this.keyPanSpeed = 7.0; // pixels moved per arrow key push
	
	        // // Le louvre
	        // this.LONGITUDE_ORI = 2.33517;
	        // this.LATITUDE_ORI = 48.86148;
	
	        // UNESCO
	        // this.LONGITUDE_ORI = 2.3057599523656336;
	        // this.LATITUDE_ORI = 48.849568465379264;
	
	        // this.LONGITUDE_ORI = 0;
	        // this.LATITUDE_ORI = 0.00001;
	
	        // // ESB
	        // this.LONGITUDE_ORI = -73.98468017578125;
	        // this.LATITUDE_ORI = 40.7477771608207;
	
	        // COLISEO
	        _this.LONGITUDE_ORI = 12.492148216478085;
	        _this.LATITUDE_ORI = 41.89015670900311;
	
	        // Set to true to automatically rotate around the target
	        // If auto-rotate is enabled, you must call controls.update() in your animation loop
	        _this.autoRotate = false;
	        _this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
	        // Set to false to disable use of the keys
	        _this.enableKeys = true;
	        // The four arrow keys
	        _this.keys = {
	            LEFT: 37,
	            UP: 38,
	            RIGHT: 39,
	            BOTTOM: 40
	        };
	        // Mouse buttons
	        // this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
	        _this.mouseButtons = {
	            PAN: THREE.MOUSE.LEFT,
	            ZOOM: THREE.MOUSE.MIDDLE,
	            ORBIT: THREE.MOUSE.RIGHT
	        };
	        // for reset
	        _this.target0 = _this.target.clone();
	        _this.position0 = _this.object.position.clone();
	        _this.zoom0 = _this.object.zoom;
	
	        //
	        // internals
	        //
	
	        // this.timer = setTimeout(function() {
	        // 	this.render();
	        // }, 0);
	        _this.startEvent = {
	            type: 'start'
	        };
	        _this.endEvent = {
	            type: 'end'
	        };
	
	        _this.state = EarthControls.STATE.NONE;
	
	        // current position in spherical coordinates
	        _this.spherical = new THREE.Spherical();
	        _this.sphericalDelta = new THREE.Spherical();
	
	        _this.scale = 1;
	        // var panOffset = new THREE.Vector3();
	        _this.longitude = _this.LONGITUDE_ORI;
	        _this.latitude = _this.LATITUDE_ORI;
	        if (coord !== null) {
	            _this.longitude = coord.hasOwnProperty('longitude') ? coord.longitude : _this.longitude;
	            _this.latitude = coord.hasOwnProperty('latitude') ? coord.latitude : _this.latitude;
	        }
	
	        _this.zoomChanged = false;
	
	        _this.rotateStart = new THREE.Vector2();
	        _this.rotateEnd = new THREE.Vector2();
	        _this.rotateDelta = new THREE.Vector2();
	
	        _this.panStart = new THREE.Vector2();
	        _this.panEnd = new THREE.Vector2();
	        _this.panDelta = new THREE.Vector2();
	
	        _this.dollyStart = new THREE.Vector2();
	        _this.dollyEnd = new THREE.Vector2();
	        _this.dollyDelta = new THREE.Vector2();
	
	        _this.domElement.addEventListener('contextmenu', _this.onContextMenu, false);
	
	        _this.domElement.addEventListener('mousedown', _this.onMouseDown, false);
	        _this.domElement.addEventListener('mousewheel', _this.onMouseWheel, false);
	        _this.domElement.addEventListener('MozMousePixelScroll', _this.onMouseWheel, false); // firefox
	
	        _this.domElement.addEventListener('touchstart', _this.onTouchStart, false);
	        _this.domElement.addEventListener('touchend', _this.onTouchEnd, false);
	        _this.domElement.addEventListener('touchmove', _this.onTouchMove, false);
	
	        _this.domElement.addEventListener('dblclick', _this.onDblClick, false);
	        _this.domElement.addEventListener('click', _this.onClick, false);
	
	        window.addEventListener('keydown', _this.onKeyDown, false);
	
	        // force an update at start
	        _this.update();
	        return _this;
	    }
	
	    //
	    // public methods
	    //
	
	
	    _createClass(EarthControls, [{
	        key: 'setCenter',
	        value: function setCenter(lon, lat) {
	            this.longitude = lon;
	            this.latitude = lat;
	            this.render();
	            this.delayUpdateScene();
	        }
	    }, {
	        key: 'setPolarAngle',
	        value: function setPolarAngle(phi) {
	            this.spherical.phi = phi;
	            this.update();
	            this.render();
	            this.delayUpdateScene();
	        }
	    }, {
	        key: 'setAzimuthalAngle',
	        value: function setAzimuthalAngle(theta) {
	            this.spherical.theta = theta;
	            this.update();
	            this.render();
	            this.delayUpdateScene();
	        }
	    }, {
	        key: 'setPosition',
	        value: function setPosition(lon, lat, alti, phi, theta) {
	            this.longitude = lon;
	            this.latitude = lat;
	            this.object.position.z = alti;
	            // this.camera.position.z = alti;
	            this.sphericalDelta.phi = phi;
	            this.sphericalDelta.theta = theta;
	            this.update();
	            this.updateScene();
	        }
	    }, {
	        key: 'getPolarAngle',
	        value: function getPolarAngle() {
	            return this.spherical.phi;
	        }
	    }, {
	        key: 'getAzimuthalAngle',
	        value: function getAzimuthalAngle() {
	            return this.spherical.theta;
	        }
	    }, {
	        key: 'reset',
	        value: function reset() {
	            this.target.copy(this.target0);
	            this.object.position.copy(this.position0);
	            this.object.zoom = this.zoom0;
	            this.object.updateProjectionMatrix();
	            this.dispatchEvent({
	                type: 'change'
	            });
	            this.update();
	            this.render();
	            this.delayUpdateScene();
	            this.state = EarthControls.STATE.NONE;
	        }
	
	        // setSelection(selection) {
	        //         this.selection = selection;
	        //     }
	        // this method is exposed, but perhaps it would be better if we can make it private...
	
	    }, {
	        key: 'update',
	        value: function update() {
	            var offset = new THREE.Vector3();
	            // so camera.up is the orbit axis
	            var quat = new THREE.Quaternion().setFromUnitVectors(this.object.up, new THREE.Vector3(0, 1, 0));
	            var quatInverse = quat.clone().inverse();
	            var lastPosition = new THREE.Vector3();
	            var lastQuaternion = new THREE.Quaternion();
	
	            var position = this.object.position;
	            
	            console.log('setPosition', this.longitude, this.latitude);
	            
	            offset.copy(position).sub(this.target);
	            // rotate offset to "y-axis-is-up" space
	            offset.applyQuaternion(quat);
	            // angle from z-axis around y-axis
	            this.spherical.setFromVector3(offset);
	            if (this.autoRotate && this.state === EarthControls.STATE.NONE) {
	                this.rotateLeft(this.getAutoRotationAngle());
	            }
	            this.spherical.theta += this.sphericalDelta.theta;
	            this.spherical.phi += this.sphericalDelta.phi;
	            // restrict theta to be between desired limits
	            this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));
	            // restrict phi to be between desired limits
	            this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
	            this.spherical.makeSafe();
	            this.spherical.radius *= this.scale;
	            // restrict radius to be between desired limits
	            this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
	            // move target to panned location
	            // scope.target.add(panOffset);
	            offset.setFromSpherical(this.spherical);
	            // rotate offset back to "camera-up-vector-is-up" space
	            offset.applyQuaternion(quatInverse);
	            position.copy(this.target).add(offset);
	            this.object.lookAt(this.target);
	            if (this.enableDamping === true) {
	                this.sphericalDelta.theta *= 1 - this.dampingFactor;
	                this.sphericalDelta.phi *= 1 - this.dampingFactor;
	            } else {
	                this.sphericalDelta.set(0, 0, 0);
	            }
	            this.scale = 1;
	
	            // panOffset.set(0, 0, 0);
	            // update condition is:
	            // min(camera displacement, camera rotation in radians)^2 > EPS
	            // using small-angle approximation cos(x/2) = 1 - x^2 / 8
	            if (this.zoomChanged || lastPosition.distanceToSquared(this.object.position) > EarthControls.EPS || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EarthControls.EPS) {
	                this.dispatchEvent({
	                    type: 'change'
	                });
	                lastPosition.copy(this.object.position);
	                lastQuaternion.copy(this.object.quaternion);
	                this.zoomChanged = false;
	                return true;
	            }
	            return false;
	        }
	    }, {
	        key: 'dispose',
	        value: function dispose() {
	            this.domElement.removeEventListener('contextmenu', this.onContextMenu, false);
	            this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
	            this.domElement.removeEventListener('mousewheel', this.onMouseWheel, false);
	            this.domElement.removeEventListener('MozMousePixelScroll', this.onMouseWheel, false); // firefox
	            this.domElement.removeEventListener('touchstart', this.onTouchStart, false);
	            this.domElement.removeEventListener('touchend', this.onTouchEnd, false);
	            this.domElement.removeEventListener('touchmove', this.onTouchMove, false);
	            document.removeEventListener('mousemove', this.onMouseMove, false);
	            document.removeEventListener('mouseup', this.onMouseUp, false);
	            document.removeEventListener('mouseout', this.onMouseUp, false);
	            document.removeEventListener('dblclick', this.onDblClick, false);
	            document.removeEventListener('click', this.onClick, false);
	            window.removeEventListener('keydown', this.onKeyDown, false);
	
	            //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
	        }
	    }, {
	        key: 'getAutoRotationAngle',
	        value: function getAutoRotationAngle() {
	            return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
	        }
	    }, {
	        key: 'getZoomScale',
	        value: function getZoomScale() {
	            return Math.pow(0.95, this.zoomSpeed);
	        }
	    }, {
	        key: 'rotateLeft',
	        value: function rotateLeft(angle) {
	            this.sphericalDelta.theta -= angle;
	        }
	
	        // this.rotateLeft = rotateLeft;
	
	    }, {
	        key: 'rotateUp',
	        value: function rotateUp(angle) {
	            this.sphericalDelta.phi -= angle;
	        }
	    }, {
	        key: 'panLeft',
	        value: function panLeft(distance) {
	            var R = EarthControls.R;
	            var lonDelta = Math.cos(this.spherical.theta) * (distance / (1000 * R * Math.cos(this.latitude * Math.PI / 180))) * 180 / Math.PI;
	            this.longitude -= lonDelta;
	            var latDelta = -Math.sin(this.spherical.theta) * (distance / (R * 1000)) * 180 / Math.PI;
	            if (this.latitude + latDelta < 80 && this.latitude + latDelta > -80) {
	                this.latitude += latDelta;
	                // console.log('latitude:', latitude)
	            }
	            // latitude = (latitude + 90) % 180 - 90;
	            this.longitude = (this.longitude + 540) % 360 - 180;
	            // console.log('lon:', this.longitude);
	            // console.log('lat:', this.latitude);
	        }
	    }, {
	        key: 'getLongitude',
	        value: function getLongitude() {
	            return this.longitude;
	        }
	
	        // var newLon = lonOri + (controls.target.x / (1000 * R * Math.cos(lat * Math.PI / 180))) * 180 / Math.PI;
	        // var newLat = latOri + (controls.target.y / (1000 * R)) * 180 / Math.PI;
	
	    }, {
	        key: 'panUp',
	        value: function panUp(distance) {
	            var R = EarthControls.R;
	            var lonDelta = Math.sin(this.spherical.theta) * (distance / (1000 * R * Math.cos(this.latitude * Math.PI / 180))) * 180 / Math.PI;
	            this.longitude -= lonDelta;
	            var latDelta = Math.cos(this.spherical.theta) * (distance / (1000 * R)) * 180 / Math.PI;
	            if (this.latitude + latDelta < 80 && this.latitude + latDelta > -80) {
	                this.latitude += latDelta;
	            }
	            // latitude = (latitude + 90) % 180 - 90;
	            this.longitude = (this.longitude + 360) % 360;
	            // console.log('lon:', this.longitude);
	            // console.log('lat:', this.latitude);
	        }
	    }, {
	        key: 'getLatitude',
	        value: function getLatitude() {
	            return this.latitude;
	        }
	
	        // deltaX and deltaY are in pixels; right and down are positive
	
	    }, {
	        key: 'pan',
	        value: function pan(deltaX, deltaY) {
	            var offset = new THREE.Vector3();
	            var element = this.domElement === document ? this.domElement.body : this.domElement;
	            if (this.object instanceof THREE.PerspectiveCamera) {
	                // perspective
	                var position = this.object.position;
	                offset.copy(position).sub(this.target);
	                var targetDistance = offset.length();
	                // half of the fov is center to top of screen
	                targetDistance *= Math.tan(this.object.fov / 2 * Math.PI / 180.0);
	                // we actually don't use screenWidth, since perspective camera is fixed to screen height
	                this.panLeft(2 * deltaX * targetDistance / element.clientHeight);
	                this.panUp(2 * deltaY * targetDistance / element.clientHeight);
	            } else if (this.object instanceof THREE.OrthographicCamera) {
	                // orthographic
	                this.panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element.clientWidth, this.object.matrix);
	                this.panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element.clientHeight, this.object.matrix);
	            } else {
	                // camera neither orthographic nor perspective
	                console.warn('WARNING: EarthControls.js encountered an unknown camera type - pan disabled.');
	                this.enablePan = false;
	            }
	        }
	    }, {
	        key: 'dollyIn',
	        value: function dollyIn(dollyScale) {
	            if (this.object instanceof THREE.PerspectiveCamera) {
	                this.scale /= dollyScale;
	            } else if (this.object instanceof THREE.OrthographicCamera) {
	                this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
	                this.object.updateProjectionMatrix();
	                this.zoomChanged = true;
	            } else {
	                console.warn('WARNING: EarthControls.js encountered an unknown camera type - dolly/zoom disabled.');
	                this.enableZoom = false;
	            }
	        }
	    }, {
	        key: 'dollyOut',
	        value: function dollyOut(dollyScale) {
	            if (this.object instanceof THREE.PerspectiveCamera) {
	                this.scale *= dollyScale;
	            } else if (this.object instanceof THREE.OrthographicCamera) {
	                this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
	                this.object.updateProjectionMatrix();
	                this.zoomChanged = true;
	            } else {
	                console.warn('WARNING: EarthControls.js encountered an unknown camera type - dolly/zoom disabled.');
	                this.enableZoom = false;
	            }
	        }
	
	        //
	        // event callbacks - update the object state
	        //
	
	    }, {
	        key: 'handleMouseDownRotate',
	        value: function handleMouseDownRotate(event) {
	            // console.log('handleMouseDownRotate');
	            self.rotateStart.set(event.clientX, event.clientY);
	        }
	    }, {
	        key: 'handleMouseDownDolly',
	        value: function handleMouseDownDolly(event) {
	            // console.log('handleMouseDownDolly');
	            self.dollyStart.set(event.clientX, event.clientY);
	        }
	    }, {
	        key: 'handleMouseDownPan',
	        value: function handleMouseDownPan(event) {
	            // console.log('handleMouseDownPan');
	            self.panStart.set(event.clientX, event.clientY);
	        }
	    }, {
	        key: 'handleMouseMoveRotate',
	        value: function handleMouseMoveRotate(event) {
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
	            // self.delayUpdateScene();
	        }
	    }, {
	        key: 'delayUpdateScene',
	        value: function delayUpdateScene() {
	            // console.log('Reset timer.');
	            clearTimeout(this.timer);
	            this.timer = setTimeout(function () {
	                // console.log('Render after delay.');
	                self.updateScene();
	            }, EarthControls.RENDER_DELAY);
	        }
	    }, {
	        key: 'handleMouseMoveDolly',
	        value: function handleMouseMoveDolly(event) {
	            //console.log( 'handleMouseMoveDolly' );
	            self.dollyEnd.set(event.clientX, event.clientY);
	            self.dollyDelta.subVectors(self.dollyEnd, self.dollyStart);
	            if (self.dollyDelta.y > 0) {
	                self.dollyIn(self.getZoomScale());
	            } else if (self.dollyDelta.y < 0) {
	                self.dollyOut(self.getZoomScale());
	            }
	            self.dollyStart.copy(self.dollyEnd);
	            self.update();
	            self.render();
	            self.delayUpdateScene();
	        }
	    }, {
	        key: 'handleMouseMovePan',
	        value: function handleMouseMovePan(event) {
	            //console.log( 'handleMouseMovePan' );
	            self.panEnd.set(event.clientX, event.clientY);
	            self.panDelta.subVectors(self.panEnd, self.panStart);
	            self.pan(self.panDelta.x, self.panDelta.y);
	            self.panStart.copy(self.panEnd);
	            self.update();
	            self.render();
	            self.delayUpdateScene();
	        }
	    }, {
	        key: 'handleMouseUp',
	        value: function handleMouseUp(event) {
	            //console.log( 'handleMouseUp' );
	        }
	    }, {
	        key: 'handleClick',
	        value: function handleClick(event) {
	            console.trace( 'click' );
	            this.onSelectObject(event);
	        }
	    }, {
	        key: 'handleDblClick',
	        value: function handleDblClick(event) {}
	        // this.onSelectObject(event);
	
	
	        // // function onDocumentMouseDown(event) {
	        //
	        //     event.preventDefault();
	        //
	        //     mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
	        //     mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
	        //
	        //     raycaster.setFromCamera(mouse, camera);
	        //
	        //     var intersects = raycaster.intersectObjects(objects);
	        //
	        //     if (intersects.length > 0) {
	        //
	        //         intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
	        //
	        //         var particle = new THREE.Sprite(particleMaterial);
	        //         particle.position.copy(intersects[0].point);
	        //         particle.scale.x = particle.scale.y = 16;
	        //         scene.add(particle);
	        //
	        //     }
	        //
	        //     /*
	        //     // Parse all the faces
	        //     for ( var i in intersects ) {
	        //
	        //     	intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );
	        //
	        //     }
	        //     */
	        // }
	
	    }, {
	        key: 'handleMouseWheel',
	        value: function handleMouseWheel(event) {
	            //console.log( 'handleMouseWheel' );
	            var delta = 0;
	            if (event.wheelDelta !== undefined) {
	                // WebKit / Opera / Explorer 9
	                delta = event.wheelDelta;
	            } else if (event.detail !== undefined) {
	                // Firefox
	                delta = -event.detail;
	            }
	
	            if (delta > 0) {
	                self.dollyOut(self.getZoomScale());
	            } else if (delta < 0) {
	                self.dollyIn(self.getZoomScale());
	            }
	            self.update();
	            self.render();
	            self.delayUpdateScene();
	        }
	    }, {
	        key: 'handleKeyDown',
	        value: function handleKeyDown(event) {
	            //console.log( 'handleKeyDown' );
	            switch (event.keyCode) {
	                case self.keys.UP:
	                    self.pan(0, self.keyPanSpeed);
	                    self.update();
	                    self.render();
	                    self.delayUpdateScene();
	                    break;
	                case self.keys.BOTTOM:
	                    self.pan(0, -self.keyPanSpeed);
	                    self.update();
	                    self.render();
	                    self.delayUpdateScene();
	                    break;
	                case self.keys.LEFT:
	                    self.pan(self.keyPanSpeed, 0);
	                    self.update();
	                    self.render();
	                    self.delayUpdateScene();
	                    break;
	                case self.keys.RIGHT:
	                    self.pan(-self.keyPanSpeed, 0);
	                    self.update();
	                    self.render();
	                    self.delayUpdateScene();
	                    break;
	            }
	        }
	    }, {
	        key: 'handleTouchStartRotate',
	        value: function handleTouchStartRotate(event) {
	            //console.log( 'handleTouchStartRotate' );
	            self.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
	        }
	    }, {
	        key: 'handleTouchStartDolly',
	        value: function handleTouchStartDolly(event) {
	            //console.log( 'handleTouchStartDolly' );
	            var dx = event.touches[0].pageX - event.touches[1].pageX;
	            var dy = event.touches[0].pageY - event.touches[1].pageY;
	            var distance = Math.sqrt(dx * dx + dy * dy);
	            self.dollyStart.set(0, distance);
	        }
	    }, {
	        key: 'handleTouchStartPan',
	        value: function handleTouchStartPan(event) {
	            //console.log( 'handleTouchStartPan' );
	            self.panStart.set(event.touches[0].pageX, event.touches[0].pageY);
	        }
	    }, {
	        key: 'handleTouchMoveRotate',
	        value: function handleTouchMoveRotate(event) {
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
	            self.delayUpdateScene();
	        }
	    }, {
	        key: 'handleTouchMoveDolly',
	        value: function handleTouchMoveDolly(event) {
	            //console.log( 'handleTouchMoveDolly' );
	            var dx = event.touches[0].pageX - event.touches[1].pageX;
	            var dy = event.touches[0].pageY - event.touches[1].pageY;
	            var distance = Math.sqrt(dx * dx + dy * dy);
	            self.dollyEnd.set(0, distance);
	            self.dollyDelta.subVectors(self.dollyEnd, self.dollyStart);
	            if (self.dollyDelta.y > 0) {
	                self.dollyOut(self.getZoomScale());
	            } else if (self.dollyDelta.y < 0) {
	                self.dollyIn(self.getZoomScale());
	            }
	
	            self.dollyStart.copy(self.dollyEnd);
	            self.update();
	            self.render();
	            self.delayUpdateScene();
	        }
	    }, {
	        key: 'handleTouchMovePan',
	        value: function handleTouchMovePan(event) {
	            //console.log( 'handleTouchMovePan' );
	            self.panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
	            self.panDelta.subVectors(self.panEnd, self.panStart);
	            self.pan(self.panDelta.x, self.panDelta.y);
	            self.panStart.copy(self.panEnd);
	            self.update();
	            self.render();
	            self.delayUpdateScene();
	        }
	    }, {
	        key: 'handleTouchEnd',
	        value: function handleTouchEnd(event) {}
	        //console.log( 'handleTouchEnd' );
	
	
	        //
	        // event handlers - FSM: listen for events and reset state
	        //
	
	    }, {
	        key: 'onMouseDown',
	        value: function onMouseDown(event) {
	            if (self.enabled === false) return;
	            event.preventDefault();
	            if (event.button === self.mouseButtons.ORBIT) {
	                if (self.enableRotate === false) return;
	                self.handleMouseDownRotate(event);
	                self.state = EarthControls.STATE.ROTATE;
	            } else if (event.button === self.mouseButtons.ZOOM) {
	                if (self.enableZoom === false) return;
	                self.handleMouseDownDolly(event);
	                self.state = EarthControls.STATE.DOLLY;
	            } else if (event.button === self.mouseButtons.PAN) {
	                if (self.enablePan === false) return;
	                self.handleMouseDownPan(event);
	                self.state = EarthControls.STATE.PAN;
	            }
	            if (self.state !== EarthControls.STATE.NONE) {
	                document.addEventListener('mousemove', self.onMouseMove, false);
	                document.addEventListener('mouseup', self.onMouseUp, false);
	                document.addEventListener('mouseout', self.onMouseUp, false);
	                document.addEventListener('dblClick', self.onDblClick, false);
	                document.addEventListener('click', self.onClick, false);
	                self.dispatchEvent(self.startEvent);
	            }
	        }
	    }, {
	        key: 'onMouseMove',
	        value: function onMouseMove(event) {
	            if (self.enabled === false) return;
	            event.preventDefault();
	            if (self.state === EarthControls.STATE.ROTATE) {
	                if (self.enableRotate === false) return;
	                self.handleMouseMoveRotate(event);
	            } else if (self.state === EarthControls.STATE.DOLLY) {
	                if (self.enableZoom === false) return;
	                self.handleMouseMoveDolly(event);
	            } else if (self.state === EarthControls.STATE.PAN) {
	                if (self.enablePan === false) return;
	                self.handleMouseMovePan(event);
	            }
	        }
	    }, {
	        key: 'onMouseUp',
	        value: function onMouseUp(event) {
	            if (self.enabled === false) return;
	            self.handleMouseUp(event);
	            document.removeEventListener('mousemove', self.onMouseMove, false);
	            document.removeEventListener('mouseup', self.onMouseUp, false);
	            document.removeEventListener('mouseout', self.onMouseUp, false);
	            document.removeEventListener('dblClick', self.onDblClick, false);
	            document.removeEventListener('click', self.onClick, false);
	            self.dispatchEvent(self.endEvent);
	            self.state = EarthControls.STATE.NONE;
	        }
	    }, {
	        key: 'onDblClick',
	        value: function onDblClick(event) {
	            if (self.enabled === false) return;
	            self.handleDblClick(event);
	            document.removeEventListener('mousemove', self.onMouseMove, false);
	            document.removeEventListener('mouseup', self.onMouseUp, false);
	            document.removeEventListener('mouseout', self.onMouseUp, false);
	            document.removeEventListener('dblClick', self.onDblClick, false);
	            document.removeEventListener('click', self.onClick, false);
	            self.dispatchEvent(self.endEvent);
	            self.state = EarthControls.STATE.NONE;
	        }
	    }, {
	        key: 'onClick',
	        value: function onClick(event) {
	            if (self.enabled === false) return;
	            self.handleClick(event);
	            document.removeEventListener('mousemove', self.onMouseMove, false);
	            document.removeEventListener('mouseup', self.onMouseUp, false);
	            document.removeEventListener('mouseout', self.onMouseUp, false);
	            document.removeEventListener('dblClick', self.onDblClick, false);
	            document.removeEventListener('click', self.onClick, false);
	            self.dispatchEvent(self.endEvent);
	            self.state = EarthControls.STATE.NONE;
	        }
	    }, {
	        key: 'onMouseWheel',
	        value: function onMouseWheel(event) {
	            if (self.enabled === false || self.enableZoom === false || self.state !== EarthControls.STATE.NONE && self.state !== EarthControls.STATE.ROTATE) return;
	            event.preventDefault();
	            event.stopPropagation();
	            self.handleMouseWheel(event);
	            self.dispatchEvent(self.startEvent); // not sure why these are here...
	            self.dispatchEvent(self.endEvent);
	        }
	    }, {
	        key: 'onKeyDown',
	        value: function onKeyDown(event) {
	            if (self.enabled === false || self.enableKeys === false || self.enablePan === false) return;
	            self.handleKeyDown(event);
	        }
	    }, {
	        key: 'onTouchStart',
	        value: function onTouchStart(event) {
	            if (self.enabled === false) return;
	            switch (event.touches.length) {
	                case 3:
	                    // one-fingered touch: rotate
	                    if (self.enableRotate === false) return;
	                    self.handleTouchStartRotate(event);
	                    self.state = EarthControls.STATE.TOUCH_ROTATE;
	                    break;
	                case 2:
	                    // two-fingered touch: dolly
	                    if (self.enableZoom === false) return;
	                    self.handleTouchStartDolly(event);
	                    self.state = EarthControls.STATE.TOUCH_DOLLY;
	                    break;
	                case 1:
	                    // three-fingered touch: pan
	                    if (self.enablePan === false) return;
	                    self.handleTouchStartPan(event);
	                    self.state = EarthControls.STATE.TOUCH_PAN;
	                    break;
	                default:
	                    self.state = EarthControls.STATE.NONE;
	            }
	            if (self.state !== EarthControls.STATE.NONE) {
	                self.dispatchEvent(self.startEvent);
	            }
	        }
	    }, {
	        key: 'onTouchMove',
	        value: function onTouchMove(event) {
	            if (self.enabled === false) return;
	            event.preventDefault();
	            event.stopPropagation();
	            switch (event.touches.length) {
	                case 3:
	                    // one-fingered touch: rotate
	                    if (self.enableRotate === false) return;
	                    if (self.state !== EarthControls.STATE.TOUCH_ROTATE) return; // is this needed?...
	                    self.handleTouchMoveRotate(event);
	                    break;
	                case 2:
	                    // two-fingered touch: dolly
	                    if (self.enableZoom === false) return;
	                    if (self.state !== EarthControls.STATE.TOUCH_DOLLY) return; // is this needed?...
	                    self.handleTouchMoveDolly(event);
	                    break;
	                case 1:
	                    // three-fingered touch: pan
	                    if (self.enablePan === false) return;
	                    if (self.state !== EarthControls.STATE.TOUCH_PAN) return; // is this needed?...
	                    self.handleTouchMovePan(event);
	                    break;
	                default:
	                    self.state = EarthControls.STATE.NONE;
	            }
	        }
	    }, {
	        key: 'onTouchEnd',
	        value: function onTouchEnd(event) {
	            if (self.enabled === false) return;
	            self.handleTouchEnd(event);
	            self.dispatchEvent(self.endEvent);
	            self.state = EarthControls.STATE.NONE;
	        }
	    }, {
	        key: 'onContextMenu',
	        value: function onContextMenu(event) {
	            event.preventDefault();
	        }
	    }]);
	
	    return EarthControls;
	}(THREE.EventDispatcher);
	
	;
	
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
	// THREE.EarthControls.prototype = Object.create(THREE.EventDispatcher.prototype);
	// THREE.EarthControls.prototype.constructor = THREE.EarthControls;
	
	Object.defineProperties(EarthControls.prototype, {
	    center: {
	        get: function get() {
	            console.warn('THREE.EarthControls: .center has been renamed to .target');
	            return this.target;
	        }
	    },
	    // backward compatibility
	    noZoom: {
	        get: function get() {
	            console.warn('THREE.EarthControls: .noZoom has been deprecated. Use .enableZoom instead.');
	            return !this.enableZoom;
	        },
	        set: function set(value) {
	            console.warn('THREE.EarthControls: .noZoom has been deprecated. Use .enableZoom instead.');
	            this.enableZoom = !value;
	        }
	    },
	    noRotate: {
	        get: function get() {
	            console.warn('THREE.EarthControls: .noRotate has been deprecated. Use .enableRotate instead.');
	            return !this.enableRotate;
	        },
	        set: function set(value) {
	            console.warn('THREE.EarthControls: .noRotate has been deprecated. Use .enableRotate instead.');
	            this.enableRotate = !value;
	        }
	    },
	    noPan: {
	        get: function get() {
	            console.warn('THREE.EarthControls: .noPan has been deprecated. Use .enablePan instead.');
	            return !this.enablePan;
	        },
	        set: function set(value) {
	            console.warn('THREE.EarthControls: .noPan has been deprecated. Use .enablePan instead.');
	            this.enablePan = !value;
	        }
	    },
	    noKeys: {
	        get: function get() {
	            console.warn('THREE.EarthControls: .noKeys has been deprecated. Use .enableKeys instead.');
	            return !this.enableKeys;
	        },
	        set: function set(value) {
	            console.warn('THREE.EarthControls: .noKeys has been deprecated. Use .enableKeys instead.');
	            this.enableKeys = !value;
	        }
	    },
	    staticMoving: {
	        get: function get() {
	            console.warn('THREE.EarthControls: .staticMoving has been deprecated. Use .enableDamping instead.');
	            return !this.constraint.enableDamping;
	        },
	        set: function set(value) {
	            console.warn('THREE.EarthControls: .staticMoving has been deprecated. Use .enableDamping instead.');
	            this.constraint.enableDamping = !value;
	        }
	    },
	    dynamicDampingFactor: {
	        get: function get() {
	            console.warn('THREE.EarthControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
	            return this.constraint.dampingFactor;
	        },
	        set: function set(value) {
	            console.warn('THREE.EarthControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
	            this.constraint.dampingFactor = value;
	        }
	    }
	});
	EarthControls.RENDER_DELAY = 500;
	
	exports.default = EarthControls;
	
	// export default function(object, domElement, render, coord) {
	//     return new EarthControls(object, domElement, render, coord);
	// };
	
	// module.exports = THREE.EarthControls;
	
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	Open Earth View - viewer-threejs
	The MIT License (MIT)
	Copyright (c) 2016 ClÃ©ment Igonet
	
	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the "Software"),
	to deal in the Software without restriction, including without limitation
	the rights to use, copy, modify, merge, publish, distribute, sublicense,
	and/or sell copies of the Software, and to permit persons to whom the Software
	is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
	OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	* @author Clement Igonet
	*/
	
	// export default OpenEarthView.World = {};
	//   //
	// }
	// require("imports-loader?toolbox=OpenEarthView.toolbox!./openearthview.js");
	
	// OpenEarthView.Terrain.FlatTerrain = require("./terrains/FlatTerrain.js");
	var FlatTerrain = __webpack_require__(4);
	var toolbox = __webpack_require__(5);
	var tileLoader = __webpack_require__(6);
	var R = 6378.137;
	var THREE = __webpack_require__(1);
	
	// THREE.EarthControls = require('./controls/EarthControls_class.js');
	// THREE.EarthControls = require('./controls/EarthControls_function.js');
	var self = void 0;
	
	var World = function () {
	    function World(domElement) {
	        var _this = this;
	
	        _classCallCheck(this, World);
	
	        self = this;
	
	        this.domElement = domElement;
	        this.terrains = {};
	        this.terrains['FlatTerrain'] = new FlatTerrain('FlatTerrain', null, null);
	        this.layers = {};
	        this.loaders = {};
	        if (this.domElement === null) {
	            alert('No domElement defined.');
	            return;
	        }
	        this.lastSelectedBuilding = {
	            id: undefined,
	            tileMesh: undefined,
	            bboxMesh: undefined,
	            bboxCenter: undefined,
	            building: undefined
	        };
	        // if (this.layers.length === 0) {
	        //     this.layers[0] = new OpenEarthView.Layer.OSM("defaultLayer");
	        // }
	        this.ZOOM_SHIFT_SIZE = 4;
	        this.MAX_TILEMESH = 400;
	        // this.ZOOM_FLAT = 13;
	        this.ZOOM_MIN = 1;
	        this.tileMeshes = {};
	        this.tileMeshQueue = [];
	        this.LONGITUDE_ORI = -73.98468017578125;
	        this.LATITUDE_ORI = 40.7477771608207;
	        this.R = 6378.137;
	        this.xtile = 0;
	        this.ytile = 0;
	        this.zoom = 0;
	        this.tileGroups;
	        this.tileGroup = [];
	        this.defaultAlti = 150;
	
	        // this.geojsonLoader = new THREE.GeojsonLoader();
	        // this.geojsonLoader = THREE.GeojsonLoader.getSingleton();
	
	        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000000);
	        // console.log('camera:', JSON.stringify(this.camera));
	        this.camera.up.set(0, 0, 1);
	
	        this.domElement = document.getElementById(domElement);
	        // console.log('container.clientWidth:', container.clientWidth)
	        // console.log('container.clientHeight:', container.clientHeight)
	        // document.body.appendChild(this.canvas);
	
	        // var background = document.createElement('Background');
	        // background.setAttribute('groundColor', '0.972 0.835 0.666');
	        // background.setAttribute('skyAngle', '1.309 1.571');
	        // background.setAttribute('skyColor', '0.0 0.2 0.7 0.0 0.5 1.0 1.0 1.0 1.0');
	        // scene.appendChild(background);
	        this.canvas = document.createElement('canvas');
	        this.canvas.setAttribute('id', 'openearthviewcanvas');
	        this.domElement.appendChild(this.canvas);
	
	        this.renderer = new THREE.WebGLRenderer({
	            canvas: this.canvas
	        });
	        this.canvas.width = this.canvas.clientWidth;
	        this.canvas.height = this.canvas.clientHeight;
	        // renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
	        //
	        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
	        // this.canvas.appendChild(this.renderer.domElement);
	
	        this.renderer.shadowMapEnabled = true;
	        this.renderer.shadowMapSoft = false;
	
	        this.renderer.shadowCameraNear = 3;
	        this.renderer.shadowCameraFar = this.camera.far;
	        this.renderer.shadowCameraFov = 50;
	
	        this.renderer.shadowMapBias = 0.0039;
	        this.renderer.shadowMapDarkness = 0.5;
	        this.renderer.shadowMapWidth = 1024;
	        this.renderer.shadowMapHeight = 1024;
	
	        this.lonStamp = 0;
	        this.latStamp = 0;
	        this.altitude = this.defaultAlti;
	        this.scene = new THREE.Scene();
	
	        // document.body.appendChild(renderer.domElement);
	        this.buildingObjects = [];
	        this.earth = new THREE.Object3D();
	        this.earth.position.set(0, 0, -this.R * 1000);
	        this.scene.add(this.earth);
	
	        // this.selectedBuildingContainer = new THREE.Object3D();
	        // this.scene.add(this.selectedBuildingContainer);
	
	        var light1 = new THREE.DirectionalLight(0xf0f0e0, 1);
	        var light2 = new THREE.DirectionalLight(0xf0f0e0, 1);
	        var light3 = new THREE.DirectionalLight(0xffffe0, 1);
	
	        light1.position.set(10000, 0, 100000);
	        light2.position.set(-5000, 8700, 10000);
	        light3.position.set(-5000, -8700, 1000);
	        // var light4 = new THREE.DirectionalLight(0xffffff, 1);
	        // light4.position.set(-10000, 10000, 20000);
	        this.scene.add(light1);
	        this.scene.add(light2);
	        this.scene.add(light3);
	        // this.scene.add(light4);
	
	        document.addEventListener('keydown', this.onDocumentKeyDown, false);
	        this.camera.position.z = this.altitude;
	        // let scope = this;
	        this.controls = new THREE.EarthControls(this.camera, this.renderer.domElement, function () {
	            self.render();
	        }, function () {
	            self.updateSceneLazy();
	        }, {
	            longitude: this.LONGITUDE_ORI,
	            latitude: this.LATITUDE_ORI
	        }, function (event) {
	            _this.onSelectObject(event);
	        });
	
	        // var canvas = document.getElementById('world');
	        // this.canvas.addEventListener('resize', this.onWindowResize, false);
	        window.addEventListener('resize', function () {
	            // console.log('coucou !!!');
	            // console.log('this.domElement.clientWidth:', this.domElement.clientWidth);
	            var width = self.domElement.clientWidth;
	            var height = self.domElement.clientHeight;
	
	            self.renderer.setViewport(0, 0, width, self.canvas.height);
	            self.renderer.setSize(width, height);
	            self.camera.aspect = width / height;
	            self.camera.updateProjectionMatrix();
	            self.render();
	        }, false);
	
	        //     canvas.addEventListener('resize', function () {
	        //   canvas.width  = canvas.clientWidth;
	        //   canvas.height = canvas.clientHeight;
	        //   renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
	        //   camera.aspect = canvas.clientWidth / canvas.clientHeight;
	        //   camera.updateProjectionMatrix();
	        // });
	
	        // canvas.width  = canvas.clientWidth;
	        // canvas.height = canvas.clientHeight;
	        // renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
	        // camera.aspect = canvas.clientWidth / canvas.clientHeight;
	        // camera.updateProjectionMatrix();
	
	        // this.onWindowResize = function() {
	        //     console.log("Call to onWindowResize.");
	        //     // var container = document.getElementById("world");
	        //     this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
	        //     this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
	        //     this.camera.updateProjectionMatrix();
	        //
	        //     // renderer.setSize(window.innerWidth, window.innerHeight);
	        //     // render();
	        // }
	    }
	
	    _createClass(World, [{
	        key: 'onSelectObject',
	
	        // var scope = this;
	
	        value: function onSelectObject(event) {
	            var scope = this;
	            console.log('Select object !');
	            console.log('event:{clientX:', event.clientX, ', clientY:', event.clientY, '}');
	            console.log('event:{offsetX:', event.offsetX, ', offsetY:', event.offsetY, '}');
	            console.log('self.renderer.domElement:{clientWidth:', self.renderer.domElement.clientWidth, ', clientHeight:', self.renderer.domElement.clientHeight, '}');
	            var mouse = new THREE.Vector3(event.offsetX / self.renderer.domElement.clientWidth * 2 - 1, -(event.offsetY / self.renderer.domElement.clientHeight) * 2 + 1, 0.5);
	            event.preventDefault();
	
	            var raycaster = new THREE.Raycaster();
	            raycaster.setFromCamera(mouse, self.camera);
	
	            for (var layerId in self.layers) {
	                console.log('self.layers[layerId].type:', JSON.stringify(self.layers[layerId].type));
	
	                switch (self.layers[layerId].type) {
	                    case 'building':
	
	                        console.log('self.buildingObjects:', self.buildingObjects);
	                        // let intersects = raycaster.intersectObjects(self.buildingObjects, true);
	
	                        var intersects = raycaster.intersectObjects(self.buildingObjects, false);
	                        //
	                        console.log('intersects.length:', JSON.stringify(intersects.length));
	                        // console.log('intersects.length:', JSON.stringify(intersects.length));
	                        if (intersects.length > 0) {
	                            console.log('intersects:', intersects);
	                            var distance = 0;
	                            var intersect = null;
	                            for (var idx = 0; idx < intersects.length; idx++) {
	                                if (distance === 0 || intersects[idx].distance < distance) {
	                                    intersect = intersects[idx];
	                                    distance = intersect.distance;
	                                }
	                            }
	                            if (intersect === null) break;
	                            if (!intersect.object.hasOwnProperty('geometry')) break;
	                            var building = intersect.object.parent;
	                            if (scope.lastSelectedBuilding.id !== undefined && building.userData.osm.id === scope.lastSelectedBuilding.id) {
	                                // BREAK
	                                break;
	                            }
	                            if (scope.lastSelectedBuilding.id !== undefined && building.userData.osm.id !== scope.lastSelectedBuilding.id) {
	                                // Remove previous selection.
	                                scope.lastSelectedBuilding.tileMesh.remove(scope.lastSelectedBuilding.bboxMesh);
	                                scope.lastSelectedBuilding.tileMesh.remove(scope.lastSelectedBuilding.bboxCenter);
	                                for (var i = scope.lastSelectedBuilding.building.children.length - 1; i >= 0; i--) {
	                                    var buildingBlockMesh = scope.lastSelectedBuilding.building.children[i];
	                                    buildingBlockMesh.material.transparent = false;
	                                }
	                                // scope.lastSelectedBuildinguildingBlockMesh.material.transparent = true;
	                            }
	
	                            for (var _i = building.children.length - 1; _i >= 0; _i--) {
	                                var _buildingBlockMesh = building.children[_i];
	                                _buildingBlockMesh.material.transparent = true;
	
	                                // buildingBlockMesh.material = new THREE.MeshPhongMaterial({
	                                //     color: buildingBlockMesh.material.color,
	                                //     transparent: true,
	                                //     opacity: 0.4
	                                // });
	                            }
	
	                            var tileMesh = building.parent;
	
	                            console.log('intersect:', intersect);
	                            console.log('intersect.object:', JSON.stringify(intersect.object));
	                            console.log('intersect.object.userData:', intersect.object.userData);
	                            console.log('building:', building);
	
	                            // Tutorial - Process bounding box - method setFromObject
	                            // Scene coordinates.
	                            // let setFromObject = new THREE.Box3().setFromObject(building);
	
	                            // Tutorial - Process bounding box - method computeBoundingBox
	                            // Bad: not hierarchical.
	                            // Target object coordinates.
	                            // buildingBlock.object.geometry.computeBoundingBox();
	                            // let computeBoundingBox = buildingBlock.object.geometry.boundingBox.clone();
	
	                            // Tutorial - Process bounding box - method BoxHelper
	                            var bboxMesh = new THREE.BoxHelper(building);
	                            console.log('bboxMesh: ', bboxMesh);
	                            var bboxWorldPos = new THREE.Vector3();
	                            bboxWorldPos.setFromMatrixPosition(tileMesh.matrixWorld);
	                            console.log('bboxWorldPos: ', bboxWorldPos);
	                            bboxMesh.position.setX(-bboxWorldPos.x);
	                            bboxMesh.position.setY(-bboxWorldPos.y);
	
	                            var bboxCenter = new THREE.Object3D();
	                            bboxCenter.position.set(bboxMesh.geometry.boundingSphere.center.x - bboxWorldPos.x, bboxMesh.geometry.boundingSphere.center.y - bboxWorldPos.y, bboxMesh.geometry.boundingSphere.center.z - bboxWorldPos.z);
	                            // bboxCenter.add(toolbox.originAxes(4, 1000));
	
	                            tileMesh.add(bboxCenter);
	                            tileMesh.add(bboxMesh);
	
	                            scope.lastSelectedBuilding.id = building.userData.osm.id;
	                            scope.lastSelectedBuilding.tileMesh = tileMesh;
	                            scope.lastSelectedBuilding.bboxMesh = bboxMesh;
	                            scope.lastSelectedBuilding.bboxCenter = bboxCenter;
	                            scope.lastSelectedBuilding.building = building;
	
	                            // Add axis to scene
	                            // self.scene.add(toolbox.originAxes(4, 1000));
	
	                            console.log('building.userData.info.tags:', building.userData.osm.tags.building);
	
	                            var message = 'id: ' + building.userData.osm.id;
	                            if (building.userData.osm.tags.hasOwnProperty('name')) {
	                                message = building.userData.osm.tags.name;
	                            } else if (building.userData.osm.tags.hasOwnProperty('addr:street')) {
	                                message = building.userData.osm.tags.hasOwnProperty('addr:housenumber') ? building.userData.osm.tags['addr:housenumber'] : '';
	                                message = building.userData.osm.tags['addr:street'];
	                            }
	
	                            var spritey = toolbox.makeTextSprite(message, {
	                                fontsize: 24,
	                                borderColor: {
	                                    r: 255,
	                                    g: 0,
	                                    b: 0,
	                                    a: 1.0
	                                },
	                                backgroundColor: {
	                                    r: 255,
	                                    g: 100,
	                                    b: 100,
	                                    a: 0.8
	                                }
	                            });
	                            // let spritey2 = toolbox.makeTextSprite('abcdefghijkl', {
	                            //     fontsize: 24,
	                            //     borderColor: {
	                            //         r: 255,
	                            //         g: 0,
	                            //         b: 0,
	                            //         a: 1.0
	                            //     },
	                            //     backgroundColor: {
	                            //         r: 255,
	                            //         g: 100,
	                            //         b: 100,
	                            //         a: 0.8
	                            //     }
	                            // });
	                            // let spritey3 = toolbox.makeTextSprite(
	                            //     'abcdefghijklmnopqrstuv', {
	                            //         fontsize: 24,
	                            //         borderColor: {
	                            //             r: 255,
	                            //             g: 0,
	                            //             b: 0,
	                            //             a: 1.0
	                            //         },
	                            //         backgroundColor: {
	                            //             r: 255,
	                            //             g: 100,
	                            //             b: 100,
	                            //             a: 0.8
	                            //         }
	                            //     });
	
	                            spritey.position.setZ(bboxMesh.geometry.boundingSphere.radius);
	                            // spritey2.position.setZ(bboxMesh.geometry.boundingSphere.radius + 35);
	                            // spritey3.position.setZ(bboxMesh.geometry.boundingSphere.radius + 70);
	
	                            console.log('spritey:', spritey);
	
	                            bboxCenter.add(spritey);
	                            // bboxCenter.add(spritey2);
	                            // bboxCenter.add(spritey3);
	
	                            self.render();
	                        }
	
	                        /*
	                        // Parse all the faces
	                        for ( var i in intersects ) {
	                          	intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );
	                          }
	                        */
	                        break;
	                }
	            }
	
	            // console.log('intersects:', JSON.stringify(intersects));
	            //
	            // if (intersects.length > 0) {
	            //     intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
	            // }
	        }
	
	        // LAYERS
	
	    }, {
	        key: 'addLayer',
	        value: function addLayer(openEarthViewLayer, openEarthViewLoader) {
	            var layerName = openEarthViewLayer.getName();
	            console.log('Add layer:', layerName);
	            if (this.layers.hasOwnProperty('defaultLayer')) {
	                delete this.layers['defaultLayer'];
	            }
	            // if (this.layers.length === 1 && this.layers[0].getName() === "defaultLayer") {
	            //     this.layers.pop();
	            // }
	            // this.layers[this.layers.length] = openEarthViewLayer;
	            this.layers[layerName] = openEarthViewLayer;
	            this.loaders[layerName] = openEarthViewLoader;
	
	            for (var xtile = 0; xtile < 4; xtile++) {
	                for (var ytile = 0; ytile < 4; ytile++) {
	                    if (openEarthViewLayer.type === 'tile') {
	                        tileLoader.tileFactory(openEarthViewLayer.getUrl(2, xtile, ytile), 2, xtile, ytile, function (texture) {
	                            // tileMesh.material.map = texture;
	                            // tileMesh.material.needsUpdate = true;
	                            // this.render();
	                        });
	                    }
	                }
	            }
	        }
	
	        // this.addTerrain("defaultTerrain", new OpenEarthView.Terrain.FlatTerrain("FlatTerrain"));
	        // world.addTerrain(new OpenEarthView.Terrain.FlatTerrain("FlatTerrain"));
	
	    }, {
	        key: 'addTerrain',
	        value: function addTerrain(openEarthViewTerrain) {
	            console.log('Add terrain:', openEarthViewTerrain.getName());
	            if (this.terrains.hasOwnProperty('defaultTerrain')) {
	                delete this.terrains['defaultTerrain'];
	            }
	            this.terrains[openEarthViewTerrain.getName()] = openEarthViewTerrain;
	        }
	    }, {
	        key: 'render',
	
	
	        // for (layerIdx = 0; layerIdx < layers.length; layerIdx++) {
	        //     this.addLayer(layers[layerIdx]);
	        // }
	        //
	
	        // var toolbox = OpenEarthView.toolbox;
	        // var terrainLoader = new OpenEarthView.TerrainLoader();
	
	        // this.updateSceneLazy();
	
	        value: function render() {
	            // requestAnimationFrame(render);
	            // //////////////////////////////////////////////////////////
	            // var oldXtile;
	            // var oldYtile;
	            // var oldZoom = this.zoom;
	            // var dist = new THREE.Vector3().copy(this.controls.object.position).sub(this.controls.target).length();
	            // var zoom__ = Math.floor(Math.max(Math.min(Math.floor(27 - Math.log2(dist)), 19), 1));
	
	            // if (zoom__ > this.ZOOM_MIN) {
	            //     this.zoom = zoom__;
	            // }
	            // console.log(this.earth.rotation);
	
	            if (this.lonStamp !== this.controls.getLongitude() || this.latStamp !== this.controls.getLatitude()) {
	                // this.lonStamp = this.controls.getLongitude();
	                // this.latStamp = this.controls.getLatitude();
	                this.earth.rotation.set(this.controls.getLatitude() * Math.PI / 180, -this.controls.getLongitude() * Math.PI / 180, 0);
	                // oldXtile = this.xtile;
	                // oldYtile = this.ytile;
	                // console.log('toolbox:', toolbox);
	                // this.xtile = toolbox.long2tile(this.lonStamp, this.zoom);
	                // this.ytile = toolbox.lat2tile(this.latStamp, this.zoom);
	
	                // if (Math.abs(oldXtile - this.xtile) >= 1 ||
	                //     Math.abs(oldYtile - this.ytile) >= 1) {
	                //     this.updateScene({
	                //         'lon': this.lonStamp,
	                //         'lat': this.latStamp,
	                //         'alti': this.altitude
	                //     });
	                // }
	            }
	            // else if (Math.abs(this.zoom - oldZoom) >= 1) {
	            //     this.updateScene({
	            //         'lon': this.lonStamp,
	            //         'lat': this.latStamp,
	            //         'alti': this.altitude
	            //     });
	            // }
	
	            // //////////////////////////////////////////////////////////
	            this.renderer.render(this.scene, this.camera);
	        }
	    }, {
	        key: 'updateSceneLazy',
	        value: function updateSceneLazy() {
	            // requestAnimationFrame(render);
	            // //////////////////////////////////////////////////////////
	            var oldXtile;
	            var oldYtile;
	            var oldZoom = this.zoom;
	            var dist = new THREE.Vector3().copy(this.controls.object.position).sub(this.controls.target).length();
	            var zoom__ = Math.floor(Math.max(Math.min(Math.floor(27 - Math.log2(dist)), 19), 1));
	
	            if (zoom__ > this.ZOOM_MIN) {
	                this.zoom = zoom__;
	            }
	
	            if (this.lonStamp !== this.controls.getLongitude() || this.latStamp !== this.controls.getLatitude()) {
	                this.lonStamp = this.controls.getLongitude();
	                this.latStamp = this.controls.getLatitude();
	                this.earth.rotation.set(this.controls.getLatitude() * Math.PI / 180, -this.controls.getLongitude() * Math.PI / 180, 0);
	                oldXtile = this.xtile;
	                oldYtile = this.ytile;
	                // console.log('toolbox:', toolbox);
	                this.xtile = toolbox.long2tile(this.lonStamp, this.zoom);
	                this.ytile = toolbox.lat2tile(this.latStamp, this.zoom);
	
	                if (Math.abs(oldXtile - this.xtile) >= 1 || Math.abs(oldYtile - this.ytile) >= 1) {
	                    this.updateScene({
	                        'lon': this.lonStamp,
	                        'lat': this.latStamp,
	                        'alti': this.altitude
	                    });
	                }
	            } else if (Math.abs(this.zoom - oldZoom) >= 1) {
	                this.updateScene({
	                    'lon': this.lonStamp,
	                    'lat': this.latStamp,
	                    'alti': this.altitude
	                });
	            }
	
	            // //////////////////////////////////////////////////////////
	            this.renderer.render(this.scene, this.camera);
	        }
	
	        //
	        // goUpdateSceneLazy() {
	        //     self.updateSceneLazy();
	        // }
	
	    }, {
	        key: 'updateScene',
	        value: function updateScene(position) {
	            var _this2 = this;
	console.log("scene", _this2, self);
	            // function updateScene(position) {
	            var tiles = {};
	            var currentIds = {};
	            var zoomMax = void 0;
	            var zoomMin = void 0;
	            var oriGround = void 0;
	
	            this.xtile = toolbox.long2tile(position.lon, this.zoom);
	            this.ytile = toolbox.lat2tile(position.lat, this.zoom);
	            this.earth.remove(this.tileGroups);
	            this.buildingObjects = [];
	            this.tileGroups = new THREE.Object3D();
	            
	            this.earth.add(this.tileGroups);
	            oriGround = new THREE.Object3D();
	            console.log(this.zoom, World.ZOOM_FLAT);
	            if (this.zoom >= World.ZOOM_FLAT) {
	                var xtileOri = toolbox.long2tile(position.lon, World.ZOOM_FLAT);
	                var ytileOri = toolbox.lat2tile(position.lat, World.ZOOM_FLAT);
	                var lonOri = toolbox.tile2long(xtileOri, World.ZOOM_FLAT);
	                var latOri = toolbox.tile2lat(ytileOri, World.ZOOM_FLAT);
	                var oriLatRot = void 0;
	                var oriLonRot = void 0;
	
	                // 3 - ground position
	                oriGround.position.set(0, 0, this.R * 1000);
	                // 2 - Latitude rotation
	                oriLatRot = new THREE.Object3D();
	                oriLatRot.rotation.set(-latOri * Math.PI / 180, 0, 0);
	                oriLatRot.add(oriGround);
	                // 1 - Longitude rotation
	                oriLonRot = new THREE.Object3D();
	                oriLonRot.rotation.set(0, lonOri * Math.PI / 180, 0);
	                oriLonRot.add(oriLatRot);
	
	                this.tileGroups.add(oriLonRot);
	            }
	
	            console.log('position:', JSON.stringify({
	                zoom: this.zoom,
	                xtile: this.xtile,
	                ytile: this.ytile
	            }));
	            zoomMax = Math.max(this.zoom, this.ZOOM_MIN);
	            zoomMin = Math.max(this.zoom - this.ZOOM_SHIFT_SIZE, this.ZOOM_MIN);
	
	            var _loop = function _loop(zoom_) {
	                var zShift = _this2.zoom - zoom_;
	                var factor = void 0;
	                var xtile_ = void 0;
	                var ytile_ = void 0;
	                var size = void 0;
	                var minXtile = void 0;
	                var maxXtile = void 0;
	                var minYtile = void 0;
	                var maxYtile = void 0;
	                var modulus = void 0;
	
	                _this2.tileGroup[zShift] = new THREE.Object3D();
	                _this2.tileGroups.add(_this2.tileGroup[zShift]);
	
	                if (zoom_ < 0 && zShift > 0) {
	                    return 'continue';
	                }
	                factor = Math.pow(2, zShift);
	                xtile_ = Math.floor(_this2.xtile / factor);
	                ytile_ = Math.floor(_this2.ytile / factor);
	                size = 2;
	
	                if (_this2.zoom < 8 && zoom_ < 6) {
	                    size = 2;
	                } else if (zoom_ < 19) {
	                    size = 2;
	                }
	                minXtile = Math.max(0, Math.floor((xtile_ - (Math.pow(2, size - 1) - 1)) / 2) * 2);
	                maxXtile = Math.floor((xtile_ + (Math.pow(2, size - 1) - 1)) / 2) * 2 + 1;
	                minYtile = Math.max(0, Math.floor((ytile_ - (Math.pow(2, size - 1) - 1)) / 2) * 2);
	                maxYtile = Math.floor((ytile_ + (Math.pow(2, size - 1) - 1)) / 2) * 2 + 1;
	                modulus = zoom_ > 0 ? Math.pow(2, zoom_) : 0;
	
	                // minXtile = xtile_;
	                // maxXtile = xtile_;
	                // minYtile = ytile_;
	                // maxYtile = ytile_;
	
	                var _loop2 = function _loop2(atile) {
	                    var _loop3 = function _loop3(btile) {
	                        var id = void 0;
	
	                        id = 'z_' + zoom_ + '_' + atile % modulus + '_' + btile % modulus;
	                        for (var zzz = 1; zzz <= 2; zzz++) {
	                            var idNext = void 0;
	
	                            idNext = 'z_' + (zoom_ - zzz) + '_' + Math.floor(atile % modulus / Math.pow(2, zzz)) + '_' + Math.floor(btile % modulus / Math.pow(2, zzz));
	                            tiles[idNext] = {};
	                        }
	                        if (!tiles.hasOwnProperty(id)) {
	                            (function () {
	                                var tileSupport = void 0;
	                                var tileMesh = void 0;
	
	                                tileSupport = new THREE.Object3D(); // create an empty container
	                                tileMesh = new THREE.Mesh();
	                                tileSupport.add(tileMesh);
	
	                                // tileMesh.position.set(0, 0, -10);
	                                if (zoom_ < World.ZOOM_FLAT) {
	                                    var tileEarth = void 0;
	
	                                    tileEarth = new THREE.Object3D(); // create an empty container
	                                    tileEarth.rotation.set(0, (toolbox.tile2long(atile, zoom_) + 180) * Math.PI / 180, 0);
	                                    _this2.tileGroup[zShift].add(tileEarth);
	                                    tileMesh = toolbox.singleton.getTileMesh(R, zoom_, btile, Math.max(9 - zoom_, 0));
	                                    tileEarth.add(tileMesh);
	                                } else {
	                                    for (var terrainId in _this2.terrains) {
	                                        // for (var layerIdx = 0; layerIdx < layerIds.length; layerIdx++) {
	                                        if (!_this2.terrains.hasOwnProperty(terrainId)) {
	                                            continue;
	                                        }
	                                        switch (_this2.terrains[terrainId].type) {
	                                            case 'terrain':
	                                                (function (tileSupport, tileMesh, zoom, xtile, ytile) {
	
	                                                    var lon1 = toolbox.tile2long(xtile, zoom_);
	                                                    var lon2 = toolbox.tile2long(xtile + 1, zoom_);
	                                                    var lon = (lon1 + lon2) / 2;
	                                                    var lat1 = toolbox.tile2lat(ytile, zoom_);
	                                                    var lat2 = toolbox.tile2lat(ytile + 1, zoom_);
	                                                    var lat = (lat1 + lat2) / 2;
	                                                    var widthUp = toolbox.measure(lat, lon1, lat, lon2);
	                                                    // var widthDown = toolbox.measure(lat2, lon1, lat2, lon2);
	                                                    var widthSide = toolbox.measure(lat1, lon, lat2, lon);
	
	                                                    var tileShape = new THREE.Shape();
	                                                    var xTileShift = atile - xtile_ + xtile_ % Math.pow(2, zoom_ - World.ZOOM_FLAT);
	                                                    var yTileShift = btile - ytile_ + ytile_ % Math.pow(2, zoom_ - World.ZOOM_FLAT);
	                                                    var xA = 0;
	                                                    var xB = xA;
	                                                    var xC = widthUp;
	                                                    var xD = xC;
	                                                    var yA = -widthSide;
	                                                    var yB = 0;
	                                                    var yC = yB;
	                                                    var yD = yA;
	                                                    var geometry;
	
	                                                    tileShape.moveTo(xA, yA);
	                                                    tileShape.lineTo(xB, yB);
	                                                    tileShape.lineTo(xC, yC);
	                                                    tileShape.lineTo(xD, yD);
	                                                    tileShape.lineTo(xA, yA);
	
	                                                    tileSupport.position.set(xTileShift * widthUp, -yTileShift * widthSide, 0);
	                                                    oriGround.add(tileSupport);
	
	                                                    geometry = new THREE.ShapeGeometry(tileShape);
	                                                    toolbox.singleton.assignUVs(geometry);
	                                                    tileMesh.geometry = geometry;
	
	                                                    // var url = this.terrains[terrainId].getUrl(
	                                                    //     zoom,
	                                                    //     ((zoom > 0) ? (xtile % Math.pow(2, zoom)) : 0),
	                                                    //     ((zoom > 0) ? (ytile % Math.pow(2, zoom)) : 0));
	                                                    // terrainLoader.terrainFactory(
	                                                    //     url,
	                                                    //     zoom,
	                                                    //     xtile,
	                                                    //     ytile,
	                                                    //     function(geometry) {
	                                                    //         tileMesh.geometry = geometry;
	                                                    //         this.render();
	                                                    //     },
	                                                    //     this.terrains[terrainId].getName();
	                                                    // );
	                                                })(tileSupport, tileMesh, zoom_, atile % modulus, btile % modulus);
	
	                                                break;
	                                        }
	                                    }
	                                    // if (zoom_ >= 19 && atile == xtile_ && btile == ytile) {
	                                }
	
	                                var _loop4 = function _loop4(layerId) {
	                                    // console.log('layerId:', layerId);
	                                    // console.log('this.layers:', JSON.stringify(this.layers));
	                                    // console.log('this.layers[layerId]:', JSON.stringify(this.layers[layerId]));
	
	                                    if (!_this2.layers.hasOwnProperty(layerId)) {
	                                        return 'continue';
	                                    }
	                                    // console.log('this.layers[',layerId ,']:', JSON.stringify(this.layers[layerId]));
	                                    switch (_this2.layers[layerId].type) {
	                                        case 'tile':
	                                            tileMesh.material = new THREE.MeshBasicMaterial({
	                                                transparent: _this2.layers[layerId].opacity !== 1,
	                                                opacity: _this2.layers[layerId].opacity
	                                            });
	                                            _this2.render();
	                                            tileLoader.tilePreload(zoom_, atile % modulus, btile % modulus, function (texture) {
	                                                tileMesh.material.map = texture;
	                                                tileMesh.material.needsUpdate = true;
	                                                self.render();
	                                            });
	                                            (function (tileMesh, zoom, xtile, ytile, layer) {
	                                                var url = layer.getUrl(zoom, zoom > 0 ? xtile % Math.pow(2, zoom) : 0, zoom > 0 ? ytile % Math.pow(2, zoom) : 0);
	                                                var tilePath = zoom + '/' + xtile + '/' + ytile;
	
	                                                tileLoader.tileFactory(url, zoom, xtile, ytile, function (texture) {
	                                                    tileMesh.material.map = texture;
	                                                    tileMesh.material.needsUpdate = true;
                                                
	                                                    self.render();
	                                                });
	                                                currentIds[tilePath] = {};
	                                            })(tileMesh, zoom_, atile % modulus, btile % modulus, _this2.layers[layerId]);
	                                            break;
	                                        case 'building':
	                                            if (_this2.zoom >= 17 && zoom_ >= Math.max(_this2.zoom - 1, _this2.layers[layerId].minZoom)) {
	                                                var defaultColor = 13 * _this2.zoom % 256 * 65536 + 53 * (atile % modulus) % 256 * 256 + 97 * (btile % modulus) % 256;
	                                                var lod = Math.max(0, zoom_ - 15);
	
	                                                (function (tileSupport, zoom, xtile, ytile, lod_, defaultColor_) {
	                                                    var localUrl = self.layers[layerId].getLocalUrl(zoom, xtile, ytile);
	                                                    // console.log('localUrl:', localUrl);
	                                                    var url = self.layers[layerId].getUrl(zoom, xtile, ytile);
														console.log(self.loaders[layerId]);
	                                                    self.loaders[layerId].load({
	                                                        z: zoom,
	                                                        x: xtile,
	                                                        y: ytile
	                                                    }, localUrl, url, function (tileMesh) {
	                                                        tileSupport.add(tileMesh);
	                                                        for (var i = tileMesh.children.length - 1; i >= 0; i--) {
	                                                            var buildingMesh = tileMesh.children[i];
	                                                            for (var j = buildingMesh.children.length - 1; j >= 0; j--) {
	                                                                self.buildingObjects.push(buildingMesh.children[j]);
	                                                            }
	                                                        }
	                                                        // self.buildingObjects.push(obj);
	                                                        // self.buildingObjects.push(obj);
	                                                        self.render();
	                                                    }, function () {}, function () {}, lod_, defaultColor_);
	                                                })(tileSupport, zoom_, atile % modulus, btile % modulus, lod, defaultColor);
	                                            }
	                                            break;
	                                        default:
	                                            break;
	                                    }
                                		console.log(tileMesh.position, tileMesh.material);
	                                };
	
	                                for (var layerId in _this2.layers) {
	                                    var _ret5 = _loop4(layerId);
	
	                                    if (_ret5 === 'continue') continue;
	                                }
	                            })();
	                        }
	                    };
	
	                    for (var btile = minYtile; btile <= maxYtile; btile++) {
	                        _loop3(btile);
	                    }
	                };
	
	                for (var atile = minXtile; atile <= maxXtile; atile++) {
	                    _loop2(atile);
	                }
	            };
	
            console.log(zoomMax, zoomMin);
	            for (var zoom_ = zoomMax; zoom_ > zoomMin; zoom_--) {
	                var _ret = _loop(zoom_);
	
	                if (_ret === 'continue') continue;
	            }
	            tileLoader.cancelOtherRequests(currentIds);
	        }
	    }, {
	        key: 'setCenter',
	        value: function setCenter(lon, lat) {
	            this.controls.setCenter(lon, lat);
	        }
	    }, {
	        key: 'setPosition',
	        value: function setPosition(lon, lat, alti, phi, theta) {
	            this.controls.setPosition(lon, lat, alti, phi, theta);
	            // this.updateScene({
	            //     'lon': this.lonStamp,
	            //     'lat': this.latStamp,
	            //     'alti': this.altitude
	            // });
	        }
	    }]);
	
	    return World;
	}();
	
	World.ZOOM_FLAT = 13;
	exports.default = World;
	module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// var OpenEarthView = require("../openearthview.js");
	// OpenEarthView.Terrain = require("./Terrain.js");
	
	// this.terrains["defaultTerrain"] = new OpenEarthView.Terrain.FlatTerrain("FlatTerrain");
	// // this.addTerrain("defaultTerrain", new OpenEarthView.Terrain.FlatTerrain("FlatTerrain"));
	// // world.addTerrain(new OpenEarthView.Terrain.FlatTerrain("FlatTerrain"));
	
	var _class = function () {
	    function _class(name, urls, options) {
	        _classCallCheck(this, _class);
	
	        this.type = 'terrain';
	        this.name = name !== undefined ? name : 'OpenEarthView';
	        // if (OpenEarthView.Terrains.hasOwnProperty(name)) {
	        //     console.err('Cannot register this already existing layer !');
	        //     return;
	        // }
	        // OpenEarthView.Terrains[name] = [];
	    }
	
	    _createClass(_class, [{
	        key: 'getName',
	        value: function getName() {
	            return this.name;
	        }
	    }, {
	        key: 'getUrl',
	        value: function getUrl(zoom, xtile, ytile) {
	            return undefined;
	        }
	    }]);

	    return _class;
	}();

	exports.default = _class;
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// TOOLBOX //
	/**
	Open Earth View - viewer-threejs
	The MIT License (MIT)
	Copyright (c) 2016 ClÃ©ment Igonet
	
	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the "Software"),
	to deal in the Software without restriction, including without limitation
	the rights to use, copy, modify, merge, publish, distribute, sublicense,
	and/or sell copies of the Software, and to permit persons to whom the Software
	is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
	OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	*/
	
	// OpenEarthView.toolbox = function() {
	//     this.textureLoader = new THREE.TextureLoader();
	//     this.textureLoader.crossOrigin = '';
	// };
	// var OpenEarthView = require("./openearthview.js");
	var THREE = __webpack_require__(1);
	
	var instance = null;
	//
	// class Cache {
	//     constructor() {
	//         if (!instance) {
	//             instance = this;
	//         }
	//
	//         // to test whether we have singleton or not
	//         this.time = new Date()
	//
	//         return instance;
	//     }
	// }
	
	var Toolbox = function () {
	    function Toolbox() {
	        _classCallCheck(this, Toolbox);
	
	        if (!instance) {
	            instance = this;
	        }
	        this.geoTiles = {};
	        this.geoTileQueue = [];
	        this.materials = {};
	        this.materialQueue = [];
	        return instance;
	    }
	
	    _createClass(Toolbox, [{
	        key: 'assignUVs',
	        value: function assignUVs(geometry) {
	
	            geometry.computeBoundingBox();
	
	            var max = geometry.boundingBox.max;
	            var min = geometry.boundingBox.min;
	
	            var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
	            var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
	
	            geometry.faceVertexUvs[0] = [];
	            var faces = geometry.faces;
	
	            for (var i = 0; i < geometry.faces.length; i++) {
	                var v1 = geometry.vertices[faces[i].a];
	                var v2 = geometry.vertices[faces[i].b];
	                var v3 = geometry.vertices[faces[i].c];
	
	                geometry.faceVertexUvs[0].push([new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y), new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y), new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)]);
	            }
	            geometry.uvsNeedUpdate = true;
	        }
	    }, {
	        key: 'getTileMesh',
	        value: function getTileMesh(r, zoom, ytile, power) {
	
	            var id = 'tile_' + zoom + '_' + ytile + '_' + power;
	
	            if (!this.geoTiles.hasOwnProperty(id)) {
	                this.geoTiles[id] = new THREE.Geometry();
	                var myGeometry = this.geoTiles[id];
	
	                this.geoTileQueue.push(id);
	                if (this.geoTileQueue.length > this.MAX_TILEMESH) {
	                    delete this.geoTiles[this.geoTileQueue.shift()];
	                }
	                /*************************
	                 *            ^ Y         *
	                 *            |           *
	                 *            |           *
	                 *            |           *
	                 *            -------> X  *
	                 *           /            *
	                 *          /             *
	                 *         / Z            *
	                 *************************/
	                /***************************
	                 *       B        C         *
	                 *                          *
	                 *                          *
	                 *                          *
	                 *      A          D        *
	                 ***************************/
	                var lonStart = Toolbox.tile2long(0, zoom);
	                var latStart = Toolbox.tile2lat(ytile, zoom);
	                var lonEnd = Toolbox.tile2long(1, zoom);
	                var latEnd = Toolbox.tile2lat(ytile + 1, zoom);
	                var factor = Math.pow(2, power);
	                var lonStep = (lonEnd - lonStart) / factor;
	                var latStep = (latEnd - latStart) / factor;
	
	                for (var u = 0; u < factor; u++) {
	                    for (var v = 0; v < factor; v++) {
	
	                        var lon1 = lonStart + lonStep * u;
	                        var lat1 = latStart + latStep * v;
	                        var lon2 = lonStart + lonStep * (u + 1);
	                        var lat2 = latStart + latStep * (v + 1);
	
	                        var rUp = r * 1000 * Math.cos(lat1 * Math.PI / 180);
	                        var rDown = r * 1000 * Math.cos(lat2 * Math.PI / 180);
	
	                        var Ax = rDown * Math.sin(lon1 * Math.PI / 180);
	                        var Ay = r * 1000 * Math.sin(lat2 * Math.PI / 180);
	                        var Az = rDown * Math.cos(lon1 * Math.PI / 180);
	
	                        var Bx = rUp * Math.sin(lon1 * Math.PI / 180);
	                        var By = r * 1000 * Math.sin(lat1 * Math.PI / 180);
	                        var Bz = rUp * Math.cos(lon1 * Math.PI / 180);
	
	                        var Cx = rUp * Math.sin(lon2 * Math.PI / 180);
	                        var Cy = r * 1000 * Math.sin(lat1 * Math.PI / 180);
	                        var Cz = rUp * Math.cos(lon2 * Math.PI / 180);
	
	                        var Dx = rDown * Math.sin(lon2 * Math.PI / 180);
	                        var Dy = r * 1000 * Math.sin(lat2 * Math.PI / 180);
	                        var Dz = rDown * Math.cos(lon2 * Math.PI / 180);
	
	                        myGeometry.vertices.push(new THREE.Vector3(Ax, Ay, Az), new THREE.Vector3(Bx, By, Bz), new THREE.Vector3(Cx, Cy, Cz), new THREE.Vector3(Dx, Dy, Dz));
	
	                        var iStep = factor - v - 1 + u * factor;
	
	                        myGeometry.faces.push(new THREE.Face3(4 * iStep, 4 * iStep + 2, 4 * iStep + 1));
	                        myGeometry.faces.push(new THREE.Face3(4 * iStep, 4 * iStep + 3, 4 * iStep + 2));
	
	                        myGeometry.faceVertexUvs[0].push([new THREE.Vector2((0.0 + u) / factor, (0.0 + v) / factor), new THREE.Vector2((1.0 + u) / factor, (1.0 + v) / factor), new THREE.Vector2((0.0 + u) / factor, (1.0 + v) / factor)]);
	                        myGeometry.faceVertexUvs[0].push([new THREE.Vector2((0.0 + u) / factor, (0.0 + v) / factor), new THREE.Vector2((1.0 + u) / factor, (0.0 + v) / factor), new THREE.Vector2((1.0 + u) / factor, (1.0 + v) / factor)]);
	                    }
	                }
	                myGeometry.uvsNeedUpdate = true;
	            }
	            return new THREE.Mesh(this.geoTiles[id]);
	        }
	
	        // static getSearchParameters() {
	        //     let prmstr = window.location.search.substr(1);
	        //     return prmstr !== null && prmstr !== '' ? transformToAssocArray(prmstr) : {};
	        // }
	
	    }], [{
	        key: 'long2tile',
	        value: function long2tile(lon, zoom) {
	            return Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
	        }
	    }, {
	        key: 'lat2tile',
	        value: function lat2tile(lat, zoom) {
	            return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
	        }
	    }, {
	        key: 'tile2long',
	        value: function tile2long(x, z) {
	            return (x / Math.pow(2, z) * 360 - 180 + 540) % 360 - 180;
	        }
	    }, {
	        key: 'tile2lat',
	        value: function tile2lat(y, z) {
	            var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
	            return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
	        }
	    }, {
	        key: 'measure',
	        value: function measure(lat1, lon1, lat2, lon2) {
	            // generally used geo measurement function
	            // var R = 6378.137; // Radius of earth in KM
	            var dLat = (lat2 - lat1) * Math.PI / 180;
	            var dLon = (lon2 - lon1) * Math.PI / 180;
	            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	            var d = Toolbox.R * c;
	            return d * 1000; // meters
	        }
	    }, {
	        key: 'lonOffsetMeter2lon',
	        value: function lonOffsetMeter2lon(lon, lat, x) {
	            return x / (Toolbox.R * Math.cos(lat)) + lon;
	        }
	    }, {
	        key: 'latOffsetMeter2lat',
	        value: function latOffsetMeter2lat(lat, y) {
	            return y / Toolbox.R + lat;
	        }
	    }, {
	        key: 'makeTextSprite',
	        value: function makeTextSprite(message, parameters) {
	            if (parameters === undefined) parameters = {};
	            var fontface = parameters.hasOwnProperty('fontface') ? parameters['fontface'] : 'Arial';
	            var fontsize = parameters.hasOwnProperty('fontsize') ? parameters['fontsize'] : 108;
	            var borderThickness = parameters.hasOwnProperty('borderThickness') ? parameters['borderThickness'] : 4;
	            var borderColor = parameters.hasOwnProperty('borderColor') ? parameters['borderColor'] : {
	                r: 0,
	                g: 0,
	                b: 0,
	                a: 1.0
	            };
	            var backgroundColor = parameters.hasOwnProperty('backgroundColor') ? parameters['backgroundColor'] : {
	                r: 255,
	                g: 255,
	                b: 255,
	                a: 1.0
	            };
	
	            // let spriteAlignment = THREE.SpriteAlignment.topLeft;
	
	            var canvas = document.createElement('canvas');
	            // let canvas = document.getElementById('osmworld');
	            console.log('canvas:', canvas);
	            var context = canvas.getContext('2d');
	            context.font = 'Bold ' + fontsize + 'px ' + fontface;
	
	            // get size data (height depends only on font size)
	            var metrics = context.measureText(message);
	            var textWidth = metrics.width;
	
	            // background color
	            context.fillStyle = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + backgroundColor.a + ')';
	            // border color
	            context.strokeStyle = 'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';
	
	            context.lineWidth = borderThickness;
	            Toolbox.roundRect(context, borderThickness / 2 + 140 - textWidth / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
	            // Toolbox.roundRect(context, borderThickness / 2 + textWidth / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
	
	            // 1.4 is extra height factor for text below baseline: g,j,p,q.
	
	            // text color
	            context.fillStyle = 'rgba(0, 0, 0, 1.0)';
	
	            context.fillText(message, borderThickness + 140 - textWidth / 2, fontsize + borderThickness);
	            // context.fillText(message, 0, fontsize + borderThickness);
	
	            // canvas contents will be used for a texture
	            var texture = new THREE.Texture(canvas);
	            texture.needsUpdate = true;
	
	            var spriteMaterial = new THREE.SpriteMaterial({
	                map: texture,
	                useScreenCoordinates: false
	                // alignment: spriteAlignment
	            });
	            var sprite = new THREE.Sprite(spriteMaterial);
	            sprite.scale.set(100, 50, 1.0);
	            return sprite;
	        }
	    }, {
	        key: 'roundRect',
	        value: function roundRect(ctx, x, y, w, h, r) {
	            ctx.beginPath();
	            ctx.moveTo(x + r, y);
	            ctx.lineTo(x + w - r, y);
	            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
	            ctx.lineTo(x + w, y + h - r);
	            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	            ctx.lineTo(x + r, y + h);
	            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
	            ctx.lineTo(x, y + r);
	            ctx.quadraticCurveTo(x, y, x + r, y);
	            ctx.closePath();
	            ctx.fill();
	            ctx.stroke();
	        }
	    }, {
	        key: 'originAxes',
	        value: function originAxes(radius, height) {
	            // static originAxes() {
	            var origin = new THREE.Object3D();
	
	            //radiusTop, radiusBottom, height, segmentsRadius, segmentsHeight, openEnded
	            var ge3 = new THREE.CylinderGeometry(radius, radius, height, 4, 1);
	            var axeXMesh = new THREE.Mesh(ge3, new THREE.MeshBasicMaterial({
	                color: Math.random() * 0xffffff,
	                opacity: 0.7
	            }));
	            axeXMesh.rotation.set(0, 0, Math.PI / 2);
	            axeXMesh.position.setX(500);
	            origin.add(axeXMesh);
	            var axeYMesh = new THREE.Mesh(ge3, new THREE.MeshBasicMaterial({
	                color: Math.random() * 0xffffff,
	                opacity: 0.7
	            }));
	            axeYMesh.position.setY(500);
	            origin.add(axeYMesh);
	            var axeZMesh = new THREE.Mesh(ge3, new THREE.MeshBasicMaterial({
	                color: Math.random() * 0xffffff,
	                opacity: 0.7
	            }));
	            axeZMesh.rotation.set(Math.PI / 2, 0, 0);
	            axeZMesh.position.setZ(500);
	            origin.add(axeZMesh);
	            return origin;
	        }
	    }]);
	
	    return Toolbox;
	}();
	
	;
	Toolbox.R = 6378.137;
	Toolbox.singleton = new Toolbox();
	exports.default = Toolbox;
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	Open Earth View - viewer-threejs
	The MIT License (MIT)
	Copyright (c) 2016 ClÃ©ment Igonet
	
	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the "Software"),
	to deal in the Software without restriction, including without limitation
	the rights to use, copy, modify, merge, publish, distribute, sublicense,
	and/or sell copies of the Software, and to permit persons to whom the Software
	is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
	OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	* @author Clement Igonet
	*/
	
	// OpenEarthView.TileLoader = function() {
	//     this.textureLoader = new THREE.TextureLoader();
	//     this.textureLoader.crossOrigin = '';
	//     // this.textureLoader
	// };
	var THREE = __webpack_require__(1);
	
	var TileLoader = function () {
	    function TileLoader() {
	        _classCallCheck(this, TileLoader);
	        this.textureLoader = new THREE.TextureLoader();
	        this.textureLoader.crossOrigin = '';
	        this.textures = {};
	        this.textureRequests = {};
	        this.textureRequestsCount = 0;
	        this.textureAliveRequests = {};
	        this.textureAliveRequestsCount = 0;
	    }
	
	    _createClass(TileLoader, [{
	        key: 'loadNextTile',
	        value: function loadNextTile() {
	            var _this = this;
	            // let scope = this;
	            // textureLoader.crossOrigin: '';
	            // console.log('textureAliveRequestsCount:', textureAliveRequestsCount, '/textureRequestsCount:', textureRequestsCount);
	            var textures = this.textures;
	            var textureRequests = this.textureRequests;
	            var textureAliveRequests = this.textureAliveRequests;
	            // console.log('scope.textureAliveRequestsCount: ', scope.textureAliveRequestsCount);
	            // console.log('scope.textureRequestsCount: ', scope.textureRequestsCount);
	
	            var _loop = function _loop() {
	                var ids = Object.keys(textureRequests);
	                var id = ids[ids.length - 1];
	                _this.textureAliveRequestsCount = _this.textureAliveRequestsCount + (textureAliveRequests.hasOwnProperty(id) ? 0 : 1);
	                textureAliveRequests[id] = textureRequests[id];
	                var url = textureAliveRequests[id].url;
	                delete textureRequests[id];
	                _this.textureRequestsCount--;
	                // console.log('(2) scope.textureAliveRequestsCount: ', scope.textureAliveRequestsCount);
	                // console.log('(2) scope.textureRequestsCount: ', scope.textureRequestsCount);
	                var scope = _this;
	                (function (url, id) {
	                    // console.log('Asking for loading: ', url);
	                    // zoom =
	
	                    textureAliveRequests[id].request = scope.textureLoader.load(url, function (texture) {
	                        textures[id] = texture;
	                        if (textureAliveRequests.hasOwnProperty(id)) {
	                            textureAliveRequests[id].onLoaded(texture);
	                            delete textureAliveRequests[id];
	                            scope.textureAliveRequestsCount--;
	                            // console.log('(0) scope.textureAliveRequestsCount: ', scope.textureAliveRequestsCount);
	                            // console.log('(0) scope.textureRequestsCount: ', scope.textureRequestsCount);
	                        }
	                        scope.loadNextTile();
	                    }, function () {}, function () {
	                        if (textureAliveRequests.hasOwnProperty(id)) {
	                            // textureAliveRequests[id].onLoaded(texture);
	                            delete textureAliveRequests[id];
	                            scope.textureAliveRequestsCount--;
	                            // console.log('scope.textureAliveRequestsCount: ', scope.textureAliveRequestsCount);
	                            // console.log('scope.textureRequestsCount: ', scope.textureRequestsCount);
	                        }
	                        scope.loadNextTile();
	                    });
	                })(url, id);
	            };
	
	            while (this.textureAliveRequestsCount < TileLoader.MAX_TEXTURE_REQUEST && this.textureRequestsCount > 0) {
	                _loop();
	            }
	        }
	    }, {
	        key: 'tilePreload',
	
	
	        // var TILE_PROVIDER01 = '.tile.openstreetmap.org';
	        // var TILE_PROVIDER01_RANDOM = ['a', 'b', 'c'];
	        // var TILE_PROVIDER01_FILE_EXT = 'png';
	
	        value: function tilePreload(zoom, xtile, ytile, onLoaded) {
	            var textures = this.textures;
	            // let textureRequests = this.textureRequests;
	            // let textureAliveRequests = this.textureAliveRequests;
	            // let id = zoom + '/' + xtile + '/' + ytile;
	            for (var diff = 0; diff < zoom; diff++) {
	                var power = Math.pow(2, diff);
	                var idZoomOther = +zoom - diff + '/' + Math.floor(xtile / power) + '/' + Math.floor(ytile / power);
	                // console.log('Looking for texture: ', idZoomOther);
	                if (textures.hasOwnProperty(idZoomOther)) {
	                    // onLoaded(textures[idZoomOther]);
	                    // origin : bottom left
	                    var tex = textures[idZoomOther].clone();
	                    tex.repeat.x = 1 / power;
	                    tex.repeat.y = 1 / power;
	                    var xOffset = xtile - Math.floor(xtile / power) * power;
	                    // console.log('xOffset: ', xOffset);
	                    var yOffset = power - 1 - (ytile - Math.floor(ytile / power) * power);
	                    // console.log('yOffset: ', yOffset);
	                    tex.offset.x = xOffset * tex.repeat.x;
	                    tex.offset.y = yOffset * tex.repeat.y;
	                    tex.needsUpdate = true;
	                    onLoaded(tex);
	                    return;
	                }
	            }
	            // for (var diff = Math.min(zoom - 19, -8); diff < Math.min(zoom - 1, -1); diff++) {
	            //     var power = Math.pow(2, diff);
	            //     var idZoomOther = (+zoom - diff) + '/' + Math.floor(xtile / power) + '/' + Math.floor(ytile / power);
	            //     // console.log('Looking for texture: ', idZoomOther);
	            //     if (textures.hasOwnProperty(idZoomOther)) {
	            //         // onLoaded(textures[idZoomOther]);
	            //         // origin : bottom left
	            //         var tex = textures[idZoomOther].clone();
	            //         tex.repeat.x = 1 / power;
	            //         tex.repeat.y = 1 / power;
	            //         var xOffset = xtile - Math.floor(xtile / power) * power
	            //         console.log('xOffset: ', xOffset);
	            //         var yOffset = (power - 1) - (ytile - Math.floor(ytile / power) * power);
	            //         console.log('yOffset: ', yOffset);
	            //         tex.offset.x = xOffset * tex.repeat.x;
	            //         tex.offset.y = yOffset * tex.repeat.y;
	            //         tex.needsUpdate = true;
	            //         onLoaded(tex);
	            //         return;
	            //     }
	            // }
	        }
	    }, {
	        key: 'tileFactory',
	        value: function tileFactory(url, zoom, xtile, ytile, onLoaded) {
	            // let scope = this;
	            var textures = this.textures;
	            var textureRequests = this.textureRequests;
	            // let textureAliveRequests = this.textureAliveRequests;
	            // var id = 'tile' + zoom + '_' + xtile + '_' + ytile + '_' + layerName;
	            // var myUrl = new URL(url);
	            var id = zoom + '/' + xtile + '/' + ytile;
	            if (textures.hasOwnProperty(id)) {
	                // onLoaded(textures[id]);
	            } else {
	                this.textureRequestsCount = this.textureRequestsCount + (textureRequests.hasOwnProperty(id) ? 0 : 1);
	                // console.log('scope.textureAliveRequestsCount: ', scope.textureAliveRequestsCount);
	                // console.log('scope.textureRequestsCount: ', scope.textureRequestsCount);
	                textureRequests[id] = {
	                    zoom: zoom,
	                    xtile: xtile,
	                    ytile: ytile,
	                    url: url,
	                    onLoaded: onLoaded
	                };
	                this.loadNextTile();
	            }
	        }
	    }, {
	        key: 'cancelOtherRequests',
	        value: function cancelOtherRequests(currentIds) {
	            // let scope = this;
	            // let textures = this.textures;
	            var textureRequests = this.textureRequests;
	            var textureAliveRequests = this.textureAliveRequests;
	            // console.log('currentIds: ', JSON.stringify(currentIds));
	            for (var id in textureRequests) {
	                if (!currentIds.hasOwnProperty(id)) {
	                    delete textureRequests[id];
	                    this.textureRequestsCount--;
	                    // console.log('id: ', id);
	                    // console.log('(1) scope.textureAliveRequestsCount: ', scope.textureAliveRequestsCount);
	                    // console.log('(1) scope.textureRequestsCount: ', scope.textureRequestsCount);
	                }
	            }
	            for (var _id in textureAliveRequests) {
	                if (!currentIds.hasOwnProperty(_id)) {
	                    // if (textureAliveRequests[id].request.hasOwnProperty('abort')) {
	                    //     textureAliveRequests[id].request.abort();
	                    // }
	                    // delete textureAliveRequests[id];
	                    // textureAliveRequestsCount--;
	                }
	            }
	            this.loadNextTile();
	        }
	    }]);
	
	    return TileLoader;
	}();
	
	TileLoader.MAX_TEXTURE_REQUEST = 10;
	exports.default = new TileLoader();
	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/*
	Calls:
	
	let requestManager = new RequestManager(loader, maxRequest);
	requestManager.createRequest(z,x,y,lod);
	requestManager.loadNext();
	*/
	
	var Request = __webpack_require__(8);
	// var THREE = require('THREE');
	
	var RequestManager = function () {
	    function RequestManager(localLoader, remoteLoader, maxRequest) {
	        _classCallCheck(this, RequestManager);
	
	        this.localLoader = localLoader;
	        this.remoteLoader = remoteLoader;
	        this.jsonResponse = {};
	        this.requests = {};
	        this.aliveRequests = {};
	        this.aliveRequestsCount = 0;
	        this.requestsCount = 0;
	        this.maxRequest = maxRequest !== undefined ? maxRequest : RequestManager.DEFAULT_MAX_REQUEST;
	    }
	
	    _createClass(RequestManager, [{
	        key: 'newRequest',
	        value: function newRequest(tileId, localUrl, url, onLoad, parse) {
	            var scope = this;
	            var myUrl = new URL(url);
	            var tilePath = myUrl.pathname + myUrl.search;
	
	            if (this.jsonResponse.hasOwnProperty(tilePath)) {
	                onLoad(parse(scope.jsonResponse[tilePath], tileId));
	            } else if (!this.requests.hasOwnProperty(tilePath)) {
	                this.requests[tilePath] = new Request(tileId, localUrl, this.localLoader, url, this.remoteLoader, parse, function (payload) {
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
	                }, function () {}, function () {
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
	    }, {
	        key: 'loadNext',
	        value: function loadNext() {
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
	        }
	    }]);
	
	    return RequestManager;
	}();
	
	RequestManager.DEFAULT_MAX_REQUEST = 10;
	// RequestManager.LOADING_MANAGER = THREE.DefaultLoadingManager;
	exports.default = RequestManager;
	module.exports = exports['default'];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// Help from https://github.com/tcorral/Design-Patterns-in-Javascript/blob/es6/State/1/scripts/main.js
	
	var Ready4LocalLoadState = __webpack_require__(9);
	var LocalLoadingState = __webpack_require__(11);
	var Ready4RemoteLoadState = __webpack_require__(12);
	var RemoteLoadingState = __webpack_require__(13);
	var LoadedState = __webpack_require__(14);
	var LoadFailedState = __webpack_require__(15);
	
	var Request = function () {
	    function Request(myTile, localUrl, localLoader, remoteUrl, remoteLoader, parse, onLoad, onProgress, onFailure) {
	        _classCallCheck(this, Request);
	
	        // console.log('tile:', myTile);
	        // console.log('mkdir -p buildingData/' + myTile.z + '/' + myTile.x + '; wget' + ' \'' + remoteUrl + '\' ' + '-O buildingData/' + myTile.z + '/' + myTile.x + '/' + myTile.y + '.json');
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
	    }
	
	    _createClass(Request, [{
	        key: 'setState',
	        value: function setState(state) {
	            // console.log('state:', state.constructor.name);
	            this.state = state;
	        }
	    }, {
	        key: 'load',
	        value: function load() {
	            this.state.load();
	        }
	    }, {
	        key: 'progress',
	        value: function progress(event) {
	            this.state.progress(event);
	        }
	    }, {
	        key: 'success',
	        value: function success(response) {
	            this.state.success(response);
	        }
	    }, {
	        key: 'fail',
	        value: function fail(event) {
	            this.state.fail(event);
	        }
	    }, {
	        key: 'getReady4LocalLoadState',
	        value: function getReady4LocalLoadState() {
	            return new Ready4LocalLoadState(this);
	        }
	    }, {
	        key: 'getReady4RemoteLoadState',
	        value: function getReady4RemoteLoadState() {
	            return new Ready4RemoteLoadState(this);
	        }
	    }, {
	        key: 'getLocalLoadingState',
	        value: function getLocalLoadingState() {
	            return new LocalLoadingState(this);
	        }
	    }, {
	        key: 'getRemoteLoadingState',
	        value: function getRemoteLoadingState() {
	            return new RemoteLoadingState(this);
	        }
	    }, {
	        key: 'getLoadedState',
	        value: function getLoadedState() {
	            return new LoadedState(this);
	        }
	    }, {
	        key: 'getLoadedFailedState',
	        value: function getLoadedFailedState() {
	            return new LoadFailedState(this);
	        }
	    }]);
	
	    return Request;
	}();
	
	exports.default = Request;
	module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _State2 = __webpack_require__(10);
	
	var _State3 = _interopRequireDefault(_State2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Ready4LocalLoadState = function (_State) {
	    _inherits(Ready4LocalLoadState, _State);
	
	    function Ready4LocalLoadState(request) {
	        _classCallCheck(this, Ready4LocalLoadState);
	
	        var _this = _possibleConstructorReturn(this, (Ready4LocalLoadState.__proto__ || Object.getPrototypeOf(Ready4LocalLoadState)).call(this));
	
	        _this._request = request;
	        return _this;
	    }
	
	    _createClass(Ready4LocalLoadState, [{
	        key: 'load',
	        value: function load() {
	            var _this2 = this;
	
	            // console.log('Ready4LocalLoad.');
	            var scope = this;
	            // console.log('Start Load!');
	            var url = void 0;
	            var loader = void 0;
	            if (this._request.localUrl !== undefined) {
	                // console.log('localUrl:', this._request.localUrl);
	                url = this._request.localUrl;
	                loader = this._request.localLoader;
	                this._request.setState(this._request.getLocalLoadingState());
	            } else {
	                console.log('localUrl undefined');
	                url = this._request.url;
	                loader = this._request.remoteLoader;
	                this._request.setState(this._request.getRemoteLoadingState());
	            }
	            // load: function ( url, onLoad(response), onProgress(event), onError(event) ) {
	            loader.load(url, function (response) {
	                scope._request.state.success(response);
	            }, function (event) {
	                _this2._request.state.progress(event);
	            }, function (event) {
	                _this2._request.state.fail(event);
	            });
	        }
	    }, {
	        key: 'progress',
	        value: function progress(event) {
	            throw new Error("You can't make progress a not started load!");
	        }
	    }, {
	        key: 'fail',
	        value: function fail(event) {
	            throw new Error("A load can't fail if is not started!");
	        }
	    }, {
	        key: 'success',
	        value: function success(response) {
	            throw new Error("A load can't success if is not started!");
	        }
	    }]);
	
	    return Ready4LocalLoadState;
	}(_State3.default);
	
	exports.default = Ready4LocalLoadState;
	module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var State = function () {
	    function State() {
	        _classCallCheck(this, State);
	    }
	
	    _createClass(State, [{
	        key: 'load',
	        value: function load() {
	            throw new Error('This method must be overwritten!');
	        }
	    }, {
	        key: 'progress',
	        value: function progress(event) {
	            throw new Error('This method must be overwritten!');
	        }
	    }, {
	        key: 'fail',
	        value: function fail(event) {
	            throw new Error('This method must be overwritten!');
	        }
	    }, {
	        key: 'success',
	        value: function success(payload) {
	            throw new Error('This method must be overwritten!');
	        }
	    }]);
	
	    return State;
	}();
	
	exports.default = State;
	module.exports = exports['default'];

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _State2 = __webpack_require__(10);
	
	var _State3 = _interopRequireDefault(_State2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var LocalLoadingState = function (_State) {
	    _inherits(LocalLoadingState, _State);
	
	    function LocalLoadingState(request) {
	        _classCallCheck(this, LocalLoadingState);
	
	        var _this = _possibleConstructorReturn(this, (LocalLoadingState.__proto__ || Object.getPrototypeOf(LocalLoadingState)).call(this));
	
	        _this._request = request;
	        return _this;
	    }
	
	    _createClass(LocalLoadingState, [{
	        key: 'load',
	        value: function load() {
	            throw new Error("You can't load a file that is being loaded already!");
	        }
	    }, {
	        key: 'progress',
	        value: function progress(event) {
	            // console.log('Getting local data in progress: ', this._request.localUrl);
	            this._request.onProgress();
	        }
	    }, {
	        key: 'fail',
	        value: function fail(event) {
	            console.log('Fail to get local data at', this._request.localUrl);
	            var myTile = this._request.tileCoord;
	            console.log('mkdir -p buildingData/' + myTile.z + '/' + myTile.x + '; wget' + ' \'' + this._request.remoteUrl + '\' ' + '-O buildingData/' + myTile.z + '/' + myTile.x + '/' + myTile.y + '.json');
	            this._request.setState(this._request.getReady4RemoteLoadState());
	            this._request.load();
	        }
	    }, {
	        key: 'success',
	        value: function success(response) {
	            console.log('Success in getting local data at', this._request.localUrl);
	            this._request.onFinish(response);
	            this._request.setState(this._request.getLoadedState());
	        }
	    }]);
	
	    return LocalLoadingState;
	}(_State3.default);
	
	exports.default = LocalLoadingState;
	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _State2 = __webpack_require__(10);
	
	var _State3 = _interopRequireDefault(_State2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Ready4RemoteLoadState = function (_State) {
	    _inherits(Ready4RemoteLoadState, _State);
	
	    function Ready4RemoteLoadState(request) {
	        _classCallCheck(this, Ready4RemoteLoadState);
	
	        var _this = _possibleConstructorReturn(this, (Ready4RemoteLoadState.__proto__ || Object.getPrototypeOf(Ready4RemoteLoadState)).call(this));
	
	        _this._request = request;
	        return _this;
	    }
	
	    _createClass(Ready4RemoteLoadState, [{
	        key: "load",
	        value: function load() {
	            // console.log('Loading remote data:', this._request.remoteUrl);
	            var scope = this;
	            // console.log('Start Load!');
	            var url = this._request.remoteUrl;
	            var loader = this._request.remoteLoader;
	            this._request.setState(this._request.getRemoteLoadingState());
	            // load: function ( url, onLoad(response), onProgress(event), onError(event) ) {
	            loader.load(url, function (response) {
	                scope._request.state.success(response);
	            }, function (event) {
	                scope._request.state.progress(event);
	            }, function (event) {
	                scope._request.state.fail(event);
	            });
	        }
	    }, {
	        key: "progress",
	        value: function progress(event) {
	            throw new Error("You can't make progress a failed load!");
	        }
	    }, {
	        key: "fail",
	        value: function fail(event) {
	            throw new Error("A failed load can't fail itself!");
	        }
	    }, {
	        key: "success",
	        value: function success(response) {
	            console.log('Remote data loaded.');
	            throw new Error('A failed load cannot success!');
	        }
	    }]);
	
	    return Ready4RemoteLoadState;
	}(_State3.default);
	
	exports.default = Ready4RemoteLoadState;
	module.exports = exports['default'];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _State2 = __webpack_require__(10);
	
	var _State3 = _interopRequireDefault(_State2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var RemoteLoadingState = function (_State) {
	    _inherits(RemoteLoadingState, _State);
	
	    function RemoteLoadingState(request) {
	        _classCallCheck(this, RemoteLoadingState);
	
	        var _this = _possibleConstructorReturn(this, (RemoteLoadingState.__proto__ || Object.getPrototypeOf(RemoteLoadingState)).call(this));
	
	        _this._request = request;
	        return _this;
	    }
	
	    _createClass(RemoteLoadingState, [{
	        key: 'load',
	        value: function load() {
	            throw new Error("You can't load a file that is being loaded already!");
	        }
	    }, {
	        key: 'progress',
	        value: function progress(event) {
	            this._request.onProgress();
	        }
	    }, {
	        key: 'fail',
	        value: function fail(event) {
	            console.log('remote tile load failed:', this._request.tileCoord);
	            console.log('remote tile load failed - remoteUrl:', this._request.remoteUrl);
	            this._request.onFailure();
	            this._request.setState(this._request.getLoadedFailedState());
	        }
	    }, {
	        key: 'success',
	        value: function success(response) {
	            console.log('remote tile loaded:', this._request.tileCoord);
	            // console.log('response:', response);
	            this._request.onFinish(response);
	            this._request.setState(this._request.getLoadedState());
	        }
	    }]);
	
	    return RemoteLoadingState;
	}(_State3.default);
	
	exports.default = RemoteLoadingState;
	module.exports = exports['default'];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _State2 = __webpack_require__(10);
	
	var _State3 = _interopRequireDefault(_State2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var LoadedState = function (_State) {
	    _inherits(LoadedState, _State);
	
	    function LoadedState(request) {
	        _classCallCheck(this, LoadedState);
	
	        var _this = _possibleConstructorReturn(this, (LoadedState.__proto__ || Object.getPrototypeOf(LoadedState)).call(this));
	
	        _this._request = request;
	        return _this;
	    }
	
	    _createClass(LoadedState, [{
	        key: "load",
	        value: function load() {
	            throw new Error("You can't reload a loaded file!");
	        }
	    }, {
	        key: "progress",
	        value: function progress() {
	            throw new Error("You can't make progress a loaded file!");
	        }
	    }, {
	        key: "fail",
	        value: function fail() {
	            throw new Error("A loaded file can't fail!");
	        }
	    }, {
	        key: "success",
	        value: function success(payload) {
	            throw new Error("A loaded file can't success itself!");
	        }
	    }]);
	
	    return LoadedState;
	}(_State3.default);
	
	exports.default = LoadedState;
	module.exports = exports['default'];

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _State2 = __webpack_require__(10);
	
	var _State3 = _interopRequireDefault(_State2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var LoadFailedState = function (_State) {
	    _inherits(LoadFailedState, _State);
	
	    function LoadFailedState(request) {
	        _classCallCheck(this, LoadFailedState);
	
	        var _this = _possibleConstructorReturn(this, (LoadFailedState.__proto__ || Object.getPrototypeOf(LoadFailedState)).call(this));
	
	        _this._request = request;
	        return _this;
	    }
	
	    _createClass(LoadFailedState, [{
	        key: "load",
	        value: function load() {
	            throw new Error("You can't reload a failed load!");
	        }
	    }, {
	        key: "progress",
	        value: function progress(event) {
	            throw new Error("You can't make progress a failed load!");
	        }
	    }, {
	        key: "fail",
	        value: function fail(event) {
	            throw new Error("A failed load can't fail itself!");
	        }
	    }, {
	        key: "success",
	        value: function success(response) {
	            // console.log('payload:', response);
	            throw new Error('A failed load cannot success!');
	        }
	    }]);
	
	    return LoadFailedState;
	}(_State3.default);
	
	exports.default = LoadFailedState;
	module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// world.addLayer(new OpenEarthView.Layer.OSM(
	//     "OpenStreetMap", [
	//         "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
	//         "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
	//         "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
	//     ]));
	
	var OSM = function () {
	    function OSM(name, urls) {
	        _classCallCheck(this, OSM);
	
	        this.name = name !== undefined ? name : 'OpenStreetMap';
	        // if (OpenEarthViewLayers.hasOwnProperty(name)) {
	        //     console.err('Cannot register this already existing layer !');
	        //     return;
	        // }
	        this.urls = urls !== undefined ? urls : ['http://a.tile.openstreetmap.org/${z}/${x}/${y}.png', 'http://b.tile.openstreetmap.org/${z}/${x}/${y}.png', 'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'];
	        this.type = OSM.type;
	    }
	
	    _createClass(OSM, [{
	        key: 'getName',
	        value: function getName() {
	            return this.name;
	        }
	    }, {
	        key: 'getUrl',
	        value: function getUrl(zoom, xtile, ytile) {
	            var urlRandom = this.urls[Math.floor(Math.random() * this.urls.length)];
	            var url = urlRandom.replace('${z}', zoom);
	            url = url.replace('${x}', xtile);
	            return url.replace('${y}', ytile);
	        }
	    }]);
	
	    return OSM;
	}();
	
	OSM.type = 'tile';
	OSM.opacity = 1;
	exports.default = OSM;
	module.exports = exports['default'];

/***/ }
/******/ ]);
//# sourceMappingURL=OpenEarthView.js.map