import Vue from 'vue'
import VueRouter from 'vue-router'

import Default from './views/Default.vue'
import Rip from './views/Rip.vue'
import Machenzie from './views/Machenzie.vue'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '',
      name: 'home',
      component: Default
    },
    {
      path: '/d-ger-boxer-rip',
      name: 'd-ger-boxer-rip',
      component: Rip
    },
    {
      path: '/d-ger-boxer-machenzie',
      name: 'd-ger-boxer-machenzie',
      component: Machenzie
    },
    {
      path: '/templink',
      name: 'templink',
      component: () => import('./views/Templink.vue')
    }
  ],
  mode: 'history'
})
