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

var citySelector = document.getElementById("citySelector");
var service = new Service();

    
init();
//animate();

var editor;

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

//Initialisation
function init() {
	
    //Init Viewer
	editor = new Editor();
	
	
	scene = editor.scene;
	scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
	scene.fog = new THREE.Fog( scene.background, 1, 5000 );
	// LIGHTS
	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 50, 0 );
	scene.add( hemiLight );
	hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
	//scene.add( hemiLightHelper );
	//
	dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( -1, 1.75, 1 );
	dirLight.position.multiplyScalar( 30 );
	scene.add( dirLight );
	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 4096;
	dirLight.shadow.mapSize.height = 4096;
	var d = 500;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;
	dirLight.shadow.camera.far = 3500;
	dirLight.shadow.bias = 0.00001;
	dirLightHeper = new THREE.DirectionalLightHelper( dirLight, 10 ) 
	//scene.add( dirLightHeper );
	// GROUND
	var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
	var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
	groundMat.color.setHSL( 0.095, 1, 0.75 );
	var ground = new THREE.Mesh( groundGeo, groundMat );
	ground.rotation.x = -Math.PI/2;
	ground.position.y = -0.1;
	// scene.add( ground );
	ground.receiveShadow = true;
	// SKYDOME
	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
		topColor:    { value: new THREE.Color( 0x0077ff ) },
		bottomColor: { value: new THREE.Color( 0xeeeeff ) },
		offset:      { value: 33 },
		exponent:    { value: 0.6 }
	};
	uniforms.topColor.value.copy( hemiLight.color );
	scene.fog.color.copy( uniforms.bottomColor.value );
	var skyGeo = new THREE.SphereGeometry( 1000, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
	var sky = new THREE.Mesh( skyGeo, skyMat );
	editor.scene.add( sky );
	
    
	viewport = new Viewport( editor );
	
	window.addEventListener('resize', viewport.onWindowResize, false);
	
	window.addEventListener('keydown', function(event) {

        switch (event.keyCode) {

            case 32: 
                console.log("space");
                
                nextLinear(1);
                break;
                
            case 109 :
            	console.log("-");
            	
            	if(speed > 0)
					speed -= 0.001;
				
				break;
			case 107 :
				console.log("+");
				
				if(speed < 10)
					speed += 0.001;
			
				break;
		}
	});
	
	document.addEventListener('dragover', function(event) {

        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';

    }, false);
    
	document.addEventListener('drop', function(event) {

        event.preventDefault();

        if (event.dataTransfer.files.length > 0) {

           loadFile(event.dataTransfer.files[0]);

        }

    }, false);
    
	//Parcel handler
    
	var array = [25,25,25,-25,-25,-25,-25,25];
	var vectices = [];	
	for (var i = 0; i < array.length; i+=2) {
		
		vectices.push(new THREE.Vector2(array[i], array[i+1]));
		
	}
	
	var shape = new THREE.Shape(vectices);
	shape.autoClose = true;
	
	var parcel = THREE.ParcelJsonLoader.createParcel(shape);
	parcel.material = new THREE.MeshPhongMaterial({color: 0xF5F6A6});
	parcel.name = "parcel";
	parcel.shape = shape;
	var area = THREE.ShapeUtils.area(vectices);
	
	parcel.userData = {
		name: "Custom parcelle",
		surface: area * -1,
		floorsHeight: 2.5,
		groundHeight: 4.5,
		floors: 3,
		number: 123,
		section: "NA",
		roofIncluded: true,
		roofAngle: 3,
		roofHeight:3
	};
	
	editor.parcels.add( parcel );
	editor.currentParcel = parcel;
	
	var slicePlane = THREE.ParcelJsonLoader.createSlicePlane(vectices, 1, 2);
	
	var footprintShape = THREE.ParcelJsonLoader.createSlicedShape(shape, slicePlane);
	var footprintVertices = footprintShape.extractPoints().shape;
	var shapeGeometry = new THREE.ShapeGeometry(footprintShape);
	
	var footprint =  new THREE.Mesh(shapeGeometry, new THREE.MeshPhongMaterial());
	footprint.name ="footprint";
	footprint.position.z = 0.1;
	
	editor.footprints.add(footprint);
	editor.currentFootprint = footprint;
	
	var footprintSurface = Math.floor(THREE.ShapeUtils.area(footprintVertices) * 100) *-.01;
	parcel.userData.footprintSurface = footprintSurface;
	parcel.userData.maxFootprintSurface = footprintSurface;
	parcel.userData.buildingSurface = footprintSurface * parcel.userData.floors;
	
	editor.updateUI();
	
	for (var i = 0; i < footprintVertices.length; i++) {
		editor.addPointToLine(editor.limit, footprintVertices[i]);
	}
	
	editor.extrudeShape();
	
}

function addObjectWithAnimation(object) {
	object.scale.z = 0.01;
	objects.push(object);
	//scene.add(object);
	viewport.objectToAnimateAdded (object);
}

function nextLinear(index){
	var shape = shapes[index];
	var extrudeSettings = { amount: shape.floors * 2.5, bevelEnabled: false, bevelSegments: 0, steps: shape.floors * 1, bevelSize: 0, bevelThickness: 0 };
	var extrusionName = shape.name.replace("shape_", "extrusion_");
	var object = scene.getObjectByName( extrusionName );
	scene.remove( object );
	
	var pointsArray = shapes[index].extractPoints().shape;
	
	shape.index = shape.index.map(function(i){
		return i < pointsArray.length-2 ? i+1 : 0;
	});
	
	var shpLoader = new SHPLoader();
	var plane = shpLoader.generateSlicePlane(pointsArray, shape.index[0], shape.index[1]);
	var newExtrusion = shpLoader.generateExtrusion(shapes[index], plane, extrudeSettings);
	newExtrusion.name = extrusionName;
	extrusions[index] = newExtrusion;
	
	addObjectWithAnimation(newExtrusion);
	
}

function loadFile(data) {
	
	var parcelLoader = new THREE.ParcelJsonLoader();
	
	// var parcels = parcelLoader.parse(data)
    
    console.log(parcelLoader, parcels, THREE.ParcelJsonLoader)
    
	// for (var i = 0; i < result.length; i++) {
	// 	// scene.add(result[i]);
	// 	// result[i].rotation.x = Math.PI/2;
	// 	//editor.objects.push(result[i]);
	// 	let option = document.createElement("option");
	// 	option.setAttribute("value", result[i].data.id);
	// 	option.innerHTML = result[i].data.id;
	// 	editor.parcelSelector.appendChild(option);
	// 	//scene.add(result[i].slicer);
	// 	if(result[i].height > 0)
	// 		editor.addObjectWithAnimation(result[i].children[1]);
	// }
		// editor.centerScene();
		
	
	// city.load('./data/parcelle_forme.csv', function(result) {
		
	// 	editor.parcels = editor.parcels.concat(result); 
		
	// 	for (var i = 0; i < result.length; i++) {
	// 		scene.add(result[i]);
			
	// 		//editor.objects.push(result[i]);
	// 		let option = document.createElement("option");
	// 		option.setAttribute("value", result[i].data.id);
	// 		option.innerHTML = result[i].data.id;
	// 		editor.parcelSelector.appendChild(option);
	// 		//scene.add(result[i].slicer);
	// 		if(result[i].height > 0)
	// 			editor.addObjectWithAnimation(result[i].children[1]);
	// 	}
		
	
		
	// },
	// undefined,
	// function(error){
	// 	console.log("error", error);
	// });

}

