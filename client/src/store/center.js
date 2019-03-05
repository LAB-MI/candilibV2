import api from '@/api'
import { SHOW_ERROR } from './message'

export const FETCH_CENTERS_REQUEST = 'FETCH_CENTERS_REQUEST'
export const FETCH_CENTERS_SUCCESS = 'FETCH_CENTERS_SUCCESS'
export const FETCH_CENTERS_FAILURE = 'FETCH_CENTERS_FAILURE'
export const SELECT_CENTER = 'SELECT_CENTER'

const zipCodeRegexFromAdresse = /.*([0-9]{2})[0-9]{3}.*/

export default {
  state: {
    isCentersFetching: false,
    list: [],
    selected: undefined,
  },
  mutations: {
    [FETCH_CENTERS_REQUEST] (state) {
      state.isCentersFetching = true
    },
    [FETCH_CENTERS_SUCCESS] (state, centers) {
      state.isCentersFetching = false
      state.list = centers
    },
    [FETCH_CENTERS_FAILURE] (state) {
      state.isCentersFetching = false
    },
    [SELECT_CENTER] (state, selected) {
      state.selected = selected
    },
  },
  actions: {
    async [FETCH_CENTERS_REQUEST] ({ commit, dispatch }, adresseCandidat) {
      commit(FETCH_CENTERS_REQUEST)
      try {
        const [, departement] = adresseCandidat.match(zipCodeRegexFromAdresse)
        const result = await api.candidat.getCentres(departement)
        commit(FETCH_CENTERS_SUCCESS, result)
      } catch (error) {
        commit(FETCH_CENTERS_FAILURE, error.message)
        dispatch(SHOW_ERROR, error.message)
      }
    },
    [SELECT_CENTER] ({ commit }, center) {
      commit(SELECT_CENTER, center)
    },
  },
}
