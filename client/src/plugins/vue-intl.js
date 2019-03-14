import Vue from 'vue'
import VueIntl from 'vue-intl'

import { candidat, admin } from '../messages'

Vue.use(VueIntl)
Vue.setLocale('fr')
Vue.registerMessages('fr', { ...candidat, ...admin })
