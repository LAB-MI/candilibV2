
import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import message from './message'
import whitelist from './whitelist'
import candidats from './candidats'
import candidat from './candidat'
import aurige from './aurige'
<<<<<<< HEAD
import importPlaces from './import-places'
import center from './center'
=======
import dateChoice from './dateChoice'
>>>>>>> create folder date-choice, store dateChoice and add element to storybook (in progress)

export * from './auth'
export * from './message'
export * from './whitelist'
export * from './candidats'
export * from './candidat'
export * from './aurige'
<<<<<<< HEAD
export * from './import-places'
export * from './center'
=======
export * from './dateChoice'
>>>>>>> create folder date-choice, store dateChoice and add element to storybook (in progress)

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },

  modules: {
    auth,
    dateChoice,
    message,
    whitelist,
    candidats,
    candidat,
    aurige,
    importPlaces,
    center,
  },
})
