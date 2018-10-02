var Viewport;
(function() {
	var container, renderer, camera, controls, infos, scene, sceneHelpers;
	var objects = [];
	var objectsToAnimate = [];
	var speed = 0.005;
	var statsEnabled = false;
	var intersected;
	var overMaterial = new THREE.MeshBasicMaterial();

	var selectionMaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00 })

	var objectPositionOnDown;
	var objectRotationOnDown;
	var objectScaleOnDown;

	var box = new THREE.Box3();

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = true;
	
	

	Viewport = function(editor) {
		objects = editor.parcels;
		this.camera = editor.camera;
		camera = this.camera;
		scene = editor.scene;
		sceneHelpers = editor.sceneHelpers;
		sceneHelpers.add(selectionBox);
		this.container = document.getElementById('viewer');
		container = this.container;
		// document.body.appendChild(container);
		
		var limitHelpers = editor.limitHelpers;

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		var renderer = this.renderer;
		renderer.autoClear = false;
		renderer.autoUpdateScene = false;
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.setClearColor(0xffffff, 1);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.shadowMap.renderSingleSided = true;
		container.appendChild(renderer.domElement);
		var canvas = renderer.domElement;

		controls = new THREE.MapNavigation(camera, renderer.domElement);
		controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		controls.dampingFactor = 0.25;
		controls.screenSpacePanning = false;
		controls.minDistance = 50;
		controls.maxDistance = 1000;
		controls.rotateSpeed = 0.5;
		controls.panSpeed = 0.5;
		controls.maxPolarAngle = Math.PI / 2;
		var transformControls = new THREE.TransformControls(camera, renderer.domElement);
		
		var lastHelperPos = new THREE.Vector3();
		
		transformControls.addEventListener('change', function() {

			var object = transformControls.object;
			
			if (object !== undefined) {
				
				if ( object.name == "LimitHelper" ) {
					
					var intersected = getIntersectsTopDown(object.position, editor.footprints.children);
					
					if(intersected.length > 0 && intersected[0].object.name == "footprint") {
						
						object.locked = false;
						editor.updateLine(editor.limit, object.index, object.position);
						
					} else {
						
						object.locked = true;
						object.position.copy(lastHelperPos);
						
					}
					
					lastHelperPos = object.position.clone();
				}

				selectionBox.setFromObject(object);

			}
			
			render();
			


		});
		transformControls.addEventListener('mouseDown', function() {
			
			
			var object = transformControls.object;
			
			objectPositionOnDown = object.position.clone();
			objectRotationOnDown = object.rotation.clone();
			objectScaleOnDown = object.scale.clone();

			controls.enabled = false;

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

			controls.enabled = true;

		});

		scene.add(transformControls);

		if (statsEnabled) {

			infos = new Infos();
			container.appendChild(infos.dom);

		}

		// object picking

		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();

		// events

		function getIntersects(point, objects) {

			mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);

			raycaster.setFromCamera(mouse, camera);

			return raycaster.intersectObjects(objects);

		}
		
		function getIntersectsTopDown(point, objects) {
			
			raycaster.set( point, new THREE.Vector3(0,0,-1) );

			return raycaster.intersectObjects(objects);

		}

		var onDownPosition = new THREE.Vector2();
		var onUpPosition = new THREE.Vector2();
		var onMovePosition = new THREE.Vector2();
		var onDoubleClickPosition = new THREE.Vector2();


		function getMousePosition(dom, x, y) {

			var rect = dom.getBoundingClientRect();
			return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];

		}

		function handleClick() {
			
			transformControls.detach();
			
			if (onDownPosition.distanceTo(onUpPosition) === 0) {

				var intersectFootprint = getIntersects(onUpPosition, editor.footprints.children);
				var intersectHelpers = getIntersects(onUpPosition, limitHelpers.children);
				
				if (intersectHelpers.length > 0) {

					var helper = intersectHelpers[0].object;
					
					editor.select(helper);
					transformControls.attach(helper);

				}
				else if (intersectFootprint.length > 0) {

					var object = intersectFootprint[0].object;
					
					editor.select(object);
					if( object.name == 'footprint' ) editor.addPointToLine(editor.limit, intersectFootprint[0].point);
					
					// transformControls.attach(object);

				}
				else {

					editor.select(null);
					
				}

				render();

			}

		}

		function onMouseMove(event) {
			event.preventDefault();
			var array = getMousePosition(container, event.clientX, event.clientY)
			onMovePosition.fromArray(array);
		}


		function onMouseDown(event) {

			event.preventDefault();

			var array = getMousePosition(container, event.clientX, event.clientY);
			onDownPosition.fromArray(array);

			document.addEventListener('mouseup', onMouseUp, false);

		}

		function onMouseUp(event) {

			var array = getMousePosition(container, event.clientX, event.clientY);
			onUpPosition.fromArray(array);

			handleClick();

			document.removeEventListener('mouseup', onMouseUp, false);

		}

		function onTouchStart(event) {

			var touch = event.changedTouches[0];

			var array = getMousePosition(container, touch.clientX, touch.clientY);
			onDownPosition.fromArray(array);

			document.addEventListener('touchend', onTouchEnd, false);

		}

		function onTouchEnd(event) {

			var touch = event.changedTouches[0];

			var array = getMousePosition(container, touch.clientX, touch.clientY);
			onUpPosition.fromArray(array);

			handleClick();

			document.removeEventListener('touchend', onTouchEnd, false);

		}

		function onDoubleClick(event) {

			var array = getMousePosition(container, event.clientX, event.clientY);
			onDoubleClickPosition.fromArray(array);

			var intersects = getIntersects(onDoubleClickPosition, editor.parcels);

			if (intersects.length > 0) {

				var intersect = intersects[0];

				//signals.objectFocused.dispatch( intersect.object );

			}

		}

		container.addEventListener('mousedown', onMouseDown, false);
		container.addEventListener('mousemove', onMouseMove, false);
		container.addEventListener('touchstart', onTouchStart, false);
		container.addEventListener('dblclick', onDoubleClick, false);
		
		this.onWindowResize = function() {
			
			var dom = container;
			// console.log(camera, dom.clientWidth, dom.clientHeight)
			camera.aspect = dom.clientWidth / dom.clientHeight;
			camera.updateProjectionMatrix();
	
			camera.aspect = dom.clientWidth / dom.clientHeight;
			camera.updateProjectionMatrix();
	
			renderer.setSize( dom.clientWidth, dom.clientHeight );
			render()
		}

		//
		function animate() {
			requestAnimationFrame(animate);
			
			controls.update();
			controls.target = editor.sceneCenter;
			
			// editor.drawCount = ( editor.drawCount + 1 ) % editor.MAX_POINTS;
			// editor.limit.geometry.setDrawRange( 0, editor.drawCount );
		
			// if ( editor.drawCount === 0 ) {
		
			// 	// periodically, generate new data
		
			// 	editor.createLine(editor.limit);
		
			 // required after the first render
		
			// 	editor.limit.material.color.setHSL( Math.random(), 1, 0.5 );
		
			// }
			render();

			if (statsEnabled) infos.update();
		}

		var timer = 0;

		function render() {

			timer += speed;

			//console.log(editor.objectsToAnimate.length)
			if (editor.objectsToAnimate.length) {
				for (var i = 0; i < editor.objectsToAnimate.length; i++) {
					editor.objectsToAnimate[i].scale.z += 0.03;
					if (editor.objectsToAnimate[i].scale.z >= 1) {
						editor.objectsToAnimate.splice(i, 1);
					}
				}
			}

			// raycaster.setFromCamera(mouse, camera);

			// var intersects = getIntersects(onMovePosition, editor.parcels.children);

			// if (intersects.length > 0 && editor.selected) {
			// 	if (intersects[0].object.uuid !== editor.selected.uuid) {
			// 		if (intersected != intersects[0].object) {
			// 			if (intersected && intersected.uuid !== editor.selected.uuid) {
			// 				intersected.material = intersected.lastMaterial;
			// 				if (intersected.children[1] !== undefined)
			// 					intersected.children[1].material = intersected.children[1].lastMaterial;
			// 			}

			// 			intersected = intersects[0].object;

			// 			intersected.lastMaterial = intersected.material;
			// 			// intersected.children[1].lastMaterial = intersected.children[1].material;
			// 			intersected.material = overMaterial;
			// 			if (intersected.children[1] !== undefined) {
			// 				intersected.children[1].lastMaterial = intersected.children[1].material;
			// 				intersected.children[1].material = overMaterial;
			// 			}
			// 		}
			// 	}
			// 	else if (intersected && intersected.uuid !== editor.selected.uuid) {

			// 		intersected.material = intersected.lastMaterial;
			// 		if (intersected.children[1] !== undefined)
			// 			intersected.children[1].material = intersected.children[1].lastMaterial;

			// 		intersected = null;
			// 	}
			// }
			// else {
			// 	if (intersected && editor.selected) {
			// 		if (intersected.uuid !== editor.selected.uuid) {
			// 			intersected.material = intersected.lastMaterial;
			// 			if (intersected.children[1] !== undefined)
			// 				intersected.children[1].material = intersected.children[1].lastMaterial;
			// 		}
			// 	}
			// 	intersected = null;
			// }


			// if(rotate){
			// 	cube.rotation.x = timer * 5;
			// 	cube.rotation.y = timer * 2.5;
			// }
			renderer.render(scene, camera);
			renderer.render(sceneHelpers, camera);
		}

		requestAnimationFrame(animate);
	};
	Object.assign(Viewport.prototype, {
		objectAdded: function(o) {
			objects.push(o);
		},
		objectToAnimateAdded: function(o) {
			objectsToAnimate.push(o);
		},

	})

}());
