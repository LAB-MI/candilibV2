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
    [FETCH_STATS_COUNT_STATUSES_FAILURE] (state) {
      state.isFetchingCountStatus = false
    },
    [FETCH_STATS_COUNT_STATUSES_SUCCESS] (state, list) {
      state.listCountStatus = list || []
      state.isFetchingCountStatus = false
    },
  },

  actions: {
    async [FETCH_LOGS_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_LOGS_REQUEST)

      const result = await api.admin.getlogsPeerPages({ pageNumber: 0 })
      if (result?.success) {
        const rawLogs = Object.entries(result.logs)
        const summaryByDepartement = {}
        const summaryNational = {}

        const details = rawLogs.map(([range, content]) => {
          const beginAndEndHour = range.split('_')
          const begin = beginAndEndHour[0]
          const end = beginAndEndHour[1]
          const formatedLogs = {
            begin: `${begin}h`,
            end: `${end}h`,
            departements: Object.entries(content)
              .map(([departement, statusesInfo]) => {
                if (!summaryByDepartement[departement]) {
                  summaryByDepartement[departement] = {}
                }
                return {
                  departement,
                  statusesInfo: Object.entries(statusesInfo).map(([status, logsContent]) => {
                    if (!summaryByDepartement[departement][status]) {
                      summaryByDepartement[departement][status] = { R: 0, M: 0, A: 0 }
                    }
                    summaryByDepartement[departement][status].R += (logsContent.R || 0)
                    summaryByDepartement[departement][status].M += (logsContent.M || 0)
                    summaryByDepartement[departement][status].A += (logsContent.A || 0)

                    if (!summaryNational[status]) {
                      summaryNational[status] = { R: 0, M: 0, A: 0 }
                    }
                    summaryNational[status].R += (logsContent.R || 0)
                    summaryNational[status].M += (logsContent.M || 0)
                    summaryNational[status].A += (logsContent.A || 0)

                    return { status, logsContent }
                  }),
                }
              }),
          }
          return formatedLogs
        })
        const summaryByDept = Object.entries(summaryByDepartement).map(([dpt, content]) => ({
          dpt,
          content: Object.entries(content).map(([status, infos]) => ({ status, infos })),
        }))

        const sumaryNationalTmp = Object.entries(summaryNational).map(([status, infos]) => ({ status, infos }))

        commit(FETCH_LOGS_SUCCESS, { details, summaryByDepartement: summaryByDept, summaryNational: sumaryNationalTmp })
        dispatch(SHOW_SUCCESS, 'Récuperation ok [section 1]')
      } else {
        commit(FETCH_LOGS_FAILURE)
        dispatch(SHOW_ERROR, 'Erreur de récuperation [section 1]')
      }
    },

    async [FETCH_STATS_COUNT_STATUSES_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_STATS_COUNT_STATUSES_REQUEST)
      const result = await api.admin.getStatsCountStatuses()
      if (result?.success) {
        const dateByCounts = Object.entries(result.counts)
        const shapedResult = dateByCounts[dateByCounts.length - 1]?.map(([status, count]) => {
          return { status, count }
        })
        commit(FETCH_STATS_COUNT_STATUSES_SUCCESS, shapedResult)
        dispatch(SHOW_SUCCESS, 'Récuperation ok [section 2]')
      } else {
        commit(FETCH_STATS_COUNT_STATUSES_FAILURE)
        dispatch(SHOW_ERROR, 'Erreur de récuperation [section 2]')
      }
    },

  },
}
