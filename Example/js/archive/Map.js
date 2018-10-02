THREE.GoogleMapObject = function ( width, height, options ) {

	THREE.Mesh.call( this );
	
	this.type = 'Mesh';
	
	this.geometry = new THREE.PlaneBufferGeometry( width, height, 1, 1 );
	this.material = new THREE.GoogleMapMaterial( options );
	
	
};


THREE.GoogleMapObject.prototype = Object.create( THREE.Mesh.prototype );
THREE.GoogleMapObject.prototype.constructor = THREE.Mesh;

THREE.GoogleMapMaterial = function ( options ) {

	THREE.Material.call( this );
	this.type = 'GoogleMapMaterial';
	
	this.latitude = 48.8582336;
	this.longitude = 2.2940428;
	this.zoom = 10;
	this.width = 512;
	this.height = 512;
	this.name = "Google Map";
	this.baseUrl = "https://maps.google.com/maps/api/staticmap?key=AIzaSyAMuXVfnpAqqUttI9anvSETMfob1R_YH5c&sensor=false&scale=2&center=";
	this.maptype = "roadmap";
	
	this.color = new THREE.Color( 0xffffff );

	this.map = null;
	
	this.updateMap( options );
	//this.setMap( options );
};
THREE.GoogleMapMaterial.prototype.constructor = THREE.GoogleMapMaterial;

// Object.defineProperties( THREE.GoogleMapMaterial.prototype, {

THREE.GoogleMapMaterial.prototype = Object.assign( Object.create( THREE.Material.prototype ), {
	
	constructor: THREE.GoogleMapMaterial,
	fromUrl: function( url ){
		var result = {};
		url.split("&").forEach(function(part) {
		    var item = part.split("=");
		    result[item[0]] = decodeURIComponent(item[1]);
		});
		if( result.center !== undefined ) {
			var center = result.center.split(",");
			result.latitude = center[0];
			result.longitude = center[1];
		}
		if( result.size !== undefined ) {
			var size = result.size.split("x");
			result.width = size[0];
			result.height = size[1];
		}
		
		this.updateMap( result );
	},
	updateMap: function( options ){
		
		if( options === undefined ) options = {};
		this.latitude = options.latitude !== undefined ? options.latitude : this.latitude;
		this.longitude = options.longitude !== undefined ? options.longitude : this.longitude;
		this.zoom = options.zoom !== undefined ? options.zoom : this.zoom;
		this.width = options.width !== undefined ? options.width : this.width;
		this.height = options.height !== undefined ? options.height : this.height;
		this.maptype = options.maptype !== undefined ? options.maptype : this.maptype;
		
		this.url = this.baseUrl + this.latitude + "," + this.longitude + "&zoom=" + this.zoom + "&size="  + this.width + "x"  + this.height + "&maptype=" + this.maptype;
		
		var textureLoader = new THREE.TextureLoader();
		textureLoader.setCrossOrigin('anonymous');
	    var self = this;
	    textureLoader.load( this.url, function( texture ){
	        console.log(texture);
	        texture.needsUpdate = true;
	        texture.image.originalUrl = self.url;
	
	        texture.image.uuid = THREE.Math.generateUUID();
	        
	        self.map = texture;
	        self.needsUpdate = true;
	        
		}, 
		undefined, 
		function(error){
			
			console.log("error", error);
			
		});
		
	},
	setMap: function( options ){
		
		if( options === undefined ) options = {};
		this.latitude = options.latitude !== undefined ? options.latitude : this.latitude;
		this.longitude = options.longitude !== undefined ? options.longitude : this.longitude;
		this.zoom = options.zoom !== undefined ? options.zoom : this.zoom;
		this.width = options.width !== undefined ? options.width : this.width;
		this.height = options.height !== undefined ? options.height : this.height;
		
		this.url = this.baseUrl + this.latitude + "," + this.longitude + "&zoom=" + this.zoom + "&size="  + this.width + "x"  + this.height + "&maptype=" + this.maptype;
		
		console.log(this.url);
		var textureLoader = new THREE.TextureLoader();
	    var self = this;
	    textureLoader.load( this.url, function( texture ){
	        console.log(texture);
	        texture.needsUpdate = true;
	        texture.image.originalUrl = self.url;
	
	        texture.image.uuid = THREE.Math.generateUUID();
	        
	        self.map = texture;
	        self.needsUpdate = true;
	        
		}, function( progress ) {
			
			// Session.set('modal-alt-message', "Loading textures "+ Number( progress.loaded * 100 / progress.total, 2).toFixed(2)+"%" );
			// self.signals.loadingProgress.dispatch("textures ", Number( progress.loaded * 100 / progress.total, 2).toFixed(2));
			
		}, function(error){
			
			console.log("error", error);
			
		});
		
	}
});
THREE.GoogleMapMaterial.prototype.constructor = THREE.GoogleMapMaterial;

THREE.GoogleMapMaterial.prototype.copy = function ( source ) {

	THREE.Material.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.map = source.map;

	return this;

};