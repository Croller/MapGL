var ParcelLayer = function(name, urls, options) {
    this.name = (name !== undefined) ? name : 'Parcel';
    this.minZoom =14;
    
    if (options !== undefined) {
        
        this.minZoom = (options.minZoom !== undefined) ? options.minZoom : 18;
        this.localData = (options.localData !== undefined) ? options.localData : undefined;
        
    }
    
    this.urls = (urls !== undefined) ? urls : [
        'api/v1/data?city=nantes'
    ];
};

ParcelLayer.prototype = {
    constructor: ParcelLayer,
    type: 'parcel',
    getName: function() {
        return this.name
    },
    getUrl: function(zoom, xtile, ytile) {
        var toolbox = new Toolbox();
        let scope = this;
        // let urls = OpenEarthViewLayers[scope.name];
        let urlRandom = this.urls[
            Math.floor(Math.random() * this.urls.length)];

        // Process GPS bounds
        minLon = toolbox.tile2long(xtile, zoom);
        maxLon = toolbox.tile2long(xtile + 1, zoom);
        minLat = toolbox.tile2lat(ytile + 1, zoom);
        maxLat = toolbox.tile2lat(ytile, zoom);

        urlRandom = urlRandom
            .replace(/\${tile2long\(x\)}/g, minLon)
            .replace(/\${tile2long\(x\+1\)}/g, maxLon)
            .replace(/\${tile2lat\(y\+1\)}/g, minLat)
            .replace(/\${tile2lat\(y\)}/g, maxLat);
        
        
        return urlRandom
            
    }
}

var R = 6378.137;
var colors = {
    		parcel: 0x666666,
    		extrusion: 0xdddddd,
    		wireframe: 0x444444,
    		roof: 0xdddddd,
    		selected:0xFF5555
    	}
var ParcelJsonLoaderSingleton;

THREE.ParcelJsonLoader = class {
    constructor() {
        this.crossOrigin = undefined;
        this.loadedTiles = [];
        this.loadedParcels = [];
        this.requestManager = new RequestManager(
            new THREE.FileLoader(),
            new THREE.FileLoader(THREE.DefaultLoadingManager),
            THREE.ParcelJsonLoader.MAX_OVERPASS_JSON_REQUEST);
            
    }
    static getSingleton() {
        if (ParcelJsonLoaderSingleton === undefined) {
            ParcelJsonLoaderSingleton = new THREE.ParcelJsonLoader();
        }
        // console.log('THREE.OverpassJsonLoader.singleton:', OverpassJsonLoaderSingleton);
        return ParcelJsonLoaderSingleton;
    }
    load(tileId, url, onLoad) {
        // console.log('load parcel', url)
        var service = new Service();
        service.load('GET', url, null, function(data){
            onLoad( THREE.ParcelJsonLoader.parse(data, tileId) );
        });
        // this.requestManager.newRequest(tileId, undefined, url, onLoad, THREE.ParcelJsonLoader.parse);
    }
    setCrossOrigin(value) {
        this.crossOrigin = value;
    }
    
};

THREE.ParcelJsonLoader.singleton = undefined;
// THREE.OverpassJsonLoader.MAX_OVERPASS_JSON_REQUEST = 20;
THREE.ParcelJsonLoader.MAX_OVERPASS_JSON_REQUEST = 20;
// THREE.ParcelJsonLoader.loadedTile = [];

THREE.ParcelJsonLoader.parse = function(buffer, tileId) {
    // console.log('///--------', tileId, ':', buffer);
    let scope = this;
    var toolbox = new Toolbox();
    let measure = toolbox.measure;
    let tile2long = toolbox.tile2long;
    let tile2lat = toolbox.tile2lat;
    // let lonOri, latOri;
    let tile = new THREE.Group();
    
    tile.name = "Parcel tile " + tileId.z +"/"+tileId.x+"/"+tileId.y;
    
    let bounds = {
            minLon: tile2long(tileId.x, tileId.z),
            maxLon: tile2long(tileId.x + 1, tileId.z),
            minLat: tile2lat(tileId.y + 1, tileId.z),
            maxLat: tile2lat(tileId.y, tileId.z)
        }
        
    var json = JSON.parse(buffer)
    
    let lonOri = bounds.minLon;
    let latOri = bounds.maxLat;
    
    function createShape(coordinates){
        var n = 0;
        let shapePts = [];
        
    	while (n < coordinates.length) {
    	    
    	    if(Array.isArray(coordinates[n])) return null;
    	    
    		var lon = coordinates[n];
    		var lat = coordinates[n + 1];
            let x = ((lon - lonOri) / Math.abs(lonOri - lon)) * measure(latOri, lonOri, latOri, lon);
            let y = ((lat - latOri) / Math.abs(latOri - lat)) * measure(latOri, lonOri, lat, lonOri);
    		shapePts.push(new THREE.Vector2(x, y));
    		
    		n = n + 2;
    	}
    	
    	var array = scope.removeUselessPoints(shapePts);
    // 	var array = shapePts;
        if(array.length <= 3) return null;
        return new THREE.Shape(array);
    }
    
    
	for (var i = 0, l = json.length; i < l; i++) {
        let shape = createShape(json[i].coordinates);
        
        if(json[i].footprints != undefined){
            for (var j = 0; j < json[i].footprints.length; j++) {
                let footprintShape = createShape(json[i].footprints[j].coordinates);
                if(footprintShape) json[i].footprints[j].shape = footprintShape;
            }
        }
        
        if(!shape) continue;
        
		shape.autoClose = true;
		shape.name = "Shape " + json[i].id;
		
		json[i].shape = shape;
		
        let extrudeSettings = {
            amount: json[i].height,
            bevelEnabled: false,
            bevelSegments: 1,
            steps: 1,
            bevelSize: 2,
            bevelThickness: 1
        };
        
        //1. Create the parcel
        let parcel = this.createParcel(shape);
        parcel.userData = json[i];
        parcel.userData.coordinates = shape.extractPoints().shape;
        parcel.userData.footprints = json[i].footprints;
        parcel.userData.groundHeight = json[i].groundHeight !== undefined ? json[i].groundHeight : 2.5;
        parcel.userData.floorHeight = json[i].floorHeight !== undefined ? json[i].floorHeight : 2.5;
        parcel.userData.floors = json[i].floors !== undefined ? json[i].floors : json[i].height / 2.5;
        parcel.userData.roofAngle = 0;
        parcel.userData.roofHeight = 0;
	    parcel.name = "Parcel " + json[i].id;
	    parcel.position.z = 0.1;
	    
    	if( json[i].height > 0 ){
    	    
        	//2. Create the slice plane parallele to the first segment
        // 	let slicePlane = this.createSlicePlane(/*shapePoints.shape*/shapePts, json[i].index[0], json[i].index[1]);
    	
            //3. Create the extrusion depending on the height and the sliced part of the parcel
            // let extrusion = this.createExtrusion(shape, slicePlane, extrudeSettings);

            //add a wireframe
	       // extrusion.add(this.createWireframe(extrusion.geometry));
	        
	       // parcel.add(extrusion);
        }
        
        //add a wireframe
        parcel.add(this.createWireframe(parcel.geometry, "Wireframe"));
	    
        tile.add(parcel);
    }
    
    return tile;
    // }
}

THREE.ParcelJsonLoader.parseCoordinates = function(buffer) {
    buffer = buffer.slice(10, -2);
	var array = buffer.split(/[\s,]/g);
	array = array.map(x => parseFloat(x));

	return array;
}

THREE.ParcelJsonLoader.createParcel = function(shape) {

    var self = this;
	//Parcelle
	var shapeGeometry = new THREE.ShapeBufferGeometry(shape);
	var parcel = new THREE.Mesh(shapeGeometry, new THREE.MeshPhongMaterial({ color: colors.parcel, opacity: 0.1, transparent: true}));
	// parcel.rotation.y = Math.PI * 0.5;
// 	parcel.castShadow = true;
// 	parcel.receiveShadow = true;
	
	return parcel;

}
THREE.ParcelJsonLoader.createBuildingFromParcel = function(parcel){
    
}

THREE.ParcelJsonLoader.createFloors = function(geometry, count, height, groundHeight) {
    
    var floors = new THREE.Group();
    var floorLineSegment = this.createWireframe(geometry, "Floor wireframe");
    
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

THREE.ParcelJsonLoader.createExtrusion = function(shape, plane, extrudeSettings) {

	var extrudeShape = plane ? Slicer.sliceShape(shape, plane) : shape;
	var extrudeGeometry = new THREE.ExtrudeGeometry(extrudeShape, extrudeSettings);
	
	var extrusion = new THREE.Mesh(extrudeGeometry, new THREE.MeshPhongMaterial());
	
	extrusion.castShadow = true;
	extrusion.receiveShadow = true;
	
	extrusion.name = "Build extrusion"

	return extrusion;
}

THREE.ParcelJsonLoader.createSlicedShape = function(shape, plane) {

	
	return plane ? Slicer.sliceShape(shape, plane) : shape;
}

THREE.ParcelJsonLoader.createShape = function(coordinates) {

	var n = 0;
    let shapePts = [];
    
	while (n < coordinates.length) {
	    
		var lon = coordinates[n];
		var lat = coordinates[n + 1];
        let x = ((lon - lonOri) / Math.abs(lonOri - lon)) * measure(latOri, lonOri, latOri, lon);
        let y = ((lat - latOri) / Math.abs(latOri - lat)) * measure(latOri, lonOri, lat, lonOri);
		shapePts.push(new THREE.Vector2(x, y));
		
		n = n + 2;
	}
	
	var array = this.removeUselessPoints(shapePts);
    if(array.length <= 3) return null;
    return new THREE.Shape(array);
}


THREE.ParcelJsonLoader.createRoofExtrusion = function(shape, extrudeSettings) {

	var extrudeGeometry = new ExtrudeRoofGeometry(shape, extrudeSettings);
	var extrusion = new THREE.Mesh(extrudeGeometry, new THREE.MeshPhongMaterial({color: 0x555555}));
	//extrusion.rotation.x = -Math.PI*0.5;
// 	extrusion.castShadow = true;
// 	extrusion.receiveShadow = true;
	//extrusion.position.y = 0.1;
	
	return extrusion;
}

THREE.ParcelJsonLoader.createWireframe = function(geometry, name) {
    
    //Wireframe
	var geo = new THREE.EdgesGeometry(geometry, 10); // or WireframeGeometry
	var mat = new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 1 /*, lights: true*/ });
	var wireframe = new THREE.LineSegments(geo, mat);
	wireframe.name = name !== undefined ? name : "";
	return wireframe;
    
}

THREE.ParcelJsonLoader.createSlicePlane = function(points, index1, index2) {
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


THREE.ParcelJsonLoader.removeUselessPoints = function(points) {

	let allPointsMap = {};
    var array = [];
    var array2 = [];
    var minusAngle = 1.0;
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
		
        
		var angle = 360.0;
			
		if( v3 !== undefined ) {


			angle = getAngle( v1, v2, v3 );
// 			if(angle > 130.0)console.log(angle);
			if( angle < minusAngle || angle > 178 - minusAngle) {
			    
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
// 			if(angle > 130.0)console.log(angle);
			if( angle < minusAngle || angle > 178 - minusAngle) {
			    
				break;
				
			} else {
				// console.log(v1,v2)
			    if( n == 0 && array.length == 0) array.push(v1)
				array.push(v2)
				break;
			}
    		
		}
		
	

	}
	
	return array;
}