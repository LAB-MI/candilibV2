import api from '@/api'

export const FETCH_PARIS_CENTERS_REQUEST = 'FETCH_PARIS_CENTERS_REQUEST'
export const FETCH_PARIS_CENTERS_FAILURE = 'FETCH_PARIS_CENTERS_FAILURE'
export const FETCH_PARIS_CENTERS_SUCCESS = 'FETCH_PARIS_CENTERS_SUCCESS'

export default {
  state: {
    list: [],
  },

  mutations: {
    [FETCH_PARIS_CENTERS_SUCCESS] (state, list) {
      state.list = list
    },
  },

  actions: {
    async [FETCH_PARIS_CENTERS_REQUEST] ({ commit }) {
      const listFromApi = await api.public.getCentresByDepartement('75')
      const list = []
      listFromApi.deptCenters.forEach(function (center) {
        list.push(center.nom)
      })
      commit(FETCH_PARIS_CENTERS_SUCCESS, list)
    },
  },
}
