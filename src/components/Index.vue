<template>
  <div id="index">
    <div id="Layers">
      1
    </div>
    <div id="MapGL">
      2
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Index',
    components: {},
    props:{},
    data() {
      return {
        locale: "ru",

      }
    },
    computed: {},
    created: function() {},
    mounted() {},
    methods: {},
    watch: {},
  }
</script>

<style>
  #index{
    background-color: #000;
  }
  #Layers{
    width: 20%;
    border-right: 1px solid #e9e9e9;
  }
  #MapGL{
    width: 80%;
  }

</style>

