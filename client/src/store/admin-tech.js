import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from './message'

export const FETCH_LOGS_REQUEST = 'FETCH_LOGS_REQUEST'
export const FETCH_LOGS_FAILURE = 'FETCH_LOGS_FAILURE'
export const FETCH_LOGS_SUCCESS = 'FETCH_LOGS_SUCCESS'

export const FETCH_STATS_COUNT_STATUSES_REQUEST = 'FETCH_STATS_COUNT_STATUSES_REQUEST'
export const FETCH_STATS_COUNT_STATUSES_FAILURE = 'FETCH_STATS_COUNT_STATUSES_FAILURE'
export const FETCH_STATS_COUNT_STATUSES_SUCCESS = 'FETCH_STATS_COUNT_STATUSES_SUCCESS'

export default {
  state: {
    isFetchingLogs: false,
    isFetchingCountStatus: false,
    listLogs: [],
    listCountStatus: [],
  },

  mutations: {
    [FETCH_LOGS_REQUEST] (state) {
      state.isFetchingLogs = true
    },
    [FETCH_LOGS_FAILURE] (state, error) {
      state.isFetchingLogs = false
    },
    [FETCH_LOGS_SUCCESS] (state, list) {
      state.listLogs = list
      state.isFetchingLogs = false
    },

    [FETCH_STATS_COUNT_STATUSES_REQUEST] (state) {
      state.isFetchingCountStatus = true
    },
    [FETCH_STATS_COUNT_STATUSES_FAILURE] (state, error) {
      state.isFetchingCountStatus = false
    },
    [FETCH_STATS_COUNT_STATUSES_SUCCESS] (state, list) {
      state.listCountStatus = list
      state.isFetchingCountStatus = false
    },
  },

  actions: {
    async [FETCH_LOGS_REQUEST] ({ commit, dispatch }) {
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
        dispatch(SHOW_SUCCESS, 'Récuperation ok [section 1]')
      } else {
        dispatch(SHOW_ERROR, 'Erreur de récuperation [section 1]')
        commit(FETCH_LOGS_FAILURE)
      }
    },

    async [FETCH_STATS_COUNT_STATUSES_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_STATS_COUNT_STATUSES_REQUEST)
      const result = await api.admin.getStatsCountStatuses()
      if (result?.success) {
        const shapedResult = Object.entries(result.counts).map(([status, count]) => {
          return { status, count }
        })
        dispatch(SHOW_SUCCESS, 'Récuperation ok [section 1]')
        commit(FETCH_STATS_COUNT_STATUSES_SUCCESS, shapedResult)
      } else {
        commit(FETCH_STATS_COUNT_STATUSES_FAILURE)
        dispatch(SHOW_ERROR, 'Erreur de récuperation [section 1]')
      }
    },

  },
}
