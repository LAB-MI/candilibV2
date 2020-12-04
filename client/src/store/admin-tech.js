import api from '@/api'

export const FETCH_LOGS_REQUEST = 'FETCH_LOGS_REQUEST'
export const FETCH_LOGS_FAILURE = 'FETCH_LOGS_FAILURE'
export const FETCH_LOGS_SUCCESS = 'FETCH_LOGS_SUCCESS'

export default {
  state: {
    isFetching: false,
    // error: undefined,
    list: [],
  },

  mutations: {
    [FETCH_LOGS_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_LOGS_FAILURE] (state, error) {
      state.isFetching = false
      // state.error = error
    },
    [FETCH_LOGS_SUCCESS] (state, list) {
      state.list = list
      state.isFetching = false
    },
  },

  actions: {
    async [FETCH_LOGS_REQUEST] ({ commit }) {
      commit(FETCH_LOGS_REQUEST)
      const result = await api.admin.getlogsPeerPages({ pageNumber: 0 })
      if (result?.success) {
        const shapedResult = Object.entries(result.logs).map(([range, content]) => {
          const beginAndEndHour = range.split('_')
          const begin = beginAndEndHour[0]
          const end = beginAndEndHour[1]
          const formatedLogs = {
            begin: `${begin}h`,
            end: `${end}h`,
            departements: Object.entries(content)
              .map(([departement, statusesInfo]) => {
                return {
                  departement,
                  statusesInfo: Object.entries(statusesInfo).map(([status, logsContent]) => {
                    return { status, logsContent }
                  }),
                }
              }),
          }
          return formatedLogs
        })
        commit(FETCH_LOGS_SUCCESS, shapedResult)
      }
      commit(FETCH_LOGS_FAILURE)
    },
  },
}
