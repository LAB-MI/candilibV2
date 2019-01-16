
import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'

export * from './auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth: {},
  },

  modules: {
    auth,
  },
})
