import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'

export const FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST = 'FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST'
export const FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS = 'FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS'
export const FETCH_GET_INSPECTEURS_AVAILABLE_FAILURE = 'FETCH_GET_INSPECTEURS_AVAILABLE_FAILURE'

export const FETCH_UPDATE_INSPECTEUR_IN_RESA_REQUEST = 'FETCH_UPDATE_INSPECTEUR_IN_RESA_REQUEST'
export const FETCH_UPDATE_INSPECTEUR_IN_RESA_SUCCESS = 'FETCH_UPDATE_INSPECTEUR_IN_RESA_SUCCESS'
export const FETCH_UPDATE_INSPECTEUR_IN_RESA_FAILURE = 'FETCH_UPDATE_INSPECTEUR_IN_RESA_FAILURE'

export default {
  state: {
    inspecteurs: {
      isFetching: false,
      list: [],
      error: undefined,
    },
    isUpdating: false,
    error: undefined,

  },

  mutations: {
    FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST (state) {
      state.inspecteurs.isFetching = true
    },
    FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS (state, list) {
      state.inspecteurs.isFetching = false
      state.inspecteurs.list = list
    },
    FETCH_GET_INSPECTEURS_AVAILABLE_FAILURE (state, error) {
      state.inspecteurs.isFetching = false
      state.inspecteurs.error = error
    },
    FETCH_UPDATE_INSPECTEUR_IN_RESA_REQUEST (state) {
      state.isUpdating = true
    },
    FETCH_UPDATE_INSPECTEUR_IN_RESA_SUCCESS (state) {
      state.isUpdating = false
    },
    FETCH_UPDATE_INSPECTEUR_IN_RESA_FAILURE (state, error) {
      state.isUpdating = false
      state.error = error
    },

  },

  actions: {
    async FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST ({ state, commit, dispatch }, { departement, centre, date }) {
      try {
        commit(FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST)
        const places = await api.admin.getPlacesAvailableByCentreAndDate(departement, centre, date)
        const list = places.map(place => place.inspecteur)
        commit(FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS, list)
      } catch (error) {
        commit(FETCH_GET_INSPECTEURS_AVAILABLE_FAILURE, error)
        dispatch(SHOW_ERROR, error.message)
      }
    },

    async FETCH_UPDATE_INSPECTEUR_IN_RESA_REQUEST ({ state, commit, dispatch }, { departement, resa, inspecteur }) {
      try {
        commit(FETCH_UPDATE_INSPECTEUR_IN_RESA_FAILURE)
        const result = await api.admin.updateInspecteurForResa(departement, resa, inspecteur)
        commit(FETCH_UPDATE_INSPECTEUR_IN_RESA_SUCCESS)
        dispatch(result.success ? SHOW_SUCCESS : SHOW_ERROR, result.message)
      } catch (error) {
        commit(FETCH_GET_INSPECTEURS_AVAILABLE_FAILURE, error)
        dispatch(SHOW_ERROR, error.message)
      }
    },

  },
}
