<template>
  <div id="MapGL">
    <!-- <canvas  v-bind:style="{ 'width': width  + 'px', 'height': height  + 'px' }">
      Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.
    </canvas> -->
  </div>
  
</template>

<script>

  import * as THREE from 'three'

  // import 'three/examples/js/controls/OrbitControls.js'
  // window.THREE = THREE;
  // require('three/examples/js/controls/OrbitControls.js');

  export default {
    name: 'Map',
    components: {},
    props:{
      width: Number,
      height: Number,
    },
    data() {
      return {
        scene: {},
        renderer: {},
        container: {},
        camera: {},
        controls: {}
      }
    },
    computed: {},
    created: function() {},
    mounted() {
      let self = this;
      setTimeout(() => {
        self.init();
      }, 2000)
      
      // self.render();
    },
    methods: {
      init(){
        let self = this;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xEDEDED ); 

        // render
        this.renderer = new THREE.WebGLRenderer( { antialias: false } ); // why? antialias
        this.renderer.setPixelRatio( window.devicePixelRatio ); // why?
        this.renderer.setSize( this.width , this.height );

        // container
        this.container = document.getElementById( 'MapGL' );
        this.container.appendChild( this.renderer.domElement );

        var camPos = 150;
        // camera
        this.camera = new THREE.PerspectiveCamera( 60, this.width / this.height, 1, 1000 );
        this.camera.position.set(0, camPos, 0)
        this.camera.lookAt( this.scene.position);

        // controls
        // controls = THREE.MapControls( this.camera, this.renderer.domElement );
        // this.controls = new OrbitControls( this.camera, this.container );
        // this.controls.enabled = false;

          // grid
        var grid = new THREE.GridHelper( 1000 , 200, 0xFFFFFF, 0xFFFFFF );
        grid.position.set( 0, 0, 0);
        this.scene.add( grid );

        // axis
        var axisHelper = new THREE.AxesHelper( 50 );
        this.scene.add( axisHelper );

        // light
        var light = new THREE.PointLight( 0xffffff, 0.5 );
        light.position.set( 1000, 1000, 1000 );
        this.scene.add( light );

        var light = new THREE.PointLight( 0xffffff, 1 );
        light.position.set( -2000, 1000, -2000 );
        this.scene.add( light );

        var light = new THREE.PointLight( 0xffffff, 1 );
        light.position.set( 1000, -2000, -2000 );
        this.scene.add( light );
        
        this.scene.add( new THREE.AmbientLight( 0x777777 ) );


        window.addEventListener( 'resize', this.onWindowResize, true );

        this.render();
      },

      animate() {
        this.render();    
      },
      
      render() {
        this.renderer.render( this.scene, this.camera );
      },

      onWindowResize() {
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.cameraSlice.aspect = this.width / this.height;
        this.cameraSlice.updateProjectionMatrix();

        this.render();
      },

      initWebGL(canvas) {
        let gl = null;
        try {
          gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        }
        catch(e) {}
        if (!gl) {
          alert("Unable to initialize WebGL. Your browser may not support it.");
          gl = null;
        }
        return gl;
      },

      

      rgbToGl(r, g, b, a){
        r = (1/255) * r;
        g = (1/255) * g;
        b = (1/255) * b;
        a = a;
        return { 'r': r, 'g': g, 'b': b, 'a': a }
      },
 

    },
    watch: {},
  }
</script>

<style>


</style>

