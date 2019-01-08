import 'normalize.css'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/dist/vuetify.min.css'

import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

import './main.css'

Vue.config.productionTip = false

Vue.use(Vuetify, {
  iconfont: 'md',
})

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
