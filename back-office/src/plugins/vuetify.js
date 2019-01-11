import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import fr from 'vuetify/es5/locale/fr'

import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  iconfont: 'fa',
  theme: {
    primary: colors.red.darken1, // #E53935
    secondary: colors.red.lighten4, // #FFCDD2
    accent: colors.indigo.base, // #3F51B5
  },
  lang: {
    locales: { fr },
    current: 'fr',
  },
})
