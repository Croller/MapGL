import Vue from 'vue'
import Router from 'vue-router'
// import Resource from 'vue-resource'

import Index from '@/components/Index.vue'

Vue.use(Router)

export default new Router({
  mode: 'history', // remove # from url
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    // { 
    //   path: '*', 
    //   component: Index 
    // }
    // {
    //   path: '/search/:uuid',
    //   name: 'Search',
    //   component: Search,
    //   props(route) {
    //     return  route.query || {}
    //   }
    // },
  ]
})
