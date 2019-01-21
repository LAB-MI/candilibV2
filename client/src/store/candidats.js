import api from '@/api'

import { SHOW_ERROR } from '@/store'

export const FETCH_CANDIDAT_REQUEST = 'FETCH_CANDIDAT_REQUEST'
export const FETCH_CANDIDAT_FAILURE = 'FETCH_CANDIDAT_FAILURE'
export const FETCH_CANDIDAT_SUCCESS = 'FETCH_CANDIDAT_SUCCESS'

export const FETCH_CANDIDATS_REQUEST = 'FETCH_CANDIDATS_REQUEST'
export const FETCH_CANDIDATS_FAILURE = 'FETCH_CANDIDATS_FAILURE'
export const FETCH_CANDIDATS_SUCCESS = 'FETCH_CANDIDATS_SUCCESS'

export default {
  state: {
    isFetching: false,
    isFetchingList: false,
    list: [],
  },

  mutations: {
    [FETCH_CANDIDAT_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_CANDIDAT_SUCCESS] (state, list) {
      state.isFetching = false
      state.list = list
    },
    [FETCH_CANDIDAT_FAILURE] (state) {
      state.isFetching = false
    },

    [FETCH_CANDIDATS_REQUEST] (state) {
      state.isFetchingList = true
    },
    [FETCH_CANDIDATS_SUCCESS] (state, list) {
      state.isFetchingList = false
      state.list = list
    },
    [FETCH_CANDIDATS_FAILURE] (state) {
      state.isFetchingList = false
    },
  },

  actions: {
    async [FETCH_CANDIDAT_REQUEST] ({ commit, dispatch }, id) {
      commit(FETCH_CANDIDAT_REQUEST)
      try {
        const list = await api.getCandidats(id)
        commit(FETCH_CANDIDAT_SUCCESS, list)
      } catch (error) {
        commit(FETCH_CANDIDAT_FAILURE)
        return dispatch(SHOW_ERROR, 'Error while fetching candidat')
      }
    },

    async [FETCH_CANDIDATS_REQUEST] ({ commit, dispatch }, { since, until }) {
      commit(FETCH_CANDIDATS_REQUEST)
      try {
        const list = await api.getCandidats({ since, until })
        commit(FETCH_CANDIDATS_SUCCESS, list)
      } catch (error) {
        commit(FETCH_CANDIDATS_FAILURE)
        return dispatch(SHOW_ERROR, 'Error while fetching candidats')
      }
    },
  },
}
