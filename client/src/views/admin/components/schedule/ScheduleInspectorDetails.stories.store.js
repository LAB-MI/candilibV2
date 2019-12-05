
import delay from 'delay'

export default {
  state: {
    inspecteurs: [],
    places: {
      isFetching: false,
    },
  },
  mutations: {
    FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST (state) {

    },
    DELETE_PLACE_REQUEST (state) {

    },
    FETCH_INSPECTEURS_BY_CENTRE_REQUEST (state) {

    },
    FETCH_ADMIN_INFO_REQUEST (state) {

    },
  },
  actions: {
    async FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST ({ commit }, { begin, end }) {
      await delay(1000)
      commit('FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST')
    },
    async DELETE_PLACE_REQUEST ({ commit }, place) {
      commit('DELETE_PLACE_REQUEST')
    },
    async FETCH_INSPECTEURS_BY_CENTRE_REQUEST ({ commit }) {
      commit('FETCH_INSPECTEURS_BY_CENTRE_REQUEST')
    },
    async FETCH_ADMIN_INFO_REQUEST ({ commit }) {
      commit('FETCH_ADMIN_INFO_REQUEST')
    },
  },
}
