import api from '@/api'
import {
  SHOW_ERROR,
} from '@/store'

export const FETCH_DEPARTEMENTS_REQUEST = 'FETCH_DEPARTEMENTS_REQUEST'
export const FETCH_DEPARTEMENTS_FAILURE = 'FETCH_DEPARTEMENTS_FAILURE'
export const FETCH_DEPARTEMENTS_SUCCESS = 'FETCH_DEPARTEMENTS_SUCCESS'

export default {
  state: {
    isFetchingDepartements: false,
    list: [],
  },

  mutations: {
    [FETCH_DEPARTEMENTS_REQUEST] (state) {
      state.isFetchingDepartements = true
    },
    [FETCH_DEPARTEMENTS_SUCCESS] (state, list) {
      state.list = list
      state.isFetchingDepartements = false
    },
    [FETCH_DEPARTEMENTS_FAILURE] (state) {
      state.isFetchingDepartements = false
    },
  },

  actions: {
    async [FETCH_DEPARTEMENTS_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_DEPARTEMENTS_REQUEST)

      try {
        const listFromApi = await api.public.getActiveDepartementsId()
        const list = listFromApi.departementsId
        commit(FETCH_DEPARTEMENTS_SUCCESS, list)
      } catch (error) {
        commit(FETCH_DEPARTEMENTS_FAILURE, error.message)
        dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
