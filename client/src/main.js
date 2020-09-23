import 'normalize.css'
import Vue from 'vue'
import './plugins'

import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

import './main.styl'
import vuetify from './plugins/vuetify'
import './assets/tailwind.pcss'

Vue.config.productionTip = false

const PageTitle = () => import(/* webpackChunkName: "header", webpackPreload: true */ '@/components/PageTitle')
const BandeauBeta = () => import(/* webpackChunkName: "header", webpackPreload: true */ '@/components/BandeauBeta')

Vue.component('page-title', PageTitle)
Vue.component('bandeau-beta', BandeauBeta)

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
