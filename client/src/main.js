import 'normalize.css'
import Vue from 'vue'

import './plugins/index.js'

import App from './App.vue'
import router from './router.js'
import store from './store/index.js'
import './registerServiceWorker.js'

import './main.css'
import vuetify from './plugins/vuetify.js'

Vue.config.productionTip = false

const PageTitle = () => import(/* webpackChunkName: "header", webpackPreload: true */ '@/components/PageTitle')
const BandeauBeta = () => import(/* webpackChunkName: "header", webpackPreload: true */ '@/components/BandeauBeta')

Vue.component('PageTitle', PageTitle)
Vue.component('BandeauBeta', BandeauBeta)

const runMyApp = () => {
  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App),
  }).$mount('#app')
}

(async function checkIntlApi () {
  if (!global.Intl) {
    await Promise.all([
      import(/* webpackChunkName: "header", webpackPreload: true */ 'intl'),
      import(/* webpackChunkName: "header", webpackPreload: true */ 'intl/locale-data/jsonp/fr.js'),
    ])
    runMyApp()
  } else {
    runMyApp()
  }
})()
