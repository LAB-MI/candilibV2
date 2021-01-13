import api from '@/api'
import { generateExcelFile, getFrenchLuxonFromObject } from '@/util'
import { SHOW_ERROR, SHOW_SUCCESS } from './message'
import { formatLogsData } from './utils'

export const FETCH_LOGS_REQUEST = 'FETCH_LOGS_REQUEST'
export const FETCH_LOGS_FAILURE = 'FETCH_LOGS_FAILURE'
export const FETCH_LOGS_SUCCESS = 'FETCH_LOGS_SUCCESS'

export const FETCH_STATS_COUNT_STATUSES_REQUEST = 'FETCH_STATS_COUNT_STATUSES_REQUEST'
export const FETCH_STATS_COUNT_STATUSES_FAILURE = 'FETCH_STATS_COUNT_STATUSES_FAILURE'
export const FETCH_STATS_COUNT_STATUSES_SUCCESS = 'FETCH_STATS_COUNT_STATUSES_SUCCESS'

export const FETCH_LOGS_HOME_DEPARTEMENT_REQUEST = 'FETCH_LOGS_HOME_DEPARTEMENT_REQUEST'
export const FETCH_LOGS_HOME_DEPARTEMENT_FAILURE = 'FETCH_LOGS_HOME_DEPARTEMENT_FAILURE'
export const FETCH_LOGS_HOME_DEPARTEMENT_SUCCESS = 'FETCH_LOGS_HOME_DEPARTEMENT_SUCCESS'

export const SAVE_EXCEL_FILE_REQUEST = 'SAVE_EXCEL_FILE_REQUEST'
export const SAVE_EXCEL_FILE_FAILURE = 'SAVE_EXCEL_FILE_FAILURE'
export const SAVE_EXCEL_FILE_SUCCESS = 'SAVE_EXCEL_FILE_SUCCESS'

export default {
  state: {
    isFetchingLogs: false,
    isFetchingLogsByHomeDepartement: false,
    isFetchingCountStatus: false,
    isGeneratingExcel: false,
    listLogs: [],
    listLogsError: undefined,
    listCountStatus: [],
    listCountStatusByDep: [],
    listCountStatusByDays: [],
    listLogsByHomeDepartement: [],
    listLogsByHomeDepartementError: undefined,
  },

  mutations: {
    [FETCH_LOGS_HOME_DEPARTEMENT_REQUEST] (state) {
      state.isFetchingLogsByHomeDepartement = true
    },
    [FETCH_LOGS_HOME_DEPARTEMENT_FAILURE] (state, error) {
      state.listLogsByHomeDepartementError = error
      state.isFetchingLogsByHomeDepartement = false
    },
    [FETCH_LOGS_HOME_DEPARTEMENT_SUCCESS] (state, list) {
      state.listLogsByHomeDepartement = list
      state.isFetchingLogsByHomeDepartement = false
    },

    [FETCH_LOGS_REQUEST] (state) {
      state.isFetchingLogs = true
    },
    [FETCH_LOGS_FAILURE] (state, error) {
      state.listLogsError = error
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

    [SAVE_EXCEL_FILE_REQUEST] (state) {
      state.isGeneratingExcel = true
    },
    [SAVE_EXCEL_FILE_FAILURE] (state) {
      state.isGeneratingExcel = false
    },
    [SAVE_EXCEL_FILE_SUCCESS] (state) {
      state.isGeneratingExcel = false
    },
  },

  actions: {
    async [FETCH_LOGS_HOME_DEPARTEMENT_REQUEST] ({ commit, dispatch }, params) {
      commit(FETCH_LOGS_HOME_DEPARTEMENT_REQUEST)

      const dateStart = params.start.split('-')
      const dateEnd = params.end.split('-')

      const start = getFrenchLuxonFromObject({ year: dateStart[0], month: dateStart[1], day: dateStart[2] }).toISODate()
      const end = getFrenchLuxonFromObject({ year: dateEnd[0], month: dateEnd[1], day: dateEnd[2] }).toISODate()

      const resultForDepartement = await api.admin.getlogsPeerPages({ pageNumber: 0, start, end, isByHomeDepartement: true })

      if (resultForDepartement?.success) {
        const shapedResult = formatLogsData(resultForDepartement)
        commit(FETCH_LOGS_HOME_DEPARTEMENT_SUCCESS, shapedResult)
        dispatch(SHOW_SUCCESS, 'Récuperation des informations des actions candidats ok par département de résidence')
      } else {
        commit(FETCH_LOGS_HOME_DEPARTEMENT_FAILURE, resultForDepartement)
        dispatch(SHOW_ERROR, 'Erreur de récuperation des informations des actions candidats')
      }
    },

    async [FETCH_LOGS_REQUEST] ({ commit, dispatch }, params) {
      commit(FETCH_LOGS_REQUEST)

      const dateStart = params.start.split('-')
      const dateEnd = params.end.split('-')

      const start = getFrenchLuxonFromObject({ year: dateStart[0], month: dateStart[1], day: dateStart[2] }).toISODate()
      const end = getFrenchLuxonFromObject({ year: dateEnd[0], month: dateEnd[1], day: dateEnd[2] }).toISODate()

      const resultForDepartement = await api.admin.getlogsPeerPages({ pageNumber: 0, start, end })

      if (resultForDepartement?.success) {
        const shapedResult = formatLogsData(resultForDepartement)
        commit(FETCH_LOGS_SUCCESS, shapedResult)
        dispatch(SHOW_SUCCESS, 'Récuperation des informations des actions candidats ok par département de réservation')
      } else {
        commit(FETCH_LOGS_FAILURE, resultForDepartement)
        dispatch(SHOW_ERROR, 'Erreur de récuperation des informations des actions candidats')
      }
    },

    async [FETCH_STATS_COUNT_STATUSES_REQUEST] ({ commit, dispatch }, params) {
      commit(FETCH_STATS_COUNT_STATUSES_REQUEST)

      const dateStart = params.start.split('-')
      const dateEnd = params.end.split('-')

      const start = getFrenchLuxonFromObject({ year: dateStart[0], month: dateStart[1], day: dateStart[2] }).toISODate()
      const end = getFrenchLuxonFromObject({ year: dateEnd[0], month: dateEnd[1], day: dateEnd[2] }).toISODate()

      const result = await api.admin.getStatsCountStatuses(start, end, true)
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
        dispatch(SHOW_SUCCESS, 'Récuperation du nombre de candidat par groupe ok')
      } else {
        commit(FETCH_STATS_COUNT_STATUSES_FAILURE)
        dispatch(SHOW_ERROR, 'Erreur de récuperation du nombre de candidat par groupe')
      }
    },

    async [SAVE_EXCEL_FILE_REQUEST] ({ commit, dispatch }, { listLogs, selectedRange, isByHomeDepartement }) {
      commit(SAVE_EXCEL_FILE_REQUEST)
      const shapedLogs = listLogs.reduce((accumulator, current) => {
        current.content.summaryNational.forEach(element => {
          accumulator.national.push([
                  `${Number(element.status) + 1}`,
                  `${element.infos.R}`,
                  `${element.infos.M}`,
                  `${element.infos.A}`,
                  `${current.date}`,
          ])
        })
        current.content.summaryByDepartement.forEach(item => {
          item.content.forEach(itm => {
            accumulator.byDepartement.push([
                  `${item.dpt}`,
                  `${Number(itm.status) + 1}`,
                  `${itm.infos.R}`,
                  `${itm.infos.M}`,
                  `${itm.infos.A}`,
                  `${current.date}`,
            ])
          })
        })

        return accumulator
      },
      { national: [], byDepartement: [], isByHomeDepartement, selectedRange })

      try {
        await generateExcelFile(shapedLogs)
        commit(SAVE_EXCEL_FILE_SUCCESS)
        dispatch(SHOW_SUCCESS, 'Export Excel ok')
      } catch (error) {
        commit(SAVE_EXCEL_FILE_FAILURE, error)
        const { message } = error
        dispatch(SHOW_ERROR, message)
      }
    },
  },
}
