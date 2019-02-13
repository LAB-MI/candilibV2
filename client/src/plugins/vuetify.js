import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import fr from 'vuetify/es5/locale/fr'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    error: '#891329',
  },
  lang: {
    locales: { fr },
    current: 'fr',
  },
})
