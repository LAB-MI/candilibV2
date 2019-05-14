
import Vue from 'vue'
import Vuex from 'vuex'

import aurige from './aurige'
import admin from './admin'
import adminModifIpcsr from './admin-modif-ipcsr'
import adminSearch from './admin-search'
import auth from './auth'
import candidat from './candidat'
import candidats from './candidats'
import center from './center'
import importPlaces from './import-places'
import message from './message'
import reservation from './reservation'
import timeSlots from './time-slots'
import whitelist from './whitelist'

export * from './aurige'
export * from './admin'
export * from './admin-modif-ipcsr'
export * from './admin-search'
export * from './auth'
export * from './candidat'
export * from './candidats'
export * from './center'
export * from './import-places'
export * from './message'
export * from './reservation'
export * from './time-slots'
export * from './whitelist'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },

  modules: {
    adminModifIpcsr,
    adminSearch,
    aurige,
    admin,
    auth,
    candidat,
    candidats,
    center,
    importPlaces,
    message,
    reservation,
    timeSlots,
    whitelist,
  },
})
