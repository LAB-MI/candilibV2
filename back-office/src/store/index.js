
import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import message from './message'

export * from './auth'
export * from './message'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth: {},
    message: {},
  },

  modules: {
    auth,
    message,
  },
})
