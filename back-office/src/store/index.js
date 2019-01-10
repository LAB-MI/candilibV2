
import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'

export * from './auth'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    auth: {},
  },

  modules: {
    auth,
  },
})

export default store
