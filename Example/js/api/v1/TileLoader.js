var Toolbox = function () {
    function Toolbox() {
        
        this.geoTiles = {};
        this.geoTileQueue = [];
        this.materials = {};
        this.materialQueue = [];
        return this;
    }

    Object.assign(Toolbox.prototype, {
        assignUVs(geometry) {

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
        },
        
        getTileMesh(r, zoom, ytile, power) {

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
                var lonStart = this.tile2long(0, zoom);
                var latStart = this.tile2lat(ytile, zoom);
                var lonEnd = this.tile2long(1, zoom);
                var latEnd = this.tile2lat(ytile + 1, zoom);
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

                        myGeometry.vertices.push(new THREE.Vector3(Ax, Ay, Az), 
                                                new THREE.Vector3(Bx, By, Bz), 
                                                new THREE.Vector3(Cx, Cy, Cz), 
                                                new THREE.Vector3(Dx, Dy, Dz));

                        var iStep = factor - v - 1 + u * factor;

                        myGeometry.faces.push(new THREE.Face3(4 * iStep, 4 * iStep + 2, 4 * iStep + 1));
                        myGeometry.faces.push(new THREE.Face3(4 * iStep, 4 * iStep + 3, 4 * iStep + 2));

                        myGeometry.faceVertexUvs[0].push([new THREE.Vector2((0.0 + u) / factor, (0.0 + v) / factor), 
                                                        new THREE.Vector2((1.0 + u) / factor, (1.0 + v) / factor), 
                                                        new THREE.Vector2((0.0 + u) / factor, (1.0 + v) / factor)]);
                        myGeometry.faceVertexUvs[0].push([new THREE.Vector2((0.0 + u) / factor, (0.0 + v) / factor), new THREE.Vector2((1.0 + u) / factor, (0.0 + v) / factor), new THREE.Vector2((1.0 + u) / factor, (1.0 + v) / factor)]);
                    }
                }
                myGeometry.uvsNeedUpdate = true;
            }
            return new THREE.Mesh(this.geoTiles[id]);
        },
        
        long2tile(lon, zoom) {
            return Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
        },
        lat2tile(lat, zoom) {
            return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
        },
        tile2long(x, z) {
            return (x / Math.pow(2, z) * 360 - 180 + 540) % 360 - 180;
        },
        
        tile2lat(y, z) {
            var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
            return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
        },
        
        measure(lat1, lon1, lat2, lon2) {
            // generally used geo measurement function
            // var R = 6378.137; // Radius of earth in KM
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLon = (lon2 - lon1) * Math.PI / 180;
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = 6378.137 * c;
            return d * 1000; // meters
        },
        
        lonOffsetMeter2lon(lon, lat, x) {
            return x / (Toolbox.R * Math.cos(lat)) + lon;
        },
        
        latOffsetMeter2lat(lat, y) {
            return y / Toolbox.R + lat;
        },
        
        makeTextSprite(message, parameters) {
            if (parameters === undefined) parameters = {};
            var fontface = parameters.hasOwnProperty('fontface') ? parameters['fontface'] : 'Arial';
            var fontsize = parameters.hasOwnProperty('fontsize') ? parameters['fontsize'] : 108;
            var borderThickness = parameters.hasOwnProperty('borderThickness') ? parameters['borderThickness'] : 2;
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
            
            canvas.height = 512;
            canvas.width = 512;
            // let canvas = document.getElementById('osmworld');
            
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
            
            // this.roundRect(context, borderThickness / 2 + textWidth - textWidth / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
            this.roundRect(context, borderThickness, borderThickness / 2, textWidth+30, fontsize * 1.6 + borderThickness, 15);
            // Toolbox.roundRect(context, borderThickness / 2 + textWidth / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);

            // 1.4 is extra height factor for text below baseline: g,j,p,q.

            // text color
            context.fillStyle = 'rgba(0, 0, 0, 1.0)';

            context.fillText(message, borderThickness+15, fontsize * 1.2 );
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
            sprite.scale.set(100, 100, 100);
            return sprite;
        },
        
        roundRect(ctx, x, y, w, h, r) {
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
        },
        
        originAxes(radius, height) {
            // static originAxes() {
            var origin = new THREE.Group();

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
    });

    return Toolbox;
}();

Toolbox.R = 6378.137;

var FlatTerrain = function () {
    function FlatTerrain(name, urls, options) {
        
        this.type = 'terrain';
        this.name = name !== undefined ? name : 'OpenEarthView';
        
    }

    Object.assign( FlatTerrain.prototype, {
        getName: function() {
            
            return this.name;
            
        },
        getUrl: function(zoom, xtile, ytile) {
            
            return undefined;
            
        }
    });

    return FlatTerrain;
}();

var TileLoader = function () {
    var self = this;
    this.textureLoader = new THREE.TextureLoader();
    this.textureLoader.crossOrigin = '';
    this.textures = {};
    this.textureRequests = {};
    this.textureRequestsCount = 0;
    this.textureAliveRequests = {};
    this.textureAliveRequestsCount = 0;
    this.MAX_TEXTURE_REQUEST = 10;

    this.loadNextTile = function() {
        
        let scope = this;
        // textureLoader.crossOrigin: '';
        var textures = this.textures;
        var textureRequests = this.textureRequests;
        var textureAliveRequests = this.textureAliveRequests;

        var _loop = function _loop() {
            
            var ids = Object.keys(textureRequests);
            var id = ids[ids.length - 1];
            self.textureAliveRequestsCount = self.textureAliveRequestsCount + (textureAliveRequests.hasOwnProperty(id) ? 0 : 1);
            textureAliveRequests[id] = textureRequests[id];
            var url = textureAliveRequests[id].url;
            delete textureRequests[id];
            self.textureRequestsCount--;
            
            var scope = self;
            (function (url, id) {
                
                // zoom =

                textureAliveRequests[id].request = scope.textureLoader.load(url, function (texture) {
                    textures[id] = texture;
                    if (textureAliveRequests.hasOwnProperty(id)) {
                        textureAliveRequests[id].onLoaded(texture);
                        delete textureAliveRequests[id];
                        scope.textureAliveRequestsCount--;
                    }
                    scope.loadNextTile();
                }, function () {}, function () {
                    if (textureAliveRequests.hasOwnProperty(id)) {
                        // textureAliveRequests[id].onLoaded(texture);
                        delete textureAliveRequests[id];
                        scope.textureAliveRequestsCount--;
                        
                    }
                    scope.loadNextTile();
                });
            })(url, id);
        };
        
        while (this.textureAliveRequestsCount < this.MAX_TEXTURE_REQUEST && this.textureRequestsCount > 0) {
            _loop();
        }
    }
    
    this.tilePreload = function(zoom, xtile, ytile, onLoaded) {
        var textures = this.textures;
        // let textureRequests = this.textureRequests;
        // let textureAliveRequests = this.textureAliveRequests;
        // let id = zoom + '/' + xtile + '/' + ytile;
        for (var diff = 0; diff < zoom; diff++) {
            var power = Math.pow(2, diff);
            var idZoomOther = +zoom - diff + '/' + Math.floor(xtile / power) + '/' + Math.floor(ytile / power);
            
            if (textures.hasOwnProperty(idZoomOther)) {
                // onLoaded(textures[idZoomOther]);
                // origin : bottom left
                var tex = textures[idZoomOther].clone();
                tex.repeat.x = 1 / power;
                tex.repeat.y = 1 / power;
                var xOffset = xtile - Math.floor(xtile / power) * power;
                
                var yOffset = power - 1 - (ytile - Math.floor(ytile / power) * power);
                
                tex.offset.x = xOffset * tex.repeat.x;
                tex.offset.y = yOffset * tex.repeat.y;
                tex.needsUpdate = true;
                onLoaded(tex);
                return;
            }
        }
    }
    this.tileFactory = function(url, zoom, xtile, ytile, onLoaded) {
        
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
    this.cancelOtherRequests = function(currentIds) {
        // let scope = this;
        // let textures = this.textures;
        var textureRequests = this.textureRequests;
        var textureAliveRequests = this.textureAliveRequests;
        
        for (var id in textureRequests) {
            if (!currentIds.hasOwnProperty(id)) {
                delete textureRequests[id];
                this.textureRequestsCount--;
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
    
};

TileLoader.prototype = Object.create( THREE.EventDispatcher.prototype );
TileLoader.prototype.constructor = TileLoader;

var OSM = function(manager) {
    function OSM(name, urls) {
        
        this.name = name !== undefined ? name : 'OpenStreetMap';
        
        this.urls = urls !== undefined ? urls : ['http://a.tile.openstreetmap.org/${z}/${x}/${y}.png', 'http://b.tile.openstreetmap.org/${z}/${x}/${y}.png', 'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'];
        this.type = 'tile';
        this.opacity = 1;
    };
    Object.assign( OSM.prototype, {
        getName: function() {
            return this.name;
        },
        getUrl: function(zoom, xtile, ytile) {
            var urlRandom = this.urls[Math.floor(Math.random() * this.urls.length)];
            var url = urlRandom.replace('${z}', zoom);
            url = url.replace('${x}', xtile);
            return url.replace('${y}', ytile);
        }
    });
    return OSM;
}();

var editor;
var World = function (domElement) {
    var _this = this;

    var self = this;
    this.ZOOM_FLAT = 13;
    // this.domElement = domElement;
    this.terrains = {};
    this.terrains['FlatTerrain'] = new FlatTerrain('FlatTerrain', null, null);
    this.layers = {};
    this.loaders = {};
    
    this.lastSelectedParcel = {
        names: [],
        // bboxMesh: undefined,
        bboxCenter: undefined,
        helpers: [],
        edge: undefined,//the copied or merged parcel(s) (in case of many one)
        footprint: undefined,//the allowed zone where the building can be build by default
        buildings: [],
        parcels: []
    };
    
    this.ZOOM_SHIFT_SIZE = 3;
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
    this.defaultAlti = 80;
    this.parcelIds = [];
    this.buildingIds = [];

    // this.geojsonLoader = new THREE.GeojsonLoader();
    // this.geojsonLoader = THREE.GeojsonLoader.getSingleton();
    
    // this.frustumBox = new THREE.Box2(new THREE.Vector2(0,0), new THREE.Vector2(500,500));
    // this.frustumBox = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector2(500,500,500));
    this.frustumBox = new THREE.Mesh(new THREE.BoxGeometry(400,400,400), new THREE.MeshPhongMaterial({color: 0x005566, transparent:true, opacity:0.5}));
    
    this.frustumBox.geometry.translate(0,200,0);
    this.frustumBox.geometry.computeBoundingSphere();
    this.frustumBoxHelper = new THREE.BoxHelper( this.frustumBox, 0xffff00 );
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.up.set(0, 0, 1);
    
    this.domElement = document.getElementById(domElement);
    
    this.canvas = document.createElement('canvas');
    // this.canvas.setAttribute('id', 'openearthviewcanvas');
    this.domElement.appendChild(this.canvas);

    if (this.domElement === null) {
        alert('No domElement defined.');
        return;
    }
    
    this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        // antialias: true,
        alpha: true
    });
    
    this.renderer.setClearColor( 0x000000, 0 );
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    // renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    //
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    // this.canvas.appendChild(this.renderer.domElement);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMapSoft = true;

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

    // this.scene.add( this.frustumBox );
    // document.body.appendChild(renderer.domElement);
    this.buildingObjects = [];
    this.parcelObjects = [];
    this.earth = new THREE.Group();
    this.earth.position.set(0, 0, -this.R * 1000);
    this.earth.name = "earth";
    this.earthClone = this.earth.clone();
    this.scene.add(this.earth);
    this.scene.add(this.earthClone);
    
    this.scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
	this.scene.fog = new THREE.Fog( this.scene.background, 1, 5000 );
	// LIGHTS
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.color.setHSL( 0.6, 0.9, 0.9 );
	hemiLight.groundColor.setHSL( 0.095, 0.9, 1 );
	hemiLight.position.set( 0, 50, 0 );
	var hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 1 );
// 	scene.add( hemiLightHelper );
	//
	var dirLight = new THREE.DirectionalLight( 0xffffff, .8);
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( 0, -0.7, 1 );
	dirLight.position.multiplyScalar( 100 );
	dirLight.castShadow = true;
// 	dirLight.shadow = new THREE.LightShadow(this.camera.clone());
//  this.shadowCamera = new THREE.PerspectiveCamera( 50, 1, 1200, 2500 )
// 	dirLight.shadow = new THREE.LightShadow( this.shadowCamera );
	dirLight.shadow.mapSize.width = 4096;
	dirLight.shadow.mapSize.height = 4096;				
	var d = 200;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;
	dirLight.shadow.camera.far = 500;
	dirLight.shadow.camera.near = 50;
	dirLight.shadow.bias = 0.00001;
	var dirLightHeper = new THREE.DirectionalLightHelper( dirLight, 10 ) 
// 	scene.add( dirLightHeper );
	
	this.scene.add( dirLight );
	this.scene.add( hemiLight );
	
	// GROUND
	var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
	var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x555555 } );
	groundMat.color.setHSL( 0.095, 1, 0.75 );
	var ground = new THREE.Mesh( groundGeo, groundMat );
// 	ground.rotation.x = -Math.PI/2;
	ground.position.z = -100;
	ground.receiveShadow = true;
	
// 	this.scene.add( ground );
	
	// SKYDOME
	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
		topColor:    { value: new THREE.Color( 0x0077ff ) },
		bottomColor: { value: new THREE.Color( 0xffffff ) },
		offset:      { value: 33 },
		exponent:    { value: 0.6 }
	};
	uniforms.topColor.value.copy( hemiLight.color );
	this.scene.fog.color.copy( uniforms.bottomColor.value );
	
	var skyGeo = new THREE.SphereGeometry( 10000, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
	var sky = new THREE.Mesh( skyGeo, skyMat );
	this.scene.add( sky );
    
    // document.addEventListener('keydown', this.onDocumentKeyDown, false);
    // this.camera.position.z = this.altitude;
    
    this.parcelName = document.getElementById("parcelName");
	this.inputFloorHeight = document.getElementById("inputFloorHeight");
	this.inputFloors = document.getElementById("inputFloors");
	this.inputSurface = document.getElementById("inputSurface");
	
    let scope = this;
    
	var mouse = new THREE.Vector2();
	
    function getIntersects(point, objects, recursive) {
	    var _recursive = recursive !== undefined ? recursive : true;

		mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);

	    let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, self.camera);
        
        var intersected = raycaster.intersectObjects(objects, _recursive);
        
		return intersected; 
		

	}
	function getIntersectsFromCamera(point, objects, recursive) {
	    var _recursive = recursive !== undefined ? recursive : true;
		// Draw a line from pointA in the given direction at distance 100
        var pointA = point;
        var direction = self.camera.getWorldDirection();
        direction.normalize();
    
		let raycaster = new THREE.Raycaster();
		raycaster.set( point, direction );

		return raycaster.intersectObjects(objects, _recursive);

	}
    
    function getIntersectsTopDown(point, object, recursive, color) {
	    var _recursive = recursive !== undefined ? recursive : true;
		// Draw a line from pointA in the given direction at distance 100
        var pointA = point;
        var direction = new THREE.Vector3(0,0,-1);
        direction.normalize();
    
		let raycaster = new THREE.Raycaster(point, direction);
// 		raycaster.set( );
        raycaster.linePrecision = 50;

		return raycaster.intersectObjects(object, _recursive);

	}
	this.getIntersectsTopDown = getIntersectsTopDown;
	
    this.controls = new EarthControls(this.camera, this.renderer.domElement, function () {
        
        transformControls.setSize(1.5);
        self.render();
    }, function () {
        self.updateSceneLazy();
    }, {
        longitude: this.LONGITUDE_ORI,
        latitude: this.LATITUDE_ORI
    }, function (event) {
        // _this.handleClick(event);
    });
    
    //
    
    var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var onMovePosition = new THREE.Vector2();
	var onDoubleClickPosition = new THREE.Vector2();
	
    var objectPositionOnDown;
	var objectRotationOnDown;
	var objectScaleOnDown;
	
    var transformControls = new THREE.TransformControls(this.camera, this.renderer.domElement);
    this.transformControls = transformControls;
    
	var lastHelperPos = new THREE.Vector3();
	
	transformControls.addEventListener('change', function() {

		var object = transformControls.object;
		
		if (object !== undefined) {
			if ( object.name == "EdgeHelper" ) {
				
				var worldObjectPosition = new THREE.Vector3();
				worldObjectPosition.setFromMatrixPosition(object.matrixWorld);
				// var limit = scope.lastSelectedParcel.parcels
				var parcelToscan = [];
				
				if(onDownPosition.distanceTo(onMovePosition) > 0.001) {
    				for (var i = 0; i < scope.lastSelectedParcel.parcels.length; i++) {
    				    parcelToscan.push(scope.lastSelectedParcel.parcels[i]);
    				    parcelToscan.push(scope.lastSelectedParcel.parcels[i].getObjectByName("Footprint"));
    				    // parcelToscan.push(scope.lastSelectedParcel.parcels[i].getObjectByName("Wireframe"));
    				}
    				
    				var intersected = getIntersectsTopDown(worldObjectPosition, parcelToscan, false, 0xFFFF00);
    				
    				let overParcel = false;
    				for (var i = 0; i < intersected.length; i++) {
    				    
    			        if(intersected[i].object.name == "Footprint" || intersected[i].object.name.includes("Parcel ")) {
    			            overParcel = true;
    			            // break;
    			        }
    				}
    				
    				if(overParcel) {
    					
    				// 	object.locked = false;
    					editor.updateLine(object.parent.parent, editor.edge, object.index, object.position);
    					editor.updateUI();
    					
    				} else {
    					
    				// 	object.locked = true;
    					object.position.copy(lastHelperPos);
    					
    				}
    				
				    lastHelperPos = object.position.clone();
				    
				}
				// editor.updateLine(editor.edge, object.index, object.position);
			}

// 			selectionBox.setFromObject(object);

		}
		
		self.render();

	});
	
	transformControls.addEventListener('mouseDown', function() {
		
		
		var object = transformControls.object;
		
		objectPositionOnDown = object.position.clone();
		objectRotationOnDown = object.rotation.clone();
		objectScaleOnDown = object.scale.clone();

		lastHelperPos = object.position.clone();
		
		self.controls.enabled = false;

	});
	transformControls.addEventListener('mouseUp', function() {

		var object = transformControls.object;

		if (object !== undefined) {

			switch (transformControls.getMode()) {

				case 'translate':

					if (!objectPositionOnDown.equals(object.position)) {

						// editor.execute( new SetPositionCommand( object, object.position, objectPositionOnDown ) );

					}

					break;

				case 'rotate':

					if (!objectRotationOnDown.equals(object.rotation)) {

						// editor.execute( new SetRotationCommand( object, object.rotation, objectRotationOnDown ) );

					}

					break;

				case 'scale':

					if (!objectScaleOnDown.equals(object.scale)) {

						// editor.execute( new SetScaleCommand( object, object.scale, objectScaleOnDown ) );

					}

					break;

			}

		}
		
		object.locked = false;

		self.controls.enabled = true;

	});
	
	
    
    this.handleClick = function(event) {
        var scope = this;
        var self = this;
        
        if (onDownPosition.distanceTo(onUpPosition) === 0) {

			var intersectFootprint = getIntersects(onUpPosition, editor.footprints.children);
			
			var edgeHelpers = [];
			for (var i = 0; i < scope.lastSelectedParcel.parcels.length; i++) {
			    var edgeHelper = scope.lastSelectedParcel.parcels[i].getObjectByName("EdgeHelpers");
			    if(edgeHelper !== undefined)
			        edgeHelpers.push(edgeHelper);
			}
			
			var intersectHelpers = getIntersects(onUpPosition, edgeHelpers);
// 			var intersect = getIntersects(onUpPosition, scope.lastSelectedParcel.parcels, false);
			
			if (intersectHelpers.length > 0) {

				var helper = intersectHelpers[0].object;
				
				editor.select(helper);
				transformControls.attach(helper);
				
				lastHelperPos.copy(helper.position);
				self.render();
				return;

			}
			else if (intersectFootprint.length > 0) {

				var object = intersectFootprint[0].object;
                
                	
				editor.select(object);
				if( object.name == 'footprint' ) editor.addPointToLine(editor.edge, intersectFootprint[0].point);
				
				self.render();
				return;
				// transformControls.attach(object);

			}
			else {

				editor.select(null);
				
			}
			
                transformControls.detach();

            for (var layerId in self.layers) {
    
                switch (self.layers[layerId].type) {
                    
                    case 'parcel':
                        
                        var intersects = getIntersects(onUpPosition, self.parcelObjects, false);
                        
                        if(intersects.length == 0) intersects = getIntersects(onUpPosition, scope.lastSelectedParcel.parcels, false);
                        
                        if (intersects.length > 0) {
                            
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
                            
                            var parcel = intersect.object;
                            	
                            //if parcel is already in the selected scope
                            if (scope.lastSelectedParcel.names.length && scope.lastSelectedParcel.names.indexOf(parcel.userData.name) >= 0){
                                
                            
                                if(scope.selectionMode == "removeParcel") {
                                    
                                    // unselectParcel()
                                    var data = parcel.userData;
                                    var index = scope.lastSelectedParcel.names.indexOf(data.name);
                                    var parcel = scope.lastSelectedParcel.parcels[index];
                                    
		                            var extrusionIds = parcel.userData.extrusions;
                                    if(extrusionIds !== undefined && extrusionIds.length){
			
                                		for (var i = 0; i < parcel.userData.prevFootprintVertices.length; i++) {
                                                            
                                        	editor.addPointToEdge(parcel, parcel.edge, parcel.userData.prevFootprintVertices[i]);
                                        	
                                        }
                                        
                                        editor.extrudeShape(parcel);
                                        
                                	} else {
                                		
                                		parcel.remove(parcel.getObjectByName("Extrusion"));
                                		
                                		for (var i = 0; i < world.lastSelectedParcel.buildings.length; i++) {
                                			var build = world.lastSelectedParcel.buildings[i];
                                			
                                			let buildingBox = new THREE.BoxHelper(build);
                                			let bboxWorldPos = new THREE.Vector3();
                                		    bboxWorldPos.setFromMatrixPosition(build.matrixWorld);
                                			
                                		    let buildingCenter = build.geometry.boundingSphere.center;
                                		    let center = bboxWorldPos.add(buildingCenter);
                                		    center.z = 10;
                                		    
                                			var intersected = world.getIntersectsTopDown(center, [parcel], true, 0x00FF00);
                                			
                                			if(intersected.length) {
                                			    
                                				var overParcel = false;
                                				for (var j = 0; j < intersected.length; j++) {
                                				    
                                				        if(intersected[j].object.name == "Footprint" || intersected[j].object.name.includes("Parcel ")) {
                                				            overParcel = true;
                                				            build.visible = true;
                                				            world.lastSelectedParcel.buildings.splice(i, 1);
                                				        }
                                				        
                                				}
                                			}
                                		}
                                		
                                	}
                                	
                                    parcel.remove(parcel.getObjectByName("EdgeHelpers"));
                                    
                                	parcel.userData.footprintVertices = data.prevFootprintVertices.map(x => x.clone());
                                        
                                    scope.lastSelectedParcel.names.splice(index, 1);
                                    parcel.material = new THREE.MeshPhongMaterial({color: colors.parcel, opacity: 0.1, transparent: true});
                                    var footprint = parcel.getObjectByName('Footprint');
                                    if( footprint !== undefined ) footprint.visible = false;
                                    
                                    scope.lastSelectedParcel.parcels.splice(index, 1);
                                    
                            //         for (var i = 0; i < scope.lastSelectedParcel.buildings.length; i++) {
                            //     		var build = scope.lastSelectedParcel.buildings[i];
                                		
                            // 			let buildingBox = new THREE.BoxHelper(build);
                            //     		let bboxWorldPos = new THREE.Vector3();
                            //             bboxWorldPos.setFromMatrixPosition(build.matrixWorld);
                                		
                            //             let buildingCenter = build.geometry.boundingSphere.center;
                            //             let center = bboxWorldPos.add(buildingCenter);
                            //             center.z = 10;
                                        
                            //     		var intersected = getIntersectsTopDown(center, [parcel], true, 0x00FF00);
                                		
                            //     		if(intersected.length) {
                                		    
                            //         		var overParcel = false;
                            // 				for (var j = 0; j < intersected.length; j++) {
                            				    
                            // 				        if(intersected[j].object.name == "Footprint" || intersected[j].object.name.includes("Parcel ")) {
                            // 				            overParcel = true;
                            // 				            build.visible = true;
                            // 				            scope.lastSelectedParcel.buildings.splice(i, 1);
                            // 				        }
                            				        
                            // 				}
                            //     		}
                            //     	}
                                
                                    editor.updateUIList( scope.lastSelectedParcel.parcels );
                                    //else we keep it
                                    break;
                                } else if(scope.selectionMode == "addParcel") {
                                    break;
                                }
                            }
                            
                            if(scope.selectionMode != "addParcel") {
                                return;
                            }
                            parcel.material = new THREE.MeshPhongMaterial({color: colors.selected, opacity: 0.5, transparent: false})
                            
                            //if there isn't footprint we build it
                            if( parcel.userData.footprint == undefined ) {
                                
                                var footprintShape;
                                if(parcel.userData.footprints == undefined || !parcel.userData.footprints.length) {
                                    
        	                        var slicePlane = THREE.ParcelJsonLoader.createSlicePlane(parcel.userData.coordinates, 0, 1);
                                    footprintShape = THREE.ParcelJsonLoader.createSlicedShape(parcel.userData.shape, slicePlane);
                                } else {
                                    
                                    footprintShape = parcel.userData.footprints[0].shape;
                                    
                                }
                                
                            	var footprintVertices = footprintShape.extractPoints().shape;
                            	var prevfootprintVertices = footprintShape.extractPoints().shape;
                            	
                            	var shapeGeometry = new THREE.ShapeGeometry(footprintShape);
                            	
                            	var footprint =  new THREE.Mesh(shapeGeometry, new THREE.MeshPhongMaterial({color: 0x00FF00, opacity: 0.6, transparent: true}));
                            	footprint.name = "Footprint" ;
                            	footprint.position.z = 0.05;
                            	
                            	var footprintSurface = Math.floor(THREE.ShapeUtils.area(footprintVertices) * 100) / -100;
                            	parcel.userData.footprintSurface = footprintSurface;
                            	parcel.userData.maxFootprintSurface = footprintSurface;
                            	parcel.userData.buildingSurface = footprintSurface * parcel.userData.floors;
                            	
                            	
                            	parcel.add( footprint );
                            	
                            	parcel.userData.footprint = footprint.uuid;
                            	parcel.userData.footprintVertices = footprintVertices;
                            	parcel.userData.prevFootprintVertices = prevfootprintVertices;
                            	
                            }
                            
                            parcel.getObjectByName('Footprint').visible = true;
                            
                            
                            var tileMesh = parcel;
    
                            // Tutorial - Process bounding box - method BoxHelper
                            var parcelBox = new THREE.BoxHelper(parcel);
                            
                            var bboxWorldPos = new THREE.Vector3();
                            
                            bboxWorldPos.setFromMatrixPosition(parcel.matrixWorld);
                            
                            var parcelCenter = parcelBox.geometry.boundingSphere.center;
                            parcelBox.position.setX(-bboxWorldPos.x);
                            parcelBox.position.setY(-bboxWorldPos.y);
                            parcelBox.updateMatrix();
    
                            var bboxCenter = new THREE.Object3D();
                            bboxCenter.name = "Bbox center";
                            bboxCenter.position.set(parcelBox.geometry.boundingSphere.center.x - bboxWorldPos.x, 
                                                    parcelBox.geometry.boundingSphere.center.y - bboxWorldPos.y, 
                                                    parcelBox.geometry.boundingSphere.center.z - bboxWorldPos.z);
                                                    
                            bboxCenter.updateMatrix();
                            
                            var parcelBox3 = new THREE.Box3().setFromObject(parcel);
                            var parcelBuildings = [];
                        	for (var i = 0; i < self.buildingObjects.length; i++) {
                        		var build = self.buildingObjects[i];
                    			    
                    // 			build.visible = true;
                    			let buildingBox = new THREE.BoxHelper(build);
                        		let bboxWorldPos = new THREE.Vector3();
                                bboxWorldPos.setFromMatrixPosition(build.matrixWorld);
                        		
                                let buildingCenter = build.geometry.boundingSphere.center;
                                let center = bboxWorldPos.add(buildingCenter);
                                center.z = 10;
                                
                        		var intersected = getIntersectsTopDown(center, [parcel], true, 0x00FF00);
                        		
                        		if(intersected.length) {
                        		    
                            		var overParcel = false;
                    				for (var j = 0; j < intersected.length; j++) {
                    				    
                    				        if(intersected[j].object.name == "footprint" || intersected[j].object.name.includes("Parcel ")) {
                    				            overParcel = true;
                    				            build.visible = false;
                    				            scope.lastSelectedParcel.buildings.push(build);
                    				        }
                    				        
                    				}
                        		}
                        	}
                        	
    
                            scope.lastSelectedParcel.names.push(parcel.userData.name);
                            scope.lastSelectedParcel.bboxCenter = bboxCenter;
                            scope.lastSelectedParcel.parcels.push(parcel);
                            
                            scope.loadBuildEnabled = false;
	
                            var editorPanel = document.getElementById("editorPanel");
                            editorPanel.style.display = 'block';
                            
                            var parcels = editor.currentParcels = scope.lastSelectedParcel.parcels;
                            
                            editor.updateUI();
                            editor.resetEdge();
                            parcels.forEach(function(parcel){
                                
                                var lastBuild = parcel.getObjectByName('Extrusion');
                                parcel.remove(lastBuild);
                                
                                for (var i = 0; i < parcel.userData.footprintVertices.length; i++) {
                                
                                	editor.addPointToEdge(parcel, parcel.edge, parcel.userData.footprintVertices[i]);
                                	
                                }
                                
                                editor.extrudeShape(parcel);
                            
                            })
                            
                            // scope.render();
                            
    
                            var message = 'id: ' + parcel.userData.name;
                            
    
                            var spritey = toolbox.makeTextSprite(message, {
                                fontsize: 32,
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
                            
                            spritey.scale.multiplyScalar(0.3)
                            spritey.position.setZ(5);
                            
    
                            bboxCenter.add(spritey);
                            
                            editor.updateUIList( scope.lastSelectedParcel.parcels );
    
                        }
                        
                        break;
                }
            }

			self.render();

		}

    } //LAYER
    this.addLayer = function(openEarthViewLayer, openEarthViewLoader) {
            var layerName = openEarthViewLayer.getName();
            
            if (this.layers.hasOwnProperty('defaultLayer')) {
                delete this.layers['defaultLayer'];
            }
            
            this.layers[layerName] = openEarthViewLayer;
            this.loaders[layerName] = openEarthViewLoader;

            for (var xtile = 0; xtile < 4; xtile++) {
                for (var ytile = 0; ytile < 4; ytile++) {
                    if (openEarthViewLayer.type === 'tile') {
                        
                        tileLoader.tileFactory(openEarthViewLayer.getUrl(2, xtile, ytile), 2, xtile, ytile, function (texture) {
                            
                        });
                    }
                }
            }

        // this.addTerrain("defaultTerrain", new OpenEarthView.Terrain.FlatTerrain("FlatTerrain"));
        // world.addTerrain(new OpenEarthView.Terrain.FlatTerrain("FlatTerrain"));
    }
    this.removeLayer = function(layerName) {
        
        delete this.layers[layerName];
        delete this.loaders[layerName];
        
        this.updateSceneLazy();

    }
    
    this.addTerrain = function(openEarthViewTerrain) {
        
        if (this.terrains.hasOwnProperty('defaultTerrain')) {
            delete this.terrains['defaultTerrain'];
        }
        this.terrains[openEarthViewTerrain.getName()] = openEarthViewTerrain;
     }
     
     function getMousePosition(x, y) {

		var rect = self.renderer.domElement.getBoundingClientRect();
		return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];

	}
	this.setBuildingVisibility = function(){
	    
	    var dist = new THREE.Vector3().copy(self.controls.object.position).sub(self.controls.target).length();
            
        dist = Math.min(Math.max(100, dist), 1000);
        
        let pos = new THREE.Vector3(0, dist, 0);
        
        pos.applyAxisAngle(new THREE.Vector3(0,0,1), self.camera.rotation.z);
        
        let sphere = new THREE.Sphere(pos, dist*2);
        
        self.buildingObjects.map(x => {
            
    		let bboxWorldPos = new THREE.Vector3();
            bboxWorldPos.setFromMatrixPosition(x.matrixWorld);
    		
            let buildingCenter = x.geometry.boundingSphere.center;
            let center = bboxWorldPos.add(buildingCenter);
            var isInTheBox = sphere.containsPoint(center);
            
            if(isInTheBox)
                x.visible = true;
            else
                x.visible = false;
        });
	}
	
     /////EVENTS/////
     
     function onMouseMove(event) {
			event.preventDefault();
			var array = getMousePosition(event.clientX, event.clientY)
			onMovePosition.fromArray(array);
		}


		function onMouseDown(event) {

			event.preventDefault();

			var array = getMousePosition(event.clientX, event.clientY);
			onDownPosition.fromArray(array);

			document.addEventListener('mouseup', onMouseUp, false);

		}

		function onMouseUp(event) {
			var array = getMousePosition(event.clientX, event.clientY);
			onUpPosition.fromArray(array);

			self.handleClick();
			
            self.setBuildingVisibility();
            
			document.removeEventListener('mouseup', onMouseUp, false);

		}

		function onTouchStart(event) {

			var touch = event.changedTouches[0];

			var array = getMousePosition(touch.clientX, touch.clientY);
			onDownPosition.fromArray(array);

			document.addEventListener('touchend', onTouchEnd, false);

		}

		function onTouchEnd(event) {
        
			var touch = event.changedTouches[0];

			var array = self.getMousePosition(touch.clientX, touch.clientY);
			onUpPosition.fromArray(array);

			self.handleClick();

			document.removeEventListener('touchend', onTouchEnd, false);

		}

		function onDoubleClick(event) {

// 			var array = getMousePosition(container, event.clientX, event.clientY);
// 			onDoubleClickPosition.fromArray(array);

// 			var intersects = getIntersects(onDoubleClickPosition, editor.parcels);

// 			if (intersects.length > 0) {

// 				var intersect = intersects[0];

// 				//signals.objectFocused.dispatch( intersect.object );

// 			}

		}

		this.renderer.domElement.addEventListener('mousedown', onMouseDown, false);
		this.renderer.domElement.addEventListener('mousemove', onMouseMove, false);
		this.renderer.domElement.addEventListener('touchstart', onTouchStart, false);
		this.renderer.domElement.addEventListener('dblclick', onDoubleClick, false);
		
    var postprocessing = { enabled: false, onlyAO: false, radius: 1, aoClamp: 0.5, lumInfluence: 0.1 };
	var ssaoPass, effectComposer;	
	
	function initPostprocessing() {
	    
		// Setup render pass
		var renderPass = new THREE.RenderPass( self.scene, self.camera );
		// Setup SSAO pass
		ssaoPass = new THREE.SSAOPass( self.scene, self.camera );
		ssaoPass.renderToScreen = true;
		// Add pass to effect composer
		effectComposer = new THREE.EffectComposer( self.renderer );
		effectComposer.addPass( renderPass );
		effectComposer.addPass( ssaoPass );
	}
	initPostprocessing() 
	//// END EVENTS ////
	
    this.render = function() {
         
        // requestAnimationFrame(render);
        // //////////////////////////////////////////////////////////
        if (this.lonStamp !== this.controls.getLongitude() || this.latStamp !== this.controls.getLatitude()) {
            // this.lonStamp = this.controls.getLongitude();
            // this.latStamp = this.controls.getLatitude();
            this.earthClone.rotation.set(this.controls.getLatitude() * Math.PI / 180, -this.controls.getLongitude() * Math.PI / 180, 0);
            this.earth.rotation.set(this.controls.getLatitude() * Math.PI / 180, -this.controls.getLongitude() * Math.PI / 180, 0);
            
        }
        
        // //////////////////////////////////////////////////////////
        if ( postprocessing.enabled ) {
            
			effectComposer.render();
			
		} else {
		    
            this.renderer.render(this.scene, this.camera);
            
		}
    } 
    
    this.updateSceneLazy = function() {
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
        

        ////////////////////////////////////////////////////////////
        
        this.render();
    }
    this.hidedBuildId = [];
    
	this.scene.add(transformControls);
	
    this.buildingObjects = [];
    
    this.updateScene = function(position) {
        
        var _this2 = this;
        
        var tiles = {};
        var currentIds = {};
        var zoomMax = void 0;
        var zoomMin = void 0;

        this.xtile = toolbox.long2tile(position.lon, this.zoom);
        this.ytile = toolbox.lat2tile(position.lat, this.zoom);
        this.earth.remove(this.tileGroups);
        
        // this.parcelObjects = [];
        this.tileGroups = new THREE.Group();
        this.tileGroups.name = "Tile group";
        
        this.buildings = new THREE.Group();
        this.buildings.name = "Buildings group";
        
        this.parcels = new THREE.Group();
        this.parcels.name = "Parcels group";
        
        this.earth.add(this.tileGroups);
        this.earth.add(this.buildings);
        this.earth.add(this.parcels);
        
        this.earth.name = "Earth";
        
        var oriGround = void 0;
        oriGround = new THREE.Group();
        oriGround.name = "oriGround";
        
        if (this.zoom >= World.ZOOM_FLAT) {
            
            var xtileOri = toolbox.long2tile(position.lon, World.ZOOM_FLAT);
            var ytileOri = toolbox.lat2tile(position.lat, World.ZOOM_FLAT);
            var lonOri = toolbox.tile2long(xtileOri, World.ZOOM_FLAT);
            var latOri = toolbox.tile2lat(ytileOri, World.ZOOM_FLAT);
            var oriLatRot = void 0;
            var oriLonRot = void 0;

            var buildingsGround = new THREE.Group();
            buildingsGround.name = "buildingsGround";
            
            var parcelsGround = new THREE.Group();
            parcelsGround.name = "parcelsGround";
            
    
            // 3 - ground position
            parcelsGround.position.set(0, 0, this.R * 1000);
            buildingsGround.position.set(0, 0, this.R * 1000);
            oriGround.position.set(0, 0, this.R * 1000);
            
            // 2 - Latitude rotation
            var buildingsLatRot = new THREE.Group();
            buildingsLatRot.add(buildingsGround);
            var parcelsLatRot = new THREE.Group();
            parcelsLatRot.add(parcelsGround);
            oriLatRot = new THREE.Group();
            oriLatRot.rotation.set(-latOri * Math.PI / 180, 0, 0);
            oriLatRot.add(oriGround);
            
            // 1 - Longitude rotation
            var buildingsLonRot = new THREE.Group();
            buildingsLonRot.add(buildingsLatRot);
            
            var parcelsLonRot = new THREE.Group();
            parcelsLonRot.add(parcelsLatRot);
            
            oriLonRot = new THREE.Group();
            oriLonRot.rotation.set(0, lonOri * Math.PI / 180, 0);
            oriLonRot.add(oriLatRot);
            oriLonRot.name = "oriLonRot";

            this.tileGroups.add(oriLonRot);
            this.buildings.add(buildingsLonRot);
            this.parcels.add(parcelsLonRot);
            
            parcelsLatRot.rotation.set(-latOri * Math.PI / 180, 0, 0);
            parcelsLonRot.rotation.set(0, lonOri * Math.PI / 180, 0);
            
            buildingsLatRot.rotation.set(-latOri * Math.PI / 180, 0, 0);
            buildingsLonRot.rotation.set(0, lonOri * Math.PI / 180, 0);
            
        }

        console.log('position:', JSON.stringify({
            zoom: this.zoom,
            xtile: this.xtile,
            ytile: this.ytile
        }));
        zoomMax = Math.max(this.zoom, this.ZOOM_MIN);
        zoomMin = Math.max(this.zoom - this.ZOOM_SHIFT_SIZE, this.ZOOM_MIN);
        
    
        if( _this2.zoom < 17 ) {
            _this2.buildingObjects.map(o => o.visible = false);
            _this2.parcelObjects.map(o => o.visible = false);
        } else {
            
            // _this2.buildingObjects.map(o => o.visible = true);
            // _this2.parcelObjects.map(o => o.visible = true);
        }
        // _this2.buildingObjects.map(o => o.visible = false);
        
        var buildingLoop = function(){
            
            if( _this2.zoom < 17 ) return;
            
            var zoom_ = 15;
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

            // _this2.tileGroup[zShift] = new THREE.Group();
            // _this2.tileGroups.add(_this2.tileGroup[zShift]);
            // _this2.tileGroups.name = "Tile group " + zoom_;

            if (zoom_ < 0 && zShift > 0) {
                return 'continue';
            }
            
            factor = Math.pow(2, zShift);
            xtile_ = Math.floor(_this2.xtile / factor);
            ytile_ = Math.floor(_this2.ytile / factor);
            size = 1;
            
            minXtile = xtile_ - size;
            maxXtile = xtile_ + size;
            minYtile = ytile_ - size;
            maxYtile = ytile_ + size;
            modulus = zoom_ > 0 ? Math.pow(2, zoom_) : 0;
            
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
                            var buildingSupport = void 0;
                            var tileMesh = void 0;

                            tileSupport = new THREE.Group(); // create an empty container
                            tileMesh = new THREE.Mesh();
                            tileMesh.name = "TileMesh";
                            
                            tileSupport.add(tileMesh);
                            tileSupport.name = "Tile Support";
                            
                            buildingSupport = new THREE.Group();
                            buildingSupport.name = "Building Support";

                            // tileMesh.position.set(0, 0, -10);
                            if (zoom_ < World.ZOOM_FLAT) {
                                
                            // var tileEarth = void 0;
                            // tileEarth = new THREE.Group(); // create an empty container
                            // tileEarth.rotation.set(0, (toolbox.tile2long(atile, zoom_) + 180) * Math.PI / 180, 0);
                            // _this2.tileGroup[zShift].add(tileEarth);
                            // tileMesh = toolbox.singleton.getTileMesh(R, zoom_, btile, Math.max(9 - zoom_, 0));
                            // tileEarth.add(tileMesh);
                            // tileEarth.name = "tileEarth";
                                
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

                                                tileSupport.position.set(xTileShift * widthUp, -yTileShift * widthSide, -0.2);
                                                buildingSupport.position.set(xTileShift * widthUp, -yTileShift * widthSide, 0);
                                                
                                                oriGround.add(tileSupport);
                                                buildingsGround.add(buildingSupport);
                                                
                                                geometry = new THREE.ShapeGeometry(tileShape);
                                                toolbox.singleton.assignUVs(geometry);
                                                tileMesh.geometry = geometry;
                                                tileMesh.material = new THREE.MeshStandardMaterial({
                                                    color:0xEAEAEE, 
                                                    roughness: 0.85, 
                                                    metalness:0.4
                                                });

                                            })(tileSupport, tileMesh, zoom_, atile % modulus, btile % modulus);

                                            break;
                                    }
                                }
                                // if (zoom_ >= 19 && atile == xtile_ && btile == ytile) {
                            }

                            
                            var defaultColor = 13 * _this2.zoom % 256 * 65536 + 53 * (atile % modulus) % 256 * 256 + 97 * (btile % modulus) % 256;
                            var lod = Math.max(0, zoom_ - 15);
                            
                            (function (buildingSupport, zoom, xtile, ytile, lod_, defaultColor_) {
                                
                                if(_this2.loaders['OSMBuildings'].loadedTiles.indexOf('tile:'+zoom+':'+xtile+':'+ytile) >= 0) return;
                                
                                // var localUrl = self.layers[layerId].getLocalUrl(zoom, xtile, ytile);
                                
                                var url = self.layers['OSMBuildings'].getUrl(zoom, xtile, ytile);
                                
                                self.loaders['OSMBuildings'].load({
                                    z: zoom,
                                    x: xtile,
                                    y: ytile
                                }, null, url, function (tileMesh) {
                                    
                                    _this2.loaders['OSMBuildings'].loadedTiles.push('tile:'+zoom+':'+xtile+':'+ytile);
                                    let tileId = 'z_' + zoom_ + '_' + xtile + '_' + ytile;
                                    tileMesh.name = "Building tile " + tileId;
                                    buildingSupport.add(tileMesh);
                                    
                                    tileMesh.updateMatrixWorld();
                                    
                                    for (var i = tileMesh.children.length - 1; i >= 0; i--) {
                                        var building = tileMesh.children[i];
                                        var buildingId = building.userData.id;
                                        
                                        // building.updateMatrixWorld();
                                        // var position = new THREE.Vector3();
                                        // position.setFromMatrixPosition( building.matrixWorld );
                                        
                                        // var camPos = new THREE.Vector3();
                                        // camPos.setFromMatrixPosition(  _this2.camera.matrixWorld );
                                        
                                        
                                        // if(position.x > camPos.x) {
                                            
                                        //     building.visible = false;
                                            
                                        // };
                                        
                                        // building.geometry.computeBoundingSphere();
                                        
                                        if( _this2.buildingIds.indexOf(buildingId) == -1 ) {
                                            
                                            buildingSupport.add(building);
                                            
                                            _this2.buildingObjects.push(building);
                                            
                                            _this2.buildingIds.push(buildingId)
                                            
                                        // for (var j = buildingMesh.children.length - 1; j >= 0; j--) {
                                        //     self.buildingObjects.push(buildingMesh.children[j]);
                                        // }
                                        }
                                    }
                                    
                                    
                                    // _this2.buildingObjects.push(building);
                                    
                                    
                                    self.render(); 
                                    
                                    self.setBuildingVisibility();
                                    
                                }, function () {}, function () {}, lod_, defaultColor_);
                                
                            })(buildingSupport, zoom_, atile % modulus, btile % modulus, lod, defaultColor);
                                            
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
        
        buildingLoop();
        
        var parcelLoop = function(){
            
            if( _this2.zoom < 17 ) return;
            
            var zoom_ = 18;
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

            // _this2.tileGroup[zShift] = new THREE.Group();
            // _this2.tileGroups.add(_this2.tileGroup[zShift]);
            // _this2.tileGroups.name = "Tile group " + zoom_;

            if (zoom_ < 0 && zShift > 0) {
                return 'continue';
            }
            
            factor = Math.pow(2, zShift);
            xtile_ = Math.floor(_this2.xtile / factor);
            ytile_ = Math.floor(_this2.ytile / factor);
            size = 1;
            
            minXtile = xtile_ - size;
            maxXtile = xtile_ + size;
            minYtile = ytile_ - size;
            maxYtile = ytile_ + size;
            modulus = zoom_ > 0 ? Math.pow(2, zoom_) : 0;
            
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
                            var parcelSupport = void 0;
                            var tileMesh = void 0;

                            tileSupport = new THREE.Group(); // create an empty container
                            tileMesh = new THREE.Mesh();
                            tileMesh.name = "tileMesh loop2";
                            
                            tileSupport.add(tileMesh);
                            tileSupport.name = "Tile Support";
                            
                            parcelSupport = new THREE.Group();
                            parcelSupport.name = "Parcel Support";
                            // tileMesh.position.set(0, 0, -10);
                            if (zoom_ < World.ZOOM_FLAT) {
                                
                                // var tileEarth = void 0;
                                // tileEarth = new THREE.Group(); // create an empty container
                                // tileEarth.rotation.set(0, (toolbox.tile2long(atile, zoom_) + 180) * Math.PI / 180, 0);
                                // _this2.tileGroup[zShift].add(tileEarth);
                                // tileMesh = toolbox.singleton.getTileMesh(R, zoom_, btile, Math.max(9 - zoom_, 0));
                                // tileEarth.add(tileMesh);
                                // tileEarth.name = "tileEarth";
                                
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
                                                parcelSupport.position.set(xTileShift * widthUp, -yTileShift * widthSide, 0);
                                                
                                                // oriGround.add(tileSupport);
                                                parcelsGround.add(parcelSupport);
                                                
                                                geometry = new THREE.ShapeGeometry(tileShape);
                                                toolbox.singleton.assignUVs(geometry);
                                                tileMesh.geometry = geometry;

                                            })(tileSupport, tileMesh, zoom_, atile % modulus, btile % modulus);

                                            break;
                                    }
                                }
                                // if (zoom_ >= 19 && atile == xtile_ && btile == ytile) {
                            }

                            
                            var defaultColor = 13 * _this2.zoom % 256 * 65536 + 53 * (atile % modulus) % 256 * 256 + 97 * (btile % modulus) % 256;
                            var lod = Math.max(0, zoom_ - 15);
                            
                            (function (parcelSupport, zoom, xtile, ytile) {
                                var url = self.layers['ParcelKelquartier'].getUrl(zoom, xtile, ytile);
                                
                                if(_this2.loaders['ParcelKelquartier'].loadedTiles.indexOf('tile:'+zoom+':'+xtile+':'+ytile) >= 0) return;
                                
                                
                                self.loaders['ParcelKelquartier'].load({
                                    z: zoom,
                                    x: xtile,
                                    y: ytile
                                }, url, function (tileMesh) {
                                    
                                    _this2.loaders['ParcelKelquartier'].loadedTiles.push('tile:'+zoom+':'+xtile+':'+ytile);
                                    let tileId = 'z_' + zoom_ + '_' + xtile + '_' + ytile;
                                    tileMesh.name = "Parcel tile " + tileId;
                                    
                                    for (var i = tileMesh.children.length - 1; i >= 0; i--) {
                                        var parcel = tileMesh.children[i];
                                        var parcelId = parcel.userData.name;
                                        
                                        if( _this2.parcelIds.indexOf(parcelId) == -1 ) {
                                            
                                            parcelSupport.add(parcel);
                                            
                                            // _this2.parcelIds.push(parcelId);
                                            self.parcelObjects.push(parcel);
                                        // for (var j = buildingMesh.children.length - 1; j >= 0; j--) {
                                        //     self.buildingObjects.push(buildingMesh.children[j]);
                                        // }
                                        }
                                        _this2.parcelIds.push(parcelId)
                                    }
                                    
                                    self.render();
                                }, function () {}, function () {});
                                
                            })(parcelSupport, zoom_, atile % modulus, btile % modulus);
                                            
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
        
        parcelLoop();
        //for each zoom
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

            _this2.tileGroup[zShift] = new THREE.Group();
            _this2.tileGroups.add(_this2.tileGroup[zShift]);
            _this2.tileGroups.name = "Tile group " + zoom_;

            if (zoom_ < 0 && zShift > 0) {
                return 'continue';
            }
            
            factor = Math.pow(2, zShift);
            xtile_ = Math.floor(_this2.xtile / factor);
            ytile_ = Math.floor(_this2.ytile / factor);
            size = 1;
            
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
                        
                        var n = 0;
                        
                        (function () {
                            
                            var tileSupport = void 0;
                            var parcelSupport = void 0;
                            var tileMesh = void 0;

                            tileSupport = new THREE.Group(); // create an empty container
                            tileMesh = new THREE.Mesh();
                            tileMesh.name = "tileMesh loop2";
                            tileSupport.add(tileMesh);
                            tileSupport.name = "Tile Support";

                            // tileMesh.position.set(0, 0, -10);
                            if (zoom_ < World.ZOOM_FLAT) {
                                
                                var tileEarth = void 0;
                                tileEarth = new THREE.Group(); // create an empty container
                                tileEarth.rotation.set(0, (toolbox.tile2long(atile, zoom_) + 180) * Math.PI / 180, 0);
                                _this2.tileGroup[zShift].add(tileEarth);
                                tileMesh = toolbox.singleton.getTileMesh(R, zoom_, btile, Math.max(9 - zoom_, 0));
                                tileEarth.add(tileMesh);
                                tileEarth.name = "tileEarth";
                                
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
                                                
                                            	tileMesh.castShadow = true;
                                            	tileMesh.receiveShadow = true;

                                            })(tileSupport, tileMesh, zoom_, atile % modulus, btile % modulus);

                                            break;
                                    }
                                }
                                // if (zoom_ >= 19 && atile == xtile_ && btile == ytile) {
                            }

                            var _loop4 = function _loop4(layerId) {
                                
                                if (!_this2.layers.hasOwnProperty(layerId)) {
                                    return 'continue';
                                }
                                
                                switch (_this2.layers[layerId].type) {
                                    case 'tile':
                                        
                                        tileMesh.material = new THREE.MeshStandardMaterial({
                                            color:0xFFFFFF, 
                                            roughness: 0.8, 
                                            metalness:0.3,
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
                                                tileMesh.name = "Map Tile";
                                            	tileMesh.castShadow = true;
                                            	tileMesh.receiveShadow = true;
                                                self.render();
                                            });
                                            
                                            currentIds[tilePath] = {};
                                            
                                        })(tileMesh, zoom_, atile % modulus, btile % modulus, _this2.layers[layerId]);
                                        break;
                                    
                                    default:
                                        break;
                                }
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

        for (var zoom_ = zoomMax; zoom_ > zoomMin; zoom_--) {
            var _ret = _loop(zoom_);

            if (_ret === 'continue') continue;
        }
        
        tileLoader.cancelOtherRequests(currentIds);
	        
    }
    
    
    this.setCenter = function(lon, lat) {
        
        this.controls.setCenter(lon, lat);
        
    },
    this.setPosition = function(lon, lat, alti, phi, theta) {
        
        this.controls.setPosition(lon, lat, alti, phi, theta);
        
    }
        
    function onWindowResize() {
    	var width = self.domElement.clientWidth;
        var height = self.domElement.clientHeight;

        self.renderer.setViewport(0, 0, width, self.canvas.height);
        self.renderer.setSize(width, height);
        self.camera.aspect = width / height;
        self.camera.updateProjectionMatrix();
        self.render();
    }
    onWindowResize()
    // var canvas = document.getElementById('world');
    // this.canvas.addEventListener('resize', this.onWindowResize, false);
    window.addEventListener('resize', onWindowResize(), false);
    
};

World.prototype = Object.create( THREE.EventDispatcher.prototype );
World.prototype.constructor = World;

World.ZOOM_FLAT = 13;
// var FlatTerrain = new FlatTerrain();
var toolbox =  new Toolbox();
toolbox.singleton = new Toolbox();
var tileLoader = new TileLoader();
var R = 6378.137;