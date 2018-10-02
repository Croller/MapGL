var Parser;
(function(Parser){
    
    Parser.parse = function(data){
        var object = {};
        var lineArray = data.split(/\r\n|\r|\n/g);
        console.log(lineArray);
        for(var i = 0, l = lineArray.length; i < l; i++) {
            var line = lineArray[i].split(',');
            
            object[line[0]] = {
                type:line[1],
                height:line[2],
                vertices:line[3],
                linearIndices:line[4],
            }
            
        }
        console.log(object)
        return object;
    }
    
    KQLoader.load = function ( url, onLoad, onProgress, onError ) {

		var self = this;

		var resourceDirectory = url.split( /[\\\/]/ );
		resourceDirectory.pop();
		resourceDirectory = resourceDirectory.join( '/' ) + '/';

		var loader = new THREE.XHRLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( buffer ) {

			try {

				var scene = self.parse( buffer, resourceDirectory );

				onLoad( scene );

			} catch ( error ) {

				window.setTimeout( function () {

					if ( onError ) onError( error );

					self.manager.itemError( url );

				}, 0 );

			}

		}, onProgress, onError );

	};
})();