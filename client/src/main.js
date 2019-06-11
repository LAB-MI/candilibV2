import 'normalize.css'
import Vue from 'vue'
import './plugins'

import App from './App.vue'
import router from './router'
import store from './store'
import { PageTitle, BandeauBeta } from '@/components'
import './registerServiceWorker'

import './main.styl'

Vue.config.productionTip = false
Vue.component('page-title', PageTitle)
Vue.component('bandeau-beta', BandeauBeta)

const runMyApp = () => {
  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app')
}

(async function checkIntlApi () {
  if (!global.Intl) {
    await Promise.all([
      import('intl'),
      import('intl/locale-data/jsonp/fr.js'),
    ])
    runMyApp()
  } else {
    runMyApp()
  }
})()
