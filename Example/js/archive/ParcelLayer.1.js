var ParcelLayer = function(name, urls, options) {
    this.name = (name !== undefined) ? name : 'Parcel';
    this.minZoom = 17;
    
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
        
        console.log('get url', urlRandom);
        
        return urlRandom
            
    }
}

var R = 6378.137;

var ParcelJsonLoaderSingleton;

THREE.ParcelJsonLoader = class {
    constructor() {
        this.crossOrigin = undefined;
        this.requestManager = new RequestManager(
            new THREE.FileLoader(),
            new THREE.FileLoader(THREE.DefaultLoadingManager),
            THREE.ParcelJsonLoader.MAX_OVERPASS_JSON_REQUEST);
        // console.log('this.requestManager:', this.requestManager);
    }
    static getSingleton() {
        if (ParcelJsonLoaderSingleton === undefined) {
            ParcelJsonLoaderSingleton = new THREE.ParcelJsonLoader();
        }
        // console.log('THREE.OverpassJsonLoader.singleton:', OverpassJsonLoaderSingleton);
        return ParcelJsonLoaderSingleton;
    }
    load(tileId, url, onLoad) {
        console.log('load:', tileId, url);
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

THREE.ParcelJsonLoader.parse = function(buffer, tileId) {
    console.log('///--------', tileId, ':', buffer);
    // let scope = this;
    var toolbox = new Toolbox();
    let measure = toolbox.measure;
    let tile2long = toolbox.tile2long;
    let tile2lat = toolbox.tile2lat;
    // let lonOri, latOri;
    let tile = new THREE.Object3D();
    tile.name = "Parcel tile " + tileId.z +"/"+tileId.x+"/"+tileId.y;
    
    let bounds = {
            minLon: tile2long(tileId.x, tileId.z),
            maxLon: tile2long(tileId.x + 1, tileId.z),
            minLat: tile2lat(tileId.y + 1, tileId.z),
            maxLat: tile2lat(tileId.y, tileId.z)
        }
        // console.log('bounds:', JSON.stringify(bounds));
    let lonOri = bounds.minLon;
    let latOri = bounds.maxLat;
    let nodes = {};
    let buildings = {};
    let buildingBlocks = [];
    let buildingParts = {};
    // TODO: deal with empty data ( {} )
	var lineArray = buffer.split(/\r\n|\r|\n/g);
    
    // Process data here
    // console.log('buildings.length:', buildings.length);
    // Parse all buildings
	for (var i = 1, l = lineArray.length; i < l; i++) {
		var line = lineArray[i].split(';');
		// console.log(line);
		if (line.length <= 1) continue;
		
        let buildingMesh = new THREE.Object3D();

		var data = {
			id: line[0],
			section: line[1],
			number: line[2],
			surface: line[3],
			height: line[4],
			index: [0, 1],
			colors: {
				parcel: 0x666666,
				extrusion: 0xdddddd,
				wireframe: 0x444444,
				roof: 0xdddddd,
			},
			coordinates: THREE.ParcelJsonLoader.parseCoordinates(line[5])
		}

		var n = 0;
		// if (i == 1) {

		// 	center = new THREE.Vector2(data.coordinates[0], data.coordinates[1]);
		// 	console.log(center);

		// }
        let shapePts = [];
        
        // console.log('data.coordinates:', data.coordinates, lonOri);
		while (n < data.coordinates.length) {
		    
			var lon = data.coordinates[n];
			var lat = data.coordinates[n + 1];
            let x = ((lon - lonOri) / Math.abs(lonOri - lon)) * measure(latOri, lonOri, latOri, lon);
            let y = ((lat - latOri) / Math.abs(latOri - lat)) * measure(latOri, lonOri, lat, lonOri);
			shapePts.push(new THREE.Vector2(x*.5, y*.5));
			
			n = n + 2;
		}
		
        // console.log('shapePts:', shapePts);
        let shape = new THREE.Shape(shapePts);
		shape.autoClose = true;
		shape.name = "Shape " + data.id;
		
		data.shape = shape;
		
        let extrudeSettings = {
            amount: 100,
            bevelEnabled: false,
            bevelSegments: 1,
            steps: 1,
            bevelSize: 2,
            bevelThickness: 1
        };
        let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        let material = new THREE.MeshPhongMaterial({
            // color: color,
            transparent: false,
            opacity: 0.4
        });
        // let material = new THREE.MeshPhongMaterial({
        //     color: color,
        //     transparent: false,
        //     opacity: Math.random()
        // });
        if (tileId.lod == 4) {
            material.transparent = true;
        }

        let parcelMesh = new THREE.Mesh(geometry, material);
        parcelMesh.userData = data;

        parcelMesh.name = "Parcel mesh";
        // buildingBlockMesh.position.z = minHeight;
        // buildingMesh.add(buildingBlockMesh);
        toolbox.assignUVs(geometry);
            // }
        // console.log('buildingMesh:', buildingMesh.geometry);
        tile.add(parcelMesh);
    }
    
    console.log(tile)
    return tile;
    // }
}
THREE.ParcelJsonLoader.parseCoordinates = function(buffer) {
    buffer = buffer.slice(10, -2);
	var array = buffer.split(/[\s,]/g);
	array = array.map(x => parseFloat(x));

	return array;
}