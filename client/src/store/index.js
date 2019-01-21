
import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import message from './message'
import whitelist from './whitelist'
import candidats from './candidats'

export * from './auth'
export * from './message'
export * from './whitelist'
export * from './candidats'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth: {},
    message: {},
    whitelist: {},
    candidats: {},
  },

  modules: {
    auth,
    message,
    whitelist,
    candidats,
  },
})
