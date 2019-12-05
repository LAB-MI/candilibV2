import Vue from 'vue'
import Vuetify from 'vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'typeface-roboto/index.css'
import 'vuetify/dist/vuetify.min.css'
import fr from 'vuetify/es5/locale/fr'

Vue.use(Vuetify)

export default new Vuetify({
  icons: {
    iconfont: 'md',
  },
  theme: {
    themes: {
      light: {
        primary: '#169DB2',
        error: '#891329',
      },
    },
  },
  lang: {
    locales: { fr },
    current: 'fr',
  },
})
