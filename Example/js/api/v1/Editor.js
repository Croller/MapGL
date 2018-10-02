var Editor;
(function (){
	
    Editor = function( world ){
    	
    	this.world = world;
        //La caméra :
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
		this.camera.position.z = 80;
		this.camera.position.y = 50;
		this.camera.position.x = 80;
		this.camera.up = new THREE.Vector3(0,0,1)
		
		this.scene = this.world.scene;
		// this.sceneHelpers = new THREE.Scene();
		
	// this.sceneHelpers.background = new THREE.Color( 0xaaaaaa );
		this.selectionMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFFF})
		
    	this.layerSelector = document.getElementById("layerSelector");
    	this.parcelListContainer = document.getElementById("parcelListContainer");
    	this.parcelList = document.getElementsByClassName("parcelList")[0].cloneNode(true);
    	this.parcelName = document.getElementById("parcelName");
    	this.inputFloorHeight = document.getElementById("inputFloorHeight");
    	this.inputGroundHeight = document.getElementById("inputGroundHeight");
    	this.inputFloors = document.getElementById("inputFloors");
    	this.totalSurface = document.getElementById("totalSurface");
    	
    	this.roofEnabled = document.getElementById("roofEnabled");
    	this.roofIncluded = document.getElementById("roofIncluded");
    	this.roofAngle = document.getElementById("roofAngle");
    	this.roofHeight = document.getElementById("roofHeight");
    	
    	this.maxFootprintSurface = document.getElementById("maxFootprintSurface");
    	this.footprintSurface = document.getElementById("footprintSurface");
    	this.buildingSurface = document.getElementById("buildingSurface");
    	this.buildingHeight = document.getElementById("buildingHeight");
    	
    	this.parcels = new THREE.Object3D();
    	this.footprints = new THREE.Object3D();
    	
    	this.currentParcels= [],
    	this.currentFootprint;
    	
    	this.objectsToAnimate = [];
		this.selected = {};
		this.sceneSize = 1;
		this.sceneCenter = new THREE.Vector3();
		
		this.edgeHelpers = new THREE.Object3D();
		this.edgeHelpers.name = "EdgeHelper";
		// this.scene.add(this.edgeHelpers);
		
		this.MAX_POINTS = 20;
		this.drawCount = 0;
		// geometry
		this.edge;
		this.resetEdge();
		this.edges = [];
		
		// this.scene.add(this.edge);
		this.scene.add(this.parcels);
		this.scene.add(this.footprints);
		
    }
    
    Object.assign( Editor.prototype, {
    	
    	updateUIList: function( parcels ){
        	
        	if(!parcels.length) {
        		var parcelListContainer = document.getElementById("parcelListContainer");
                    parcelListContainer.style.display = "none";
                
                var infoPanel = document.getElementById("infoPanel");
                	// infoPanel.style.display = 'none';
        	} else {
        		var parcelListContainer = document.getElementById("parcelListContainer");
                    parcelListContainer.style.display = "block";
                
                var infoPanel = document.getElementById("infoPanel");
                	infoPanel.style.display = 'block';
        	}
        	
        	var self = this;
			var parcelClone = this.parcelList;
        	while(this.parcelListContainer.firstChild !== null){
        		
        		this.parcelListContainer.removeChild(this.parcelListContainer.firstChild );
        		
        	}
        	var totalSurface = 0;
        	
        	parcels.forEach(function(parcel){
        	
	        	var data = parcel.userData;
	        	
	        	if(parcelClone.length)
	        		parcelClone = parcelClone.cloneNode(true);
	        	else 
	        		parcelClone = parcelClone.cloneNode(true);
	        	
	        	parcelClone.getElementsByClassName("parcelName")[0].innerHTML = data.name;
	        	var surface = Math.floor(data.surface * 100) / 100;
	        	totalSurface += surface;
	        	parcelClone.getElementsByClassName("parcelSurface")[0].innerHTML = surface;
	        	
		    	// this.parcelName.innerHTML =  data.name;
		    	// this.inputSurface.innerHTML = Math.floor(data.surface * 100) / 100;
		    	
		    	self.parcelListContainer.appendChild(parcelClone);
		    	
        	});
        	this.totalSurface.innerHTML = totalSurface;
	    	// this.roofIncludes.value = data.height;
	    	
        },
        
        select: function(object){
        	
        	if( !object ) return this.selected = null;
        	
            if ( this.selected === object ) return;
            
           // if( this.selected.lastMaterial !== undefined ) {
                
           //     this.selected.material = this.selected.lastMaterial;
           //     if( this.selected.data !== undefined && this.selected.children[1] !== undefined )
			        // this.selected.children[1].material = this.selected.lastMaterial;
			        
           // }
            
            //si c'est une parcelle
    //         if(object.data !== undefined) {
            
    //             console.log(object.name);
    // //             object.lastMaterial = object.material;
                
			 ////   if(object.data !== undefined && object.children[1] !== undefined)
			 ////       object.children[1].lastMaterial = object.children[1].material;
			        
    //             object.material = this.selectionMaterial;
			 //   if(object.children[1] !== undefined)
			 //       object.children[1].material = this.selectionMaterial;
    //         }
    
    		this.selected = object;
    		
    		if( object && object.data !== undefined ) {
    			this.parcelSelector.value = object.userdata.id;
    			this.inputFloors.value = object.userdata.floors;
    			this.inputFloorHeight.value = Math.floor(object.userdata.height * 100) / 100;
    			this.inputSurface.innerHTML = Math.floor(object.userdata.surface * 100) / 100 ;
    			let rs = this.roofSelector;
    			for(var i = 0; i < rs.length; i++) {
					rs[i].checked = false;
					if(rs[i].value == object.userdata.section) {
						rs[i].checked = true;
					}
				}
    		}
    		    
    		    
    		//this.signals.objectSelected.dispatch( object );
            
        },
        
        removeObject: function ( object ) {

			if ( object.parent === null ) return; // avoid deleting the camera or scene
	
			// var scope = this;
	
			// object.traverse( function ( child ) {
	
			// 	scope.removeHelper( child );
	
			// } );
	
			object.parent.remove( object );
	
		},
		
        centerScene: function(object){
        	
	        var bb = new THREE.Box3();
	        //var material = this.unselectedMaterial;
	        
	        if(object) {
	        	
	        	bb.union(new THREE.Box3().setFromObject(object));
	        	
	        } else {
		        this.parcels.forEach(function(_object){
		        	
		            bb.union(new THREE.Box3().setFromObject(_object));
		            //object.material = material;
		        });
	        }
	        var ext = {x: bb.max.x - bb.min.x, y: bb.max.y - bb.min.y, z: bb.max.z - bb.min.z};
	        //this.scene.position.set(ext.x * -.5 - bb.min.x, ext.y * -.5 - bb.min.y, ext.z * -.5 - bb.min.z);
	        this.sceneSize = Math.max(ext.x, ext.y, ext.z);
	        
	        this.sceneCenter = bb.getCenter();
	        this.sceneCenter.z = 0;
	        this.world.camera.position.set(this.sceneSize, this.sceneSize, this.sceneSize);
	        
	        this.world.camera.lookAt(bb.getCenter());
	        
	    },
	    
	    zoomOnParcel: function(parcel){
        	
	        var bb = new THREE.Box3();
	        //var material = this.unselectedMaterial;
	        
	        bb.union(new THREE.Box3().setFromObject(parcel));
	        
	        var ext = {x: bb.max.x - bb.min.x, y: bb.max.y - bb.min.y, z: bb.max.z - bb.min.z};
	        //this.scene.position.set(ext.x * -.5 - bb.min.x, ext.y * -.5 - bb.min.y, ext.z * -.5 - bb.min.z);
	        this.sceneSize = Math.max(ext.x, ext.y, ext.z);
	        
	        this.sceneCenter = bb.getCenter();
	        // this.sceneCenter.y = 0;
	        this.world.camera.position.set(this.sceneSize, this.sceneSize, this.sceneSize);
	        
			this.world.setCenter( parcel.userData.centerLon, parcel.userData.centerLat );
	        
	    },
	    
	    addPointToEdge(parcel, line, point, index){
	    	
			// var positions = line.geometry.attributes.position.array;
			if(parcel.drawCount == undefined) parcel.drawCount = 0;
			var index = parcel.drawCount * 3;
			
			var helperGeo = new THREE.CylinderBufferGeometry( 0.5, 0.5, 1, 8 );
		    var helper = new THREE.Mesh(helperGeo, new THREE.MeshPhongMaterial({color: 0xFF0000}));
			// helper.castShadow = true;
			helper.name = "EdgeHelper";
			// helper.receiveShadow = true;
			helper.index = parcel.drawCount;
			helper.position.copy(point);
			helper.position.z = 0;
			helper.rotation.x = Math.PI * .5;
			
			var edgeHelpers = parcel.getObjectByName("EdgeHelpers");
			edgeHelpers.add(helper)
			// world.lastSelectedParcel.helpers.push()
			parcel.edgePositions[ index ++ ] = point.x;
			parcel.edgePositions[ index ++ ] = point.y;
			parcel.edgePositions[ index ++ ] = 0.15;
			
			parcel.drawCount++;
			parcel.edge.geometry.setDrawRange( 0, parcel.drawCount );
			parcel.edge.geometry.attributes.position.needsUpdate = true;
			
			if(parcel.drawCount >= 3) {
				
				parcel.userData.footprintSurface = this.getArea(parcel.edge.geometry.attributes.position.array, parcel.drawCount);
				
				// console.log("add point", parcel.userData, parcel.edge.geometry.attributes.position.array);
				// this.extrudeShape(parcel);
				
			}
	    	
	    },
	    
	    setEdgeHelperFromEdge(){
	    	console.log(this.edge.geometry.attributes.position.array)
	    	for (var i = 0; i < this.edge.geometry.attributes.position.array.length; i++) {
	    		
	   // 		var helperGeo = new THREE.CylinderBufferGeometry( 0.5, 0.5, 1, 8 );
			 //   var helper = new THREE.Mesh(helperGeo, new THREE.MeshPhongMaterial({color: 0xFF0000}));
				// // helper.castShadow = true;
				// helper.name = "EdgeHelper";
				// // helper.receiveShadow = true;
				// helper.index = this.drawCount;
				// helper.position.copy(point);
				// helper.position.z = 0;
				// helper.rotation.x = Math.PI * .5;
				
				// this.edgeHelpers.add(helper)
	    	}
	    	
	    },
	    
	    resetEdge(){
	    	
        	if(!this.currentParcels.length) return;
        	var self = this;
        	// world.lastSelectedParcel.helpers = [];
	    	this.currentParcels.forEach(function(parcel) {
	    	    
	    	    var edgeHelpers = parcel.getObjectByName("EdgeHelpers");
	    	    if( edgeHelpers !== undefined ) parcel.remove(edgeHelpers);
		    	
				parcel.drawCount = 0;
		    	
				parcel.edgeGeometry = new THREE.BufferGeometry();
				parcel.edgePositions = new Float32Array( self.MAX_POINTS * 3 ); // 3 vertices per point
				parcel.edgeGeometry.addAttribute( 'position', new THREE.BufferAttribute( parcel.edgePositions, 3 ) );
				parcel.edgeGeometry.setDrawRange( 0, parcel.drawCount );
				parcel.edgeMaterial = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 3 } );
			
				var newEdge = new THREE.Line( parcel.edgeGeometry,  parcel.edgeMaterial );
				newEdge.name = "Edge";
				
				var newEdgeHelpers = new THREE.Object3D();
				newEdgeHelpers.name = "EdgeHelpers";
			
		    	parcel.edge = newEdge;
		    	parcel.add(newEdgeHelpers);
		    	
	    	})
	    	
	    	
	    },
	    
	    updateLine(parcel, line, index, point) {
	    	
	    	var offset = index * 3;
	    	
	    	parcel.edgePositions[ offset ++ ] = point.x;
			parcel.edgePositions[ offset ++ ] = point.y;
			parcel.edgePositions[ offset ++ ] = 0.1;
	    	
			parcel.edge.geometry.attributes.position.needsUpdate = true;
			
			parcel.userData.footprintVertices[index].x = point.x;
			parcel.userData.footprintVertices[index].y = point.y;
			
			parcel.userData.footprintSurface = this.getArea(parcel.edge.geometry.attributes.position.array, parcel.drawCount);
			
			this.extrudeShape(parcel);
			
	    },
	    
	    getArea(points, drawCount){
	    	// console.log(points)
	    	var count = drawCount !== undefined ? drawCount : points.length / 3;
	    	var array = [];
	    	for (var i = 0; i < count * 3; i+=3) {
	    		array.push(new THREE.Vector2(points[i], points[i+1]))
	    	}
	    	
	    	return Math.floor(THREE.ShapeUtils.area(array)*100)*-.01;
	    },
	    
	    extrudeShape(parcel) {
	    	
	    	if( event!=undefined ) event.preventDefault();
	    	var lastExtrusion = parcel.getObjectByName("Extrusion");
	    	if( lastExtrusion != undefined ) 
	    		parcel.remove( lastExtrusion );
	    	
	    	var array = [];
	    	
	    	for (var i = parcel.drawCount -1; i >= 0; i--) {
	    		
	    		let offset = i * 3;
	    		array.push(new THREE.Vector2(parcel.edge.geometry.attributes.position.array[offset],
	    									 parcel.edge.geometry.attributes.position.array[offset+1]));
	    		
	    	}
	    	
	    	var shape = new THREE.Shape(array);
	    	shape.autoClose = true;
	    	
	    	var footprint = THREE.ParcelJsonLoader.createParcel(shape);
	    	footprint.name = "Footprint";
	    	
        	var data = parcel.userData;
	    	
	    	var height  = (data.floorHeight * data.floors) + data.groundHeight;
	    	
	    	if ( data.roofEnabled == true ) {
	    		
		    	let roofSettings = {
		    		amount: 0,
		            bevelEnabled: true,
		            bevelSegments: 1,
		            steps: 1,
		            bevelSize: data.roofAngle * .1,
		            bevelThickness: data.roofHeight
		    	}
		    	
		    	var roof = THREE.ParcelJsonLoader.createRoofExtrusion(shape, roofSettings);
		    	if(data.roofIncluded) {
		    		
		    		height -= data.floorHeight;
		    		roof.position.z = data.roofHeight + height;
		    	
		    	} else {
		    		
		    		roof.position.z = data.roofHeight + height;
		    		
		    	}
		    	
	    	}
	    	
	    	let extrudeSettings = {
	            amount: height,
	            bevelEnabled: false
	        };
	        
	    	var extrusion = THREE.ParcelJsonLoader.createExtrusion(shape, null, extrudeSettings);
	    	extrusion.name = "Extrusion";
	    	var floors = THREE.ParcelJsonLoader.createFloors(footprint.geometry, 
	    													 data.floors,
	    													 data.floorHeight, 
	    													 data.groundHeight);
	    	floors.name = "Floors";
	    	extrusion.add(floors);
	    	if(roof !== undefined) extrusion.add(roof);
	    	parcel.add(extrusion);
	    	
	    	var edgeHelpers = parcel.getObjectByName("EdgeHelpers");
	    	edgeHelpers.scale.z = height;
	    	edgeHelpers.position.z = (height * .5);
	    	
	    	this.world.render();
	    	
	    },
	    
        updateUI: function(){
        	
        	if(!this.currentParcels.length) return;
        	
        	var maxFootprintSurface = 0;
	    	var footprintSurface = 0;
	    	var buildingSurface = 0;
        	this.currentParcels.forEach(function(parcel){
        	
	        	var data = parcel.userData;
	        
		    	// this.parcelName.innerHTML =  data.name;
	        	this.inputFloorHeight.value = data.floorHeight;
		    	this.inputGroundHeight.value = data.groundHeight;
		    	// this.inputSurface.innerHTML = Math.floor(data.surface * 100) / 100;
		    	this.inputFloors.value = data.floors;
		    	
		    	this.roofIncluded.value = data.roofIncluded;
		    	this.roofAngle.value = data.roofAngle;
		    	this.roofHeight.value = data.roofHeight;
		    	
		    	// var height = 0;
		    	maxFootprintSurface += Math.floor(data.maxFootprintSurface * 100) / 100 ;
	    		footprintSurface += Math.floor(data.footprintSurface * 100) / 100 ;
		    	buildingSurface += Math.floor(data.footprintSurface * data.floors * 100) / 100;
		    	
		    	if(data.roofEnabled){
		    		
			    	if(!data.roofIncluded){
			    		
			    		data.height = (data.floorHeight * data.floors) + data.groundHeight + data.roofHeight;
			    		
			    	} else {
			    		
		    			data.height = (data.floorHeight * (data.floors-1)) + data.groundHeight + data.roofHeight;
		    			
			    	}
			    	
		    	} else {
		    		
		    		data.height = (data.floorHeight * data.floors) + data.groundHeight;
		    		
		    	}
		    	
		    	this.buildingHeight.innerHTML = data.height;
        	});
	    	this.maxFootprintSurface.innerHTML = maxFootprintSurface;
	    	this.footprintSurface.innerHTML = footprintSurface;
	    	this.buildingSurface.innerHTML = buildingSurface;
	    	// this.roofIncludes.value = data.height;
	    	
        },
        
        
        updateParcel: function(parcel){
	    	
	    	// console.log("update parcel", parcel);
    		var data = parcel.userData;
    	
        	data.floors = parseInt(this.inputFloors.value);
        	data.floorHeight = parseFloat(this.inputFloorHeight.value);
        	
        	data.roofHeight = parseFloat(this.roofHeight.value);
        	data.roofAngle = parseFloat(this.roofAngle.value);
        	
        	data.roofEnabled = this.roofEnabled.checked;
        	data.roofIncluded = this.roofIncluded.checked;
        	
        	if( data.roofEnabled == true && data.roofHeight == 0.0 && data.roofAngle == 0.0) {
        		
		    	this.roofHeight.value = data.roofHeight = 2.5;
		    	this.roofAngle.value = data.roofAngle = 35.0;
		    	
        	}
        	
        	data.groundHeight = parseFloat(this.inputGroundHeight.value);
        	data.buildingSurface = parseFloat(this.inputFloors.value * data.footprintSurface);
        	this.buildingSurface.innerHTML = data.buildingSurface.toString();
        	
	    	console.log("update parcel",parcel, data);
    		this.extrudeShape(parcel);
			
        },
        
        updateParcels: function(){
        	var self = this;
        	this.currentParcels.forEach(function(parcel){
	        	
        		self.updateParcel(parcel);
        		
        	})
        	
        },
        
        changeLinear: function(){
				
			let value = this.parcelSelector.value;
			var object = this.scene.getObjectByName( "Parcel " + value );
        	object.remove( object.children[1] );
        	
        	for (var i = 0, l = this.parcels.length; i < l; i++) {
        		if(this.parcels[i].data.id == value) {
        			var parcel = this.parcels[i];
        			let pointsArray = parcel.data.shape.extractPoints().shape;
        	
	            	parcel.data.index = parcel.data.index.map(function(i){
	            		return i < pointsArray.length-2 ? i+1 : 0;
	            	});
	            	var cityManager = new CityManager();
	            	
        			let extrudeSettings = { amount: parcel.data.height, bevelEnabled: false, bevelSegments: 0, steps: 1, bevelSize: 0, bevelThickness: 0 };
	            	let plane = cityManager.generateSlicePlane(pointsArray, parcel.data.index[0], parcel.data.index[1]);
	            	let extrusion = cityManager.generateExtrusion(parcel.data.shape, plane, extrudeSettings);
	            	parcel.add(extrusion);
	            	parcel.children[1].material.color.setHex(parcel.data.colors.extrusion);
	            	parcel.children[1].name = "Extrusion " + parcel.data.id;
	            	this.addObjectWithAnimation(parcel.children[1]);
        		}
        	}
            	
		},
		
		changeLayer: function(){
				
			let value = this.layerSelector.value;
			
			this.world.hideLayer(value);
			
			
            	
		},
	    
	    centerParcels: function(){
        	
	        var bb = new THREE.Box3();
	        
	        this.parcels.forEach(function(object){
	        	
	            bb.union(new THREE.Box3().setFromObject(object));
	            
	        });
	        
	        var ext = {x: bb.max.x - bb.min.x, y: bb.max.y - bb.min.y, z: bb.max.z - bb.min.z};
	        
	        this.sceneSize = Math.max(ext.x, ext.y, ext.z);
	        var center = bb.getCenter();
	        
	        this.parcels.forEach(function(object){
	        	
	           object.position.sub(center)
	           
	        });
	        
	    },
        
        selectParcel: function(){
        	
            let value = this.parcelSelector.value;
			this.select(this.scene.getObjectByName( "Parcel " + value ));
			
        },
        
        hideBuild: function(){
        	
            this.customBuild.visible = false;
			
        },
        
		
		addObjectWithAnimation: function(object) {
			object.scale.z = 0.01;
			//this.parcels.push(object);
			// this.scene.add(object);
			this.objectsToAnimate.push(object);
		}
        
    })
}());