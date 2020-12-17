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
    listCountStatusByDep: [],
    listCountStatusByDays: [],
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
    [FETCH_STATS_COUNT_STATUSES_SUCCESS] (state, { list, listByDep, listByDays }) {
      state.listCountStatus = list || []
      state.listCountStatusByDep = listByDep || []
      state.listCountStatusByDays = listByDays || []
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

    async [FETCH_STATS_COUNT_STATUSES_REQUEST] ({ commit, dispatch }, { begin, end } = {}) {
      commit(FETCH_STATS_COUNT_STATUSES_REQUEST)
      const result = await api.admin.getStatsCountStatuses(begin, end, true)
      if (result?.success) {
        const dateByCounts = Object.entries(result.counts).reduce((acc, [date, countsByDep]) => {
          if (!acc.byDays[date]) acc.byDays[date] = {}

          const daysAcc = Object.entries(countsByDep).reduce((acc2, [dep, countByStatuses]) => {
            if (!acc2.byDep[dep]) acc2.byDep[dep] = { }

            const depAcc = Object.entries(countByStatuses).reduce((acc3, [status, count]) => {
              if (!acc3.byDays[status]) acc3.byDays[status] = 0
              acc3.byDays[status] += count
              if (!acc3.byDep[status]) acc3.byDep[status] = 0
              acc3.byDep[status] += count
              if (!acc3.byNational[status]) acc3.byNational[status] = 0
              acc3.byNational[status] += count
              return acc3
            }, { ...acc2, byDep: acc2.byDep[dep] })

            acc2.byDep[dep] = depAcc.byDep

            return acc2
          }, { ...acc, byDays: acc.byDays[date] })

          acc.byDays[date] = daysAcc.byDays

          return acc
        }, { byNational: {}, byDep: {}, byDays: {} })

        const list = Object.entries(dateByCounts.byNational).map(([status, count]) => {
          return { status, count }
        })
        const listByDeps = Object.entries(dateByCounts.byDep).map(([departement, countByStatus]) => {
          const statuses = Object.entries(countByStatus).map(([status, count]) => {
            return { status, count }
          })
          return { departement, statuses }
        })
        const listByDates = Object.entries(dateByCounts.byNational).map(([date, countByStatus]) => {
          const statuses = Object.entries(countByStatus).map(([status, count]) => {
            return { status, count }
          })
          return { date, statuses }
        })

        commit(FETCH_STATS_COUNT_STATUSES_SUCCESS, { list, listByDeps, listByDates })
        dispatch(SHOW_SUCCESS, 'Récuperation ok [section 2]')
      } else {
        commit(FETCH_STATS_COUNT_STATUSES_FAILURE)
        dispatch(SHOW_ERROR, 'Erreur de récuperation [section 2]')
      }
    },

  },
}
