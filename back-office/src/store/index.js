
import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import message from './message'
import whitelist from './whitelist'

export * from './auth'
export * from './message'
export * from './whitelist'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth: {},
    message: {},
    whitelist: {},
  },

  modules: {
    auth,
    message,
    whitelist,
  },
})
