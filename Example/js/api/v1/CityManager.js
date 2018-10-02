var CityManager;
(function() {

	CityManager = function(manager) {

		this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
		
		this.center = { x: 0, y: 0 };
		this.scale = 111.95

	};

	Object.assign(CityManager.prototype, {

		/**
		 * Loads an ASCII/Binary FBX file from URL and parses into a THREE.Group.
		 * THREE.Group will have an animations property of AnimationClips
		 * of the different animations exported with the FBX.
		 * @param {string} url - URL of the FBX file.
		 * @param {function(THREE.Group):void} onLoad - Callback for when FBX file is loaded and parsed.
		 * @param {function(ProgressEvent):void} onProgress - Callback fired periodically when file is being retrieved from server.
		 * @param {function(Event):void} onError - Callback fired when error occurs (Currently only with retrieving file, not with parsing errors).
		 */
		load: function(url, onLoad, onProgress, onError) {

			var self = this;

			var resourceDirectory = url.split(/[\\\/]/);
			resourceDirectory.pop();
			resourceDirectory = resourceDirectory.join('/') + '/';

			console.time("data loading");
			var loader = new THREE.XHRLoader(this.manager);
			loader.setPath(this.path);
			loader.setResponseType('text');
			loader.load(url, function(buffer) {

				console.timeEnd("data loading");
				try {

					var scene = self.parse(buffer, resourceDirectory);

					onLoad(scene);

				}
				catch (error) {

					window.setTimeout(function() {

						if (onError) onError(error);

						self.manager.itemError(url);

					}, 0);

				}

			}, onProgress, onError);

		},

		/**
		 * Parses an ASCII/Binary FBX file and returns a THREE.Group.
		 * THREE.Group will have an animations property of AnimationClips
		 * of the different animations within the FBX file.
		 * @param {ArrayBuffer} FBXBuffer - Contents of FBX file to parse.
		 * @param {string} resourceDirectory - Directory to load external assets (e.g. textures ) from.
		 * @returns {THREE.Group}
		 */
		parse: function(buffer, resourceDirectory) {

			var group = new THREE.Group();
			var shapes = [];
			var parcels = [];
			var extrusions = [];
			var lineArray = buffer.split(/\r\n|\r|\n/g);
			var center;
			/*
				0.identifiant;
				1.Section;
				2.Numero;
				3.Surface;
				4.hauteur;
				5.coordonnees_de_la_forme;
			*/
			// console.log(lineArray);
			console.time("parse loop");

			for (var i = 1, l = lineArray.length; i < l; i++) {
				var line = lineArray[i].split(';');
				// console.log(line);
				if (line.length <= 1) continue;

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
					coordinates: this.parseCoordinates(line[5])
				}

				var pointsArray = [];

				var n = 0;
				var o = 2;
				var a = 0;
				// if (i == 1) {

				// 	center = new THREE.Vector2(data.coordinates[0], data.coordinates[1]);
				// 	console.log(center);

				// }

				while (n < data.coordinates.length) {
					var lon = data.coordinates[n];
					var lat = data.coordinates[n + 1];
					let x = ((lon - this.center.x) / Math.abs(this.center.x - lon)) * toolbox.measure(this.center.y, this.center.x, this.center.y, lon);
                	let y = ((lat  - this.center.y) / Math.abs(this.center.y - lat )) * toolbox.measure(this.center.y, this.center.x, lat, this.center.x);
					let v1 = new THREE.Vector2(x, y);
					
					// let v1 = new THREE.Vector2((data.coordinates[n] - this.center.x) * this.scale, ( data.coordinates[n + 1] - this.center.y )* this.scale);
					// let v2 = new THREE.Vector2(data.coordinates[n+o]-center.x, data.coordinates[n+o+1]-center.y);
					// let v3 = new THREE.Vector2(data.coordinates[n+o+2]-center.x, data.coordinates[n+o+3]-center.y);

					// if(n+o < data.coordinates.length) {

					// 	var angle = 360;

					// 	angle = this.getAngle( v1, v2, v3 )

					// 	if( angle < 10 ) {
					// 		o = o+2;
					// 		continue
					// 	} else {
					// 		//console.log(v1,v2)
					// 	pointsArray.push(v1)
					// 		pointsArray.push(v2)
					// 		if(n+o+2 < data.coordinates.length)
					// 			pointsArray.push(v3)
					// 		n = n+o+2;
					// 		o = 2;
					// 	}
					// } else {

					pointsArray.push(v1)
					// pointsArray.push(v2)
					n = n + 2;
					// }

				}
// console.log(pointsArray)
				var shape = new THREE.Shape(pointsArray);
				shape.autoClose = true;

				shape.name = "Shape " + data.id;
				data.shape = shape;

				let parcel = this.createModelFromShape(shape, data);
				parcels.push(parcel);

			}


			return parcels;

		},

		parseCoordinates: function(buffer) {
			/* buffer look like it :
				POLYGON ((352884.939420855 6689138.70439115,...,352886.830297351 6689139.92956966))
			*/

			buffer = buffer.slice(10, -2);
			var array = buffer.split(/[\s,]/g);
			array = array.map(x => parseFloat(x));

			return array;

		},

		createModelFromShape: function(shape, data) {

			var shapePoints = shape.extractPoints();
			// console.log(shapePoints);
			var plane = this.generateSlicePlane(shapePoints.shape, data.index[0], data.index[1]);

			// var planeGeometry = new THREE.PlaneGeometry(80, 40);
			// var planeMesh = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({color:  color }));
			// var rotation = new THREE.Euler().setFromVector3(plane.normal);
			// //planeMesh.setRotationFromEuler(rotation);
			// planeMesh.translateOnAxis(plane.normal, -plane.constant);
			// planeMesh.lookAt(plane.normal);

			// planeMesh.name = "Slicer "+parcel.id;
			// parcel.slicer = planeMesh;

			//Parcelle
			var shapeGeometry = new THREE.ShapeBufferGeometry(shape);
			var parcel = new THREE.Mesh(shapeGeometry, new THREE.MeshPhongMaterial({ color: data.colors.parcel /* data.color*/ }));
			// parcel.rotation.y = Math.PI * 0.5;
			parcel.name = "Parcel " + data.id;
			parcel.castShadow = true;
			parcel.receiveShadow = true;
			parcel.data = data;

			//Wireframe
			var geo = new THREE.EdgesGeometry(parcel.geometry, 10); // or WireframeGeometry
			var mat = new THREE.LineBasicMaterial({ color: data.colors.wireframe, linewidth: 1 /*, lights: true */ });
			var wireframe = new THREE.LineSegments(geo, mat);
			parcel.add(wireframe);

			//Extrusion
			if (data.height > 0) {

				//roofing
				let bevelSize = -2,
					bevelThickness = 0,
					bevelSegments = 1,
					bevelEnabled = true;
				var roof;

				switch (data.section) {
					case 'IR':
						bevelEnabled = false;
						break;
					case 'KW':
						bevelSize = 2;
						bevelThickness = 3;
						bevelSegments = 1;
						bevelEnabled = true;
						break;
					case 'KX':
						bevelSize = 5;
						bevelThickness = 3;
						bevelSegments = 1;
						bevelEnabled = true;
						break;
					default:
						break;
				}
				
				bevelEnabled = false;

				var extrudeSettings = { amount: data.height - bevelThickness, bevelEnabled: false, bevelSegments: 0, steps: 1, bevelSize: 0, bevelThickness: 0 };
				parcel.extrusion = this.generateExtrusion(shape, plane, extrudeSettings);
				parcel.extrusion.name = "Extrusion " + parcel.id;
				parcel.extrusion.material.color.setHex(data.colors.extrusion);
				parcel.add(parcel.extrusion);

				if (bevelEnabled) {
					let roofSettings = { amount: 2, bevelEnabled: true, bevelSegments: bevelSegments, steps: 1, bevelSize: bevelSize, bevelThickness: bevelThickness };
					roof = this.generateRoofExtrusion(shape, plane, roofSettings);
					roof.position.z = parseFloat(data.height);
				}

				if (roof !== undefined)
					parcel.extrusion.add(roof);
			}


			return parcel;

		},

		generateExtrusion: function(shape, plane, extrudeSettings) {
			var bevelSize;

			var extrudeShape = plane ? Slicer.sliceShape(shape, plane) : shape;
			var extrudeGeometry = new THREE.ExtrudeGeometry(extrudeShape, extrudeSettings);
			// extrudeGeometry = Slicer.sliceGeometry(extrudeGeometry, plane, true);
			var extrusion = new THREE.Mesh(extrudeGeometry, new THREE.MeshPhongMaterial());
			//extrusion.rotation.x = -Math.PI*0.5;
			extrusion.castShadow = true;
			extrusion.receiveShadow = true;
			//extrusion.position.y = 0.1;

			//Wireframe
			var geo = new THREE.EdgesGeometry(extrusion.geometry, 10); // or WireframeGeometry
			var mat = new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 1 /*, lights: true*/ });
			var wireframe = new THREE.LineSegments(geo, mat);
			extrusion.add(wireframe);

			return extrusion;
		},

		generateRoofExtrusion: function(shape, plane, extrudeSettings) {
			var bevelSize;

			var extrudeShape = Slicer.sliceShape(shape, plane);
			var extrudeGeometry = new ExtrudeRoofGeometry(extrudeShape, extrudeSettings);
			// extrudeGeometry = Slicer.sliceGeometry(extrudeGeometry, plane, true);
			var extrusion = new THREE.Mesh(extrudeGeometry, new THREE.MeshPhongMaterial());
			//extrusion.rotation.x = -Math.PI*0.5;
			extrusion.castShadow = true;
			extrusion.receiveShadow = true;
			//extrusion.position.y = 0.1;

			//Wireframe
			var geo = new THREE.EdgesGeometry(extrusion.geometry, 10); // or WireframeGeometry
			var mat = new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 1 /*, lights: true*/ });
			var wireframe = new THREE.LineSegments(geo, mat);
			extrusion.add(wireframe);

			return extrusion;
		},

		generateSlicePlane: function(points, index1, index2) {
			var v1 = new THREE.Vector3(points[index1].x, points[index1].y, 0);
			var v2 = new THREE.Vector3(points[index2].x, points[index2].y, 0);

			var sliceDir = new THREE.Vector3();
			sliceDir.subVectors(v1, v2);

			sliceDir.normalize();
			sliceDir.applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);

			//slicePlane
			var plane = new THREE.Plane();
			plane.setFromNormalAndCoplanarPoint(sliceDir, v1);
			plane.constant = plane.constant + 15;

			return plane;
		},

		parseShape: function(SHPTree) {
			Object.forEach(SHPTree, function(key, value) {

			});
		},

		getAngle: function(v1, v2, v3) {

			let vec2 = new THREE.Vector2().subVectors(v1, v2)
			let vec3 = new THREE.Vector2().subVectors(v1, v3)

			var theta = vec2.dot(vec3) / (Math.sqrt(vec2.lengthSq() * vec3.lengthSq()))

			// console.log( theta, Math.acos(theta) * 180 / Math.PI  );//Math.acos( Math.clamp( theta, - 1, 1 ) ))

			return Math.acos(theta) * 180 / Math.PI
		},

		calculateArea(shape) {

		}


	});

	// Binary format specification:
	//   https://code.blender.org/2013/08/fbx-binary-file-format-specification/
	//   https://wiki.rogiken.org/specifications/file-format/fbx/ (more detail but Japanese)
	function BinaryParser() {}

	Object.assign(BinaryParser.prototype, {

		/**
		 * Parses binary data and builds FBXTree as much compatible as possible with the one built by TextParser.
		 * @param {ArrayBuffer} buffer
		 * @returns {THREE.FBXTree}
		 */
		parse: function(buffer) {

			var reader = new BinaryReader(buffer);
			reader.skip(23); // skip magic 23 bytes

			var version = reader.getUint32();

			console.log('SHP binary version: ' + version);

			var allNodes = {};

			while (!this.endOfContent(reader)) {

				var node = this.parseNode(reader, version);
				if (node !== null) allNodes[node.name] = node;

			}

			return allNodes;

		},

		/**
		 * Checks if reader has reached the end of content.
		 * @param {BinaryReader} reader
		 * @returns {boolean}
		 */
		endOfContent: function(reader) {

			// footer size: 160bytes + 16-byte alignment padding
			// - 16bytes: magic
			// - padding til 16-byte alignment (at least 1byte?)
			//   (seems like some exporters embed fixed 15bytes?)
			// - 4bytes: magic
			// - 4bytes: version
			// - 120bytes: zero
			// - 16bytes: magic
			if (reader.size() % 16 === 0) {

				return ((reader.getOffset() + 160 + 16) & ~0xf) >= reader.size();

			}
			else {

				return reader.getOffset() + 160 + 15 >= reader.size();

			}

		},

		/**
		 * Parses Node as much compatible as possible with the one parsed by TextParser
		 * TODO: could be optimized more?
		 * @param {BinaryReader} reader
		 * @param {number} version
		 * @returns {Object} - Returns an Object as node, or null if NULL-record.
		 */
		parseNode: function(reader, version) {
			console.log(reader)
			// The first three data sizes depends on version.
			var endOffset = (version >= 7500) ? reader.getUint64() : reader.getUint32();
			var numProperties = (version >= 7500) ? reader.getUint64() : reader.getUint32();
			var propertyListLen = (version >= 7500) ? reader.getUint64() : reader.getUint32();
			var nameLen = reader.getUint8();
			var name = reader.getString(nameLen);

			// Regards this node as NULL-record if endOffset is zero
			if (endOffset === 0) return null;

			var propertyList = [];

			for (var i = 0; i < numProperties; i++) {

				propertyList.push(this.parseProperty(reader));

			}

			// Regards the first three elements in propertyList as id, attrName, and attrType
			var id = propertyList.length > 0 ? propertyList[0] : '';
			var attrName = propertyList.length > 1 ? propertyList[1] : '';
			var attrType = propertyList.length > 2 ? propertyList[2] : '';

			var subNodes = {};
			var properties = {};

			var isSingleProperty = false;

			// if this node represents just a single property
			// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
			if (numProperties === 1 && reader.getOffset() === endOffset) {

				isSingleProperty = true;

			}

			while (endOffset > reader.getOffset()) {

				var node = this.parseNode(reader, version);

				if (node === null) continue;

				// special case: child node is single property
				if (node.singleProperty === true) {

					var value = node.propertyList[0];

					if (Array.isArray(value)) {

						// node represents
						//	Vertices: *3 {
						//		a: 0.01, 0.02, 0.03
						//	}
						// of text format here.

						node.properties[node.name] = node.propertyList[0];
						subNodes[node.name] = node;

						// Later phase expects single property array is in node.properties.a as String.
						// TODO: optimize
						node.properties.a = value.toString();

					}
					else {

						// node represents
						// 	Version: 100
						// of text format here.

						properties[node.name] = value;

					}

					continue;

				}

				// special case: connections
				if (name === 'Connections' && node.name === 'C') {

					var array = [];

					// node.propertyList would be like
					// ["OO", 111264976, 144038752, "d|x"] (?, from, to, additional values)
					for (var i = 1, il = node.propertyList.length; i < il; i++) {

						array[i - 1] = node.propertyList[i];

					}

					if (properties.connections === undefined) {

						properties.connections = [];

					}

					properties.connections.push(array);

					continue;

				}

				// special case: child node is Properties\d+
				if (node.name.match(/^Properties\d+$/)) {

					// move child node's properties to this node.

					var keys = Object.keys(node.properties);

					for (var i = 0, il = keys.length; i < il; i++) {

						var key = keys[i];
						properties[key] = node.properties[key];

					}

					continue;

				}

				// special case: properties
				if (name.match(/^Properties\d+$/) && node.name === 'P') {

					var innerPropName = node.propertyList[0];
					var innerPropType1 = node.propertyList[1];
					var innerPropType2 = node.propertyList[2];
					var innerPropFlag = node.propertyList[3];
					var innerPropValue;

					if (innerPropName.indexOf('Lcl ') === 0) innerPropName = innerPropName.replace('Lcl ', 'Lcl_');
					if (innerPropType1.indexOf('Lcl ') === 0) innerPropType1 = innerPropType1.replace('Lcl ', 'Lcl_');

					if (innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' ||
						innerPropType1 === 'Vector3D' || innerPropType1.indexOf('Lcl_') === 0) {

						innerPropValue = [
							node.propertyList[4],
							node.propertyList[5],
							node.propertyList[6]
						];

					}
					else {

						innerPropValue = node.propertyList[4];

					}

					if (innerPropType1.indexOf('Lcl_') === 0) {

						innerPropValue = innerPropValue.toString();

					}

					// this will be copied to parent. see above.
					properties[innerPropName] = {

						'type': innerPropType1,
						'type2': innerPropType2,
						'flag': innerPropFlag,
						'value': innerPropValue

					};

					continue;

				}

				// standard case
				// follows TextParser's manner.
				if (subNodes[node.name] === undefined) {

					if (typeof node.id === 'number') {

						subNodes[node.name] = {};
						subNodes[node.name][node.id] = node;

					}
					else {

						subNodes[node.name] = node;

					}

				}
				else {

					if (node.id === '') {

						if (!Array.isArray(subNodes[node.name])) {

							subNodes[node.name] = [subNodes[node.name]];

						}

						subNodes[node.name].push(node);

					}
					else {

						if (subNodes[node.name][node.id] === undefined) {

							subNodes[node.name][node.id] = node;

						}
						else {

							// conflict id. irregular?

							if (!Array.isArray(subNodes[node.name][node.id])) {

								subNodes[node.name][node.id] = [subNodes[node.name][node.id]];

							}

							subNodes[node.name][node.id].push(node);

						}

					}

				}

			}

			return {

				singleProperty: isSingleProperty,
				id: id,
				attrName: attrName,
				attrType: attrType,
				name: name,
				properties: properties,
				propertyList: propertyList, // raw property list, would be used by parent
				subNodes: subNodes

			};

		},

		parseProperty: function(reader) {

			var type = reader.getChar();
			console.log(type);
			switch (type) {

				case 'F':
					return reader.getFloat32();

				case 'D':
					return reader.getFloat64();

				case 'L':
					return reader.getInt64();

				case 'I':
					return reader.getInt32();

				case 'Y':
					return reader.getInt16();

				case 'C':
					return reader.getBoolean();

				case 'f':
				case 'd':
				case 'l':
				case 'i':
				case 'b':

					var arrayLength = reader.getUint32();
					var encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
					var compressedLength = reader.getUint32();

					if (encoding === 0) {

						switch (type) {

							case 'f':
								return reader.getFloat32Array(arrayLength);

							case 'd':
								return reader.getFloat64Array(arrayLength);

							case 'l':
								return reader.getInt64Array(arrayLength);

							case 'i':
								return reader.getInt32Array(arrayLength);

							case 'b':
								return reader.getBooleanArray(arrayLength);

						}

					}

					if (window.Zlib === undefined) {

						throw new Error('FBXLoader: Import inflate.min.js from https://github.com/imaya/zlib.js');

					}

					var inflate = new Zlib.Inflate(new Uint8Array(reader.getArrayBuffer(compressedLength)));
					var reader2 = new BinaryReader(inflate.decompress().buffer);

					switch (type) {

						case 'f':
							return reader2.getFloat32Array(arrayLength);

						case 'd':
							return reader2.getFloat64Array(arrayLength);

						case 'l':
							return reader2.getInt64Array(arrayLength);

						case 'i':
							return reader2.getInt32Array(arrayLength);

						case 'b':
							return reader2.getBooleanArray(arrayLength);

					}

				case 'S':
					var length = reader.getUint32();
					return reader.getString(length);

				case 'R':
					var length = reader.getUint32();
					return reader.getArrayBuffer(length);

				default:
					throw new Error('FBXLoader: Unknown property type ' + type);

			}

		}

	});


	function BinaryReader(buffer, littleEndian) {

		this.dv = new DataView(buffer);
		this.offset = 0;
		this.littleEndian = (littleEndian !== undefined) ? littleEndian : true;

	}

	Object.assign(BinaryReader.prototype, {

		getOffset: function() {

			return this.offset;

		},

		size: function() {

			return this.dv.buffer.byteLength;

		},

		skip: function(length) {

			this.offset += length;

		},

		// seems like true/false representation depends on exporter.
		//   true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
		// then sees LSB.
		getBoolean: function() {

			return (this.getUint8() & 1) === 1;

		},

		getBooleanArray: function(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getBoolean());

			}

			return a;

		},

		getInt8: function() {

			var value = this.dv.getInt8(this.offset);
			this.offset += 1;
			return value;

		},

		getInt8Array: function(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getInt8());

			}

			return a;

		},

		getUint8: function() {

			var value = this.dv.getUint8(this.offset);
			this.offset += 1;
			return value;

		},

		getUint8Array: function(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getUint8());

			}

			return a;

		},

		getInt16: function() {

			var value = this.dv.getInt16(this.offset, this.littleEndian);
			this.offset += 2;
			return value;

		},

		getInt16Array: function(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getInt16());

			}

			return a;

		},

		getUint16: function() {

			var value = this.dv.getUint16(this.offset, this.littleEndian);
			this.offset += 2;
			return value;

		},

		getUint16Array: function(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getUint16());

			}

			return a;

		},

		getInt32: function() {

			var value = this.dv.getInt32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;

		},

		getInt32Array: function(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getInt32());

			}

			return a;

		},

		getUint32: function() {

			var value = this.dv.getUint32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;

		},

		getUint32Array: function(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getUint32());

			}

			return a;

		},

		// JavaScript doesn't support 64-bit integer so attempting to calculate by ourselves.
		// 1 << 32 will return 1 so using multiply operation instead here.
		// There'd be a possibility that this method returns wrong value if the value
		// is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
		// TODO: safely handle 64-bit integer
		getInt64: function() {

			var low, high;

			if (this.littleEndian) {

				low = this.getUint32();
				high = this.getUint32();

			}
			else {

				high = this.getUint32();
				low = this.getUint32();

			}

			// calculate negative value
			if (high & 0x80000000) {

				high = ~high & 0xFFFFFFFF;
				low = ~low & 0xFFFFFFFF;

				if (low === 0xFFFFFFFF) high = (high + 1) & 0xFFFFFFFF;

				low = (low + 1) & 0xFFFFFFFF;

				return -(high * 0x100000000 + low);

			}

			return high * 0x100000000 + low;

		},

		getInt64Array: function(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getInt64());

			}

			return a;

		},

		// Note: see getInt64() comment
		getUint64: function() {

			var low, high;

			if (this.littleEndian) {

				low = this.getUint32();
				high = this.getUint32();

			}
			else {

				high = this.getUint32();
				low = this.getUint32();

			}

			return high * 0x100000000 + low;

		},

		getUint64Array: function(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getUint64());

			}

			return a;

		},

		getFloat32: function() {

			var value = this.dv.getFloat32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;

		},

		getFloat32Array: function(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getFloat32());

			}

			return a;

		},

		getFloat64: function() {

			var value = this.dv.getFloat64(this.offset, this.littleEndian);
			this.offset += 8;
			return value;

		},

		getFloat64Array: function(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getFloat64());

			}

			return a;

		},

		getArrayBuffer: function(size) {

			var value = this.dv.buffer.slice(this.offset, this.offset + size);
			this.offset += size;
			return value;

		},

		getChar: function() {

			return String.fromCharCode(this.getUint8());

		},

		getString: function(size) {

			var s = '';

			while (size > 0) {

				var value = this.getUint8();
				size--;

				if (value === 0) break;

				s += String.fromCharCode(value);

			}

			this.skip(size);

			return s;

		}

	});
})();
