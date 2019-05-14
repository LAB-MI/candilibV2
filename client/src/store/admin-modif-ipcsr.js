import api from '@/api'

export const FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST = 'FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST'
export const FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS = 'FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS'
export const FETCH_GET_INSPECTEURS_AVAILABLE_FAILURE = 'FETCH_GET_INSPECTEURS_AVAILABLE_FAILURE'

export default {
  state: {
    inspecteurs: {
      isFetching: false,
      list: [],
      error: undefined,
    },
  },

  mutations: {
    FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST (state) {
      state.inspecteurs.isFetching = true
    },
    FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS (state, list) {
      state.inspecteurs.isFetching = false
      state.inspecteurs.list = list.map(e => {
        const { _id: value, nom, matricule } = e
        const text = nom + ' | ' + matricule
        return { value, text }
      })
    },
    FETCH_GET_INSPECTEURS_AVAILABLE_FAILURE (state, error) {
      state.inspecteurs.isFetching = false
      state.inspecteurs.error = error
    },
  },

  actions: {
    async FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST ({ state, commit }, centre, date) {
      try {
        const list = await api.admin.getPlacesAvailableByCentreAndDate(centre, date)
        commit(FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS, list)
      } catch (error) {
        commit(FETCH_GET_INSPECTEURS_AVAILABLE_FAILURE, error)
      }
    },
  },
}
