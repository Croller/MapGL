
import Vue from 'vue'

import App from './App'
import routers from './router'
// import Resource from 'vue-resource'

// assets
// import * as THREE from 'three'
// require('@/assets/js/MapControls.js')
// require('@/three/examples/js/controls/MapControls.js');

// Vue.use(Resource)

Vue.config.productionTip = false

/* eslint-disable no-new */

new Vue({
  router: routers,
  el: '#app',
  // render: h => h(App)
  components: { App },
  template: '<App/>'
})
