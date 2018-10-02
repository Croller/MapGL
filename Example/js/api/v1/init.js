//On check si le navigateur est compatible
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var THREE = THREE;
//On décrit les variables
var container;
var editor, viewport;
var camera, scene, renderer, controls, infos, cube, dirLight, dirLightHeper, hemiLight, hemiLightHelper;
var shapes = [],
	osmShapes = [],
	parcels = [], 
	extrusions = [];
var rotate = true;
var objects = [];

var infoPanel = document.getElementById("infoPanel");
	// infoPanel.style.display = 'none';
var messagePanel = document.getElementById("messagePanel");
var editorPanel = document.getElementById("editorPanel");
	editorPanel.style.display = 'none';
var service = new Service();
    
//init();
//animate();
var lat = 47.246911142596,
	lon = -1.52280576211165;

var map = new OSM("OpenStreetMap", [
		            "https://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
		            "https://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
		            "https://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
		        ]);
		        
let bbox = '${tile2lat(y+1)},${tile2long(x)},${tile2lat(y)},${tile2long(x+1)}'
let url1 = 'https://overpass-api.de/api/interpreter' +
	'?data=[out:json];(' +
	'(relation["type"="building"](' + bbox + ');>;);' +
	'(way["building"](' + bbox + ');>;););' +
	'out center;';
	
var overpassBuilbing = new OverpassBuilding(
			'Overpass', [url1], {
				minZoom: 14,
				localData: 'https://webgl-twistengine.c9users.io/buildingData/${z}/${x}/${y}.json',
				maxRequest: 3
			})

let url2 = 'https://webgl-twistengine.c9users.io/parcel?bbox='+ bbox;

var parcelLayer = new ParcelLayer(
			'ParcelKelquartier', [url2], {
				minZoom: 14,
				maxRequest: 3
			})

let url3 = 'https://data.osmbuildings.org/0.2/anonymous/tile/15/${x}/${y}.json';

var osmBuildings = new OSMBuildings(
			'OSMBuildings', [url3], {
				minZoom: 14,
				maxRequest: 3
			})
var world = new World("viewer")

world.addLayer(map);
// world.addLayer(overpassBuilbing, THREE.OverpassJsonLoader.getSingleton());
world.addLayer(osmBuildings, THREE.OSMBuildingsLoader.getSingleton());
world.addLayer(parcelLayer, THREE.ParcelJsonLoader.getSingleton());

world.setPosition(lon, lat, 200, 1, 0);

var setLayer = function() {
	var layerSelector = document.getElementById("layerSelector");
	// var parcelCheckbox = document.getElementById("parcelCheckbox");
    // console.log('Hide layer:', this.layers, layerSelector.value, parcelCheckbox.value);
    
    if(layerSelector.value == "building") {
    	
        // world.loaders["Parcel"].loadedTile = [];
        // world.removeLayer("Parcel");
        world.parcels.visible = false;
        // while (world.parcels.children.length) {
        // 	world.parcels.remove(world.parcels.children[0]);
        // }
		world.addLayer(overpassBuilbing, THREE.OverpassJsonLoader.getSingleton());
	}
        
    if(layerSelector.value == "parcel") {
        world.removeLayer("Overpass");
        world.parcels.visible = true;
        
    }
    world.updateScene({lon: lon, lat: lat});
}

var editor = new Editor(world);

function removeUselessPoints() {
	function getAngle(v1,v2,v3){
		var v1 = new THREE.Vector2(3,1)
		var v2 = new THREE.Vector2(1,1)
		var v3 = new THREE.Vector2(1,3)
		
		v2.sub(v1)
		v3.sub(v1)
		
		var theta = v2.dot( v3 ) / ( Math.sqrt( v2.lengthSq() * v3.lengthSq() ) )

		console.log( theta, Math.acos(theta) * 180 / Math.PI  );//Math.acos( Math.clamp( theta, - 1, 1 ) ))
	}
}

removeUselessPoints();

function finish(){
	
	editor.resetEdge();
	
	var index = world.lastSelectedParcel.names = [];
	
	world.lastSelectedParcel.parcels.forEach(function(parcel) {
		
	    parcel.material = new THREE.MeshPhongMaterial({color: colors.parcel, opacity: 0.1, transparent: true});
	    var footprint = parcel.getObjectByName('footprint');
	    if( footprint !== undefined ) footprint.visible = false;
	    
	});
	
	world.lastSelectedParcel.parcels = [];
	//if it's not edited we remove it from the scope
	
	world.render();
	editor.updateUIList( [] );
	editorPanel.style.display = 'none';
}

function cancel(){
	
	world.lastSelectedParcel.parcels.forEach(function(parcel) {
		
	    parcel.material = new THREE.MeshPhongMaterial({color: colors.parcel, opacity: 0.1, transparent: true});
	    var footprint = parcel.getObjectByName('footprint');
	    if( footprint !== undefined ) footprint.visible = false;
	    
	});
	
	world.lastSelectedParcel.parcels = [];
	
	editor.resetEdge();
	editorPanel.style.display = 'none';
	
}
var stopSelection =  document.getElementById("stop-selection");
var addParcelButton = document.getElementById("add-parcel");
var removeParcelButton = document.getElementById("remove-parcel");
var finishButton = document.getElementById("finish");
var cancelButton = document.getElementById("cancel");

stopSelection.addEventListener('click', function(){
	document.body.style.cursor = 'default';
	world.selectionMode = "";
	stopSelection.style.display = "none";
	addParcelButton.style.display = "inline-block";
	removeParcelButton.style.display = "inline-block";
	
});
addParcelButton.addEventListener('click', function(){
	document.body.style.cursor = 'copy';
	world.selectionMode = "addParcel";
	stopSelection.style.display = "inline-block";
	addParcelButton.style.display = "none";
	removeParcelButton.style.display = "none";
});
removeParcelButton.addEventListener('click', function(){
	document.body.style.cursor = 'alias';
	world.selectionMode = "removeParcel";
	stopSelection.style.display = "inline-block";
	addParcelButton.style.display = "none";
	removeParcelButton.style.display = "none";
});

finishButton.addEventListener('click', function(){
	
	editorPanel.style.display = 'none';
	
	world.transformControls.detach();
	var parcels = editor.currentParcels = world.lastSelectedParcel.parcels;
	
	parcels.forEach(function(parcel){
		
		var lastBuild = parcel.getObjectByName('Extrusion');
		parcel.userData.extrusions = [lastBuild.uuid];
			
        parcel.userData.prevFootprintVertices = parcel.userData.footprintVertices.map(x => x.clone()) ;
        
        parcel.remove(parcel.getObjectByName("EdgeHelpers"));
        
		world.lastSelectedParcel.names = [];
		
		parcel.material = new THREE.MeshPhongMaterial({color: colors.parcel, opacity: 0.1, transparent: true});
		var footprint = parcel.getObjectByName('Footprint');
		if( footprint !== undefined ) footprint.visible = false;
		
		world.lastSelectedParcel.parcels = [];
		
	});
	
	editor.updateUIList([]);
	world.render();
	
});

cancelButton.addEventListener('click', function(){
	world.loadBuildEnabled = false;
	
	editorPanel.style.display = 'none';
	
	var parcels = editor.currentParcels;
	
	editor.resetEdge();
	world.transformControls.detach();
	parcels.forEach(function(parcel){
        
		
        parcel.userData.footprintVertices = parcel.userData.prevFootprintVertices.map(x => x.clone());
		    
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
		
		world.lastSelectedParcel.names = [];
		
		parcel.material = new THREE.MeshPhongMaterial({color: colors.parcel, opacity: 0.1, transparent: true});
		var footprint = parcel.getObjectByName('Footprint');
		if( footprint !== undefined ) footprint.visible = false;
		
		world.lastSelectedParcel.parcels = [];
		
		
		
		
		//else we keep it
	});
	
	editor.updateUIList([]);
	world.render();
	animate();

	function animate() {

		requestAnimationFrame( animate );

		var r = clock.getElapsedTime();

		// var realTime = Math.round( r * 10 ) / 10; // get decimal 1 value eg. 13.4

		roundedTime = Math.round(r);
		console.log(roundedTime);


		render();
		//stats.update();
		TWEEN.update();

	}

	function render() {

		world.render( scene, camera );

	}
	
});