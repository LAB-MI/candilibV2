import api from '@/api'
import {
  SHOW_ERROR,
} from '@/store'

export const FETCH_PARIS_CENTERS_REQUEST = 'FETCH_PARIS_CENTERS_REQUEST'
export const FETCH_PARIS_CENTERS_FAILURE = 'FETCH_PARIS_CENTERS_FAILURE'
export const FETCH_PARIS_CENTERS_SUCCESS = 'FETCH_PARIS_CENTERS_SUCCESS'
export const FETCH_PARIS_CENTERS_UNIQ_REQUEST = 'FETCH_PARIS_CENTERS_UNIQ_REQUEST'
export const FETCH_PARIS_CENTERS_UNIQ_FAILURE = 'FETCH_PARIS_CENTERS_UNIQ_FAILURE'
export const FETCH_PARIS_CENTERS_UNIQ_SUCCESS = 'FETCH_PARIS_CENTERS_UNIQ_SUCCESS'

export default {
  state: {
    isFetching: false,
    list: [],
    isFetchingUniq: false,
    listUniq: [],
  },

  mutations: {
    [FETCH_PARIS_CENTERS_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_PARIS_CENTERS_SUCCESS] (state, list) {
      state.isFetching = false
      state.list = list
    },
    [FETCH_PARIS_CENTERS_FAILURE] (state) {
      state.isFetching = false
    },

    [FETCH_PARIS_CENTERS_UNIQ_REQUEST] (state) {
      state.isFetchingUniq = true
    },
    [FETCH_PARIS_CENTERS_UNIQ_SUCCESS] (state, list) {
      state.isFetchingUniq = false
      state.listUniq = list
    },
    [FETCH_PARIS_CENTERS_UNIQ_FAILURE] (state) {
      state.isFetchingUniq = false
    },

  },

  actions: {
    async [FETCH_PARIS_CENTERS_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_PARIS_CENTERS_REQUEST)
      try {
        const listFromApi = await api.public.getCentresByDepartement('75')
        const list = listFromApi.deptCenters.map(center => `${center.nom}(${center.geoDepartement})`)
        commit(FETCH_PARIS_CENTERS_SUCCESS, list)
      } catch (error) {
        commit(FETCH_PARIS_CENTERS_FAILURE)
        dispatch(SHOW_ERROR, error.message)
      }
    },
    async [FETCH_PARIS_CENTERS_UNIQ_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_PARIS_CENTERS_UNIQ_REQUEST)
      try {
        const listFromApi = await api.public.getCentresByDepartement('75', true)
        const list = listFromApi.deptCenters.map(center => center.nom)
        commit(FETCH_PARIS_CENTERS_UNIQ_SUCCESS, list)
      } catch (error) {
        commit(FETCH_PARIS_CENTERS_UNIQ_FAILURE)
        dispatch(SHOW_ERROR, error.message)
      }
    },

  },
}
