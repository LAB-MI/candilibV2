import api from '@/api'

export const FETCH_DEPARTEMENTS_REQUEST = 'FETCH_DEPARTEMENTS_REQUEST'
export const FETCH_DEPARTEMENTS_FAILURE = 'FETCH_DEPARTEMENTS_FAILURE'
export const FETCH_DEPARTEMENTS_SUCCESS = 'FETCH_DEPARTEMENTS_SUCCESS'

export default {
  state: {
    list: [],
  },

  mutations: {
    [FETCH_DEPARTEMENTS_SUCCESS] (state, list) {
      state.list = list
    },
  },

  actions: {
    async [FETCH_DEPARTEMENTS_REQUEST] ({ commit }) {
      const listFromApi = await api.util.getActiveDepartementsId()
      const list = []
      listFromApi.departements.forEach(function (dept) {
        list.push(dept._id)
      })
      commit(FETCH_DEPARTEMENTS_SUCCESS, list)
    },
  },
}
