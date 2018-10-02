/**
 * @author Mathieu CAZELLE / http://twistengine.com/
 * @author zz85 / http://joshuakoo.com/
 */
var OSMLoader;
(function() {

    OSMLoader = function(manager) {

        this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;

        this.rawObject;

        this.scene = new THREE.Scene();
        this.center = new THREE.Vector3();
        this.width;
        this.height;
        this.scaleFactor = 1000;
        this.object = new THREE.Object3D();
        this.shapes = [];
        this.bounds = [];
        this.center = {
            lat:0,
            lon:0,
            alt:0
        }
        
        this.offset = {x: 0, y: 0};

    };

    Object.assign( OSMLoader.prototype, {

        load: function(url, onLoad, onProgress, onError) {

            var scope = this;

            var parser = new DOMParser();

            var loader = new THREE.XHRLoader(scope.manager);
            loader.load(url, function(osmString) {
                var doc = parser.parseFromString(osmString, 'text/xml'); // application/xml
                // var doc = xml2js.parseStringSync( osmString );
                scope.parse(doc.documentElement);
                // onLoad( scope.parse(doc.documentElement) );

            }, onProgress, onError);

        },
        parse: function(data, format) {

            var obj = {};

            if (format == 'xml') obj = element2obj(data);
            else obj = json2obj( JSON.parse(data).elements );

            function json2obj(elements) {
                
                var nodes = {};
                var ways = [];

                for (let i = 0; i < elements.length; i++) {
                    
                    if (elements[i].type === "node") {
                        
                        nodes[elements[i].id] = [elements[i].lat, elements[i].lon];
                        
                    }
                }
                
                function getNodes(ids) { 
                    
                    var way = [];
                    for (let i = 0; i < ids.length; i++) {
                        
                        way = way.concat( nodes[ids[i]] );
                    } 
                    
                    return way;
                }

                for (let i = 0; i < elements.length; i++) {
                    
                    if (elements[i].type === "way") {
                        ways.push({
                            id: [elements[i].id],
                            positions: getNodes(elements[i].nodes),
                            tags: elements[i].tags
                        });
                    }
                }

                return ways;
            }
            
            function element2obj(node) {

                var element = {};

                _.each(node.attributes, function(attr, key) {
                    element[attr.name] = attr.value;
                });


                for (let i = 0; i < node.children.length; i++) {
                    if (node.children[i].tagName === "bounds") {
                        element[node.children[i].tagName] = element2obj(node.children[i]);
                    }

                    if (node.children[i].tagName === "node" || node.children[i].tagName === "way" || node.children[i].tagName === "relation") {
                        if (element[node.children[i].tagName] === undefined) element[node.children[i].tagName] = {};
                        let child = element2obj(node.children[i]);
                        element[node.children[i].tagName][child.id] = child;
                    }

                    if (node.children[i].tagName === "nd" || node.children[i].tagName === "member" || node.children[i].tagName === "tag") {
                        if (element[node.children[i].tagName] === undefined) element[node.children[i].tagName] = [];
                        let child = element2obj(node.children[i]);
                        element[node.children[i].tagName].push(child);
                    }
                }

                return element;
            }

            if(obj.bounds !== undefined) this.setCenter(obj.bounds);
            if(obj.bounds !== undefined) this.setBounds(obj.bounds);
            this.setOffset();
            
            this.objectRaw = obj;
            this.wayToShape(obj);
            // this.wayToMesh(obj);
            return this.object;

        },
        setCenter: function(bounds) {

            var v = { x: (Number(bounds.minlon) + Number(bounds.maxlon)) * .5, y: (Number(bounds.minlat) + Number(bounds.maxlat)) * .5 };

            let r = Math.cos(v.y * Math.PI / 180);

            v.x = v.x * 111.195 * r * this.scaleFactor;
            v.y = v.y * 111.195 * this.scaleFactor;
            
            this.center = v;
        },
        setOffset: function() {

            var v = { x: this.center.lon, y: this.center.lat };

            let r = Math.cos(v.y * Math.PI / 180);

            v.x = v.x * 111.195 * r * this.scaleFactor;
            v.y = v.y * 111.195 * this.scaleFactor;
            
            this.offset = v;
        },
        setBounds: function(bounds) {
            this.width = Number(bounds.maxlon) - Number(bounds.minlon);
            this.height = Number(bounds.maxlat) - Number(bounds.minlat);
        },
        convertLon: function(lon, lat) {

            let r = Math.cos(lat * Math.PI / 180);
            return lon * 111.195 * r * this.scaleFactor;

        },
        convertLat: function(lat) {

            return lat * 111.195 * this.scaleFactor;

        },
        nodeToVector3: function(id) {

            var node = this.objectRaw.node[id];

            var v = new THREE.Vector3(this.convertLon(node.lon, node.lat) - this.offset.x, this.convertLat(Number(node.lat)) - this.offset.y, 0);

            return v;
        },
        nodeToVector2: function(id) {

            var node = this.objectRaw.node[id];

            var v = new THREE.Vector2(this.convertLon(node.lon, node.lat) - this.offset.x, this.convertLat(Number(node.lat)) - this.offset.y);

            return v;
        },
        
        arrayToVector2: function(array) {
            
            var vertices = [];
            
            for (var i = 0; i < array.length; i+=2) {
                var v = new THREE.Vector2(this.convertLon(array[i+1], array[i]) - this.offset.x, this.convertLat(Number(array[i])) - this.offset.y);
                vertices.push( v );
            }

            return vertices;
        },
        
        wayToShape: function(ways) {
            // var self = this;
            var shape;
            
            ways.forEach((way, key) => {
                
                shape = new THREE.Shape(this.arrayToVector2(way.positions));
	            shape.name = "Shape "+ key;
	            
                this.shapes.push(shape);
            });
            
            // this.object.rotation.x = -90 * Math.PI / 180;
            // return this.shape;
        },
        wayToMesh: function(ways) {

            var scope = this;
            var meshes = [];
        
            ways.forEach(function(way) {

                var mesh = scope.getMesh(way.positions);
                if (mesh) {
                    if (way.id !== undefined) mesh.name += " " + way.id;
                    mesh.receiveShadow = true;
                    mesh.castShadow = true;
                    mesh.visible = way.visible === false ? false : true;
                    scope.object.add(mesh);
                }

            });
            // console.log(this.object);
            this.object.rotation.x = -90 * Math.PI / 180;
            return this.object;
        },
        getColor: function(ref) {

            switch (ref) {
                case 'allotments':
                case 'residential':
                case 'village_green':
                    return new THREE.Color(0xbdc6b6); //green grey
                    break;
                case 'basin':
                case 'reservoir':
                    return new THREE.Color(0xa3c3cc); //blue
                    break;
                case 'brownfield':
                    return new THREE.Color(0x9e9373); //brown
                    break;
                case 'building':
                    return new THREE.Color(0x666666); //grey
                    break;
                case 'cemetery':
                    return new THREE.Color(0xb0b3b7); //grey blue
                    break;
                case 'commercial':
                case 'retail':
                    return new THREE.Color(0xdbb8c2); //light red
                    break;
                case 'construction':
                    return new THREE.Color(0xe0c398); //pale orange
                    break;
                case 'farmland':
                case 'farmyard':
                case 'landfill':
                    return new THREE.Color(0xceba84); //yellow brown
                    break;
                case 'garages':
                    return new THREE.Color(0x878787); //dark grey
                    break;
                case 'grass':
                case 'greenfield':
                case 'greenhouse_horticulture':
                case 'orchard':
                case 'recreation_ground':
                    return new THREE.Color(0x64a53b); //green
                    break;
                case 'industrial':
                case 'railway':
                    return new THREE.Color(0x96a4b5); //blue green
                    break;
                case 'motorway':
                case 'trunk':
                case 'primary':
                case 'secondary':
                case 'tertiary':
                case 'trunk_link':
                case 'primary_link':
                case 'secondary_link':
                case 'tertiary_link':
                case 'motorway_link':
                    return new THREE.Color(0x444444); //dark grey
                    break;
                case 'military':
                    return new THREE.Color(0xaf3c2a); //red
                    break;
                case 'user defined':
                    return new THREE.Color(0x555555); //grey
                    break;
                case 'white':
                    return new THREE.Color(0xEEEEEE); //grey
                    break;
                default:
                    return new THREE.Color(0xCCCCCC); //grey light
                    break;

            }

        },
        makeMaterial: function(type, params) {
            var scope = this;
            var m;

            if (type === "line") {

                // m = new THREE.LineBasicMaterial({color: params.color, linewidth: 3});
                m = new THREE.MeshStandardMaterial({ name: params.name, color: params.color });

            }
            else if (type === "standard") {

                m = new THREE.MeshStandardMaterial({ name: params.name, color: params.color });

            }
            else {

                m = new THREE.MeshPhongMaterial({ name: params.name, color: params.color });

            }
            return m;
        },
        makeGeometry: function(type, params, nodes) {
            
            var scope = this;
            var vertices = [];
            var importVolume = true,
                importShape = true,
                importRoad = false,
                importLine = false;

            if (type === "volume" && importVolume === true) {

                _.each(nodes, function(nd) {
                    var v = scope.nodeToVector2(nd.ref);
                    vertices.push(v);
                });

                let shape = new THREE.Shape(vertices);
                if (params.height === undefined) params.height = 5;
                let extrudeSettings = { amount: params.height * this.scaleFactor / 1000, bevelEnabled: false };
                var extrude = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                return new THREE.Geometry().copy(extrude);

            }
            else if (type === "shape" && importShape === true) {
                let shape = new THREE.Shape(this.arrayToVector2(nodes));
                let shapeGeometry = new THREE.ShapeGeometry(shape);
                
                return new THREE.Geometry().copy(shapeGeometry);

            }
            else if (type === "tape" && importRoad === true) {

                _.each(nodes, function(nd) {

                    var v = scope.nodeToVector3(nd.ref);
                    vertices.push(v);

                });

                var path = new THREE.CatmullRomCurve3(vertices);
                path.tension = 1;

                var options = {
                    steps: 200,
                    scale: params.width !== undefined ? params.width : 3,
                    bevelEnabled: false,
                    extrudePath: path
                };

                var geometry = new THREE.TapeGeometry(options);

                return geometry;

            }
            else if (type === "line" && importLine === true) {

                _.each(nodes, function(nd) {

                    var v = scope.nodeToVector3(nd.ref);
                    vertices.push(v);

                });

                let geometry = new THREE.Geometry();
                geometry.vertices = vertices;
                geometry.needsUpdate = true;
                return geometry;
            }
        },
        getMesh: function(nodes, tags) {
            //if(tags === undefined) return null;
            var g = {},
                m = {};
            g.params = {};
            m.params = {};
            var self = this;
            var name;

            _.each(tags, function(tag) {

                function setCommonParams() {
                    name = tag.k;
                    if (nodes[0].ref === nodes[nodes.length - 1].ref && nodes.length > 3) {
                        nodes.splice(nodes.length - 1);
                        g.type = "shape";
                        m.type = "phong";
                    }
                    else if (nodes.length > 1 && tag.k.includes("way")) {
                        g.type = "tape";
                        m.type = "phong";
                    }
                    else if (nodes.length > 1) {
                        g.type = "line";
                        m.type = "line";
                    }
                    else if (nodes.length === 1) {
                        return null;
                        // g.type = "point";
                        // m.type = "point";
                    }
                    else {
                        return null;
                    }
                    m.params.color = self.getColor(tag.v);
                    m.params.name = tag.v;
                }

                switch (tag.k) {
                    case 'aerialway':
                        name = 'aerialway';
                        g.type = "line";
                        m.type = "line";
                        m.params.color = self.getColor(tag.v);
                        break;
                    case 'aeroway':
                        setCommonParams();
                        m.params.color = self.getColor("primary");
                        break;
                    case 'amenity':
                        name = 'amenity';
                        if (nodes[0].ref === nodes[nodes.length - 1].ref && nodes.length > 3) {
                            nodes.splice(nodes.length - 1);
                            g.type = "shape";
                            m.type = "phong";
                        }
                        else {
                            return null;
                            // g.type = "point";
                            // m.type = "point";
                        }
                        break;
                    case 'barrier':

                        setCommonParams();
                        break;
                    case 'boundary':

                        setCommonParams();
                        break;
                    case 'building':
                        name = 'building';
                        g.type = "volume";
                        m.type = "phong";
                        m.params.color = self.getColor("building");
                        break;
                    case 'services':
                    case 'service':
                        name = 'service';
                        if (nodes.length > 2) g.type = "shape";
                        break;
                    case 'building:height':
                    case 'height':
                        if (nodes.length > 3) g.type = "volume";
                        g.params.height = tag.v;
                        break;
                    case 'level':
                    case 'levels':
                    case 'building:levels':
                        if (nodes.length > 3) g.type = "volume";
                        if (g.params.height === undefined) g.params.height = tag.v * 3;
                        break;
                    case 'building:part':
                        return null;
                        break;
                    case 'craft':

                        setCommonParams();

                        break;
                    case 'emergency':
                        name = 'emergency';
                        if (nodes[0].ref === nodes[nodes.length - 1].ref && nodes.length > 3) {
                            nodes.splice(nodes.length - 1);
                            g.type = "volume";
                            m.type = "phong";
                        }
                        else {
                            return null;
                            // g.type = "point";
                            // m.type = "point";
                        }
                        break;
                    case 'geological':
                        name = 'geological';
                        return null;
                        break;
                    case 'highway':
                        setCommonParams();
                        if (tag.v === "motorway") {
                            if (g.params.width === undefined) g.params.width = 9;
                        }
                        if (tag.v === "trunk") {
                            if (g.params.width === undefined) g.params.width = 6;
                        }
                        if (tag.v === "primary" || tag.v === "secondary") {
                            if (g.params.width === undefined) g.params.width = 4;
                        }
                        m.params.color = new THREE.Color(0x444444);
                        g.params.zOffset = 0.5;
                        break;
                    case 'lanes':
                        g.params.width = tag.v * 3;
                        break;
                    case 'width':
                        g.params.width = tag.v;
                        break;
                    case 'historic':

                        setCommonParams();
                        break;
                    case 'landuse':
                        setCommonParams();
                        break;
                    case 'man_made':
                        setCommonParams();
                        g.params.zOffset = 0.3;
                        break;
                    case 'military':

                        setCommonParams();
                        break;
                    case 'Natural':
                        name = 'Natural';
                        m.params.color = self.getColor(tag.v);
                        return null;
                        break;
                    case 'Office':
                        name = 'Office';
                        return null;
                        break;
                    case 'places':

                        setCommonParams();
                        break;
                    case 'Power':
                        name = 'Power';
                        return null;
                        break;
                    case 'public Transport':
                        name = 'Public Transport';
                        return null;
                        break;
                    case 'railway':
                        name = 'railway';
                        return null;
                        break;
                    case 'route':
                        name = 'route';
                        return null;
                        break;
                    case 'shop':
                        name = 'shop';
                        if (nodes[0].ref === nodes[nodes.length - 1].ref && nodes.length > 3) {
                            nodes.splice(nodes.length - 1);
                            g.type = "volume";
                            m.type = "phong";
                        }
                        else if (nodes.length > 1) {
                            g.type = "line";
                            m.type = "line";
                        }
                        else {
                            return null;
                            // g.type = "point";
                            // m.type = "point";
                        }
                        return null;
                        break;
                    case 'sport':
                        name = 'sport';
                        return null;
                        break;
                    case 'tourism':
                        name = 'tourism';
                        return null;
                        break;
                    case 'waterway':

                        setCommonParams();
                        break;
                }


            });
            if (g.type === undefined) {
                name = "undefined";
                if (nodes[0].ref === nodes[nodes.length - 1].ref && nodes.length > 3) {
                    nodes.splice(nodes.length - 1);
                    g.type = "shape";
                    m.type = "phong";
                }
                else if (nodes.length > 1) {
                    g.type = "line";
                    m.type = "line";
                }
                else {
                    return null;
                    // g.type = "point";
                    // m.type = "point";
                }
                g.params.zOffset = -0.4;
                m.params.color = self.getColor();
            }

            if (m.params.color === {}) m.params.color === new THREE.Color();
            let geometry = self.makeGeometry(g.type, g.params, nodes);
            let material = self.makeMaterial(m.type, m.params);
            if (g !== undefined && geometry !== undefined) {
                var mesh;
                if (g.type === "line") {
                    mesh = new THREE.Line(geometry, material);
                    mesh.position.z += 0.4;
                }
                else mesh = new THREE.Mesh(geometry, material);
                mesh.name = name;
                mesh.position.z += g.params.zOffset !== undefined ? g.params.zOffset : 0;
                return mesh;
            }
            else {
                return null;
            }

        }
    });
})();
