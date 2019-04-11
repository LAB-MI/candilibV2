// import api from '@/api'

import { SHOW_ERROR } from '@/store'

export const FETCH_ADMIN_INFO_REQUEST = 'FETCH_ADMIN_INFO_REQUEST'
export const FETCH_ADMIN_INFO_FAILURE = 'FETCH_ADMIN_INFO_FAILURE'
export const FETCH_ADMIN_INFO_SUCCESS = 'FETCH_ADMIN_INFO_SUCCESS'

export const SELECT_DEPARTEMENT = 'SELECT_DEPARTEMENT'

export default {
  state: {
    isFetching: false,
    list: [],
    selectedDepartement: '',
  },

  mutations: {
    [FETCH_ADMIN_INFO_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_ADMIN_INFO_SUCCESS] (state, list) {
      state.isFetching = false
      state.list = list
    },
    [FETCH_ADMIN_INFO_FAILURE] (state) {
      state.isFetching = false
    },

    [SELECT_DEPARTEMENT] (state, departement) {
      state.selectedDepartement = departement
    },
  },

  actions: {
    async [FETCH_ADMIN_INFO_REQUEST] ({ commit, dispatch }, id) {
      commit(FETCH_ADMIN_INFO_REQUEST)
      try {
        // const list = await api.admin.getCandidats(id)
        const list = {
          departements: [75, 93],
          email: 'admin@example.com',
        }
        commit(FETCH_ADMIN_INFO_SUCCESS, list)
        commit(SELECT_DEPARTEMENT, list.departements[0])
      } catch (error) {
        commit(FETCH_ADMIN_INFO_FAILURE)
        return dispatch(SHOW_ERROR, 'Error while fetching admin infos')
      }
    },
    async [SELECT_DEPARTEMENT] ({ commit, dispatch }, departement) {
      commit(SELECT_DEPARTEMENT, departement)
    },
  },
}
