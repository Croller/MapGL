/**
Open Earth View - library
The MIT License (MIT)
Copyright (c) 2017 Clément Igonet

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

// var toolbox = new Toooolbox;
// var RequestManager = OpenEarthView.RequestManager;
// OpenEarthView.Layer.OSMBuildings = function(name, urls, options) {
var OSMBuildings = function(name, urls, options) {
    this.name = (name !== undefined) ? name : 'OSMBuildings';
    this.minZoom = 14;
    if (options !== undefined) {
        this.minZoom = (options.minZoom !== undefined) ? options.minZoom : 18;
        this.localData = (options.localData !== undefined) ? options.localData : undefined;
        // console.log('minZoom: ' + this.minZoom);
    }
    // if (OpenEarthViewLayers.hasOwnProperty(name)) {
    //     console.err('Cannot register this already existing layer !');
    //     return;
    // }
    this.urls = (urls !== undefined) ? urls : [
        'http://overpass-api.de/api/interpreter'
    ];
};

// OpenEarthView.Layer.OSMBuildings.prototype = {
OSMBuildings.prototype = {
    constructor: OSMBuildings,
    type: 'building',
    getName: function() {
        return this.name
    },
    getLocalUrl(zoom, xtile, ytile) {
        return this.localData
            // .replace('${z}', zoom)
            .replace('${x}', xtile)
            .replace('${y}', ytile);
        
    },
    getUrl: function(zoom, xtile, ytile) {
        var toolbox = new Toolbox();
        let scope = this;
        // let urls = OpenEarthViewLayers[scope.name];
        let urlRandom = this.urls[
            Math.floor(Math.random() * this.urls.length)];

        // Process GPS bounds
        // minLon = toolbox.tile2long(xtile, zoom);
        // maxLon = toolbox.tile2long(xtile + 1, zoom);
        // minLat = toolbox.tile2lat(ytile + 1, zoom);
        // maxLat = toolbox.tile2lat(ytile, zoom);

            // .replace('${z}', zoom)
        
        return urlRandom
            .replace('${x}', xtile)
            .replace('${y}', ytile);
        // return urlRandom
        //     .replace(/\${tile2long\(x\)}/g, minLon)
        //     .replace(/\${tile2long\(x\+1\)}/g, maxLon)
        //     .replace(/\${tile2lat\(y\+1\)}/g, minLat)
        //     .replace(/\${tile2lat\(y\)}/g, maxLat);
    }
}

var R = 6378.137;

var OSMBuildingsLoaderSingleton;

THREE.OSMBuildingsLoader = class {
    constructor() {
        this.crossOrigin = undefined;
        this.loadedTiles = [];
        this.queue = 0;
        this.busy = false;
        this.loadedBuildings = [];
        this.requestManager = new RequestManager(
            new THREE.FileLoader(),
            new THREE.FileLoader(THREE.DefaultLoadingManager),
            THREE.OSMBuildingsLoader.MAX_OVERPASS_JSON_REQUEST);
        // console.log('this.requestManager:', this.requestManager);
    }
    static getSingleton() {
        if (OSMBuildingsLoaderSingleton === undefined) {
            OSMBuildingsLoaderSingleton = new THREE.OSMBuildingsLoader();
        }
        // console.log('THREE.OSMBuildingsLoader.singleton:', OSMBuildingsLoaderSingleton);
        return OSMBuildingsLoaderSingleton;
    }
    load(tileId, localUrl, url, onLoad, lod, defaultColor) {
        // console.log('this:', this);
        // console.log('this.requestManager:', this.requestManager);
        // console.log(tileId, localUrl, url);
        var self = this;
        
        var service = new Service();
        
        // console.log(self.busy, self.queue);
        // if(self.busy) self.queue.push({url: url, tileId: tileId, onLoad: onLoad});
        self.queue++;
        self.busy = true;
        function load(tileId, localUrl, url, onLoad) {
            
            service.load('GET', url, function(progress){
                // console.log("progress", progress)
            }, function(data){
                
                onLoad( THREE.OSMBuildingsLoader.parse(JSON.parse(data), tileId) );
            }, function( error ){
                console.log("An error occured on building loading.")
            });
            self.queue--;
        }
        
        if(self.queue >= 2) {
            setTimeout(load, 400 * self.queue, tileId, localUrl, url, onLoad);
        } else {
            setTimeout(load, 10 * self.queue, tileId, localUrl, url, onLoad);
        }
        // this.requestManager.newRequest(tileId, localUrl, url, onLoad, THREE.OSMBuildingsLoader.parse);
    }
    setCrossOrigin(value) {
        this.crossOrigin = value;
    }
};

THREE.OSMBuildingsLoader.singleton = undefined;
// THREE.OSMBuildingsLoader.MAX_OVERPASS_JSON_REQUEST = 20;
THREE.OSMBuildingsLoader.MAX_OVERPASS_JSON_REQUEST = 20;

THREE.OSMBuildingsLoader.parse = function(json, tileId) {
    // console.log('', tileId, ':', json);
    // console.log('', tileId, ':', json);
    // let scope = this;
    
    let scope = this;
    var toolbox = new Toolbox();
    let measure = toolbox.measure;
    let tile2long = toolbox.tile2long;
    let tile2lat = toolbox.tile2lat;
    // let lonOri, latOri;
    let tile = new THREE.Group();
    
    tile.name = "OSM Buildings tile " + tileId.z +"/"+tileId.x+"/"+tileId.y;
    
    let bounds = {
            minLon: tile2long(tileId.x, tileId.z),
            maxLon: tile2long(tileId.x + 1, tileId.z),
            minLat: tile2lat(tileId.y + 1, tileId.z),
            maxLat: tile2lat(tileId.y, tileId.z)
        }
        
    // var json = JSON.parse(buffer)
    
    let lonOri = bounds.minLon;
    let latOri = bounds.maxLat;
    
    var features = json.features;
    // var prevHeight;
	for (var i = 0, l = features.length; i < l; i++) {
	    
	    var geometry = features[i].geometry,
	        coordinates = geometry.coordinates[0];
        // console.log(features[i].properties)
		var n = 0;
        let shapePts = [];
        
		while (n < coordinates.length) {
		    
			var lon = coordinates[n][0];
			var lat = coordinates[n][1];
            let x = ((lon - lonOri) / Math.abs(lonOri - lon)) * measure(latOri, lonOri, latOri, lon);
            let y = ((lat - latOri) / Math.abs(latOri - lat)) * measure(latOri, lonOri, lat, lonOri);
			shapePts.push(new THREE.Vector2(x, y));
			
			n++;
		}
// 		console.log(json[i].name)
// 		var array = this.removeUselessPoints(shapePts);
	
        let shape = new THREE.Shape(shapePts);
		shape.autoClose = true;
		shape.name = "Shape " + features[i].id;
		
// 		json[i].shape = shape;
        var height = features[i].properties.height != undefined ? features[i].properties.height : 5;
        var levels = features[i].properties.levels;
        if(levels !== undefined && height !== 5)
            height = 3 * levels; 
        
        var random = Math.random(1);
        height += random;
        
        let extrudeSettings = {
            amount: height,
            bevelEnabled: false,
            bevelSegments: 1,
            steps: 1,
            bevelSize: 2,
            bevelThickness: 1
        };
        
        //1. Create the parcel
        // let parcel = this.createParcel(shape, extrudeSettings);
        let build = this.createExtrusion(shape, extrudeSettings);
        build.userData = features[i].properties;
        build.userData.shape = shape;
        build.userData.coordinates = shapePts;
	    build.userData.id = features[i].id;
	   // build.position.z = 0.2;
	    
    // 	if( json[i].height > 0 ){
    	    
        	//2. Create the slice plane parallele to the first segment
        // 	let slicePlane = this.createSlicePlane(/*shapePoints.shape*/shapePts, json[i].index[0], json[i].index[1]);
    	
            //3. Create the extrusion depending on the height and the sliced part of the parcel
            // let extrusion = this.createExtrusion(shape, extrudeSettings);

            //add a wireframe
	       // extrusion.add(this.createWireframe(extrusion.geometry));
	        
	       // parcel.add(extrusion);
        // }
        
        //add a wireframe
        // build.add(this.createWireframe(parcel.geometry));
	    
        tile.add(build);
    }
    // console.log(tile);
    return tile;
    // }
}

THREE.OSMBuildingsLoader.parseCoordinates = function(buffer) {
    buffer = buffer.slice(10, -2);
	var array = buffer.split(/[\s,]/g);
	array = array.map(x => parseFloat(x));

	return array;
}

THREE.OSMBuildingsLoader.createParcel = function(shape) {

    var self = this;
	//Parcelle
	var shapeGeometry = new THREE.ShapeBufferGeometry(shape);
	var parcel = new THREE.Mesh(shapeGeometry, new THREE.MeshPhongMaterial({ color: colors.parcel, opacity: 0.1, transparent: true}));
	// parcel.rotation.y = Math.PI * 0.5;
// 	parcel.castShadow = true;
// 	parcel.receiveShadow = true;
	
	return parcel;

}
THREE.OSMBuildingsLoader.createBuildingFromParcel = function(parcel){
    
}

THREE.OSMBuildingsLoader.createFloors = function(geometry, count, height, groundHeight) {
    
    var floors = new THREE.Group();
    var floorLineSegment = this.createWireframe(geometry);
    
    for (var i = 0; i < count; i++) {
        
        var floor = floorLineSegment.clone();
        
        if( i == 0 && groundHeight != undefined ) {
            
            floor.position.z = groundHeight;
            
        } else {
            
            floor.position.z = (height * i) + groundHeight;
            
        }
        
        floor.name = "foor " + i;
        
        floors.add(floor);
        
    }
    
    return floors;

}

THREE.OSMBuildingsLoader.createExtrusion = function(shape, extrudeSettings) {

	var extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
	
	var extrusion = new THREE.Mesh(extrudeGeometry, new THREE.MeshStandardMaterial({color:0xFFFFFF, roughness: 0.9, metalness:0.25}));
	
	extrusion.castShadow = true;
	extrusion.receiveShadow = true;
	
	extrusion.name = "OSM Building"

	return extrusion;
}

THREE.OSMBuildingsLoader.createSlicedShape = function(shape, plane) {

	
	return plane ? Slicer.sliceShape(shape, plane) : shape;
}

THREE.OSMBuildingsLoader.createRoofExtrusion = function(shape, extrudeSettings) {

	var extrudeGeometry = new ExtrudeRoofGeometry(shape, extrudeSettings);
	var extrusion = new THREE.Mesh(extrudeGeometry, new THREE.MeshPhongMaterial({color: 0x555555}));
// 	//extrusion.rotation.x = -Math.PI*0.5;
// 	extrusion.castShadow = true;
// 	extrusion.receiveShadow = true;
	//extrusion.position.y = 0.1;
	
	return extrusion;
}

THREE.OSMBuildingsLoader.createWireframe = function(geometry) {
    
    //Wireframe
	var geo = new THREE.EdgesGeometry(geometry, 10); // or WireframeGeometry
	var mat = new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 1 /*, lights: true*/ });
	var wireframe = new THREE.LineSegments(geo, mat);
	return wireframe;
    
}

THREE.OSMBuildingsLoader.createSlicePlane = function(points, index1, index2) {
	var v1 = new THREE.Vector3(points[index1].x, points[index1].y, 0);
	var v2 = new THREE.Vector3(points[index2].x, points[index2].y, 0);

	var sliceDir = new THREE.Vector3();
	sliceDir.subVectors(v1, v2);

	sliceDir.normalize();
	sliceDir.applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);

	//slicePlane
	var plane = new THREE.Plane();
	plane.setFromNormalAndCoplanarPoint(sliceDir, v1);
	plane.constant += 15;

	return plane;
}


THREE.OSMBuildingsLoader.removeUselessPoints = function(points) {

	let allPointsMap = {};
    var array = [];
    var array2 = [];
    
    for (let i = 0, il = points.length; i < il; i ++ ) {

		let key = points[ i ].x + ":" + points[ i ].y;

		if ( allPointsMap[ key ] == undefined ) {

			array2.push(points[i]);

		}

		allPointsMap[ key ] = i;

	}
	
    function getAngle(v1, v2, v3) {

		let vec2 = new THREE.Vector2().subVectors(v1, v2)
		let vec3 = new THREE.Vector2().subVectors(v1, v3)

		var theta = vec2.dot(vec3) / (Math.sqrt(vec2.lengthSq() * vec3.lengthSq()))

		// console.log( theta, Math.acos(theta) * 180 / Math.PI  );//Math.acos( Math.clamp( theta, - 1, 1 ) ))

		return Math.acos(theta) * 180 / Math.PI
	}
	
    var n = 0;
    var o = 1;
    
	while (n < array2.length) {
	    
		
		let v1 = array2[n];
		let v2 = array2[n+o];
		let v3 = array2[n+o+1];
		
        
		var angle = 360;
			
		if( v3 !== undefined ) {


			angle = getAngle( v1, v2, v3 );
			if( angle < 1.0 ) {
			    
				o++;
				continue;
				
			} else {
				// console.log(v1,v2)
			    if( n == 0 && array.length == 0) array.push(v1)
				array.push(v2)
				
				n += o;
				o = 1;
				
			}
			
			
		} else {
		    
    		v3 = array2[0];

			angle = getAngle( v1, v2, v3 );
			
			if( angle < 1.0 ) {
			    
				break;
				
			} else {
				// console.log(v1,v2)
			    if( n == 0 && array.length == 0) array.push(v1)
				array.push(v2)
				break;
			}
    		
		}
		
	

	}
	
// 	console.log(array2, array);
	return array;
}
