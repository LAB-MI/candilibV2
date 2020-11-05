import api from '@/api'

export const FETCH_LOGS_REQUEST = 'FETCH_LOGS_REQUEST'
export const FETCH_LOGS_FAILURE = 'FETCH_LOGS_FAILURE'
export const FETCH_LOGS_SUCCESS = 'FETCH_LOGS_SUCCESS'

export default {
  state: {
    isFetching: false,
    error: undefined,
    list: [],
  },

  mutations: {
    [FETCH_LOGS_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_LOGS_FAILURE] (state, error) {
      state.isFetching = false
      state.error = error
    },
    [FETCH_LOGS_SUCCESS] (state, list) {
      state.list = list
      state.isFetching = false
    },
  },

  actions: {
    async [FETCH_LOGS_REQUEST] ({ commit }) {
      const logs = await api.admin.getlogsPeerPages({ pageNumber: 0 })
      // const logs = await api.admin.getlogsPeerPages({ method, path, start, end, groupCandidatBy, pageNumber })
      console.log({ logs })
      // commit(FETCH_LOGS_SUCCESS, config.lineDelay)
    },
  },
}
