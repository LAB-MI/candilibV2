// import api from '@/api'

import { SHOW_ERROR } from '@/store'

export const FETCH_ADMIN_INFO_REQUEST = 'FETCH_ADMIN_INFO_REQUEST'
export const FETCH_ADMIN_INFO_FAILURE = 'FETCH_ADMIN_INFO_FAILURE'
export const FETCH_ADMIN_INFO_SUCCESS = 'FETCH_ADMIN_INFO_SUCCESS'

export const SELECT_DEPARTEMENT = 'SELECT_DEPARTEMENT'

export default {
  state: {
    departements: {
      active: undefined,
      isFetching: false,
      list: [],
    },
    email: undefined,
  },

  mutations: {
    [FETCH_ADMIN_INFO_REQUEST] (state) {
      state.departements.isFetching = true
    },
    [FETCH_ADMIN_INFO_SUCCESS] (state, infos) {
      state.departements = infos.departements
      state.me = infos.me
    },
    [FETCH_ADMIN_INFO_FAILURE] (state) {
      state.departements.isFetching = false
    },

    [SELECT_DEPARTEMENT] (state, departement) {
      state.departements.active = departement
    },
  },

  actions: {
    async [FETCH_ADMIN_INFO_REQUEST] ({ commit, dispatch }, id) {
      commit(FETCH_ADMIN_INFO_REQUEST)
      try {
        // const infos = await api.admin.getMe()
        const infos = {
          departements: {
            list: ['75', '93'],
          },
          email: 'admin@example.com',
        }

        infos.departements.active = infos.departements.list[0]

        commit(FETCH_ADMIN_INFO_SUCCESS, infos)
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
