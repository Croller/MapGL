<template>
  <div id="index">
    <div class="row">
      <div id="toolbox" class="col-2">
        <div id="layer">

        </div>
      </div>
      <div id="map" class="col-10">
        <Map
        :width=mapWidth
        :height=mapHeight
        />
      </div>
    </div>
  </div>
</template>

<script>

  import Map from './Map.vue'

  export default {
    name: 'Index',
    components: {
      'Map': Map,
    },
    props:{},
    data() {
      return {
        locale: "ru",

        mapWidth: 0,
        mapHeight: 0,  

      }
    },
    computed: {},
    created: function() {},
    mounted() {
      let self = this;

      this.mapWidth = document.getElementById("map").offsetWidth;
      this.mapHeight = window.innerHeight;

      window.addEventListener('resize', self.handleResize);
    },
    methods: {
      handleResize: function(event) {
        this.mapWidth = document.getElementById("map").offsetWidth;
        this.mapHeight = window.innerHeight;
      },
    },
    watch: {},
  }
</script>

<style>
  #index{
  }
  #toolbox{
    padding-right: 0px;
    border-right: 1px solid #e9e9e9;
  }
  #toolbox #layer{
    height: 100%;
  }
  #map{
    padding-left: 0px;
  }

</style>

