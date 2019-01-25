
import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import message from './message'
import whitelist from './whitelist'
import candidats from './candidats'
import candidat from './candidat'

export * from './auth'
export * from './message'
export * from './whitelist'
export * from './candidats'
export * from './candidat'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth: {},
    message: {},
    whitelist: {},
    candidats: {},
    candidat: {},
  },

  modules: {
    auth,
    message,
    whitelist,
    candidats,
    candidat,
  },
})
